import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { assemblePluginRegistry } from "../../plugins/assembler.js";
import { availableDomains, loadPluginRegistry, type PluginRegistry } from "../../plugins/registry.js";
import { commitVendorStage, pathExists, prepareVendorStage, vendorProjectionDiff } from "../shared/staging.js";
import { PRODUCTION_DOMAIN_COUNTS, productionVendorInventoryErrors } from "../shared/production-vendors.js";
import { renderEducationCompleteTrees } from "./complete-tree.js";
import { assertEducationProductionApproved } from "./policy.js";

const VENDOR_ID = "education-agent-skills";

interface FileDisposition {
  source_path: string;
  output_path: string;
  disposition: "included";
  reason: "approved adapted Skill asset";
  sha256: string;
}

export interface EducationAgentSkillsConversionManifest {
  schema_version: "1";
  converter_version: "1";
  vendor_id: "education-agent-skills";
  release: "snapshot-32fce5c";
  revision: string;
  audit_sha256: string;
  evidence_map_sha256: string;
  production_policy_sha256: string;
  license_sha256: string;
  approved_tree_set_sha256: string;
  generated_skills: string[];
  excluded_skill_ids: string[];
  decision_counts: {
    admission: 165;
    evidence_adaptations: 872;
    advisory_relationships: 813;
    safety_domains: 136;
    hard_dependencies: 0;
  };
  tree_sha256: Record<string, string>;
  file_dispositions: FileDisposition[];
}

export interface ConvertEducationAgentSkillsOptions {
  repoRoot: string;
  outputRoot?: string;
  force?: boolean;
  dryRun?: boolean;
}

export async function convertEducationAgentSkills(options: ConvertEducationAgentSkillsOptions): Promise<EducationAgentSkillsConversionManifest> {
  const repoRoot = path.resolve(options.repoRoot);
  const outputRoot = path.resolve(options.outputRoot ?? path.join(repoRoot, "skills/plugins"));
  const rendered = await renderEducationCompleteTrees(repoRoot);
  assertEducationProductionApproved(rendered.policies, rendered.treeSetSha256);
  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-education-agent-skills-"));
  try {
    await prepareVendorStage(path.join(repoRoot, "skills/plugins"), stage, VENDOR_ID);
    const manifest = await generateBundle(stage, rendered);
    await assemblePluginRegistry({ repoRoot, pluginRoot: stage });
    if (options.dryRun) return manifest;
    if (!options.force && await pathExists(path.join(outputRoot, "vendors", VENDOR_ID)) && (await vendorProjectionDiff(stage, outputRoot, VENDOR_ID)).length) {
      throw new Error("Education Agent Skills generated output has drift; run with --force after reviewing the converter inputs.");
    }
    await commitVendorStage(stage, outputRoot, VENDOR_ID);
    return manifest;
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

export async function checkEducationAgentSkillsOutput(repoRoot: string): Promise<{ ok: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    const rendered = await renderEducationCompleteTrees(repoRoot);
    assertEducationProductionApproved(rendered.policies, rendered.treeSetSha256);
    const loaded = await loadPluginRegistry(path.join(repoRoot, "skills/plugins"));
    const vendor = loaded.vendors.get(VENDOR_ID);
    if (!vendor) errors.push("Education Agent Skills vendor is absent from the bundled registry");
    else {
      if (vendor.skills.length !== rendered.trees.length) errors.push(`Expected ${String(rendered.trees.length)} Education Agent Skills, found ${String(vendor.skills.length)}`);
      if (vendor.skills.some((skill) => skill.dependencies.length)) errors.push("Education Agent Skills Registry Schema 1 dependencies must remain empty");
      const expectedSkillIds = rendered.trees.map((tree) => tree.skillId);
      if (JSON.stringify(vendor.skills.map((skill) => skill.skill_id).sort(compareText)) !== JSON.stringify(expectedSkillIds)) {
        errors.push("Education Agent Skills bundled Skill IDs differ from the approved complete trees");
      }
    }
    errors.push(...productionVendorInventoryErrors(loaded.vendors.keys()));
    if (loaded.domains.size !== PRODUCTION_DOMAIN_COUNTS.internal) errors.push(`Expected ${String(PRODUCTION_DOMAIN_COUNTS.internal)} internal domains, found ${String(loaded.domains.size)}`);
    if (availableDomains(loaded).length !== PRODUCTION_DOMAIN_COUNTS.available) errors.push(`Expected ${String(PRODUCTION_DOMAIN_COUNTS.available)} available domains, found ${String(availableDomains(loaded).length)}`);
    for (const domainId of rendered.policies.policy.domains.allowed) {
      const expected = rendered.trees.filter((tree) => tree.domainId === domainId).map((tree) => tree.skillId);
      const actual = loaded.domains.get(domainId)?.skills ?? [];
      if (JSON.stringify(actual) !== JSON.stringify(expected)) errors.push(`Education Agent Skills membership differs for domain ${domainId}`);
    }
    const manifest = JSON.parse(await readFile(path.join(repoRoot, "skills/plugins/vendor-manifests/education-agent-skills.json"), "utf8")) as EducationAgentSkillsConversionManifest;
    if (manifest.approved_tree_set_sha256 !== rendered.treeSetSha256) errors.push("Education Agent Skills manifest does not bind the approved complete-tree hash");
    warnings.push(...loaded.diagnostics.map((item) => item.message));
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { ok: errors.length === 0, errors, warnings };
}

export async function checkEducationAgentSkillsIdempotence(repoRoot: string): Promise<{ ok: boolean; drift_paths: string[] }> {
  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-education-agent-skills-check-"));
  try {
    await convertEducationAgentSkills({ repoRoot, outputRoot: stage, force: true });
    const driftPaths = await vendorProjectionDiff(stage, path.join(repoRoot, "skills/plugins"), VENDOR_ID);
    return { ok: driftPaths.length === 0, drift_paths: driftPaths };
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

async function generateBundle(
  outputRoot: string,
  rendered: Awaited<ReturnType<typeof renderEducationCompleteTrees>>,
): Promise<EducationAgentSkillsConversionManifest> {
  const fileDispositions: FileDisposition[] = [];
  const vendorSkills: PluginRegistry["vendors"][number]["skills"] = [];
  for (const tree of rendered.trees) {
    const outputSkillRoot = path.join(outputRoot, "vendors", VENDOR_ID, tree.skillId);
    for (const file of tree.files) {
      const target = path.join(outputSkillRoot, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content);
      fileDispositions.push({
        source_path: file.path === "SKILL.md" ? tree.sourcePath : `generated/${file.path}`,
        output_path: `vendors/${VENDOR_ID}/${tree.skillId}/${file.path}`,
        disposition: "included",
        reason: "approved adapted Skill asset",
        sha256: file.sha256,
      });
    }
    vendorSkills.push({
      skill_id: tree.skillId,
      license: rendered.policies.policy.license.expression,
      dependencies: [],
      upstreams: [{ source_paths: [tree.sourcePath], adaptation: "converted" }],
    });
  }
  const vendor: PluginRegistry["vendors"][number] = {
    vendor_id: VENDOR_ID,
    name: "Education Agent Skills",
    repository_url: rendered.policies.audit.vendor.repository_url,
    release: rendered.policies.policy.release,
    revision: rendered.policies.policy.revision,
    license: rendered.policies.policy.license.expression,
    converter_version: rendered.policies.policy.converter_version,
    skills: vendorSkills,
  };
  const manifest: EducationAgentSkillsConversionManifest = {
    schema_version: "1",
    converter_version: "1",
    vendor_id: VENDOR_ID,
    release: rendered.policies.policy.release,
    revision: rendered.policies.policy.revision,
    audit_sha256: rendered.policies.policy.audit.sha256,
    evidence_map_sha256: rendered.policies.policy.evidence.sha256,
    production_policy_sha256: rendered.policies.policySha256,
    license_sha256: rendered.policies.policy.license.text_sha256,
    approved_tree_set_sha256: rendered.treeSetSha256,
    generated_skills: rendered.trees.map((tree) => tree.skillId),
    excluded_skill_ids: rendered.policies.admission.filter((item) => item.disposition === "excluded").map((item) => item.generated_skill_id).sort(compareText),
    decision_counts: {
      admission: 165,
      evidence_adaptations: 872,
      advisory_relationships: 813,
      safety_domains: 136,
      hard_dependencies: 0,
    },
    tree_sha256: Object.fromEntries(rendered.trees.map((tree) => [tree.skillId, tree.treeSha256])),
    file_dispositions: fileDispositions.sort((left, right) => compareText(left.output_path, right.output_path)),
  };
  await writeJson(path.join(outputRoot, "vendor-bundles/education-agent-skills.json"), { schema_version: "1", vendor });
  await writeJson(path.join(outputRoot, "vendor-manifests/education-agent-skills.json"), manifest);
  await writeText(path.join(outputRoot, "conversion-reports/education-agent-skills.md"), renderReport(manifest));
  return manifest;
}

function renderReport(manifest: EducationAgentSkillsConversionManifest): string {
  return `# Education Agent Skills Vendor Conversion

- Release: \`${manifest.release}\`
- Revision: \`${manifest.revision}\`
- Audit SHA-256: \`${manifest.audit_sha256}\`
- Evidence map SHA-256: \`${manifest.evidence_map_sha256}\`
- Production policy SHA-256: \`${manifest.production_policy_sha256}\`
- Approved complete-tree SHA-256: \`${manifest.approved_tree_set_sha256}\`
- Generated Skills: ${String(manifest.generated_skills.length)}
- Excluded Skills: ${String(manifest.excluded_skill_ids.length)}
- Evidence adaptation decisions: ${String(manifest.decision_counts.evidence_adaptations)}
- Advisory relationships: ${String(manifest.decision_counts.advisory_relationships)}
- Hard dependencies: 0

The converter copies only approved adapted \`SKILL.md\`, CC BY-SA 4.0
\`LICENSE\`, and \`NOTICE.md\` files. It does not execute upstream or generated
content, install dependencies, contact services, read credentials, upload
learner material, or grant ResearchSpec workflow authority.
`;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeText(filePath: string, value: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, value.endsWith("\n") ? value : `${value}\n`, "utf8");
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
