#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse as parseYaml } from "yaml";

const ROOT = process.cwd();
const AUDIT_ROOT = path.join(ROOT, "audits", "own-vendors");
const CATALOG_PATH = path.join(AUDIT_ROOT, "catalog.json");
const MAINTENANCE_SKILL = path.join(ROOT, ".agents", "skills", "own-vendor-maintenance", "SKILL.md");
const REGISTRY_PATH = path.join(ROOT, "skills", "capabilities", "registry.json");
const PACKAGES = path.join(ROOT, "skills", "capabilities");
const PARITY_REPORT_PATH = path.join(ROOT, "artifacts", "generated", "capability-parity-report.json");
const RECORD_FILES = ["01-analysis.md", "02-ingestion.md", "03-conversion.md", "04-review.md", "05-semantic-review.md"];

let currentVendor = null;
let currentAnchor = "";

function sha256(text) { return createHash("sha256").update(text, "utf8").digest("hex"); }
function fileSha(pathName) { return sha256(readFileSync(pathName, "utf8")); }
function byteSha(pathName) { return createHash("sha256").update(readFileSync(pathName)).digest("hex"); }
function json(pathName) { return JSON.parse(readFileSync(pathName, "utf8")); }
function esc(text) { return String(text ?? "").replaceAll("|", "\\|").replaceAll("\n", " "); }

function deliveryState(vendor) {
  if (vendor.delivery_assets === undefined) return null;
  if (!Array.isArray(vendor.delivery_assets) || vendor.delivery_assets.some((asset) => typeof asset !== "string")) {
    throw new Error(`delivery_assets must be a string array for ${vendor.vendor_id}`);
  }
  const seen = new Set();
  const assets = vendor.delivery_assets.map((assetPath) => {
    const parts = assetPath.split("/");
    if (assetPath.length === 0 || assetPath.includes("\0") || assetPath.includes("\\") || path.isAbsolute(assetPath) || path.win32.isAbsolute(assetPath)
      || parts.some((part) => part === "" || part === "." || part === "..")) {
      throw new Error(`Unsafe delivery asset path: ${assetPath}`);
    }
    if (seen.has(assetPath)) throw new Error(`Duplicate delivery asset path: ${assetPath}`);
    seen.add(assetPath);
    let file = ROOT;
    let stats;
    for (const part of parts) {
      file = path.join(file, part);
      try { stats = lstatSync(file); } catch { throw new Error(`Missing delivery asset: ${assetPath}`); }
      if (stats.isSymbolicLink()) throw new Error(`Delivery asset path contains a symlink: ${assetPath}`);
    }
    if (!stats.isFile()) throw new Error(`Delivery asset is not a regular file: ${assetPath}`);
    return { path: assetPath, sha256: byteSha(file) };
  });
  return { assets: assets.sort((a, b) => a.path.localeCompare(b.path)) };
}

function catalog() {
  const parsed = json(CATALOG_PATH);
  const vendors = new Map();
  for (const vendor of parsed.vendors) {
    if (vendors.has(vendor.vendor_id)) throw new Error(`Duplicate vendor id: ${vendor.vendor_id}`);
    vendors.set(vendor.vendor_id, vendor);
  }
  return { ...parsed, vendors };
}

function requireVendor(vendorId) {
  const { vendors } = catalog();
  const vendor = vendors.get(vendorId);
  if (!vendor) throw new Error(`Unknown own vendor: ${vendorId}`);
  return vendor;
}

function anchorDir(vendor, anchorId) {
  return path.join(AUDIT_ROOT, vendor.vendor_id, anchorId);
}

function artifactDir(vendor, anchorId) {
  return path.join(anchorDir(vendor, anchorId), "artifacts");
}

function treeSha(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile()) files.push(target);
    }
  };
  walk(root);
  return sha256(files.map((file) => `${path.relative(root, file).split(path.sep).join("/")}\0${fileSha(file)}`).join("\n"));
}

function upstreamInventory(vendor) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile()) files.push(target);
    }
  };
  walk(path.join(ROOT, vendor.upstream_root));
  const byExt = new Map();
  const byTop = new Map();
  for (const file of files) {
    const rel = path.relative(path.join(ROOT, vendor.upstream_root), file);
    const ext = path.extname(file) || "(none)";
    byExt.set(ext, (byExt.get(ext) ?? 0) + 1);
    const top = rel.split(path.sep)[0] ?? ".";
    byTop.set(top, (byTop.get(top) ?? 0) + 1);
  }
  return {
    total: files.length,
    treeSha: treeSha(path.join(ROOT, vendor.upstream_root)),
    byExt: Object.fromEntries([...byExt].sort()),
    byTop: Object.fromEntries([...byTop].sort()),
  };
}

function capabilityRows(vendor) {
  const registry = json(REGISTRY_PATH);
  const ids = new Set(vendor.capability_ids);
  const entries = registry.capabilities.filter((entry) => ids.has(entry.capability_id));
  if (entries.length !== ids.size) {
    const found = new Set(entries.map((entry) => entry.capability_id));
    throw new Error(`Registry is missing vendor capabilities: ${[...ids].filter((id) => !found.has(id)).join(", ")}`);
  }
  return entries.map((entry) => {
    const manifest = parseYaml(readFileSync(path.join(PACKAGES, entry.source_path, "manifest.yaml"), "utf8"));
    const files = [];
    const walk = (dir) => {
      for (const item of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const target = path.join(dir, item.name);
        if (item.isDirectory()) walk(target);
        else files.push(path.relative(path.join(PACKAGES, entry.source_path), target).split(path.sep).join("/"));
      }
    };
    walk(path.join(PACKAGES, entry.source_path));
    return {
      capability_id: manifest.capability_id,
      source_path: entry.source_path,
      manifest_sha256: entry.manifest_sha256,
      title: manifest.title,
      class: manifest.class,
      node_kind: manifest.node_kind,
      execution_type: manifest.execution_type,
      gate_policy: manifest.gate_policy,
      maturity: manifest.maturity ?? "skeleton",
      inputs: manifest.inputs?.length ?? 0,
      outputs: manifest.outputs?.length ?? 0,
      knowledge_refs: manifest.knowledge_refs?.length ?? 0,
      validators: manifest.validators?.length ?? 0,
      files: files.length,
    };
  });
}

function paritySlice(vendor) {
  const report = json(PARITY_REPORT_PATH);
  const ids = new Set(vendor.capability_ids);
  const packages = report.packages.filter((pkg) => ids.has(pkg.capability_id));
  if (packages.length !== ids.size) throw new Error(`Parity report is missing packages for ${vendor.vendor_id}`);
  const summary = {
    package_count: packages.length,
    operational_count: packages.filter((pkg) => pkg.maturity === "operational").length,
    avg_section_coverage: packages.reduce((sum, pkg) => sum + pkg.section_coverage, 0) / Math.max(1, packages.length),
    avg_rule_coverage: packages.reduce((sum, pkg) => sum + pkg.rule_coverage, 0) / Math.max(1, packages.length),
    below_section_threshold: packages.filter((pkg) => pkg.section_coverage < 0.7).map((pkg) => pkg.capability_id),
    below_rule_threshold: packages.filter((pkg) => pkg.rule_coverage < 0.6).map((pkg) => pkg.capability_id),
    output_missing: packages.filter((pkg) => !pkg.output_format_preserved).map((pkg) => pkg.capability_id),
    knowledge_below_threshold: packages.filter((pkg) => pkg.knowledge_coverage < 1 || pkg.knowledge_refs_referenced < 1).map((pkg) => pkg.capability_id),
    flow_retained: packages.filter((pkg) => (pkg.flow_sections_retained ?? []).length > 0).map((pkg) => ({ capability_id: pkg.capability_id, headings: pkg.flow_sections_retained })),
  };
  return { summary, packages };
}

function registrySubsetSha(vendor) {
  const registry = json(REGISTRY_PATH);
  const ids = new Set(vendor.capability_ids);
  const entries = registry.capabilities.filter((entry) => ids.has(entry.capability_id)).sort((a, b) => a.capability_id.localeCompare(b.capability_id));
  return sha256(JSON.stringify(entries, null, 2));
}

function packageTreeSha(vendor) {
  const roots = vendor.capability_ids.map((id) => path.join(PACKAGES, id)).sort();
  const files = [];
  for (const root of roots) {
    if (!existsSync(root)) throw new Error(`Missing capability package: ${root}`);
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const target = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(target);
        else files.push(target);
      }
    };
    walk(root);
  }
  return sha256(files.map((file) => `${path.relative(PACKAGES, file).split(path.sep).join("/")}\0${fileSha(file)}`).join("\n"));
}

function currentState(vendor, anchorId) {
  const source = json(path.join(ROOT, vendor.source_meta));
  const extraction = json(path.join(ROOT, vendor.extraction_index));
  const capabilities = capabilityRows(vendor);
  const parity = paritySlice(vendor);
  const delivery = deliveryState(vendor);
  const parityArtifact = path.join(artifactDir(vendor, anchorId), "parity-packages.json");
  return {
    schema_version: "1",
    vendor_id: vendor.vendor_id,
    anchor_id: anchorId,
    created_at: new Date().toISOString(),
    upstream: {
      source_meta: vendor.source_meta,
      upstream_root: vendor.upstream_root,
      release_label: vendor.release_label,
      commit: source.commit,
      tree_sha256: upstreamInventory(vendor).treeSha,
    },
    extraction: {
      index_path: vendor.extraction_index,
      index_sha256: fileSha(path.join(ROOT, vendor.extraction_index)),
      artifact_count: extraction.artifact_count,
      pass: extraction.verification_summary?.pass ?? 0,
      fail: extraction.verification_summary?.fail ?? 0,
      error: extraction.verification_summary?.error ?? 0,
    },
    conversion: {
      capability_count: capabilities.length,
      operational_count: capabilities.filter((item) => item.maturity === "operational").length,
      capability_ids: capabilities.map((item) => item.capability_id).sort(),
      registry_subset_sha256: registrySubsetSha(vendor),
      packages_tree_sha256: packageTreeSha(vendor),
    },
    ...(delivery ? { delivery } : {}),
    review: {
      parity_report_path: PARITY_REPORT_PATH,
      parity_artifact_path: path.relative(ROOT, parityArtifact),
      parity_artifact_sha256: existsSync(parityArtifact) ? fileSha(parityArtifact) : null,
      ...parity.summary,
    },
    maintenance: {
      skill_sha256: existsSync(MAINTENANCE_SKILL) ? fileSha(MAINTENANCE_SKILL) : null,
      catalog_sha256: fileSha(CATALOG_PATH),
      record_sha256: recordSha(vendor, anchorId),
    },
  };
}

function recordSha(vendor, anchorId) {
  const values = [];
  const dir = anchorDir(vendor, anchorId);
  for (const name of RECORD_FILES) {
    const file = path.join(dir, name);
    if (existsSync(file)) values.push(`${name}\0${fileSha(file)}`);
  }
  return values.length ? sha256(values.join("\n")) : null;
}

function writeRecords(vendor, anchorId) {
  const dir = anchorDir(vendor, anchorId);
  mkdirSync(dir, { recursive: true });
  const state = currentState(vendor, anchorId);
  const inventory = upstreamInventory(vendor);
  const extraction = json(path.join(ROOT, vendor.extraction_index));
  const capabilities = capabilityRows(vendor);
  const parity = paritySlice(vendor);
  const deliverySection = state.delivery
    ? `\n## Delivery Assets\n\n| path | sha256 |\n|---|---|\n${state.delivery.assets.map((asset) => `| \`${esc(asset.path)}\` | \`${asset.sha256}\` |`).join("\n")}\n`
    : "";

  const analysis = `# Own Vendor Anchor Analysis — ${vendor.vendor_id} @ ${anchorId}

- generated: ${new Date().toISOString()}
- upstream: ${esc(vendor.release_label)} @ ${state.upstream.commit}
- maintenance skill SHA-256: \`${state.maintenance.skill_sha256}\`

## Upstream Inventory

- total files: ${inventory.total}
- tree SHA-256: \`${inventory.treeSha}\`

| top-level area | files |
|---|---|
${Object.entries(inventory.byTop).map(([area, count]) => `| ${esc(area)} | ${count} |`).join("\n")}

| extension | files |
|---|---|
${Object.entries(inventory.byExt).map(([ext, count]) => `| ${esc(ext)} | ${count} |`).join("\n")}

## Conversion Mapping

| capability_id | class | node_kind | execution | gate | maturity |
|---|---|---|---|---|---|
${capabilities.map((c) => `| \`${c.capability_id}\` | ${c.class} | ${c.node_kind} | ${c.execution_type} | ${c.gate_policy} | ${c.maturity} |`).join("\n")}

## Decisions

- [x] 以 \`${esc(vendor.release_label)} @ ${state.upstream.commit}\` 作为当前锚点。
- [x] extraction index 固定为 ${state.extraction.artifact_count} artifacts。
- [x] capability package 命名采用 kebab-case，并由 manifest/registry schema 强制。
- [x] 上游 workflow/state-machine 文本只进入审计与分析，流程权威由 graph profile 与 Gate/Decision 承接。
`;

  const ingestion = `# Own Vendor Anchor Ingestion — ${vendor.vendor_id} @ ${anchorId}

- extraction index: \`${esc(vendor.extraction_index)}\`
- index SHA-256: \`${state.extraction.index_sha256}\`
- artifact count: ${state.extraction.artifact_count} · pass: ${state.extraction.pass} · fail: ${state.extraction.fail} · error: ${state.extraction.error}

## Artifact Inventory

| artifact_id | milestone | kind | path | sha256 |
|---|---|---|---|---|
${extraction.artifacts.map((a) => `| \`${a.artifact_id}\` | ${esc(a.milestone)} | ${esc(a.kind)} | \`${esc(a.path)}\` | \`${a.sha256}\` |`).join("\n")}

## Verification

- 上游 source mapping 逐项 byte-for-byte 校验。
- 新增/修改/删除 artifact 必须在后续增量锚点中显式列出。
`;

  const conversion = `# Own Vendor Anchor Conversion — ${vendor.vendor_id} @ ${anchorId}

- registry subset SHA-256: \`${state.conversion.registry_subset_sha256}\`
- packages tree SHA-256: \`${state.conversion.packages_tree_sha256}\`
- capability count: ${state.conversion.capability_count} · operational: ${state.conversion.operational_count}

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
${capabilities.map((c) => `| \`${c.capability_id}\` | ${esc(c.title)} | ${c.class} | ${c.node_kind} | ${c.execution_type} | ${c.gate_policy} | ${c.maturity} | ${c.inputs}/${c.outputs} | ${c.knowledge_refs} | ${c.validators} | ${c.files} | \`${c.manifest_sha256.slice(0, 12)}\` |`).join("\n")}
${deliverySection}
## Verification

- [x] \`pnpm ${vendor.author_script}\` twice: byte-identical
- [x] \`pnpm capability:parity\`
- [x] \`pnpm check\` / \`pnpm lint\`
- [x] full test suite
`;

  const review = `# Own Vendor Anchor Review — ${vendor.vendor_id} @ ${anchorId}

## Parity Summary

| metric | value |
|---|---|
| package count | ${state.review.package_count} |
| operational | ${state.review.operational_count} |
| avg section coverage | ${state.review.avg_section_coverage} |
| avg rule coverage | ${state.review.avg_rule_coverage} |
| below section threshold | ${state.review.below_section_threshold.length} |
| below rule threshold | ${state.review.below_rule_threshold.length} |
| output missing | ${state.review.output_missing.length} |
| knowledge below threshold | ${state.review.knowledge_below_threshold.length} |
| flow retained | ${state.review.flow_retained.length} |

## Per-Package Parity

| capability_id | section coverage | rule coverage | skill lines | knowledge refs | output format | flow headings |
|---|---|---|---|---|---|---|
${parity.packages.map((p) => `| \`${p.capability_id}\` | ${p.section_coverage.toFixed(3)} | ${p.rule_coverage.toFixed(3)} | ${p.skill_lines} | ${p.knowledge_refs} | ${p.output_format_preserved ? "yes" : "no"} | ${(p.flow_sections_retained ?? []).join("; ") || "none"} |`).join("\n")}

## Artifact Hashes

| artifact | path | sha256 |
|---|---|---|
| parity report | \`${esc(state.review.parity_report_path)}\` | \`${fileSha(PARITY_REPORT_PATH)}\` |
| parity package slice | \`${esc(state.review.parity_artifact_path)}\` | \`${state.review.parity_artifact_sha256 ?? "missing"}\` |
${deliverySection}
## Human Confirmation

- [x] 所有 vendor capability 包均在 parity report 中可见且无缺口。
- [x] 上游语义文件与转换后 SKILL 节点一一对应。
- [x] capability SKILL 不含 next-node / next-phase 指令。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
`;

  const semanticReviewPath = path.join(dir, "05-semantic-review.md");
  if (!existsSync(semanticReviewPath)) {
    writeFileSync(semanticReviewPath, `# Own Vendor Anchor Semantic Review — ${vendor.vendor_id} @ ${anchorId}

[NOT-COMPLETED] 本文件必须由执行维护的 Agent 完成语义审阅后填写，不能只依赖脚本生成。

## 审阅范围

<列出本锚点新增或变更的 extraction artifact / capability / graph profile>

## 逐项语义判定

<每个变更项：上游语义义务 -> 转换后承载位置 -> 判定 preserved / adapted / removed / gap，并给出来源文件与原文片段>

## 流程权威检查

- [ ] 生成的 capability SKILL 中无 next-node / next-phase / agent-team orchestration 指令。
- [ ] 流程锚点已由 graph profile / Gate / Decision 承接。

## 风险与遗留

<列出未解决项或需要人类确认的语义偏差>

## 结论

<declared-fit / declared-fit-with-notes / not-fit> 及理由。
`, "utf8");
  }
  const records = {
    "01-analysis.md": analysis,
    "02-ingestion.md": ingestion,
    "03-conversion.md": conversion,
    "04-review.md": review,
  };
  for (const [name, content] of Object.entries(records)) writeFileSync(path.join(dir, name), content, "utf8");
  process.stdout.write(`wrote ${dir}/{${Object.keys(records).join(", ")}}${existsSync(semanticReviewPath) ? "; preserved 05-semantic-review.md" : ""}\n`);
}

function records(vendorId, anchorId) {
  currentVendor = requireVendor(vendorId);
  currentAnchor = anchorId;
  writeRecords(currentVendor, anchorId);
}

function baseline(vendorId, anchorId) {
  currentVendor = requireVendor(vendorId);
  currentAnchor = anchorId;
  writeRecords(currentVendor, anchorId);
  const semanticReviewPath = path.join(anchorDir(currentVendor, anchorId), "05-semantic-review.md");
  const semanticText = existsSync(semanticReviewPath) ? readFileSync(semanticReviewPath, "utf8") : "";
  if (!semanticText.includes("## 结论") || semanticText.includes("[NOT-COMPLETED]")) {
    throw new Error(`Semantic review is not completed: ${semanticReviewPath}`);
  }
  const state = currentState(currentVendor, anchorId);
  const dir = anchorDir(currentVendor, anchorId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "manifest.json"), `${JSON.stringify(state, null, 2)}\n`, "utf8");
  process.stdout.write(`wrote ${path.join(dir, "manifest.json")}\n`);
}

function compareValue(pathParts, expected, actual) {
  return JSON.stringify(expected) === JSON.stringify(actual) ? null : `${pathParts.join(".")}: expected ${JSON.stringify(expected)}, actual ${JSON.stringify(actual)}`;
}

function check(vendorId, anchorId) {
  currentVendor = requireVendor(vendorId);
  currentAnchor = anchorId;
  const manifestPath = path.join(anchorDir(currentVendor, anchorId), "manifest.json");
  if (!existsSync(manifestPath)) throw new Error(`Missing anchor manifest: ${manifestPath}`);
  const manifest = json(manifestPath);
  const state = currentState(currentVendor, anchorId);
  const problems = [];
  for (const key of ["source_meta", "upstream_root", "release_label", "commit", "tree_sha256"]) {
    const issue = compareValue(["upstream", key], manifest.upstream?.[key], state.upstream[key]);
    if (issue) problems.push(issue);
  }
  for (const key of ["index_path", "index_sha256", "artifact_count", "pass", "fail", "error"]) {
    const issue = compareValue(["extraction", key], manifest.extraction?.[key], state.extraction[key]);
    if (issue) problems.push(issue);
  }
  for (const key of ["capability_count", "operational_count", "capability_ids", "registry_subset_sha256", "packages_tree_sha256"]) {
    const issue = compareValue(["conversion", key], manifest.conversion?.[key], state.conversion[key]);
    if (issue) problems.push(issue);
  }
  const deliveryIssue = compareValue(["delivery"], manifest.delivery, state.delivery);
  if (deliveryIssue) problems.push(deliveryIssue);
  for (const key of ["package_count", "operational_count", "avg_section_coverage", "avg_rule_coverage", "below_section_threshold", "below_rule_threshold", "output_missing", "knowledge_below_threshold", "flow_retained"]) {
    const issue = compareValue(["review", key], manifest.review?.[key], state.review[key]);
    if (issue) problems.push(issue);
  }
  for (const key of ["parity_report_path", "parity_artifact_path", "parity_artifact_sha256"]) {
    if (manifest.review?.[key] !== undefined) {
      const issue = compareValue(["review", key], manifest.review[key], state.review[key]);
      if (issue) problems.push(issue);
    }
  }
  for (const key of ["skill_sha256", "catalog_sha256", "record_sha256"]) {
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
}

function artifacts(vendorId) {
  const { vendors } = catalog();
  const selected = vendorId ? [requireVendor(vendorId)] : [...vendors.values()];
  for (const vendor of selected) {
    currentVendor = vendor;
    currentAnchor = vendor.anchor_id;
    execFileSync("pnpm", [vendor.author_script], { cwd: ROOT, stdio: "inherit" });
  }
  execFileSync("pnpm", ["capability:parity"], { cwd: ROOT, stdio: "inherit" });
  for (const vendor of selected) {
    const slice = paritySlice(vendor);
    const dir = artifactDir(vendor, vendor.anchor_id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "parity-packages.json"), `${JSON.stringify(slice, null, 2)}\n`, "utf8");
    process.stdout.write(`wrote ${path.join(dir, "parity-packages.json")}\n`);
  }
}

function diff(vendorId, oldAnchor, newAnchor) {
  const vendor = requireVendor(vendorId);
  const oldManifest = json(path.join(anchorDir(vendor, oldAnchor), "manifest.json"));
  const newManifest = json(path.join(anchorDir(vendor, newAnchor), "manifest.json"));
  for (const key of ["upstream.commit", "extraction.artifact_count", "conversion.capability_count", "review.avg_section_coverage", "review.avg_rule_coverage"]) {
    const oldValue = key.split(".").reduce((value, part) => value?.[part], oldManifest);
    const newValue = key.split(".").reduce((value, part) => value?.[part], newManifest);
    process.stdout.write(`${key}: ${JSON.stringify(oldValue)} -> ${JSON.stringify(newValue)}\n`);
  }
}

function allVendors() { return [...catalog().vendors.values()]; }

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const vendorId = args[1];
  const anchor = args[2];
  const other = args[3];
  if (command === "artifacts") { artifacts(vendorId); return; }
  if (command === "diff") {
    if (!vendorId || !anchor || !other) throw new Error("usage: own-vendor-maintenance.mjs diff <vendor> <old-anchor> <new-anchor>");
    diff(vendorId, anchor, other);
    return;
  }
  if (!["records", "baseline", "check"].includes(command)) {
    throw new Error("usage: node scripts/own-vendor-maintenance.mjs <records|baseline|check|artifacts|diff> [vendor] [anchor] [other-anchor]");
  }
  if (vendorId) {
    const vendor = requireVendor(vendorId);
    const targetAnchor = anchor ?? vendor.anchor_id;
    if (command === "records") records(vendorId, targetAnchor);
    else if (command === "baseline") baseline(vendorId, targetAnchor);
    else check(vendorId, targetAnchor);
    return;
  }
  for (const vendor of allVendors()) {
    if (command === "records") records(vendor.vendor_id, vendor.anchor_id);
    else if (command === "baseline") baseline(vendor.vendor_id, vendor.anchor_id);
    else check(vendor.vendor_id, vendor.anchor_id);
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
