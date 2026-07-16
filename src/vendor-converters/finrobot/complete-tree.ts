import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

import { sha256 } from "../../core/workspace/write-plan.js";
import { validateNonNativeVendorSkill } from "../shared/non-native-skill-standard/index.js";
import { posix, walkFiles } from "../shared/staging.js";
import { assertNoSensitiveValues, loadFinRobotDraftPolicies, type FinRobotDraftPolicies } from "./policy.js";
import { FINROBOT_SKILL_DEFINITIONS, type FinRobotSkillDefinition } from "./skill-definitions.js";

export interface FinRobotTreeFile { path: string; content: Buffer; sha256: string }
export interface FinRobotCompleteTree {
  skillId: string;
  title: string;
  tier: 1 | 3;
  files: FinRobotTreeFile[];
  sha256: string;
}

export interface FinRobotCompleteTreeSet {
  policies: FinRobotDraftPolicies;
  trees: FinRobotCompleteTree[];
  treeSetSha256: string;
  reviewStatus: "pending-human-review" | "rejected" | "approved";
}

export async function renderFinRobotCompleteTrees(repoRoot: string): Promise<FinRobotCompleteTreeSet> {
  const policies = await loadFinRobotDraftPolicies(repoRoot);
  const root = path.join(repoRoot, "src/vendor-converters/finrobot");
  const license = await readFile(path.join(repoRoot, "vendor/finrobot/LICENSE"));
  const upstreamNotice = normalize(await readFile(path.join(repoRoot, "vendor/finrobot/NOTICE"), "utf8"));
  const supportLibrary = await readFile(path.join(root, "lib/financial_support.py"));
  const trees: FinRobotCompleteTree[] = [];

  for (const definition of Object.values(FINROBOT_SKILL_DEFINITIONS).sort((left, right) => compareText(left.skillId, right.skillId))) {
    const authored = await readTree(path.join(root, "skills", definition.skillId));
    const capabilitySources = definition.capabilities.map((capability) => {
      const surface = policies.audit.knowledge_surfaces.find((item) => item.surface_id === capability.id);
      if (!surface) throw new Error(`Missing FinRobot audited surface: ${capability.id}`);
      const source = policies.audit.source_entries.find((item) => item.path === surface.source_path);
      if (!source) throw new Error(`Missing FinRobot audited source: ${surface.source_path}`);
      return {
        surface_id: surface.surface_id,
        source_path: surface.source_path,
        source_sha256: source.sha256,
        symbol: surface.symbol,
        implementation: capability.implementation,
      };
    });
    const authoredPaths = [...authored.keys()].sort(compareText);
    const overlay = new Map<string, Buffer>([
      ...authored,
      ...(definition.tier === 3 ? [["lib/financial_support.py", supportLibrary] as [string, Buffer]] : []),
      ["LICENSE", license],
      ["NOTICE", Buffer.from(`${upstreamNotice}\n${notice()}`, "utf8")],
      ["DERIVATION.json", jsonBytes({
        schema_version: 2,
        vendor: "finrobot",
        release: policies.audit.source.release,
        revision: policies.audit.source.revision,
        audit_sha256: policies.review.audit_sha256,
        skill_id: definition.skillId,
        skill_tier: definition.tier,
        implementation_strategy: "researchspec-authored-non-native-skill",
        upstream_code_copied: false,
        capability_map: capabilitySources,
        files: [
          ...authoredPaths.map((filePath) => ({ path: filePath, authorship: "researchspec-authored", source_scope: "audited-capability-reimplementation" })),
          ...(definition.tier === 3 ? [{ path: "lib/financial_support.py", authorship: "researchspec-authored", source_scope: "shared-deterministic-support" }] : []),
          { path: "LICENSE", authorship: "upstream-license", source_scope: "vendor-root" },
          { path: "NOTICE", authorship: "combined-notice", source_scope: "vendor-root-and-researchspec" },
          { path: "DERIVATION.json", authorship: "converter-generated", source_scope: "immutable-audit-and-skill-definition" },
        ],
      })],
    ]);
    const files = [...overlay]
      .map(([relative, content]) => ({ path: relative, content, sha256: sha256(content) }))
      .sort((left, right) => compareText(left.path, right.path));
    validateCompleteTree(definition, files);
    const treeHash = sha256(Buffer.from(files.map((file) => `${file.path}\0${file.sha256}\n`).join(""), "utf8"));
    trees.push({ skillId: definition.skillId, title: definition.title, tier: definition.tier, files, sha256: treeHash });
  }

  const treeSetSha256 = sha256(Buffer.from(trees.map((tree) => `${tree.skillId}\0${tree.sha256}\n`).join(""), "utf8"));
  const candidate = policies.review.candidate;
  if (candidate?.tree_set_sha256 && candidate.tree_set_sha256 !== treeSetSha256) throw new Error("FinRobot complete candidate trees differ from the review decision.");
  if (policies.review.published.converter_version === "2" && policies.review.published.tree_set_sha256 !== treeSetSha256) throw new Error("FinRobot version 2 approval does not bind the complete trees.");
  return {
    policies,
    trees,
    treeSetSha256,
    reviewStatus: policies.review.published.converter_version === "2"
      ? policies.review.published.review_status
      : candidate?.review_status ?? "pending-human-review",
  };
}

async function readTree(root: string): Promise<Map<string, Buffer>> {
  const result = new Map<string, Buffer>();
  for (const file of await walkFiles(root)) {
    const info = await lstat(file);
    if (!info.isFile()) throw new Error(`FinRobot authored tree contains a non-file: ${file}`);
    const relative = posix(path.relative(root, file));
    if (!safeRelative(relative)) throw new Error(`Unsafe FinRobot tree path: ${relative}`);
    result.set(relative, await readFile(file));
  }
  return result;
}

function validateCompleteTree(definition: FinRobotSkillDefinition, files: FinRobotTreeFile[]): void {
  const byPath = new Map(files.map((file) => [file.path, file]));
  const required = ["SKILL.md", "LICENSE", "NOTICE", "DERIVATION.json", ...definition.references.map((item) => item.path)];
  if (definition.tier === 3) required.push("lib/financial_support.py", ...definition.scripts.map((item) => item.path));
  for (const relative of required) if (!byPath.has(relative)) throw new Error(`FinRobot complete tree lacks ${relative}: ${definition.skillId}`);
  if (definition.tier === 1 && files.some((file) => file.path.startsWith("scripts/") || file.path.startsWith("lib/") || file.path.startsWith("references/"))) throw new Error(`FinRobot Tier 1 tree contains an unused auxiliary asset: ${definition.skillId}`);
  const validation = validateNonNativeVendorSkill(definition, files);
  if (!validation.ok) {
    const summary = validation.diagnostics.map((item) => `${item.code}:${item.path ?? "definition"}:${item.subject ?? item.message}`).join("\n");
    throw new Error(`FinRobot complete tree violates the non-native Skill standard: ${definition.skillId}\n${summary}`);
  }
  assertTreeSafety(definition.skillId, files);
}

export function assertTreeSafety(skillId: string, files: FinRobotTreeFile[]): void {
  const forbiddenBasenames = new Set(["runner.json", "runtime.json", "dependencies.json", "input.schema.json", "output.schema.json", "parameter.schema.json", "openai.yaml"]);
  const standardModules = new Set(["__future__", "argparse", "collections", "datetime", "hashlib", "json", "math", "os", "pathlib", "sys", "tempfile", "typing"]);
  for (const file of files) {
    if (forbiddenBasenames.has(path.posix.basename(file.path).toLowerCase())) throw new Error(`FinRobot forbidden runtime convention: ${skillId}/${file.path}`);
    const content = file.content.toString("utf8");
    assertNoSensitiveValues(content, `${skillId}/${file.path}`);
    if (["LICENSE", "NOTICE", "DERIVATION.json"].includes(file.path)) continue;
    if (/src\/vendor-converters|vendor\/finrobot|audits\/finrobot|ResearchSpec\/src/.test(content)) throw new Error(`FinRobot repository coupling is forbidden: ${skillId}/${file.path}`);
    if (file.path.endsWith(".py")) {
      for (const [label, pattern] of [
        ["provider client", /\b(?:OpenAI|Anthropic|YFinance|FMP|SEC)\s*\(|from\s+(?:openai|anthropic|yfinance|requests|sec_api)\s+import/],
        ["credential access", /os\.(?:environ|getenv)|keyring|credential[_-]?store/i],
        ["network access", /urllib\.request|socket\.|requests\.|httpx\.|aiohttp\./],
        ["dependency installation", /(?:pip|uv|conda|npm)\s+install/],
      ] as const) if (pattern.test(content)) throw new Error(`FinRobot ${label} is forbidden: ${skillId}/${file.path}`);
      if (/^(?:from|import)\s+(?:researchspec|finrobot)\b/m.test(content)) throw new Error(`FinRobot repository import is forbidden: ${skillId}/${file.path}`);
      for (const match of content.matchAll(/^\s*(?:from|import)\s+([A-Za-z_][A-Za-z0-9_.]*)/gm)) {
        const moduleName = match[1]?.split(".")[0];
        if (moduleName && !standardModules.has(moduleName) && moduleName !== "financial_support") throw new Error(`FinRobot undeclared Python dependency: ${skillId}/${file.path}:${moduleName}`);
      }
    }
  }
}

function notice(): string {
  return `ResearchSpec adaptation notice\n------------------------------\nThis standalone Skill preserves audited FinRobot financial-research capabilities through ResearchSpec-authored procedures and deterministic Python 3.11 standard-library tools. It contains no FinRobot runtime, provider client, AgentSpec, prompt factory, credential handling, dependency installer, or automatic network access. DERIVATION.json records immutable evidence and per-capability implementation decisions. ResearchSpec and this Skill are independent from and not endorsed by FinRobot.\n`;
}

function safeRelative(value: string): boolean { return value.length > 0 && !path.posix.isAbsolute(value) && !value.split("/").includes(".."); }
function jsonBytes(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function normalize(value: string): string { return `${value.replace(/\r\n?/g, "\n").trim()}\n`; }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
