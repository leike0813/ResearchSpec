import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

export const RECORD_FILES = [
  "01-analysis.md",
  "02-ingestion.md",
  "03-conversion.md",
  "04-review.md",
  "05-semantic-review.md",
];

/**
 * Hash the supplied bytes without decoding them as text. Strings remain
 * supported for the canonical JSON/Markdown serializations built by the
 * maintenance scripts.
 */
export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function fileSha(pathName) {
  return sha256(readFileSync(pathName));
}

export function json(pathName) {
  return JSON.parse(readFileSync(pathName, "utf8"));
}

export function isIgnored(name) {
  return name === "__pycache__" || name.endsWith(".pyc");
}

export function hashFileList(files, base) {
  return sha256(files.map((file) => `${path.relative(base, file).split(path.sep).join("/")}\0${fileSha(file)}`).join("\n"));
}

export function gitTrackedFiles(root) {
  const output = execFileSync("git", ["-C", root, "ls-files", "-z"], { encoding: "utf8" });
  return output.split("\0").filter(Boolean)
    .map((item) => path.join(root, item))
    .filter((item) => {
      try {
        return statSync(item).isFile();
      } catch {
        return false;
      }
    });
}

function walkedFiles(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === ".git" || isIgnored(entry.name)) continue;
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile()) files.push(target);
    }
  };
  walk(root);
  return files;
}

export function treeSha(root) {
  return hashFileList(walkedFiles(root), root);
}

export function inventory(root, trackedOnly = false) {
  const files = trackedOnly ? gitTrackedFiles(root) : walkedFiles(root);
  const byExt = new Map();
  const byTop = new Map();
  for (const file of files) {
    const rel = path.relative(root, file);
    const ext = path.extname(file) || "(none)";
    byExt.set(ext, (byExt.get(ext) ?? 0) + 1);
    const top = rel.split(path.sep)[0] ?? ".";
    byTop.set(top, (byTop.get(top) ?? 0) + 1);
  }
  return {
    total: files.length,
    treeSha: hashFileList(files, root),
    files,
    byExt: Object.fromEntries([...byExt].sort()),
    byTop: Object.fromEntries([...byTop].sort()),
  };
}

export function esc(text) {
  return String(text ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function inlineCode(values) {
  return values.map((value) => `\`${value}\``).join(" ");
}

export function recordSha(anchorPath, recordFiles = RECORD_FILES) {
  const values = [];
  for (const name of recordFiles) {
    const file = path.join(anchorPath, name);
    if (existsSync(file)) values.push(`${name}\0${fileSha(file)}`);
  }
  return values.length ? sha256(values.join("\n")) : null;
}

export function compareValue(pathParts, expected, actual) {
  return JSON.stringify(expected) === JSON.stringify(actual)
    ? null
    : `${pathParts.join(".")}: expected ${JSON.stringify(expected)}, actual ${JSON.stringify(actual)}`;
}

export function syncTools({ root, catalog, displayName }) {
  const data = catalog();
  let copied = 0;
  for (const extension of data.extensions) {
    for (const tool of extension.tool_files) {
      const source = path.join(root, tool.source);
      const target = path.join(root, tool.target);
      const content = readFileSync(source);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, content);
      copied += 1;
    }
  }
  process.stdout.write(`synced ${copied} ${displayName} tool files from ${data.generated_root} to ${data.extension_root}\n`);
}

export function writeReviewArtifact({ anchorId, artifactDir, currentState, createdAt }) {
  const state = currentState(anchorId);
  const dir = artifactDir(anchorId);
  mkdirSync(dir, { recursive: true });
  const artifact = {
    schema_version: "1",
    vendor_id: state.vendor_id,
    anchor_id: state.anchor_id,
    generated: createdAt,
    registry_version: state.extension.registry_version,
    capabilities: state.extension.rows,
  };
  const target = path.join(dir, "extension-review.json");
  writeFileSync(target, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  process.stdout.write(`wrote ${target}\n`);
}

/**
 * Construct the shared command lifecycle. Vendor entrypoints provide only
 * their policy-aware state and record writers, plus an optional generator.
 */
export function createMaintenanceCommands({
  root,
  catalog,
  anchorDir,
  artifactDir,
  currentState,
  writeRecords,
  vendorId,
  vendorLabel,
  scriptName,
  regeneratePackages,
  anchorCreatedAt,
}) {
  const sync = () => syncTools({ root, catalog, displayName: vendorLabel });
  const writeArtifact = (anchorId) => writeReviewArtifact({ anchorId, artifactDir, currentState, createdAt: anchorCreatedAt });

  const records = (anchorId) => {
    writeRecords(anchorId);
  };

  const baseline = (anchorId) => {
    const semanticReviewPath = path.join(anchorDir(anchorId), "05-semantic-review.md");
    const semanticText = existsSync(semanticReviewPath) ? readFileSync(semanticReviewPath, "utf8") : "";
    if (!semanticText.includes("## 结论") || semanticText.includes("[NOT-COMPLETED]")) {
      throw new Error(`Semantic review is not completed: ${semanticReviewPath}`);
    }
    if (regeneratePackages) regeneratePackages();
    sync();
    writeArtifact(anchorId);
    writeRecords(anchorId);
    const state = currentState(anchorId);
    const dir = anchorDir(anchorId);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "manifest.json"), `${JSON.stringify(state, null, 2)}\n`, "utf8");
    process.stdout.write(`wrote ${path.join(dir, "manifest.json")}\n`);
  };

  const artifacts = (anchorId = catalog().anchor_id) => {
    if (regeneratePackages) regeneratePackages();
    sync();
    writeArtifact(anchorId);
    writeRecords(anchorId);
  };

  const check = (anchorId) => {
    const manifestPath = path.join(anchorDir(anchorId), "manifest.json");
    if (!existsSync(manifestPath)) throw new Error(`Missing anchor manifest: ${manifestPath}`);
    const manifest = json(manifestPath);
    const state = currentState(anchorId);
    const problems = [];
    for (const key of ["release", "revision", "content_file_count", "tree_sha256", "audit_path", "audit_sha256", "audit_report_path", "audit_report_sha256"]) {
      const issue = compareValue(["upstream", key], manifest.upstream?.[key], state.upstream[key]);
      if (issue) problems.push(issue);
    }
    for (const key of ["file_count", "tree_sha256", "raw_skill_count"]) {
      const issue = compareValue(["advisory", key], manifest.advisory?.[key], state.advisory[key]);
      if (issue) problems.push(issue);
    }
    for (const key of ["registry_version", "capability_count", "profile_count", "mixed_count", "llm_count", "script_validator_count", "capability_ids", "registry_subset_sha256", "packages_tree_sha256", "profiles_tree_sha256"]) {
      const issue = compareValue(["extension", key], manifest.extension?.[key], state.extension[key]);
      if (issue) problems.push(issue);
    }
    for (const key of ["artifact_path", "artifact_sha256", "tool_file_count", "tools_byte_identical", "required_fields_bound"]) {
      if (manifest.review?.[key] !== undefined) {
        const issue = compareValue(["review", key], manifest.review[key], state.review[key]);
        if (issue) problems.push(issue);
      }
    }
    for (const key of ["skill_path", "skill_sha256", "catalog_path", "catalog_sha256", "audit_readme_path", "audit_readme_sha256", "record_sha256"]) {
      if (manifest.maintenance?.[key] !== undefined) {
        const issue = compareValue(["maintenance", key], manifest.maintenance[key], state.maintenance[key]);
        if (issue) problems.push(issue);
      }
    }
    if (problems.length > 0) {
      process.stderr.write(`FAIL ${vendorId}@${anchorId}\n${problems.map((problem) => `- ${problem}`).join("\n")}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write(`OK ${vendorId}@${anchorId}\n`);
    }
  };

  const diff = (oldAnchor, newAnchor) => {
    const oldManifest = json(path.join(anchorDir(oldAnchor), "manifest.json"));
    const newManifest = json(path.join(anchorDir(newAnchor), "manifest.json"));
    for (const key of ["upstream.revision", "upstream.tree_sha256", "advisory.tree_sha256", "extension.registry_version", "extension.capability_count", "extension.registry_subset_sha256", "extension.packages_tree_sha256", "extension.profiles_tree_sha256"]) {
      const oldValue = key.split(".").reduce((value, part) => value?.[part], oldManifest);
      const newValue = key.split(".").reduce((value, part) => value?.[part], newManifest);
      process.stdout.write(`${key}: ${JSON.stringify(oldValue)} -> ${JSON.stringify(newValue)}\n`);
    }
  };

  const main = (args) => {
    const command = args[0];
    const anchor = args[1];
    const other = args[2];
    if (command === "artifacts") {
      artifacts(anchor);
      return;
    }
    if (command === "diff") {
      if (!anchor || !other) throw new Error(`usage: ${scriptName} diff <old-anchor> <new-anchor>`);
      diff(anchor, other);
      return;
    }
    if (!["records", "baseline", "check"].includes(command)) {
      throw new Error(`usage: node scripts/${scriptName} <artifacts|records|baseline|check|diff> [anchor] [other-anchor]`);
    }
    const targetAnchor = anchor ?? catalog().anchor_id;
    if (command === "records") records(targetAnchor);
    else if (command === "baseline") baseline(targetAnchor);
    else check(targetAnchor);
  };

  return { artifacts, baseline, check, diff, main, records };
}
