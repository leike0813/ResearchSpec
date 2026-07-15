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
import {
  loadMaterialsPolicies,
  type MaterialsFileDecision,
  type MaterialsPolicies,
  type MaterialsRelationshipCatalog,
} from "./policy.js";

const execFileAsync = promisify(execFile);
const VENDOR_ID = "materials-science-skills-for-llm";
const SOURCE_PATH = "vendor/materials-science-skills-for-llm";
const POLICY_PATH = "src/vendor-converters/materials-science-skills-for-llm";

interface FileDisposition {
  source_path: string;
  output_path?: string;
  disposition: "included" | "excluded";
  reason: string;
  source_sha256: string;
  sha256?: string;
}

export interface MaterialsConversionManifest {
  schema_version: "1";
  converter_version: "1";
  vendor_id: "materials-science-skills-for-llm";
  release: "snapshot-fafd3ab";
  revision: string;
  audited_skills: 12;
  generated_skills: string[];
  excluded_skill_ids: string[];
  admission_policy_sha256: string;
  relationship_policy_sha256: string;
  file_policy_sha256: string;
  external_resource_policy_sha256: string;
  relationship_decisions: MaterialsRelationshipCatalog["decisions"];
  file_dispositions: FileDisposition[];
}

export interface ConvertMaterialsOptions { repoRoot: string; outputRoot?: string; force?: boolean; dryRun?: boolean }

export async function convertMaterials(options: ConvertMaterialsOptions): Promise<MaterialsConversionManifest> {
  const repoRoot = path.resolve(options.repoRoot);
  const outputRoot = path.resolve(options.outputRoot ?? path.join(repoRoot, "skills/plugins"));
  const policies = await loadMaterialsPolicies(repoRoot);
  const sourceRoot = path.join(repoRoot, SOURCE_PATH);
  await validateSource(sourceRoot, policies);

  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-materials-science-skills-"));
  try {
    await prepareVendorStage(path.join(repoRoot, "skills/plugins"), stage, VENDOR_ID);
    const manifest = await generateBundle(repoRoot, stage, sourceRoot, policies);
    await assemblePluginRegistry({ repoRoot, pluginRoot: stage });
    if (options.dryRun) return manifest;
    if (!options.force && await pathExists(path.join(outputRoot, "vendors", VENDOR_ID)) && (await vendorProjectionDiff(stage, outputRoot, VENDOR_ID)).length) {
      throw new Error("Materials generated output has drift; run with --force after reviewing the converter inputs.");
    }
    await commitVendorStage(stage, outputRoot, VENDOR_ID);
    return manifest;
  } finally { await rm(stage, { recursive: true, force: true }); }
}

export async function checkMaterialsOutput(repoRoot: string): Promise<{ ok: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    const policies = await loadMaterialsPolicies(repoRoot);
    const loaded = await loadPluginRegistry(path.join(repoRoot, "skills/plugins"));
    const expected = policies.admission.decisions.filter((item) => item.disposition === "admitted").length;
    const vendor = loaded.vendors.get(VENDOR_ID);
    if (!vendor) errors.push("Materials vendor is absent from the bundled registry");
    else if (vendor.skills.length !== expected) errors.push(`Expected ${String(expected)} Materials Skills, found ${String(vendor.skills.length)}`);
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

async function generateBundle(repoRoot: string, outputRoot: string, sourceRoot: string, policies: MaterialsPolicies): Promise<MaterialsConversionManifest> {
  const admitted = policies.admission.decisions.filter((item) => item.disposition === "admitted").sort((a, b) => compareText(a.generated_skill_id, b.generated_skill_id));
  const filesBySkill = new Map<string, MaterialsFileDecision[]>();
  for (const decision of policies.files.decisions) filesBySkill.set(decision.upstream_skill_id, [...(filesBySkill.get(decision.upstream_skill_id) ?? []), decision]);
  const policyRoot = path.join(repoRoot, POLICY_PATH);
  const licenseText = await readFile(path.join(sourceRoot, policies.audit.source.license_path), "utf8");
  const fileDispositions: FileDisposition[] = [];
  const vendorSkills: PluginRegistry["vendors"][number]["skills"] = [];

  for (const admission of admitted) {
    const audit = policies.audit.skills.find((item) => item.skill_id === admission.upstream_skill_id);
    if (!audit || !admission.license) throw new Error(`Admitted Materials Skill lacks audit or license: ${admission.upstream_skill_id}`);
    const outputSkillRoot = path.join(outputRoot, "vendors", VENDOR_ID, admission.generated_skill_id);
    await mkdir(outputSkillRoot, { recursive: true });
    for (const decision of (filesBySkill.get(admission.upstream_skill_id) ?? []).sort((a, b) => compareText(a.source_path, b.source_path))) {
      if (decision.disposition === "exclude") {
        fileDispositions.push({ source_path: decision.source_path, disposition: "excluded", reason: decision.reason, source_sha256: decision.source_sha256 });
        continue;
      }
      const content = decision.disposition === "copy"
        ? await readFile(path.join(sourceRoot, decision.source_path))
        : await readFile(path.join(policyRoot, decision.replacement_asset));
      const normalized = normalizeText(content);
      const target = path.join(outputSkillRoot, decision.output_path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, normalized);
      fileDispositions.push({
        source_path: decision.source_path,
        output_path: `vendors/${VENDOR_ID}/${admission.generated_skill_id}/${decision.output_path}`,
        disposition: "included",
        reason: decision.disposition === "copy" ? "reviewed source file copied" : "reviewed source-bound replacement asset",
        source_sha256: decision.source_sha256,
        sha256: sha256(normalized),
      });
    }
    await writeText(path.join(outputSkillRoot, "LICENSE"), licenseText);
    await writeText(path.join(outputSkillRoot, "NOTICE.md"), renderNotice(policies, admission.upstream_skill_id, admission.generated_skill_id, audit.source_path));
    vendorSkills.push({ skill_id: admission.generated_skill_id, license: "MIT", dependencies: [], upstreams: [{ source_paths: [audit.source_path], adaptation: "curated" }] });
  }

  const vendor: PluginRegistry["vendors"][number] = {
    vendor_id: VENDOR_ID,
    name: "Materials-Science-Skills-For-LLM",
    repository_url: policies.audit.source.repository_url,
    release: policies.audit.source.release,
    revision: policies.audit.source.revision,
    license: "MIT",
    converter_version: "1",
    skills: vendorSkills,
  };
  const manifest: MaterialsConversionManifest = {
    schema_version: "1",
    converter_version: "1",
    vendor_id: VENDOR_ID,
    release: "snapshot-fafd3ab",
    revision: policies.audit.source.revision,
    audited_skills: 12,
    generated_skills: admitted.map((item) => item.generated_skill_id),
    excluded_skill_ids: policies.admission.decisions.filter((item) => item.disposition === "excluded").map((item) => item.generated_skill_id).sort(compareText),
    admission_policy_sha256: await policyHash(policyRoot, "admission-decisions.json"),
    relationship_policy_sha256: await policyHash(policyRoot, "relationship-decisions.json"),
    file_policy_sha256: await policyHash(policyRoot, "file-decisions.json"),
    external_resource_policy_sha256: await policyHash(policyRoot, "external-resource-decisions.json"),
    relationship_decisions: policies.relationships.decisions,
    file_dispositions: fileDispositions.sort((a, b) => compareText(a.source_path, b.source_path)),
  };
  await writeJson(path.join(outputRoot, "vendor-bundles", `${VENDOR_ID}.json`), { schema_version: "1", vendor });
  await writeJson(path.join(outputRoot, "vendor-manifests", `${VENDOR_ID}.json`), manifest);
  await writeText(path.join(outputRoot, "conversion-reports", `${VENDOR_ID}.md`), renderReport(manifest));
  return manifest;
}

async function validateSource(sourceRoot: string, policies: MaterialsPolicies): Promise<void> {
  const { stdout } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD"]);
  if (stdout.trim() !== policies.audit.source.revision) throw new Error(`Materials checkout revision differs from audit: ${stdout.trim()}`);
  const { stdout: status } = await execFileAsync("git", ["-C", sourceRoot, "status", "--porcelain"]);
  if (status.trim()) throw new Error("Materials checkout must be clean before conversion.");
}

function renderNotice(policies: MaterialsPolicies, upstreamId: string, generatedId: string, sourcePath: string): string {
  const curated = policies.files.decisions.filter((item) => item.upstream_skill_id === upstreamId && item.disposition === "curate").map((item) => `\`${item.source_path}\``);
  const excluded = policies.files.decisions.filter((item) => item.upstream_skill_id === upstreamId && item.disposition === "exclude").map((item) => `\`${item.source_path}\``);
  return `# Notice\n\nThis Skill is adapted by ResearchSpec from Materials-Science-Skills-For-LLM (${policies.audit.source.repository_url}), ${policies.audit.source.release}, revision ${policies.audit.source.revision}.\n\nUpstream source: \`${sourcePath}\`. Generated Skill ID: \`${generatedId}\`. Copied and curated Skill content is distributed under MIT after per-file review. External software, models, datasets, services, documentation, and compute environments remain separately licensed and are not copied by ResearchSpec.\n\nResearchSpec used complete source-bound replacement assets and did not execute upstream commands, install dependencies, configure credentials, retrieve resources, access services, or submit scientific/HPC work.${curated.length ? `\n\nCurated source files: ${curated.join(", ")}.` : ""}${excluded.length ? `\n\nExcluded source files: ${excluded.join(", ")}.` : ""}\n`;
}

function renderReport(manifest: MaterialsConversionManifest): string {
  const curated = manifest.file_dispositions.filter((item) => item.reason === "reviewed source-bound replacement asset").length;
  const copied = manifest.file_dispositions.filter((item) => item.reason === "reviewed source file copied").length;
  const excluded = manifest.file_dispositions.filter((item) => item.disposition === "excluded").length;
  return `# Materials-Science-Skills-For-LLM Vendor Conversion\n\n- Release: \`${manifest.release}\`\n- Revision: \`${manifest.revision}\`\n- Audited Skills: ${String(manifest.audited_skills)}\n- Generated Skills: ${String(manifest.generated_skills.length)}\n- Excluded Skills: ${String(manifest.excluded_skill_ids.length)}\n- File decisions: ${String(copied)} copied, ${String(curated)} curated, ${String(excluded)} excluded\n- Audited relationships: ${String(manifest.relationship_decisions.length)} advisory or source-excluded; 0 hard dependencies\n\nThis isolated converter distributes static reviewed content only. External software, models, data, services, and compute environments remain user-managed prerequisites. ResearchSpec does not execute, provision, retrieve, authenticate, or submit work.\n`;
}

function normalizeText(content: Buffer): Buffer { return Buffer.from(content.toString("utf8").replace(/\r\n?/g, "\n"), "utf8"); }
async function policyHash(root: string, name: string): Promise<string> { return sha256(await readFile(path.join(root, name))); }
async function writeJson(filePath: string, value: unknown): Promise<void> { await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`); }
async function writeText(filePath: string, value: string): Promise<void> { await mkdir(path.dirname(filePath), { recursive: true }); await writeFile(filePath, value.endsWith("\n") ? value : `${value}\n`, "utf8"); }
function compareText(left: string, right: string): number { return left.localeCompare(right); }
