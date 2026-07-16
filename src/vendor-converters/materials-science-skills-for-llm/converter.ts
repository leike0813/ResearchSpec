import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { sha256 } from "../../core/workspace/write-plan.js";
import { assemblePluginRegistry } from "../../plugins/assembler.js";
import { availableDomains, loadPluginRegistry, type PluginRegistry } from "../../plugins/registry.js";
import { commitVendorStage, pathExists, prepareVendorStage, vendorProjectionDiff } from "../shared/staging.js";
import { PRODUCTION_DOMAIN_COUNTS, productionVendorInventoryErrors } from "../shared/production-vendors.js";
import { renderMaterialsCompleteTrees, type MaterialsCompleteTreeSet } from "./complete-tree.js";
import { type MaterialsFileDecision, type MaterialsRelationshipCatalog } from "./policy.js";
import { MATERIALS_SKILL_DEFINITIONS } from "./skill-definitions.js";

const execFileAsync = promisify(execFile);
const VENDOR_ID = "materials-science-skills-for-llm";
const SOURCE_PATH = "vendor/materials-science-skills-for-llm";
const POLICY_PATH = "src/vendor-converters/materials-science-skills-for-llm";

interface GeneratedFileDisposition {
  output_path: string;
  sha256: string;
}

export interface MaterialsConversionManifest {
  schema_version: "1";
  converter_version: "2";
  vendor_id: "materials-science-skills-for-llm";
  release: "snapshot-fafd3ab";
  revision: string;
  audit_sha256: string;
  approved_tree_set_sha256: string;
  audited_skills: 12;
  generated_skills: string[];
  excluded_skill_ids: string[];
  admission_policy_sha256: string;
  relationship_policy_sha256: string;
  file_policy_sha256: string;
  external_resource_policy_sha256: string;
  review_policy_sha256: string;
  implementation_counts: {
    agent_procedures: number;
    external_tools: number;
    references: number;
    bundled_scripts: 0;
  };
  generated_trees: Array<{ skill_id: string; tier: 1 | 2; sha256: string }>;
  relationship_decisions: MaterialsRelationshipCatalog["decisions"];
  source_file_dispositions: MaterialsFileDecision[];
  generated_file_dispositions: GeneratedFileDisposition[];
}

export interface ConvertMaterialsOptions { repoRoot: string; outputRoot?: string; force?: boolean; dryRun?: boolean }

export async function convertMaterials(options: ConvertMaterialsOptions): Promise<MaterialsConversionManifest> {
  const repoRoot = path.resolve(options.repoRoot);
  const outputRoot = path.resolve(options.outputRoot ?? path.join(repoRoot, "skills/plugins"));
  const rendered = await renderMaterialsCompleteTrees(repoRoot);
  await validateSource(path.join(repoRoot, SOURCE_PATH), rendered);

  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-materials-science-skills-"));
  try {
    await prepareVendorStage(path.join(repoRoot, "skills/plugins"), stage, VENDOR_ID);
    const manifest = await generateBundle(repoRoot, stage, rendered);
    await assemblePluginRegistry({ repoRoot, pluginRoot: stage });
    if (options.dryRun) return manifest;
    if (!options.force && await pathExists(path.join(outputRoot, "vendors", VENDOR_ID)) && (await vendorProjectionDiff(stage, outputRoot, VENDOR_ID)).length) {
      throw new Error("Materials generated output has drift; run with --force after reviewing the approved converter inputs.");
    }
    await commitVendorStage(stage, outputRoot, VENDOR_ID);
    return manifest;
  } finally { await rm(stage, { recursive: true, force: true }); }
}

export async function checkMaterialsOutput(repoRoot: string): Promise<{ ok: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    const rendered = await renderMaterialsCompleteTrees(repoRoot);
    const loaded = await loadPluginRegistry(path.join(repoRoot, "skills/plugins"));
    const vendor = loaded.vendors.get(VENDOR_ID);
    if (!vendor) errors.push("Materials vendor is absent from the bundled registry");
    else {
      if (vendor.converter_version !== "2") errors.push(`Expected Materials converter version 2, found ${vendor.converter_version}`);
      if (vendor.skills.length !== 7) errors.push(`Expected 7 Materials Skills, found ${String(vendor.skills.length)}`);
    }
    const manifest = JSON.parse(await readFile(path.join(repoRoot, "skills/plugins/vendor-manifests/materials-science-skills-for-llm.json"), "utf8")) as MaterialsConversionManifest;
    if (manifest.converter_version !== "2" || manifest.approved_tree_set_sha256 !== rendered.treeSetSha256) errors.push("Materials manifest does not bind the approved version 2 complete-tree hash");
    for (const definition of Object.values(MATERIALS_SKILL_DEFINITIONS)) {
      const actualDomains = [...loaded.domains.values()].filter((domain) => domain.skills.includes(definition.skillId)).map((domain) => domain.domain_id).sort(compareText);
      if (!sameArray(actualDomains, [...definition.domainIds].sort(compareText))) errors.push(`Materials domain membership differs from the definition: ${definition.skillId}`);
    }
    errors.push(...productionVendorInventoryErrors(loaded.vendors.keys()));
    if (loaded.domains.size !== PRODUCTION_DOMAIN_COUNTS.internal) errors.push(`Expected ${String(PRODUCTION_DOMAIN_COUNTS.internal)} internal domains, found ${String(loaded.domains.size)}`);
    if (availableDomains(loaded).length !== PRODUCTION_DOMAIN_COUNTS.available) errors.push(`Expected ${String(PRODUCTION_DOMAIN_COUNTS.available)} available domains, found ${String(availableDomains(loaded).length)}`);
    warnings.push(...loaded.diagnostics.map((item) => item.message));
  } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { ok: errors.length === 0, errors, warnings };
}

export async function checkMaterialsIdempotence(repoRoot: string): Promise<{ ok: boolean; drift_paths: string[] }> {
  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-materials-science-skills-check-"));
  try {
    await convertMaterials({ repoRoot, outputRoot: stage, force: true });
    const driftPaths = await vendorProjectionDiff(stage, path.join(repoRoot, "skills/plugins"), VENDOR_ID);
    return { ok: driftPaths.length === 0, drift_paths: driftPaths };
  } finally { await rm(stage, { recursive: true, force: true }); }
}

async function generateBundle(repoRoot: string, outputRoot: string, rendered: MaterialsCompleteTreeSet): Promise<MaterialsConversionManifest> {
  const { policies, trees } = rendered;
  const generatedFiles: GeneratedFileDisposition[] = [];
  const vendorSkills: PluginRegistry["vendors"][number]["skills"] = [];

  for (const tree of trees) {
    const definition = MATERIALS_SKILL_DEFINITIONS[tree.skillId];
    if (!definition) throw new Error(`Missing Materials definition for rendered tree: ${tree.skillId}`);
    const outputSkillRoot = path.join(outputRoot, "vendors", VENDOR_ID, tree.skillId);
    for (const file of tree.files) {
      const target = path.join(outputSkillRoot, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content);
      generatedFiles.push({ output_path: `vendors/${VENDOR_ID}/${tree.skillId}/${file.path}`, sha256: file.sha256 });
    }
    const sourcePaths = policies.files.decisions.filter((item) => item.upstream_skill_id === definition.upstreamSkillId).map((item) => item.source_path).sort(compareText);
    vendorSkills.push({
      skill_id: tree.skillId,
      license: "MIT",
      dependencies: [],
      upstreams: [{ source_paths: sourcePaths, adaptation: "curated" }],
    });
  }

  const vendor: PluginRegistry["vendors"][number] = {
    vendor_id: VENDOR_ID,
    name: "Materials-Science-Skills-For-LLM",
    repository_url: policies.audit.source.repository_url,
    release: policies.audit.source.release,
    revision: policies.audit.source.revision,
    license: "MIT",
    converter_version: "2",
    skills: vendorSkills,
  };
  const capabilities = Object.values(MATERIALS_SKILL_DEFINITIONS).flatMap((definition) => definition.capabilities);
  const manifest: MaterialsConversionManifest = {
    schema_version: "1",
    converter_version: "2",
    vendor_id: VENDOR_ID,
    release: "snapshot-fafd3ab",
    revision: policies.audit.source.revision,
    audit_sha256: policies.auditSha256,
    approved_tree_set_sha256: rendered.treeSetSha256,
    audited_skills: 12,
    generated_skills: trees.map((tree) => tree.skillId),
    excluded_skill_ids: policies.admission.decisions.filter((item) => item.disposition === "excluded").map((item) => item.generated_skill_id).sort(compareText),
    admission_policy_sha256: await policyHash(repoRoot, "admission-decisions.json"),
    relationship_policy_sha256: await policyHash(repoRoot, "relationship-decisions.json"),
    file_policy_sha256: await policyHash(repoRoot, "file-decisions.json"),
    external_resource_policy_sha256: await policyHash(repoRoot, "external-resource-decisions.json"),
    review_policy_sha256: await policyHash(repoRoot, "review-decision.json"),
    implementation_counts: {
      agent_procedures: capabilities.filter((item) => item.implementation.kind === "agent-procedure").length,
      external_tools: capabilities.filter((item) => item.implementation.kind === "external-tool").length,
      references: Object.values(MATERIALS_SKILL_DEFINITIONS).reduce((count, definition) => count + definition.references.length, 0),
      bundled_scripts: 0,
    },
    generated_trees: trees.map((tree) => ({ skill_id: tree.skillId, tier: tree.tier, sha256: tree.sha256 })),
    relationship_decisions: policies.relationships.decisions,
    source_file_dispositions: policies.files.decisions,
    generated_file_dispositions: generatedFiles.sort((left, right) => compareText(left.output_path, right.output_path)),
  };
  await writeJson(path.join(outputRoot, "vendor-bundles", `${VENDOR_ID}.json`), { schema_version: "1", vendor });
  await writeJson(path.join(outputRoot, "vendor-manifests", `${VENDOR_ID}.json`), manifest);
  await writeText(path.join(outputRoot, "conversion-reports", `${VENDOR_ID}.md`), renderReport(manifest));
  return manifest;
}

async function validateSource(sourceRoot: string, rendered: MaterialsCompleteTreeSet): Promise<void> {
  const { stdout } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD"]);
  if (stdout.trim() !== rendered.policies.audit.source.revision) throw new Error(`Materials checkout revision differs from audit: ${stdout.trim()}`);
  const { stdout: status } = await execFileAsync("git", ["-C", sourceRoot, "status", "--porcelain"]);
  if (status.trim()) throw new Error("Materials checkout must be clean before conversion.");
}

function renderReport(manifest: MaterialsConversionManifest): string {
  const adapted = manifest.source_file_dispositions.filter((item) => item.disposition === "adapted").length;
  const excluded = manifest.source_file_dispositions.filter((item) => item.disposition === "excluded").length;
  return `# Materials-Science-Skills-For-LLM Vendor Conversion\n\n- Release: \`${manifest.release}\`\n- Revision: \`${manifest.revision}\`\n- Audit SHA-256: \`${manifest.audit_sha256}\`\n- Converter version: \`${manifest.converter_version}\`\n- Approved complete-tree SHA-256: \`${manifest.approved_tree_set_sha256}\`\n- Audited Skills: ${String(manifest.audited_skills)}\n- Generated Skills: ${String(manifest.generated_skills.length)}\n- Excluded Skills: ${String(manifest.excluded_skill_ids.length)}\n- Capability implementations: ${String(manifest.implementation_counts.agent_procedures)} Agent procedures, ${String(manifest.implementation_counts.external_tools)} external-tool mappings, 0 bundled scripts\n- References: ${String(manifest.implementation_counts.references)} substantial conditional references\n- Source files: ${String(adapted)} adapted, ${String(excluded)} excluded\n- Generated files: ${String(manifest.generated_file_dispositions.length)}\n- Audited relationships: ${String(manifest.relationship_decisions.length)} advisory or source-excluded; 0 hard dependencies\n\nThe converter emits the exact approved complete authored trees through isolated five-vendor staging. Conversion, checking, packaging, installation, discovery, update, and registry assembly do not execute scientific software, install dependencies, retrieve resources, read credentials, contact services, compile software, or submit local, remote, GPU, scheduler, DFT, ALM, or HPC work.\n`;
}

async function policyHash(repoRoot: string, name: string): Promise<string> { return sha256(await readFile(path.join(repoRoot, POLICY_PATH, name))); }
async function writeJson(filePath: string, value: unknown): Promise<void> { await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`); }
async function writeText(filePath: string, value: string): Promise<void> { await mkdir(path.dirname(filePath), { recursive: true }); await writeFile(filePath, value.endsWith("\n") ? value : `${value}\n`, "utf8"); }
function sameArray(left: string[], right: string[]): boolean { return left.length === right.length && left.every((value, index) => value === right[index]); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
