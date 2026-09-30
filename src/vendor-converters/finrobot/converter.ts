import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { sha256 } from "../../core/workspace/write-plan.js";
import { assemblePluginRegistry } from "../../plugins/assembler.js";
import { availableDomains, loadPluginRegistry, type PluginRegistry } from "../../plugins/registry.js";
import { commitVendorStage, pathExists, posix, prepareVendorStage, vendorProjectionDiff, walkFiles } from "../shared/staging.js";
import { loadProductionDomainCounts, productionVendorInventoryErrors } from "../shared/production-vendors.js";
import { renderFinRobotCompleteTrees } from "./complete-tree.js";
import { assertFinRobotProductionReady, loadFinRobotDraftPolicies, type FinRobotDraftPolicies } from "./policy.js";
import { FINROBOT_SKILL_DEFINITIONS } from "./skill-definitions.js";

const execFileAsync = promisify(execFile);
const VENDOR_ID = "finrobot";
const SOURCE_PATH = "vendor/finrobot";
const POLICY_PATH = "src/vendor-converters/finrobot";

interface FileDisposition {
  source_path: string;
  output_path: string;
  disposition: "included";
  reason: "approved complete-tree asset";
  sha256: string;
}

interface CapabilityImplementation {
  surface_id: string;
  skill_id: string;
  implementation_kind: "agent-procedure" | "bundled-script" | "external-tool";
  implementation_path: string;
}

export interface FinRobotConversionManifest {
  schema_version: "2";
  converter_version: "2";
  vendor_id: "finrobot";
  release: string;
  revision: string;
  audit_sha256: string;
  approved_tree_set_sha256: string;
  generated_skills: string[];
  decision_counts: {
    source_entries: number;
    knowledge_surfaces: number;
    admitted_capabilities: number;
    content_origins: number;
    license_claims: number;
    resources: number;
  };
  implementation_counts: {
    agent_procedures: number;
    bundled_scripts: number;
    external_tools: number;
    formal_entrypoints: 4;
    shared_support_copies: 4;
    references: 0;
  };
  capability_map: CapabilityImplementation[];
  admission_policy_sha256: string;
  source_policy_sha256: string;
  surface_policy_sha256: string;
  resource_policy_sha256: string;
  relationship_policy_sha256: string;
  review_policy_sha256: string;
  tree_sha256: Record<string, string>;
  relationship_decisions: FinRobotDraftPolicies["relationships"]["decisions"];
  file_dispositions: FileDisposition[];
}

export interface ConvertFinRobotOptions {
  repoRoot: string;
  outputRoot?: string;
  force?: boolean;
  dryRun?: boolean;
}

export async function convertFinRobot(options: ConvertFinRobotOptions): Promise<FinRobotConversionManifest> {
  const repoRoot = path.resolve(options.repoRoot);
  const outputRoot = path.resolve(options.outputRoot ?? path.join(repoRoot, "skills/plugins"));
  const policies = await loadFinRobotDraftPolicies(repoRoot);
  assertFinRobotProductionReady(policies);
  await validatePrerequisites(repoRoot, policies);
  const rendered = await renderFinRobotCompleteTrees(repoRoot);

  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-"));
  try {
    await prepareVendorStage(path.join(repoRoot, "skills/plugins"), stage, VENDOR_ID);
    const manifest = await generateBundle(repoRoot, stage, policies, rendered);
    await assemblePluginRegistry({ repoRoot, pluginRoot: stage });
    if (options.dryRun) return manifest;
    if (!options.force && await pathExists(path.join(outputRoot, "vendors", VENDOR_ID)) && (await vendorProjectionDiff(stage, outputRoot, VENDOR_ID)).length) {
      throw new Error("FinRobot generated output has drift; run with --force after reviewing the converter inputs.");
    }
    await commitVendorStage(stage, outputRoot, VENDOR_ID);
    return manifest;
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

export async function checkFinRobotOutput(repoRoot: string): Promise<{ ok: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    const policies = await loadFinRobotDraftPolicies(repoRoot);
    assertFinRobotProductionReady(policies);
    await validatePrerequisites(repoRoot, policies);
    const rendered = await renderFinRobotCompleteTrees(repoRoot);
    const loaded = await loadPluginRegistry(path.join(repoRoot, "skills/plugins"));
    const vendor = loaded.vendors.get(VENDOR_ID);
    if (!vendor) errors.push("FinRobot vendor is absent from the bundled registry");
    else {
      if (vendor.converter_version !== "2") errors.push(`Expected FinRobot converter version 2, found ${vendor.converter_version}`);
      if (vendor.skills.length !== 6) errors.push(`Expected 6 FinRobot Skills, found ${String(vendor.skills.length)}`);
      if (vendor.skills.some((skill) => skill.dependencies.length !== 0)) errors.push("FinRobot Registry Schema 1 dependencies must remain empty");
    }
    errors.push(...productionVendorInventoryErrors(loaded.vendors.keys()));
    const domainCounts = await loadProductionDomainCounts(repoRoot);
    if (loaded.domains.size !== domainCounts.internal) errors.push(`Expected ${String(domainCounts.internal)} internal domains, found ${String(loaded.domains.size)}`);
    if (availableDomains(loaded).length !== domainCounts.available) errors.push(`Expected ${String(domainCounts.available)} available domains, found ${String(availableDomains(loaded).length)}`);
    const banking = loaded.domains.get("banking-finance-and-investment")?.skills.filter((skillId) => skillId.startsWith("financial-research-")).sort(compareText) ?? [];
    const accounting = loaded.domains.get("accounting-auditing-and-accountability")?.skills.filter((skillId) => skillId.startsWith("financial-research-")).sort(compareText) ?? [];
    if (!sameValues(banking, rendered.trees.map((tree) => tree.skillId).sort(compareText))) errors.push("Banking, finance and investment does not contain all six FinRobot Skills");
    if (!sameValues(accounting, ["financial-research-company-fundamentals", "financial-research-statement-analysis"])) errors.push("Accounting, auditing and accountability has invalid FinRobot membership");
    const manifest = JSON.parse(await readFile(path.join(repoRoot, "skills/plugins/vendor-manifests/finrobot.json"), "utf8")) as FinRobotConversionManifest;
    if (manifest.converter_version !== "2" || manifest.approved_tree_set_sha256 !== rendered.treeSetSha256) errors.push("FinRobot manifest does not bind the approved version 2 complete-tree hash");
    for (const tree of rendered.trees) {
      if (manifest.tree_sha256[tree.skillId] !== tree.sha256) errors.push(`FinRobot manifest tree hash differs for ${tree.skillId}`);
      const generatedRoot = path.join(repoRoot, "skills/plugins/vendors/finrobot", tree.skillId);
      const generatedPaths = (await walkFiles(generatedRoot)).map((file) => posix(path.relative(generatedRoot, file))).sort(compareText);
      const approvedPaths = tree.files.map((file) => file.path).sort(compareText);
      if (!sameValues(generatedPaths, approvedPaths)) errors.push(`FinRobot generated file closure differs from the approved tree: ${tree.skillId}`);
      for (const file of tree.files) {
        const generated = await readFile(path.join(generatedRoot, file.path));
        if (!generated.equals(file.content)) errors.push(`FinRobot generated file differs from the approved tree: ${tree.skillId}/${file.path}`);
      }
    }
    warnings.push(...loaded.diagnostics.map((item) => item.message));
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { ok: errors.length === 0, errors, warnings };
}

export async function checkFinRobotIdempotence(repoRoot: string): Promise<{ ok: boolean; drift_paths: string[] }> {
  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-check-"));
  try {
    await convertFinRobot({ repoRoot, outputRoot: stage, force: true });
    const driftPaths = await vendorProjectionDiff(stage, path.join(repoRoot, "skills/plugins"), VENDOR_ID);
    return { ok: driftPaths.length === 0, drift_paths: driftPaths };
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

async function generateBundle(
  repoRoot: string,
  outputRoot: string,
  policies: FinRobotDraftPolicies,
  rendered: Awaited<ReturnType<typeof renderFinRobotCompleteTrees>>,
): Promise<FinRobotConversionManifest> {
  const fileDispositions: FileDisposition[] = [];
  const vendorSkills: PluginRegistry["vendors"][number]["skills"] = [];

  for (const tree of rendered.trees) {
    const outputSkillRoot = path.join(outputRoot, "vendors", VENDOR_ID, tree.skillId);
    for (const file of tree.files) {
      const target = path.join(outputSkillRoot, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content);
      fileDispositions.push({
        source_path: `authored-tree/${tree.skillId}/${file.path}`,
        output_path: `vendors/${VENDOR_ID}/${tree.skillId}/${file.path}`,
        disposition: "included",
        reason: "approved complete-tree asset",
        sha256: file.sha256,
      });
    }
    const definition = FINROBOT_SKILL_DEFINITIONS[tree.skillId];
    if (!definition) throw new Error(`FinRobot complete tree has no typed definition: ${tree.skillId}`);
    const sourcePaths = definition.capabilities.map((capability) => {
      const surface = policies.surfaces.decisions.find((item) => item.surface_id === capability.id);
      if (!surface) throw new Error(`FinRobot capability references an unknown surface: ${capability.id}`);
      return surface.source_path;
    });
    vendorSkills.push({
      skill_id: tree.skillId,
      license: "Apache-2.0",
      dependencies: [],
      upstreams: [{ source_paths: [...new Set(sourcePaths)].sort(compareText), adaptation: "curated" }],
    });
  }

  const vendor: PluginRegistry["vendors"][number] = {
    vendor_id: VENDOR_ID,
    name: "FinRobot",
    repository_url: policies.audit.source.repository_url,
    release: policies.audit.source.release,
    revision: policies.audit.source.revision,
    license: "Apache-2.0",
    converter_version: "2",
    skills: vendorSkills.sort((left, right) => compareText(left.skill_id, right.skill_id)),
  };
  const capabilityMap = Object.values(FINROBOT_SKILL_DEFINITIONS)
    .flatMap((definition) => definition.capabilities.map((capability) => manifestCapability(definition.skillId, capability)))
    .sort((left, right) => compareText(left.surface_id, right.surface_id));
  const policyRoot = path.join(repoRoot, POLICY_PATH);
  const manifest: FinRobotConversionManifest = {
    schema_version: "2",
    converter_version: "2",
    vendor_id: VENDOR_ID,
    release: policies.audit.source.release,
    revision: policies.audit.source.revision,
    audit_sha256: policies.review.audit_sha256,
    approved_tree_set_sha256: rendered.treeSetSha256,
    generated_skills: rendered.trees.map((tree) => tree.skillId),
    decision_counts: {
      source_entries: policies.sourceEntries.decisions.length,
      knowledge_surfaces: policies.surfaces.decisions.length,
      admitted_capabilities: capabilityMap.length,
      content_origins: policies.origins.decisions.length,
      license_claims: policies.licenses.decisions.length,
      resources: policies.resources.decisions.length,
    },
    implementation_counts: {
      agent_procedures: capabilityMap.filter((item) => item.implementation_kind === "agent-procedure").length,
      bundled_scripts: capabilityMap.filter((item) => item.implementation_kind === "bundled-script").length,
      external_tools: capabilityMap.filter((item) => item.implementation_kind === "external-tool").length,
      formal_entrypoints: 4,
      shared_support_copies: 4,
      references: 0,
    },
    capability_map: capabilityMap,
    admission_policy_sha256: await policyHash(policyRoot, "admission-decisions.json"),
    source_policy_sha256: await policyHash(policyRoot, "source-entry-decisions.json"),
    surface_policy_sha256: await policyHash(policyRoot, "surface-decisions.json"),
    resource_policy_sha256: await policyHash(policyRoot, "resource-decisions.json"),
    relationship_policy_sha256: await policyHash(policyRoot, "relationship-decisions.json"),
    review_policy_sha256: await policyHash(policyRoot, "review-decision.json"),
    tree_sha256: Object.fromEntries(rendered.trees.map((tree) => [tree.skillId, tree.sha256])),
    relationship_decisions: policies.relationships.decisions,
    file_dispositions: fileDispositions.sort((left, right) => compareText(left.output_path, right.output_path)),
  };
  await writeJson(path.join(outputRoot, "vendor-bundles/finrobot.json"), { schema_version: "1", vendor });
  await writeJson(path.join(outputRoot, "vendor-manifests/finrobot.json"), manifest);
  await writeText(path.join(outputRoot, "conversion-reports/finrobot.md"), renderReport(manifest));
  return manifest;
}

async function validatePrerequisites(repoRoot: string, policies: FinRobotDraftPolicies): Promise<void> {
  const sourceRoot = path.join(repoRoot, SOURCE_PATH);
  const { stdout } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD"]);
  if (stdout.trim() !== policies.audit.source.revision) throw new Error(`FinRobot checkout revision differs from audit: ${stdout.trim()}`);
  const { stdout: status } = await execFileAsync("git", ["-C", sourceRoot, "status", "--porcelain", "--ignore-submodules=all"]);
  if (status.trim()) throw new Error("FinRobot checkout must be clean before conversion.");
  for (const entry of policies.audit.source_entries.filter((item) => item.kind === "gitlink")) {
    const { stdout: nested } = await execFileAsync("git", ["-C", sourceRoot, "submodule", "status", entry.path]);
    if (!nested.startsWith(`-${entry.git_object_id} `)) throw new Error(`FinRobot gitlink must remain uninitialized: ${entry.path}`);
  }
  if (!(await pathExists(path.join(repoRoot, "openspec/specs/finrobot-domain-skill-audit/spec.md")))) throw new Error("FinRobot audit main specification is absent.");
  const archives = await readdir(path.join(repoRoot, "openspec/changes/archive"));
  if (!archives.some((name) => name.endsWith("-audit-finrobot"))) throw new Error("FinRobot audit change must be archived before conversion.");
}

function renderReport(manifest: FinRobotConversionManifest): string {
  return `# FinRobot Vendor Conversion\n\n- Release: \`${manifest.release}\`\n- Revision: \`${manifest.revision}\`\n- Audit SHA-256: \`${manifest.audit_sha256}\`\n- Converter version: \`${manifest.converter_version}\`\n- Approved complete-tree SHA-256: \`${manifest.approved_tree_set_sha256}\`\n- Generated Skills: ${String(manifest.generated_skills.length)}\n- Capability implementations: ${String(manifest.implementation_counts.agent_procedures)} Agent procedures, ${String(manifest.implementation_counts.bundled_scripts)} bundled-script mappings, ${String(manifest.implementation_counts.external_tools)} external-tool mappings\n- Formal entrypoints: ${String(manifest.implementation_counts.formal_entrypoints)}; shared support copies: ${String(manifest.implementation_counts.shared_support_copies)}; references: ${String(manifest.implementation_counts.references)}\n- Generated files: ${String(manifest.file_dispositions.length)}\n- Advisory relationships: ${String(manifest.relationship_decisions.length)}; 0 hard dependencies\n\nThe converter emits the exact approved complete trees through isolated five-vendor staging. Conversion, checking, packaging, installation, discovery, update, and registry assembly do not import or execute the Python entrypoints, install dependencies, read credentials, contact services, or grant ResearchSpec workflow authority.\n`;
}

function manifestCapability(
  skillId: string,
  capability: (typeof FINROBOT_SKILL_DEFINITIONS)[string]["capabilities"][number],
): CapabilityImplementation {
  if (capability.implementation.kind === "bundled-resource") throw new Error(`FinRobot capability cannot use a bundled-resource implementation: ${capability.id}`);
  return {
    surface_id: capability.id,
    skill_id: skillId,
    implementation_kind: capability.implementation.kind,
    implementation_path: capability.implementation.kind === "bundled-script" ? capability.implementation.scriptPath : "SKILL.md",
  };
}

async function policyHash(root: string, name: string): Promise<string> { return sha256(await readFile(path.join(root, name))); }
async function writeJson(filePath: string, value: unknown): Promise<void> { await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`); }
async function writeText(filePath: string, value: string): Promise<void> { await mkdir(path.dirname(filePath), { recursive: true }); await writeFile(filePath, value.endsWith("\n") ? value : `${value}\n`, "utf8"); }
function sameValues(left: string[], right: string[]): boolean { return JSON.stringify(left) === JSON.stringify(right); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
