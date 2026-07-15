import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { sha256 } from "../../core/workspace/write-plan.js";
import { assemblePluginRegistry } from "../../plugins/assembler.js";
import { availableDomains, loadPluginRegistry, type PluginRegistry } from "../../plugins/registry.js";
import { commitVendorStage, pathExists, prepareVendorStage, vendorProjectionDiff } from "../shared/staging.js";
import { productionVendorInventoryErrors } from "../shared/production-vendors.js";
import { assertFinRobotProductionReady, loadFinRobotDraftPolicies, type FinRobotDraftPolicies } from "./policy.js";
import { renderFinRobotPreviewSet } from "./preview.js";

const execFileAsync = promisify(execFile);
const VENDOR_ID = "finrobot";
const SOURCE_PATH = "vendor/finrobot";
const POLICY_PATH = "src/vendor-converters/finrobot";
const APPROVED_TREE_SET = "83cc17371bd3e0b82434f67e74adc5ed8a12cf11979480e1eb1f83debe1a9bb3";

interface FileDisposition {
  source_path: string;
  output_path: string;
  disposition: "included";
  reason: string;
  sha256: string;
}

export interface FinRobotConversionManifest {
  schema_version: "1";
  converter_version: "1";
  vendor_id: "finrobot";
  release: "snapshot-297a8d2";
  revision: string;
  audit_sha256: string;
  approved_tree_set_sha256: string;
  generated_skills: string[];
  source_entry_decisions: 146;
  surface_decisions: 66;
  direct_resources: 4;
  adapted_candidate_resources: 8;
  provider_helper_sources: 4;
  admission_policy_sha256: string;
  source_policy_sha256: string;
  surface_policy_sha256: string;
  curation_policy_sha256: string;
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
  const preview = await renderFinRobotPreviewSet(repoRoot);
  if (preview.draftSetSha256 !== APPROVED_TREE_SET) throw new Error("FinRobot rendered trees differ from the approved tree set.");

  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-"));
  try {
    await prepareVendorStage(path.join(repoRoot, "skills/plugins"), stage, VENDOR_ID);
    const manifest = await generateBundle(repoRoot, stage, policies, preview);
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
    const loaded = await loadPluginRegistry(path.join(repoRoot, "skills/plugins"));
    const vendor = loaded.vendors.get(VENDOR_ID);
    if (!vendor) errors.push("FinRobot vendor is absent from the bundled registry");
    else {
      if (vendor.skills.length !== 6) errors.push(`Expected 6 FinRobot Skills, found ${String(vendor.skills.length)}`);
      if (vendor.skills.some((skill) => skill.dependencies.length !== 0)) errors.push("FinRobot Registry Schema 1 dependencies must remain empty");
    }
    errors.push(...productionVendorInventoryErrors(loaded.vendors.keys()));
    if (loaded.domains.size !== 218) errors.push(`Expected 218 internal domains, found ${String(loaded.domains.size)}`);
    if (availableDomains(loaded).length !== 51) errors.push(`Expected 51 available domains, found ${String(availableDomains(loaded).length)}`);
    const manifest = JSON.parse(await readFile(path.join(repoRoot, "skills/plugins/vendor-manifests/finrobot.json"), "utf8")) as { approved_tree_set_sha256?: string };
    if (manifest.approved_tree_set_sha256 !== APPROVED_TREE_SET) errors.push("FinRobot manifest does not bind the approved complete-tree hash");
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
  preview: Awaited<ReturnType<typeof renderFinRobotPreviewSet>>,
): Promise<FinRobotConversionManifest> {
  const policyRoot = path.join(repoRoot, POLICY_PATH);
  const profiles = new Map<string, FinRobotDraftPolicies["curation"]["profiles"][number]>(
    policies.curation.profiles.map((profile) => [profile.generated_skill_id, profile]),
  );
  const fileDispositions: FileDisposition[] = [];
  const vendorSkills: PluginRegistry["vendors"][number]["skills"] = [];

  for (const skill of preview.previews) {
    const profile = profiles.get(skill.skillId);
    if (!profile) throw new Error(`FinRobot preview has no approved curation profile: ${skill.skillId}`);
    const outputSkillRoot = path.join(outputRoot, "vendors", VENDOR_ID, skill.skillId);
    for (const file of skill.files) {
      const target = path.join(outputSkillRoot, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content);
      fileDispositions.push({
        source_path: file.path.startsWith("resources/") ? `curation/${file.path}` : `complete-tree/${file.path}`,
        output_path: `vendors/${VENDOR_ID}/${skill.skillId}/${file.path}`,
        disposition: "included",
        reason: "approved complete-tree asset",
        sha256: file.sha256,
      });
    }
    const sourcePaths = policies.sourceEntries.decisions
      .filter((source) => source.output_assets.some((asset) => profile.resource_paths.includes(asset)))
      .map((source) => source.source_path)
      .sort(compareText);
    vendorSkills.push({
      skill_id: skill.skillId,
      license: "Apache-2.0",
      dependencies: [],
      upstreams: [{ source_paths: sourcePaths, adaptation: "curated" }],
    });
  }

  const vendor: PluginRegistry["vendors"][number] = {
    vendor_id: VENDOR_ID,
    name: "FinRobot",
    repository_url: policies.audit.source.repository_url,
    release: policies.audit.source.release,
    revision: policies.audit.source.revision,
    license: "Apache-2.0",
    converter_version: "1",
    skills: vendorSkills.sort((left, right) => compareText(left.skill_id, right.skill_id)),
  };
  const direct = policies.sourceEntries.decisions.filter((item) => item.production_action === "direct-resource").length;
  const prompt = policies.sourceEntries.decisions.filter((item) => item.production_action === "prompt-resource").length;
  const adapted = policies.sourceEntries.decisions.filter((item) => item.production_action === "adapted-resource").length;
  const manifest: FinRobotConversionManifest = {
    schema_version: "1",
    converter_version: "1",
    vendor_id: VENDOR_ID,
    release: "snapshot-297a8d2",
    revision: policies.audit.source.revision,
    audit_sha256: policies.review.audit_sha256,
    approved_tree_set_sha256: preview.draftSetSha256,
    generated_skills: preview.previews.map((item) => item.skillId),
    source_entry_decisions: 146,
    surface_decisions: 66,
    direct_resources: direct as 4,
    adapted_candidate_resources: (prompt + adapted - 4) as 8,
    provider_helper_sources: 4,
    admission_policy_sha256: await policyHash(policyRoot, "admission-decisions.json"),
    source_policy_sha256: await policyHash(policyRoot, "source-entry-decisions.json"),
    surface_policy_sha256: await policyHash(policyRoot, "surface-decisions.json"),
    curation_policy_sha256: await policyHash(policyRoot, "curation-decisions.json"),
    review_policy_sha256: await policyHash(policyRoot, "review-decision.json"),
    tree_sha256: Object.fromEntries(preview.previews.map((item) => [item.skillId, item.sha256])),
    relationship_decisions: policies.relationships.decisions,
    file_dispositions: fileDispositions.sort((left, right) => compareText(left.output_path, right.output_path)),
  };
  if (direct !== 4 || prompt !== 6 || adapted !== 6) throw new Error("FinRobot executable source classification differs from the approved policy.");
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
  const { stdout: nested } = await execFileAsync("git", ["-C", sourceRoot, "submodule", "status", "FinNLP"]);
  if (!nested.startsWith("-")) throw new Error("FinRobot FinNLP gitlink must remain uninitialized.");
  if (!(await pathExists(path.join(repoRoot, "openspec/specs/finrobot-domain-skill-audit/spec.md")))) throw new Error("FinRobot audit main specification is absent.");
  const archives = await readdir(path.join(repoRoot, "openspec/changes/archive"));
  if (!archives.some((name) => name.endsWith("-audit-finrobot"))) throw new Error("FinRobot audit change must be archived before conversion.");
}

function renderReport(manifest: FinRobotConversionManifest): string {
  return `# FinRobot Vendor Conversion\n\n- Release: \`${manifest.release}\`\n- Revision: \`${manifest.revision}\`\n- Audit SHA-256: \`${manifest.audit_sha256}\`\n- Approved complete-tree SHA-256: \`${manifest.approved_tree_set_sha256}\`\n- Generated Skills: ${String(manifest.generated_skills.length)}\n- Source decisions: ${String(manifest.source_entry_decisions)}\n- Surface decisions: ${String(manifest.surface_decisions)}\n- Candidate executable classification: ${String(manifest.direct_resources)} direct, ${String(manifest.adapted_candidate_resources)} adapted, 0 hard-coupled exclusions\n- Provider/helper closure sources: ${String(manifest.provider_helper_sources)} adapted\n\nResearchSpec conversion, checking, packaging, installation, discovery, and update remain file-only and do not execute the distributed resources. The Skills retain reviewed financial-analysis capabilities and may use user-configured providers and execution environments without embedding credential values or private payloads.\n`;
}

async function policyHash(root: string, name: string): Promise<string> { return sha256(await readFile(path.join(root, name))); }
async function writeJson(filePath: string, value: unknown): Promise<void> { await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`); }
async function writeText(filePath: string, value: string): Promise<void> { await mkdir(path.dirname(filePath), { recursive: true }); await writeFile(filePath, value.endsWith("\n") ? value : `${value}\n`, "utf8"); }
function compareText(left: string, right: string): number { return left.localeCompare(right); }
