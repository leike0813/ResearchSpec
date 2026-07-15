import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

import { sha256 } from "../../core/workspace/write-plan.js";
import { validateNonNativeVendorSkill } from "../shared/non-native-skill-standard/index.js";
import { posix, walkFiles } from "../shared/staging.js";
import { histAgentSkillDefinition } from "./skill-definitions.js";
import { loadHistAgentPolicies, type HistAgentPolicies } from "./policy.js";

export interface HistAgentTreeFile { path: string; content: Buffer; sha256: string }
export interface HistAgentCompleteTree { skillId: string; entrypoint: string; commands: string[]; files: HistAgentTreeFile[]; sha256: string }

export async function renderHistAgentCompleteTrees(repoRoot: string): Promise<{ policies: HistAgentPolicies; trees: HistAgentCompleteTree[]; treeSetSha256: string }> {
  const policies = await loadHistAgentPolicies(repoRoot);
  const root = path.join(repoRoot, "src/vendor-converters/histagent");
  const license = await readFile(path.join(repoRoot, "vendor/histagent/LICENSE"));
  const supportLibrary = await readFile(path.join(root, "lib/historical_support.py"));
  const trees: HistAgentCompleteTree[] = [];

  for (const contract of [...policies.production.skill_contracts].sort((left, right) => compareText(left.skill_id, right.skill_id))) {
    const authored = await readTree(path.join(root, "skills", contract.skill_id));
    const surfaceMappings = policies.production.capability_map.filter((item) => item.skill_id === contract.skill_id);
    const surfaceSources = surfaceMappings.map((mapping) => {
      const surface = policies.audit.knowledge_surfaces.find((item) => item.surface_id === mapping.surface_id);
      if (!surface) throw new Error(`Missing HistAgent surface: ${mapping.surface_id}`);
      const entry = policies.audit.source_entries.find((item) => item.path === surface.source_path);
      if (!entry) throw new Error(`Missing HistAgent source entry: ${surface.source_path}`);
      return { surface_id: surface.surface_id, source_path: surface.source_path, source_sha256: entry.sha256, command: mapping.command, implementation: mapping.implementation, action: "independent-reimplementation" };
    });
    const overlay = new Map<string, Buffer>([
      ...authored,
      ["lib/historical_support.py", supportLibrary],
      ["LICENSE", license],
      ["NOTICE", Buffer.from(notice(), "utf8")],
      ["DERIVATION.json", jsonBytes({ schema_version: 1, vendor: "histagent", release: policies.audit.source.release, revision: policies.audit.source.revision, audit_sha256: policies.production.audit.sha256, implementation_strategy: "independent-capability-reimplementation", copied_upstream_code: false, sources: surfaceSources, attributed_source_evidence: policies.sourceEvidence.files })],
    ]);
    const files = [...overlay].map(([relative, content]) => ({ path: relative, content, sha256: sha256(content) })).sort((left, right) => compareText(left.path, right.path));
    validateCompleteTree(
      histAgentSkillDefinition(contract.skill_id),
      contract.formal_entrypoint,
      contract.commands,
      surfaceMappings.map((item) => item.optional_dependency).filter((item): item is string => item !== null),
      files,
    );
    const treeHash = sha256(Buffer.from(files.map((file) => `${file.path}\0${file.sha256}\n`).join(""), "utf8"));
    trees.push({ skillId: contract.skill_id, entrypoint: contract.formal_entrypoint, commands: contract.commands, files, sha256: treeHash });
  }
  const treeSetSha256 = sha256(Buffer.from(trees.map((tree) => `${tree.skillId}\0${tree.sha256}\n`).join(""), "utf8"));
  if (policies.review.tree_set_sha256 && policies.review.tree_set_sha256 !== treeSetSha256) throw new Error("HistAgent complete trees differ from the pending review hash.");
  if (policies.review.review_status === "approved" && policies.review.approved_tree_set_sha256 !== treeSetSha256) throw new Error("HistAgent approval does not bind the complete trees.");
  return { policies, trees, treeSetSha256 };
}

async function readTree(root: string): Promise<Map<string, Buffer>> {
  const result = new Map<string, Buffer>();
  for (const file of await walkFiles(root)) {
    const info = await lstat(file);
    if (!info.isFile()) throw new Error(`HistAgent authored tree contains a non-file: ${file}`);
    const relative = posix(path.relative(root, file));
    if (!safeRelative(relative)) throw new Error(`Unsafe HistAgent tree path: ${relative}`);
    result.set(relative, await readFile(file));
  }
  return result;
}

function validateCompleteTree(
  definition: ReturnType<typeof histAgentSkillDefinition>,
  entrypoint: string,
  commands: string[],
  optionalDependencies: string[],
  files: HistAgentTreeFile[],
): void {
  const skillId = definition.skillId;
  const byPath = new Map(files.map((file) => [file.path, file]));
  const required = ["SKILL.md", "LICENSE", "NOTICE", "DERIVATION.json", "lib/historical_support.py", entrypoint];
  for (const relative of required) if (!byPath.has(relative)) throw new Error(`HistAgent complete tree lacks ${relative}: ${skillId}`);
  const validation = validateNonNativeVendorSkill(definition, files);
  if (!validation.ok) {
    const summary = validation.diagnostics.map((item) => `${item.code}:${item.path ?? "definition"}:${item.subject ?? item.message}`).join("\n");
    throw new Error(`HistAgent complete tree violates the non-native Skill standard: ${skillId}\n${summary}`);
  }
  const capabilityIds = definition.capabilities.map((item) => item.id).sort(compareText);
  if (JSON.stringify(capabilityIds) !== JSON.stringify([...commands].sort(compareText))) throw new Error(`HistAgent command and capability definition drift: ${skillId}`);
  assertTreeSafety(skillId, files, optionalDependencies);
}

export function assertTreeSafety(skillId: string, files: HistAgentTreeFile[], optionalDependencies: string[] = []): void {
  const textFiles = files.filter((file) => !["LICENSE", "NOTICE", "DERIVATION.json"].includes(file.path));
  const declaredModules = new Set(optionalDependencies.map((name) => name.split(".")[0]));
  const standardModules = new Set(["__future__", "argparse", "base64", "datetime", "difflib", "hashlib", "html", "json", "os", "pathlib", "shutil", "subprocess", "sys", "tempfile", "typing", "urllib", "zipfile"]);
  const forbidden = [
    ["blocked browser implementation", /browser_use\//i],
    ["cookie material", /scripts\/cookies\.py|\bCOOKIES\b/],
    ["telemetry implementation", /browser_use.*telemetry|ProductTelemetry/],
    ["benchmark payload", /HistBench|GAIA dataset|HLE dataset/],
    ["repository coupling", /src\/vendor-converters|vendor\/histagent|audits\/histagent|ResearchSpec\/src/],
    ["private absolute path", /\/(?:home|Users)\/[A-Za-z0-9._-]+\//],
    ["fixed provider client", /\b(?:OpenAI|Anthropic)\s*\(|from\s+(?:openai|anthropic)\s+import/],
    ["embedded credential", /(?:api[_-]?key|token|password)\s*[=:]\s*["'][A-Za-z0-9_-]{16,}["']/i],
  ] as const;
  for (const file of textFiles) {
    const content = file.content.toString("utf8");
    for (const [label, pattern] of forbidden) if (pattern.test(content)) throw new Error(`HistAgent ${label} is forbidden: ${skillId}/${file.path}`);
    if (file.path.endsWith(".py")) {
      if (/^(?:from|import)\s+(?:researchspec|histagent|browser_use)\b/m.test(content)) throw new Error(`HistAgent undeclared repository import: ${skillId}/${file.path}`);
      if (/^(?:request_json|urllib\.request\.urlopen|subprocess\.run)\s*\(/m.test(content)) throw new Error(`HistAgent import-time I/O: ${skillId}/${file.path}`);
      for (const match of content.matchAll(/^\s*(?:from|import)\s+([A-Za-z_][A-Za-z0-9_.]*)/gm)) {
        const moduleName = match[1]?.split(".")[0];
        if (!moduleName) continue;
        if (!standardModules.has(moduleName) && !declaredModules.has(moduleName) && moduleName !== "historical_support") throw new Error(`HistAgent undeclared Python dependency: ${skillId}/${file.path}:${moduleName}`);
      }
    }
  }
}

function notice(): string {
  return `HistAgent capability reimplementation\n====================================\n\nThis standalone Skill preserves audited HistAgent capabilities through an independent implementation under Apache-2.0. It contains no copied HistAgent, AutoGen, Magentic-One, browser_use, benchmark, Cookie, telemetry, bytecode, or unverified media implementation. DERIVATION.json records immutable evidence and per-capability decisions. ResearchSpec is independent from and not endorsed by HistAgent or Microsoft.\n`;
}

function safeRelative(value: string): boolean { return value.length > 0 && !path.posix.isAbsolute(value) && !value.split("/").includes(".."); }
function jsonBytes(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
