import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { parse, stringify } from "yaml";

import { sha256 } from "../../core/workspace/write-plan.js";
import { assemblePluginRegistry } from "../../plugins/assembler.js";
import { availableDomains, loadPluginRegistry, type PluginRegistry } from "../../plugins/registry.js";
import { commitVendorStage, pathExists, posix, prepareVendorStage, vendorProjectionDiff, walkFiles } from "../shared/staging.js";
import {
  loadScientificAgentSkillsPolicies,
  type ScientificAgentSkillsAdmissionDecision,
  type ScientificAgentSkillsDependencyDecision,
  type ScientificAgentSkillsPolicies,
  type ScientificAgentSkillsResourceDecision,
} from "./policy.js";

const execFileAsync = promisify(execFile);
const VENDOR_ID = "scientific-agent-skills";
const SOURCE_PATH = "vendor/scientific-agent-skills";

interface FileDisposition {
  source_path: string;
  output_path?: string;
  disposition: "included" | "excluded";
  reason: string;
  sha256?: string;
}

export interface ScientificAgentSkillsConversionManifest {
  schema_version: "1";
  converter_version: "1";
  vendor_id: "scientific-agent-skills";
  release: "v2.53.0";
  revision: string;
  audited_skills: number;
  reviewed_candidates: number;
  generated_skills: string[];
  excluded_skill_ids: string[];
  admission_policy_sha256: string;
  dependency_policy_sha256: string;
  resource_policy_sha256: string;
  dependency_decisions: ScientificAgentSkillsDependencyDecision[];
  file_dispositions: FileDisposition[];
}

export interface ConvertScientificAgentSkillsOptions {
  repoRoot: string;
  outputRoot?: string;
  force?: boolean;
  dryRun?: boolean;
}

export async function convertScientificAgentSkills(options: ConvertScientificAgentSkillsOptions): Promise<ScientificAgentSkillsConversionManifest> {
  const repoRoot = path.resolve(options.repoRoot);
  const outputRoot = path.resolve(options.outputRoot ?? path.join(repoRoot, "skills/plugins"));
  const policies = await loadScientificAgentSkillsPolicies(repoRoot);
  const sourceRoot = path.join(repoRoot, SOURCE_PATH);
  await validateSource(sourceRoot, policies);

  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-scientific-agent-skills-"));
  try {
    await prepareVendorStage(path.join(repoRoot, "skills/plugins"), stage, VENDOR_ID);
    const manifest = await generateBundle(repoRoot, stage, sourceRoot, policies);
    await assemblePluginRegistry({ repoRoot, pluginRoot: stage });
    if (options.dryRun) return manifest;
    if (!options.force && await pathExists(path.join(outputRoot, "vendors", VENDOR_ID)) && (await vendorProjectionDiff(stage, outputRoot, VENDOR_ID)).length) {
      throw new Error("Scientific Agent Skills generated output has drift; run with --force after reviewing the converter inputs.");
    }
    await commitVendorStage(stage, outputRoot, VENDOR_ID);
    return manifest;
  } finally { await rm(stage, { recursive: true, force: true }); }
}

export async function checkScientificAgentSkillsOutput(repoRoot: string): Promise<{ ok: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    const policies = await loadScientificAgentSkillsPolicies(repoRoot);
    const expected = policies.admission.decisions.filter((decision) => decision.disposition === "admitted").length;
    const loaded = await loadPluginRegistry(path.join(repoRoot, "skills/plugins"));
    const vendor = loaded.vendors.get(VENDOR_ID);
    if (!vendor) errors.push("Scientific Agent Skills vendor is absent from the bundled registry");
    else if (vendor.skills.length !== expected) errors.push(`Expected ${String(expected)} Scientific Agent Skills, found ${String(vendor.skills.length)}`);
    if (loaded.vendors.size !== 2) errors.push(`Expected two production vendors, found ${String(loaded.vendors.size)}`);
    if (loaded.domains.size !== 218) errors.push(`Expected 218 internal domains, found ${String(loaded.domains.size)}`);
    if (!availableDomains(loaded).length) errors.push("Production registry has no available domains");
    warnings.push(...loaded.diagnostics.map((item) => item.message));
  } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { ok: errors.length === 0, errors, warnings };
}

export async function checkScientificAgentSkillsIdempotence(repoRoot: string): Promise<{ ok: boolean; drift_paths: string[] }> {
  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-scientific-agent-skills-check-"));
  try {
    await convertScientificAgentSkills({ repoRoot, outputRoot: stage, force: true });
    const driftPaths = await vendorProjectionDiff(stage, path.join(repoRoot, "skills/plugins"), VENDOR_ID);
    return { ok: driftPaths.length === 0, drift_paths: driftPaths };
  } finally { await rm(stage, { recursive: true, force: true }); }
}

async function generateBundle(repoRoot: string, outputRoot: string, sourceRoot: string, policies: ScientificAgentSkillsPolicies): Promise<ScientificAgentSkillsConversionManifest> {
  const auditById = new Map(policies.audit.skills.map((skill) => [skill.skill_id, skill]));
  const admitted = policies.admission.decisions.filter((decision) => decision.disposition === "admitted").sort((a, b) => compareText(a.generated_skill_id, b.generated_skill_id));
  const resourcesBySkill = new Map<string, ScientificAgentSkillsResourceDecision[]>();
  for (const decision of policies.resources.decisions) resourcesBySkill.set(decision.upstream_skill_id, [...(resourcesBySkill.get(decision.upstream_skill_id) ?? []), decision]);
  const requiredBySkill = new Map<string, string[]>();
  for (const decision of policies.dependencies.decisions) if (decision.disposition === "installed" && decision.resolved_target) requiredBySkill.set(decision.from, [...(requiredBySkill.get(decision.from) ?? []), decision.resolved_target]);
  const rootLicense = await readFile(path.join(sourceRoot, policies.audit.source.license_path), "utf8");
  const fileDispositions: FileDisposition[] = [];
  const vendorSkills: PluginRegistry["vendors"][number]["skills"] = [];

  for (const decision of admitted) {
    const audit = auditById.get(decision.upstream_skill_id);
    if (!audit || !decision.license) throw new Error(`Admitted Skill lacks audit or license: ${decision.upstream_skill_id}`);
    const sourceSkillRoot = path.join(sourceRoot, audit.source_path);
    const outputSkillRoot = path.join(outputRoot, "vendors", VENDOR_ID, decision.generated_skill_id);
    await mkdir(outputSkillRoot, { recursive: true });
    const sourceEntry = await readFile(path.join(sourceSkillRoot, "SKILL.md"), "utf8");
    const scriptPaths = (await walkFiles(path.join(sourceSkillRoot, "scripts"))).map((file) => posix(path.relative(sourceSkillRoot, file)));
    const adapted = adaptSkillEntry(decision, sourceEntry, scriptPaths);
    await writeText(path.join(outputSkillRoot, "SKILL.md"), adapted);
    fileDispositions.push(included(`${audit.source_path}/SKILL.md`, `vendors/${VENDOR_ID}/${decision.generated_skill_id}/SKILL.md`, adapted, "normalized reviewed Open Agent Skill entry"));

    const exclusions = new Map((resourcesBySkill.get(decision.upstream_skill_id) ?? []).map((item) => [item.source_path, item]));
    for (const sourceFile of await walkFiles(sourceSkillRoot)) {
      const relative = posix(path.relative(sourceSkillRoot, sourceFile));
      if (relative === "SKILL.md") continue;
      const sourcePath = `${audit.source_path}/${relative}`;
      const exclusion = exclusions.get(sourcePath);
      if (exclusion) {
        fileDispositions.push({ source_path: sourcePath, disposition: "excluded", reason: exclusion.reason });
        exclusions.delete(sourcePath);
        continue;
      }
      const target = path.join(outputSkillRoot, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await cp(sourceFile, target);
      fileDispositions.push({ source_path: sourcePath, output_path: `vendors/${VENDOR_ID}/${decision.generated_skill_id}/${relative}`, disposition: "included", reason: "reviewed source resource", sha256: sha256(await readFile(sourceFile)) });
    }
    if (exclusions.size) throw new Error(`Resource decisions reference absent files for ${decision.upstream_skill_id}: ${[...exclusions.keys()].join(", ")}`);

    const licenseText = decision.license.text_source === policies.audit.source.license_path
      ? rootLicense
      : await readFile(path.join(sourceRoot, decision.license.text_source), "utf8");
    await writeText(path.join(outputSkillRoot, "LICENSE"), licenseText.endsWith("\n") ? licenseText : `${licenseText}\n`);
    const excludedResources = (resourcesBySkill.get(decision.upstream_skill_id) ?? []).map((item) => `- \`${item.source_path}\`: ${item.reason}`).join("\n");
    const notice = `# Notice\n\nThis Skill is adapted by ResearchSpec from Scientific Agent Skills (${policies.audit.source.repository_url}) release ${policies.audit.source.release}, revision ${policies.audit.source.revision}.\n\nUpstream source: \`${audit.source_path}\`. Generated Skill ID: \`${decision.generated_skill_id}\`. Skill content license: ${decision.license.expression}. Package, service, dataset, and runtime licenses named by the upstream instructions remain separately applicable.\n\nResearchSpec normalized packaging, compatibility, resource disclosure, and authority boundaries. It did not execute scripts, install dependencies, configure credentials, or contact services.\n${excludedResources ? `\nExplicit resource exclusions:\n\n${excludedResources}\n` : ""}`;
    await writeText(path.join(outputSkillRoot, "NOTICE.md"), notice);
    vendorSkills.push({
      skill_id: decision.generated_skill_id,
      license: decision.license.expression,
      dependencies: [...new Set(requiredBySkill.get(decision.upstream_skill_id) ?? [])].sort(compareText),
      upstreams: [{ source_paths: [audit.source_path], adaptation: "converted" }],
    });
  }

  const vendor: PluginRegistry["vendors"][number] = {
    vendor_id: VENDOR_ID,
    name: "Scientific Agent Skills",
    repository_url: policies.audit.source.repository_url,
    release: policies.audit.source.release,
    revision: policies.audit.source.revision,
    license: policies.audit.source.root_license,
    converter_version: "1",
    skills: vendorSkills,
  };
  const manifest: ScientificAgentSkillsConversionManifest = {
    schema_version: "1",
    converter_version: "1",
    vendor_id: VENDOR_ID,
    release: "v2.53.0",
    revision: policies.audit.source.revision,
    audited_skills: policies.audit.skills.length,
    reviewed_candidates: policies.audit.skills.filter((skill) => skill.scope_disposition === "candidate").length,
    generated_skills: admitted.map((decision) => decision.generated_skill_id),
    excluded_skill_ids: policies.admission.decisions.filter((decision) => decision.disposition === "excluded").map((decision) => decision.generated_skill_id).sort(compareText),
    admission_policy_sha256: sha256(await readFile(path.join(repoRoot, "src/vendor-converters/scientific-agent-skills/admission-decisions.json"))),
    dependency_policy_sha256: sha256(await readFile(path.join(repoRoot, "src/vendor-converters/scientific-agent-skills/dependency-decisions.json"))),
    resource_policy_sha256: sha256(await readFile(path.join(repoRoot, "src/vendor-converters/scientific-agent-skills/resource-decisions.json"))),
    dependency_decisions: policies.dependencies.decisions,
    file_dispositions: fileDispositions.sort((a, b) => compareText(a.source_path, b.source_path) || compareText(String(a.output_path), String(b.output_path))),
  };
  await writeJson(path.join(outputRoot, "vendor-bundles", `${VENDOR_ID}.json`), { schema_version: "1", vendor });
  await writeJson(path.join(outputRoot, "vendor-manifests", `${VENDOR_ID}.json`), manifest);
  await writeText(path.join(outputRoot, "conversion-reports", `${VENDOR_ID}.md`), renderReport(manifest, policies));
  return manifest;
}

function adaptSkillEntry(decision: ScientificAgentSkillsAdmissionDecision, source: string, scriptPaths: string[]): string {
  if (!source.startsWith("---\n")) throw new Error(`Upstream Skill has no frontmatter: ${decision.upstream_skill_id}`);
  const end = source.indexOf("\n---\n", 4);
  if (end < 0) throw new Error(`Upstream Skill has no closed frontmatter: ${decision.upstream_skill_id}`);
  const parsed = parse(source.slice(4, end)) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`Upstream Skill frontmatter is not an object: ${decision.upstream_skill_id}`);
  const value = parsed as Record<string, unknown>;
  const description = typeof value.description === "string" ? value.description.trim() : "";
  if (!description || description.length > 1024) throw new Error(`Admitted Skill requires a reviewed description override: ${decision.upstream_skill_id}`);
  const environment = Array.isArray(value.required_environment_variables) ? value.required_environment_variables.filter((item): item is string => typeof item === "string") : [];
  const compatibility = [
    "Requires the packages, services, hardware, and local runtimes described by this Skill.",
    environment.length ? `Environment variables: ${environment.join(", ")}.` : "",
    "ResearchSpec installs files only and never executes scripts, installs dependencies, or configures credentials.",
  ].filter(Boolean).join(" ").slice(0, 500);
  const allowed = Array.isArray(value["allowed-tools"])
    ? value["allowed-tools"].filter((item): item is string => typeof item === "string").join(" ")
    : typeof value["allowed-tools"] === "string" ? value["allowed-tools"].trim() : undefined;
  const frontmatter: Record<string, unknown> = {
    name: decision.generated_skill_id,
    description,
    license: decision.license?.expression ?? "MIT",
    compatibility,
    metadata: { vendor: VENDOR_ID, "vendor-release": "v2.53.0", "upstream-skill-id": decision.upstream_skill_id, "researchspec-role": "semantic-helper" },
  };
  if (allowed) frontmatter["allowed-tools"] = allowed;
  const boundary = "> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.";
  const disclosure = scriptPaths.length
    ? `> **Bundled scripts:** ResearchSpec distributes these reviewed inert resources but does not run them: ${scriptPaths.map((item) => `\`${item}\``).join(", ")}. The target Agent must inspect requirements and side effects before execution.`
    : "";
  const body = source.slice(end + 5).trimStart();
  return `---\n${stringify(frontmatter).trimEnd()}\n---\n\n${boundary}\n${disclosure ? `\n${disclosure}\n` : ""}\n${body.trimEnd()}\n`;
}

async function validateSource(sourceRoot: string, policies: ScientificAgentSkillsPolicies): Promise<void> {
  const { stdout } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD"]);
  if (stdout.trim() !== policies.audit.source.revision) throw new Error(`Scientific Agent Skills checkout revision differs from audit: ${stdout.trim()}`);
  const entries = await readdir(path.join(sourceRoot, policies.audit.source.skill_root), { withFileTypes: true });
  const skillDirs: string[] = [];
  for (const entry of entries) if (entry.isDirectory() && await pathExists(path.join(sourceRoot, policies.audit.source.skill_root, entry.name, "SKILL.md"))) skillDirs.push(entry.name);
  if (skillDirs.length !== policies.audit.summary.top_level_skills) throw new Error(`Scientific Agent Skills checkout contains ${String(skillDirs.length)} top-level Skills; audit expects ${String(policies.audit.summary.top_level_skills)}.`);
}

function renderReport(manifest: ScientificAgentSkillsConversionManifest, policies: ScientificAgentSkillsPolicies): string {
  const required = manifest.dependency_decisions.filter((item) => item.disposition === "installed").length;
  const excludedResources = manifest.file_dispositions.filter((item) => item.disposition === "excluded").length;
  const reasons = new Map<string, number>();
  for (const decision of policies.admission.decisions) for (const reason of decision.reason_codes) reasons.set(reason, (reasons.get(reason) ?? 0) + 1);
  const reasonLines = [...reasons].sort(([left], [right]) => compareText(left, right)).map(([reason, count]) => `- ${reason}: ${String(count)}`).join("\n");
  return `# Scientific Agent Skills Vendor Conversion\n\n- Release: \`${manifest.release}\`\n- Revision: \`${manifest.revision}\`\n- Audited Skills: ${String(manifest.audited_skills)}\n- Reviewed business candidates: ${String(manifest.reviewed_candidates)}\n- Generated Skills: ${String(manifest.generated_skills.length)}\n- Excluded Skills: ${String(manifest.excluded_skill_ids.length)}\n- Installed hard dependency edges: ${String(required)}\n- Explicit resource exclusions: ${String(excludedResources)}\n\n## Exclusion decisions\n\n${reasonLines}\n\nThis converter emits only the isolated Scientific Agent Skills vendor bundle. The source-neutral domain catalog owns reviewed membership and the central assembler owns the combined production registry.\n\nResearchSpec copied reviewed static assets only. It did not execute scripts, install dependencies, configure credentials, contact services, or grant workflow authority.\n`;
}

async function writeJson(filePath: string, value: unknown): Promise<void> { await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`); }
async function writeText(filePath: string, value: string): Promise<void> { await mkdir(path.dirname(filePath), { recursive: true }); await writeFile(filePath, value, "utf8"); }
function included(sourcePath: string, outputPath: string, content: string, reason: string): FileDisposition { return { source_path: sourcePath, output_path: outputPath, disposition: "included", reason, sha256: sha256(content) }; }
function compareText(left: string, right: string): number { return left.localeCompare(right); }
