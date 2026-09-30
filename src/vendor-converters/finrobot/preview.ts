import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import { parse, stringify } from "yaml";

import { sha256 } from "../../core/workspace/write-plan.js";
import { loadPluginExtensionRegistry, type PluginExtensionRegistry } from "../../plugins/extensions.js";
import { posix, walkFiles } from "../shared/staging.js";
import { renderFinRobotCompleteTrees, type FinRobotTreeInputs } from "./complete-tree.js";
import { FINROBOT_SKILL_DEFINITIONS } from "./skill-definitions.js";

function required<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`Missing FinRobot candidate input: ${label}`);
  return value;
}

// The retained preview uses the same reviewed capability contracts as production.
export function finRobotCandidateDefinitions(): typeof FINROBOT_SKILL_DEFINITIONS {
  return structuredClone(FINROBOT_SKILL_DEFINITIONS);
}

export function finRobotCandidateInputs(repoRoot: string, anchorRoot: string, sourceRoot: string): FinRobotTreeInputs {
  return {
    auditPath: path.join(anchorRoot, "capability-audit.json"),
    policyRoot: path.join(anchorRoot, "candidate-policies"),
    authoredRoot: path.join(anchorRoot, "candidate-authoring"),
    supportPath: path.join(repoRoot, "src/vendor-converters/finrobot/lib/financial_support.py"),
    sourceRoot,
    definitions: finRobotCandidateDefinitions(),
  };
}

export async function previewFinRobot(repoRoot: string, anchorRoot: string, sourceRoot: string, check = false) {
  anchorRoot = await realpath(anchorRoot);
  const auditRoot = await realpath(path.join(path.resolve(repoRoot), "audits/finrobot"));
  if (!anchorRoot.startsWith(`${auditRoot}${path.sep}`)) throw new Error("FinRobot previews must stay under the vendor audit directory.");
  const rendered = await renderFinRobotCompleteTrees(repoRoot, finRobotCandidateInputs(repoRoot, anchorRoot, sourceRoot));
  if (rendered.reviewStatus !== "pending-human-review") throw new Error("Only pending FinRobot candidates can be previewed.");
  for (const entry of rendered.policies.audit.source_entries) {
    if (entry.kind === "gitlink") continue;
    const bytes = await readFile(path.join(sourceRoot, entry.path));
    const blob = createHash("sha1").update(`blob ${String(bytes.length)}\0`).update(bytes).digest("hex");
    if (bytes.length !== entry.bytes || sha256(bytes) !== entry.sha256 || blob !== entry.git_object_id) throw new Error(`FinRobot audit source differs: ${entry.path}`);
  }
  const outputRoot = path.join(anchorRoot, "artifacts/candidate");
  const assets = new Map<string, Buffer>();
  for (const tree of rendered.trees) for (const file of tree.files) assets.set(`vendors/finrobot/${tree.skillId}/${file.path}`, file.content);

  const catalog = JSON.parse(await readFile(path.join(repoRoot, "audits/finrobot/catalog.json"), "utf8")) as {
    extensions: Array<{ capability_id: string; raw_skill_id: string; execution_type: string; required_brief_fields: string[] }>;
    extension_domains: string[];
  };
  const production = await loadPluginExtensionRegistry(path.join(repoRoot, "skills/plugins/extensions"));
  const ids = new Set(catalog.extensions.map((item) => item.capability_id));
  const registry: PluginExtensionRegistry = {
    schema_version: "1", registry_version: rendered.policies.audit.source.release,
    capabilities: [], profiles: [],
    domains: production.registry.domains.filter((item) => catalog.extension_domains.includes(item.domain_id))
      .map((item) => ({ ...item, capabilities: item.capabilities.filter((id) => ids.has(id)), profiles: item.profiles.filter((id) => ids.has(id)) })),
  };
  const unchanged = new Set(["financial-research-corporate-risk", "financial-research-event-evidence"]);
  for (const extension of catalog.extensions) {
    const tree = required(rendered.trees.find((item) => item.skillId === extension.raw_skill_id), extension.raw_skill_id);
    const relativeRoot = `extensions/capabilities/${extension.capability_id}`;
    const originalRoot = path.join(repoRoot, "skills/plugins/extensions/capabilities", extension.capability_id);
    for (const file of await walkFiles(originalRoot)) assets.set(`${relativeRoot}/${posix(path.relative(originalRoot, file))}`, await readFile(file));
    const manifest = parse(required(assets.get(`${relativeRoot}/manifest.yaml`), `${relativeRoot}/manifest.yaml`).toString("utf8")) as {
      knowledge_refs: Array<{ path: string; content_hash: string }>;
      validators: Array<{ kind: string; runner?: { args_template: string[] } }>;
      provenance: { upstream_sources: Array<{ path: string; sha256: string }> };
    };
    const rawSkill = required(tree.files.find((file) => file.path === "SKILL.md"), `${tree.skillId}/SKILL.md`);
    if (!unchanged.has(tree.skillId)) {
      const original = required(assets.get(`${relativeRoot}/SKILL.md`), `${relativeRoot}/SKILL.md`).toString("utf8");
      const frontmatter = original.slice(0, original.indexOf("\n---\n", 4) + 5);
      const raw = rawSkill.content.toString("utf8");
      const body = raw.slice(raw.indexOf("\n---\n", 4) + 5).trim()
        .replaceAll("scripts/", "tools/").replaceAll("lib/financial_support.py", "tools/financial_support.py");
      const extra = tree.skillId.endsWith("relative-valuation") ? ["comparability_checks", "equity_bridge"]
        : tree.skillId.endsWith("statement-analysis") ? ["evidence_checks"]
          : tree.skillId.endsWith("company-fundamentals") ? ["numeric_evidence"] : [];
      const fields = [...new Set([...extension.required_brief_fields, ...extra])];
      assets.set(`${relativeRoot}/SKILL.md`, Buffer.from(`${frontmatter}\n${body}\n\n## ResearchSpec node contract\n\nExecute exactly one ResearchSpec capability node. Input: \`task_request\` (plugin-task.v1). Output: \`research_brief\` (plugin-result.v1), a JSON object at the declared output path. Required brief sections: ${fields.map((item) => `\`${item}\``).join(", ")}. All sections must carry evidence or explicit limitations.\n\nReturn the declared outputs and follow the active procedure packet. In standalone mode, report ordinary output paths without modifying ResearchSpec workflow state. In graph mode, use only the packet's handoff and exact advance selector.\n`));
      for (const validator of manifest.validators) if (validator.runner) {
        const index = validator.runner.args_template.indexOf("--required");
        if (index >= 0) validator.runner.args_template[index + 1] = fields.join(",");
      }
    }
    for (const ref of manifest.knowledge_refs) {
      const name = path.posix.basename(ref.path);
      const rawPath = name === "financial_support.py" ? `lib/${name}` : `scripts/${name}`;
      const raw = tree.files.find((item) => item.path === rawPath);
      if (!raw) throw new Error(`Missing candidate tool: ${tree.skillId}/${rawPath}`);
      assets.set(`${relativeRoot}/${ref.path}`, raw.content);
      ref.content_hash = raw.sha256;
    }
    manifest.provenance.upstream_sources = tree.files.filter((item) => item.path === "SKILL.md" || item.path.startsWith("scripts/") || item.path.startsWith("lib/"))
      .map((item) => ({ path: posix(path.relative(repoRoot, path.join(outputRoot, "vendors/finrobot", tree.skillId, item.path))), sha256: item.sha256 }));
    const manifestBytes = Buffer.from(stringify(manifest));
    assets.set(`${relativeRoot}/manifest.yaml`, manifestBytes);
    const capabilityEntry = required(production.registry.capabilities.find((item) => item.capability_id === extension.capability_id), extension.capability_id);
    registry.capabilities.push({ ...capabilityEntry, manifest_sha256: sha256(manifestBytes) });
    const profile = required(production.registry.profiles.find((item) => item.profile_id === extension.capability_id), extension.capability_id);
    const profileBytes = await readFile(path.join(production.root, profile.source_path));
    assets.set(`extensions/${profile.source_path}`, profileBytes);
    registry.profiles.push({ ...profile, profile_sha256: sha256(profileBytes) });
  }
  assets.set("extensions/registry.json", Buffer.from(`${JSON.stringify(registry, null, 2)}\n`));
  const report = {
    schema_version: "1", review_status: rendered.reviewStatus, release: rendered.policies.audit.source.release,
    revision: rendered.policies.audit.source.revision, audit_sha256: rendered.policies.review.audit_sha256,
    published_tree_set_sha256: rendered.policies.review.published.tree_set_sha256,
    candidate_tree_set_sha256: rendered.treeSetSha256,
    trees: rendered.trees.map((item) => ({ skill_id: item.skillId, tree_sha256: item.sha256 })),
    files: [...assets].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([file, bytes]) => ({ path: file, sha256: sha256(bytes) })),
  };
  assets.set("review.json", Buffer.from(`${JSON.stringify(report, null, 2)}\n`));
  if (check) {
    const actual = (await walkFiles(outputRoot)).map((file) => posix(path.relative(outputRoot, file))).sort();
    if (JSON.stringify(actual) !== JSON.stringify([...assets.keys()].sort())) throw new Error("FinRobot candidate file closure differs from preview.");
    for (const [file, bytes] of assets) if (!(await readFile(path.join(outputRoot, file))).equals(bytes)) throw new Error(`FinRobot candidate output differs: ${file}`);
  } else {
    for (const [file] of assets) {
      const target = path.join(outputRoot, file);
      await mkdir(path.dirname(target), { recursive: true });
      const parent = await realpath(path.dirname(target));
      if (!parent.startsWith(`${anchorRoot}${path.sep}`)) throw new Error("FinRobot candidate output resolves outside the audit directory.");
      try {
        if (!(await lstat(target)).isFile()) throw new Error(`FinRobot candidate output is not an ordinary file: ${file}`);
      } catch (error) {
        if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
      }
    }
    for (const [file, bytes] of assets) await writeFile(path.join(outputRoot, file), bytes);
  }
  await loadPluginExtensionRegistry(path.join(outputRoot, "extensions"));
  return { ok: true as const, ...report, output_root: posix(path.relative(repoRoot, outputRoot)) };
}
