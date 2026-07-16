import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

import { sha256 } from "../../core/workspace/write-plan.js";
import { validateNonNativeVendorSkill } from "../shared/non-native-skill-standard/index.js";
import { posix, walkFiles } from "../shared/staging.js";
import { loadMaterialsPolicies, type MaterialsPolicies } from "./policy.js";
import { MATERIALS_SKILL_DEFINITIONS, type MaterialsSkillDefinition } from "./skill-definitions.js";

export interface MaterialsTreeFile { path: string; content: Buffer; sha256: string }
export interface MaterialsCompleteTree {
  skillId: string;
  title: string;
  tier: 1 | 2;
  files: MaterialsTreeFile[];
  sha256: string;
}

export interface MaterialsCompleteTreeSet {
  policies: MaterialsPolicies;
  trees: MaterialsCompleteTree[];
  treeSetSha256: string;
  reviewStatus: "approved" | "unbound";
}

export async function renderMaterialsCompleteTrees(
  repoRoot: string,
  options: { enforceReview?: boolean } = {},
): Promise<MaterialsCompleteTreeSet> {
  const policies = await loadMaterialsPolicies(repoRoot);
  const root = path.join(repoRoot, "src/vendor-converters/materials-science-skills-for-llm");
  const license = await readFile(path.join(repoRoot, "vendor/materials-science-skills-for-llm/LICENSE"));
  const trees: MaterialsCompleteTree[] = [];

  for (const definition of Object.values(MATERIALS_SKILL_DEFINITIONS).sort((left, right) => compareText(left.skillId, right.skillId))) {
    const authored = await readTree(path.join(root, "skills", definition.skillId));
    const sourceDecisions = policies.files.decisions
      .filter((item) => item.upstream_skill_id === definition.upstreamSkillId)
      .sort((left, right) => compareText(left.source_path, right.source_path));
    const authoredPaths = [...authored.keys()].sort(compareText);
    const noticeBytes = Buffer.from(renderNotice(policies, definition, sourceDecisions), "utf8");
    const derivationBytes = jsonBytes({
      schema_version: 2,
      vendor: "materials-science-skills-for-llm",
      release: policies.audit.source.release,
      revision: policies.audit.source.revision,
      audit_sha256: policies.auditSha256,
      skill_id: definition.skillId,
      upstream_skill_id: definition.upstreamSkillId,
      skill_tier: definition.tier,
      implementation_strategy: "researchspec-authored-non-native-skill",
      upstream_code_copied: false,
      capability_map: definition.capabilities,
      source_file_map: sourceDecisions,
      files: [
        ...authoredPaths.map((filePath) => ({ path: filePath, authorship: "researchspec-authored-adaptation", source_scope: "reviewed-materials-skill-evidence" })),
        { path: "LICENSE", authorship: "upstream-license", source_scope: "vendor-root" },
        { path: "NOTICE.md", authorship: "researchspec-authored", source_scope: "immutable-audit-and-source-decisions" },
        { path: "DERIVATION.json", authorship: "converter-generated", source_scope: "immutable-audit-skill-definition-and-source-decisions" },
      ],
    });
    const overlay = new Map<string, Buffer>([
      ...authored,
      ["LICENSE", license],
      ["NOTICE.md", noticeBytes],
      ["DERIVATION.json", derivationBytes],
    ]);
    const files = [...overlay]
      .map(([relative, content]) => ({ path: relative, content, sha256: sha256(content) }))
      .sort((left, right) => compareText(left.path, right.path));
    validateCompleteTree(definition, files);
    const treeHash = sha256(Buffer.from(files.map((file) => `${file.path}\0${file.sha256}\n`).join(""), "utf8"));
    trees.push({ skillId: definition.skillId, title: definition.title, tier: definition.tier, files, sha256: treeHash });
  }

  const treeSetSha256 = sha256(Buffer.from(trees.map((tree) => `${tree.skillId}\0${tree.sha256}\n`).join(""), "utf8"));
  const approved = policies.review.published.tree_set_sha256 === treeSetSha256;
  if (options.enforceReview !== false && !approved) throw new Error("Materials complete trees differ from the approved review decision.");
  return { policies, trees, treeSetSha256, reviewStatus: approved ? "approved" : "unbound" };
}

async function readTree(root: string): Promise<Map<string, Buffer>> {
  const result = new Map<string, Buffer>();
  for (const file of await walkFiles(root)) {
    const info = await lstat(file);
    if (!info.isFile()) throw new Error(`Materials authored tree contains a non-file: ${file}`);
    const relative = posix(path.relative(root, file));
    if (!safeRelative(relative)) throw new Error(`Unsafe Materials tree path: ${relative}`);
    result.set(relative, await readFile(file));
  }
  return result;
}

function validateCompleteTree(definition: MaterialsSkillDefinition, files: MaterialsTreeFile[]): void {
  const byPath = new Map(files.map((file) => [file.path, file]));
  const required = ["SKILL.md", "LICENSE", "NOTICE.md", "DERIVATION.json", ...definition.references.map((item) => item.path)];
  for (const relative of required) if (!byPath.has(relative)) throw new Error(`Materials complete tree lacks ${relative}: ${definition.skillId}`);
  const referenceFiles = files.filter((file) => file.path.startsWith("references/"));
  if (definition.tier === 1 && referenceFiles.length) throw new Error(`Materials Tier 1 tree contains a reference: ${definition.skillId}`);
  if (definition.tier === 2 && referenceFiles.length !== 1) throw new Error(`Materials Tier 2 tree must contain exactly one reference: ${definition.skillId}`);
  if (files.some((file) => file.path.startsWith("scripts/") || file.path.startsWith("lib/") || file.path.startsWith("assets/") || file.path.startsWith("resources/"))) {
    throw new Error(`Materials external-tool tree contains an executable or unused resource: ${definition.skillId}`);
  }
  const validation = validateNonNativeVendorSkill(definition, files);
  if (!validation.ok) {
    const summary = validation.diagnostics.map((item) => `${item.code}:${item.path ?? "definition"}:${item.subject ?? item.message}`).join("\n");
    throw new Error(`Materials complete tree violates the non-native Skill standard: ${definition.skillId}\n${summary}`);
  }
  assertMaterialsTreeSafety(definition.skillId, files);
}

export function assertMaterialsTreeSafety(skillId: string, files: MaterialsTreeFile[]): void {
  const forbiddenBasenames = new Set(["runner.json", "runtime.json", "dependencies.json", "input.schema.json", "output.schema.json", "parameter.schema.json", "openai.yaml"]);
  const sensitiveAssignment = /\b(?:api[_-]?key|access[_-]?token|password|secret)\s*[:=]\s*["'][^"'\n]+["']/iu;
  for (const file of files) {
    if (forbiddenBasenames.has(path.posix.basename(file.path).toLowerCase())) throw new Error(`Materials forbidden runtime convention: ${skillId}/${file.path}`);
    if (["LICENSE", "NOTICE.md", "DERIVATION.json"].includes(file.path)) continue;
    const content = file.content.toString("utf8");
    if (sensitiveAssignment.test(content)) throw new Error(`Materials sensitive value is forbidden: ${skillId}/${file.path}`);
    if (/src\/vendor-converters|vendor\/materials-science-skills-for-llm|audits\/materials-science-skills-for-llm|\/Users\/|\/home\/[A-Za-z0-9._-]+\//u.test(content)) {
      throw new Error(`Materials repository or private-path coupling is forbidden: ${skillId}/${file.path}`);
    }
    if (/\b(?:pip3?|conda|uv|npm)\s+install\b|\bgit\s+clone\b|\bcurl\s+https?:|\bwget\s+https?:|\bdocker\s+pull\b/iu.test(content)) {
      throw new Error(`Materials dependency installation or download is forbidden: ${skillId}/${file.path}`);
    }
  }
}

function renderNotice(
  policies: MaterialsPolicies,
  definition: MaterialsSkillDefinition,
  sourceDecisions: MaterialsPolicies["files"]["decisions"],
): string {
  const adapted = sourceDecisions.filter((item) => item.disposition === "adapted").map((item) => `\`${item.source_path}\``);
  const excluded = sourceDecisions.filter((item) => item.disposition === "excluded").map((item) => `\`${item.source_path}\``);
  return `# Notice\n\nThis complete Skill is adapted by ResearchSpec from Materials-Science-Skills-For-LLM (${policies.audit.source.repository_url}), ${policies.audit.source.release}, revision ${policies.audit.source.revision}.\n\nUpstream Skill: \`${definition.upstreamSkillId}\`. Generated Skill ID: \`${definition.skillId}\`. The reviewed authored adaptation and copied root license are distributed under MIT. External software, models, datasets, services, documentation, GPU capacity, schedulers, and compute environments remain separately licensed and user managed.\n\nThe Skill contains no bundled executable, installer, credential handling, automatic network access, or ResearchSpec workflow authority. \`DERIVATION.json\` records source evidence and each Agent-procedure or external-tool implementation.\n\nAdapted source files: ${adapted.join(", ")}.${excluded.length ? `\n\nExcluded source files: ${excluded.join(", ")}.` : ""}\n`;
}

function safeRelative(value: string): boolean { return value.length > 0 && !path.posix.isAbsolute(value) && !value.split("/").includes(".."); }
function jsonBytes(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
