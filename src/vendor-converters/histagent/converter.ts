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
import { renderHistAgentCompleteTrees } from "./complete-tree.js";
import {
  assertHistAgentProductionReady,
  HISTAGENT_AUDIT_SHA256,
  HISTAGENT_RELEASE,
  HISTAGENT_REVISION,
  loadHistAgentPolicies,
  type HistAgentPolicies,
} from "./policy.js";

const execFileAsync = promisify(execFile);
const VENDOR_ID = "histagent";
const SOURCE_PATH = "vendor/histagent";
const POLICY_PATH = "src/vendor-converters/histagent";

interface FileDisposition {
  source_path: string;
  output_path: string;
  disposition: "included";
  reason: "approved complete-tree asset";
  sha256: string;
}

interface RelationshipDecision {
  from: string;
  to: string;
  relation: "advisory";
  note: string;
}

export interface HistAgentConversionManifest {
  schema_version: "1";
  converter_version: "1";
  vendor_id: "histagent";
  release: typeof HISTAGENT_RELEASE;
  revision: typeof HISTAGENT_REVISION;
  audit_sha256: typeof HISTAGENT_AUDIT_SHA256;
  approved_tree_set_sha256: string;
  generated_skills: string[];
  decision_counts: {
    source_entries: 120;
    knowledge_surfaces: 31;
    content_origins: 5;
    license_claims: 4;
    runtime_authorities: 10;
    external_resources: 16;
    security_findings: 10;
    candidates: 3;
  };
  capability_map: HistAgentPolicies["production"]["capability_map"];
  attributed_source_evidence: HistAgentPolicies["sourceEvidence"]["files"];
  production_policy_sha256: string;
  source_evidence_sha256: string;
  review_policy_sha256: string;
  tree_sha256: Record<string, string>;
  relationship_decisions: RelationshipDecision[];
  file_dispositions: FileDisposition[];
}

export interface ConvertHistAgentOptions {
  repoRoot: string;
  outputRoot?: string;
  force?: boolean;
  dryRun?: boolean;
}

export async function convertHistAgent(options: ConvertHistAgentOptions): Promise<HistAgentConversionManifest> {
  const repoRoot = path.resolve(options.repoRoot);
  const outputRoot = path.resolve(options.outputRoot ?? path.join(repoRoot, "skills/plugins"));
  const policies = await loadHistAgentPolicies(repoRoot);
  assertHistAgentProductionReady(policies);
  await validatePrerequisites(repoRoot, policies);
  const rendered = await renderHistAgentCompleteTrees(repoRoot);

  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-histagent-"));
  try {
    await prepareVendorStage(path.join(repoRoot, "skills/plugins"), stage, VENDOR_ID);
    const manifest = await generateBundle(repoRoot, stage, policies, rendered);
    await assemblePluginRegistry({ repoRoot, pluginRoot: stage });
    if (options.dryRun) return manifest;
    if (!options.force && await pathExists(path.join(outputRoot, "vendors", VENDOR_ID)) && (await vendorProjectionDiff(stage, outputRoot, VENDOR_ID)).length) {
      throw new Error("HistAgent generated output has drift; run with --force after reviewing the converter inputs.");
    }
    await commitVendorStage(stage, outputRoot, VENDOR_ID);
    return manifest;
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

export async function checkHistAgentOutput(repoRoot: string): Promise<{ ok: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    const policies = await loadHistAgentPolicies(repoRoot);
    assertHistAgentProductionReady(policies);
    await validatePrerequisites(repoRoot, policies);
    const rendered = await renderHistAgentCompleteTrees(repoRoot);
    const loaded = await loadPluginRegistry(path.join(repoRoot, "skills/plugins"));
    const vendor = loaded.vendors.get(VENDOR_ID);
    if (!vendor) errors.push("HistAgent vendor is absent from the bundled registry");
    else {
      if (vendor.skills.length !== 3) errors.push(`Expected 3 HistAgent Skills, found ${String(vendor.skills.length)}`);
      if (vendor.skills.some((skill) => skill.dependencies.length !== 0)) errors.push("HistAgent Registry Schema 1 dependencies must remain empty");
    }
    errors.push(...productionVendorInventoryErrors(loaded.vendors.keys()));
    const domainCounts = await loadProductionDomainCounts(repoRoot);
    if (loaded.domains.size !== domainCounts.internal) errors.push(`Expected ${String(domainCounts.internal)} internal domains, found ${String(loaded.domains.size)}`);
    if (availableDomains(loaded).length !== domainCounts.available) errors.push(`Expected ${String(domainCounts.available)} available domains, found ${String(availableDomains(loaded).length)}`);
    const historical = loaded.domains.get("historical-studies")?.skills.filter((skillId) => skillId.startsWith("histagent-")).sort(compareText) ?? [];
    const heritage = loaded.domains.get("heritage-archive-and-museum-studies")?.skills.filter((skillId) => skillId.startsWith("histagent-")).sort(compareText) ?? [];
    if (!sameValues(historical, rendered.trees.map((tree) => tree.skillId).sort(compareText))) errors.push("Historical studies does not contain all three HistAgent Skills");
    if (!sameValues(heritage, ["histagent-historical-source-analysis", "histagent-historical-source-identification"])) errors.push("Heritage, archive and museum studies has invalid HistAgent membership");
    const toolMembership = [...loaded.domains.values()].filter((domain) => domain.domain_type === "tool").some((domain) => domain.skills.some((skillId) => skillId.startsWith("histagent-")));
    if (toolMembership) errors.push("HistAgent Skills must not enter a tool domain");
    const manifest = JSON.parse(await readFile(path.join(repoRoot, "skills/plugins/vendor-manifests/histagent.json"), "utf8")) as HistAgentConversionManifest;
    if (manifest.approved_tree_set_sha256 !== rendered.treeSetSha256) errors.push("HistAgent manifest does not bind the approved complete-tree hash");
    for (const tree of rendered.trees) {
      if (manifest.tree_sha256[tree.skillId] !== tree.sha256) errors.push(`HistAgent manifest tree hash differs for ${tree.skillId}`);
      const generatedRoot = path.join(repoRoot, "skills/plugins/vendors/histagent", tree.skillId);
      const generatedPaths = (await walkFiles(generatedRoot)).map((file) => posix(path.relative(generatedRoot, file))).sort(compareText);
      const approvedPaths = tree.files.map((file) => file.path).sort(compareText);
      if (!sameValues(generatedPaths, approvedPaths)) errors.push(`HistAgent generated file closure differs from the approved tree: ${tree.skillId}`);
      for (const file of tree.files) {
        const generated = await readFile(path.join(generatedRoot, file.path));
        if (!generated.equals(file.content)) errors.push(`HistAgent generated file differs from the approved tree: ${tree.skillId}/${file.path}`);
      }
    }
    warnings.push(...loaded.diagnostics.map((item) => item.message));
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { ok: errors.length === 0, errors, warnings };
}

export async function checkHistAgentIdempotence(repoRoot: string): Promise<{ ok: boolean; drift_paths: string[] }> {
  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-histagent-check-"));
  try {
    await convertHistAgent({ repoRoot, outputRoot: stage, force: true });
    const driftPaths = await vendorProjectionDiff(stage, path.join(repoRoot, "skills/plugins"), VENDOR_ID);
    return { ok: driftPaths.length === 0, drift_paths: driftPaths };
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

async function generateBundle(
  repoRoot: string,
  outputRoot: string,
  policies: HistAgentPolicies,
  rendered: Awaited<ReturnType<typeof renderHistAgentCompleteTrees>>,
): Promise<HistAgentConversionManifest> {
  const fileDispositions: FileDisposition[] = [];
  const vendorSkills: PluginRegistry["vendors"][number]["skills"] = [];
  for (const tree of rendered.trees) {
    const outputSkillRoot = path.join(outputRoot, "vendors", VENDOR_ID, tree.skillId);
    for (const file of tree.files) {
      const target = path.join(outputSkillRoot, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content);
      fileDispositions.push({
        source_path: `complete-tree/${tree.skillId}/${file.path}`,
        output_path: `vendors/${VENDOR_ID}/${tree.skillId}/${file.path}`,
        disposition: "included",
        reason: "approved complete-tree asset",
        sha256: file.sha256,
      });
    }
    const candidate = policies.audit.candidate_skills.find((item) => item.skill_id === tree.skillId);
    if (!candidate) throw new Error(`HistAgent complete tree has no audited candidate: ${tree.skillId}`);
    const sourcePaths = candidate.source_surface_ids.map((surfaceId) => {
      const surface = policies.audit.knowledge_surfaces.find((item) => item.surface_id === surfaceId);
      if (!surface) throw new Error(`HistAgent candidate references an unknown surface: ${surfaceId}`);
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
    name: "HistAgent",
    repository_url: policies.audit.source.repository_url,
    release: policies.audit.source.release,
    revision: policies.audit.source.revision,
    license: "Apache-2.0",
    converter_version: "1",
    skills: vendorSkills.sort((left, right) => compareText(left.skill_id, right.skill_id)),
  };
  const relationships = policies.audit.candidate_skills.flatMap((candidate) => candidate.advisory_relationships.map((relationship) => ({
    from: candidate.skill_id,
    to: relationship.target_skill_id,
    relation: relationship.relation,
    note: relationship.note,
  }))).sort((left, right) => compareText(`${left.from}\0${left.to}`, `${right.from}\0${right.to}`));
  const policyRoot = path.join(repoRoot, POLICY_PATH);
  const manifest: HistAgentConversionManifest = {
    schema_version: "1",
    converter_version: "1",
    vendor_id: VENDOR_ID,
    release: HISTAGENT_RELEASE,
    revision: HISTAGENT_REVISION,
    audit_sha256: HISTAGENT_AUDIT_SHA256,
    approved_tree_set_sha256: rendered.treeSetSha256,
    generated_skills: rendered.trees.map((tree) => tree.skillId),
    decision_counts: {
      source_entries: 120,
      knowledge_surfaces: 31,
      content_origins: 5,
      license_claims: 4,
      runtime_authorities: 10,
      external_resources: 16,
      security_findings: 10,
      candidates: 3,
    },
    capability_map: policies.production.capability_map,
    attributed_source_evidence: policies.sourceEvidence.files,
    production_policy_sha256: await policyHash(policyRoot, "production-policy.json"),
    source_evidence_sha256: await policyHash(policyRoot, "source-evidence.json"),
    review_policy_sha256: await policyHash(policyRoot, "review-decision.json"),
    tree_sha256: Object.fromEntries(rendered.trees.map((tree) => [tree.skillId, tree.sha256])),
    relationship_decisions: relationships,
    file_dispositions: fileDispositions.sort((left, right) => compareText(left.output_path, right.output_path)),
  };
  await writeJson(path.join(outputRoot, "vendor-bundles/histagent.json"), { schema_version: "1", vendor });
  await writeJson(path.join(outputRoot, "vendor-manifests/histagent.json"), manifest);
  await writeText(path.join(outputRoot, "conversion-reports/histagent.md"), renderReport(manifest));
  return manifest;
}

async function validatePrerequisites(repoRoot: string, policies: HistAgentPolicies): Promise<void> {
  const sourceRoot = path.join(repoRoot, SOURCE_PATH);
  const { stdout } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD"]);
  if (stdout.trim() !== policies.audit.source.revision) throw new Error(`HistAgent checkout revision differs from audit: ${stdout.trim()}`);
  const { stdout: status } = await execFileAsync("git", ["-C", sourceRoot, "status", "--porcelain", "--ignore-submodules=all"]);
  if (status.trim()) throw new Error("HistAgent checkout must be clean before conversion.");
  if (!(await pathExists(path.join(repoRoot, "openspec/specs/histagent-domain-skill-audit/spec.md")))) throw new Error("HistAgent audit main specification is absent.");
  const archives = await readdir(path.join(repoRoot, "openspec/changes/archive"));
  if (!archives.some((name) => name.endsWith("-audit-histagent"))) throw new Error("HistAgent audit change must be archived before conversion.");
}

function renderReport(manifest: HistAgentConversionManifest): string {
  return `# HistAgent Vendor Conversion\n\n- Release: \`${manifest.release}\`\n- Revision: \`${manifest.revision}\`\n- Audit SHA-256: \`${manifest.audit_sha256}\`\n- Approved complete-tree SHA-256: \`${manifest.approved_tree_set_sha256}\`\n- Generated Skills: ${String(manifest.generated_skills.length)}\n- Capability decisions: ${String(manifest.capability_map.length)}\n- Generated files: ${String(manifest.file_dispositions.length)}\n- Advisory relationships: ${String(manifest.relationship_decisions.length)}; 0 hard dependencies\n- Attributed source evidence records: ${String(manifest.attributed_source_evidence.length)}\n\nThe converter emits the exact approved complete trees through isolated five-vendor staging. Conversion, checking, packaging, installation, discovery, update, and central assembly do not import or execute the Python entrypoints, install dependencies, read credentials, contact services, upload materials, or grant ResearchSpec workflow authority.\n`;
}

async function policyHash(root: string, name: string): Promise<string> { return sha256(await readFile(path.join(root, name))); }
async function writeJson(filePath: string, value: unknown): Promise<void> { await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`); }
async function writeText(filePath: string, value: string): Promise<void> { await mkdir(path.dirname(filePath), { recursive: true }); await writeFile(filePath, value.endsWith("\n") ? value : `${value}\n`, "utf8"); }
function sameValues(left: string[], right: string[]): boolean { return JSON.stringify(left) === JSON.stringify(right); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
