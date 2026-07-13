import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { parse, stringify } from "yaml";

import { sha256 } from "../../core/workspace/write-plan.js";
import { loadPluginRegistry, validatePluginRegistry, type PluginRegistry } from "../../plugins/registry.js";

const execFileAsync = promisify(execFile);
const VENDOR_ID = "tooluniverse";
const AUDIT_PATH = "audits/tooluniverse/v1.3.1/skill-audit.json";
const SOURCE_PATH = "vendor/tooluniverse";
const POLICY_ROOT = "src/vendor-converters/tooluniverse";

interface AuditSkill {
  skill_id: string;
  source_path: string;
  scope_disposition: "candidate" | "exclude";
  primary_domain: string | null;
  secondary_domains: string[];
  cross_skill_references: string[];
}

interface Audit {
  source: { repository_url: string; release: string; revision: string; license: string; license_path: string };
  summary: { top_level_skills: number; candidate_skills: number; excluded_skills: number; candidate_cross_skill_edges: number };
  skills: AuditSkill[];
}

interface DependencyDecision {
  from: string;
  to: string;
  relation: "required" | "related" | "routing";
  evidence: Array<{ path: string; line: number; text: string }>;
}

interface DomainCatalog {
  schema_version: "1";
  domains: PluginRegistry["domains"];
}

interface FileDisposition { source_path: string; output_path?: string; disposition: "included" | "excluded"; reason: string; sha256?: string }

export interface ToolUniverseConversionManifest {
  schema_version: "1";
  converter_version: "1";
  vendor_id: "tooluniverse";
  release: string;
  revision: string;
  candidate_skills: number;
  excluded_skills: number;
  generated_skills: string[];
  excluded_skill_ids: string[];
  dependency_decisions: DependencyDecision[];
  file_dispositions: FileDisposition[];
  domain_counts: Record<string, number>;
}

export interface ConvertToolUniverseOptions { repoRoot: string; outputRoot?: string; force?: boolean; dryRun?: boolean }

export async function convertToolUniverse(options: ConvertToolUniverseOptions): Promise<ToolUniverseConversionManifest> {
  const repoRoot = path.resolve(options.repoRoot);
  const outputRoot = path.resolve(options.outputRoot ?? path.join(repoRoot, "skills/plugins"));
  const audit = await readJson<Audit>(path.join(repoRoot, AUDIT_PATH));
  const decisions = await readJson<DependencyDecision[]>(path.join(repoRoot, POLICY_ROOT, "dependency-decisions.json"));
  const domainCatalog = await readJson<DomainCatalog>(path.join(repoRoot, POLICY_ROOT, "domain-catalog.json"));
  const sourceRoot = path.join(repoRoot, SOURCE_PATH);
  await validateSource(sourceRoot, audit);
  validateAuditAndPolicies(audit, decisions, domainCatalog);

  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-tooluniverse-"));
  try {
    const manifest = await generateBundle(stage, sourceRoot, audit, decisions, domainCatalog);
    await validatePluginRegistry(await readJson<unknown>(path.join(stage, "registry.json")), stage);
    if (options.dryRun) return manifest;
    if (!options.force && await pathExists(path.join(outputRoot, "vendors", VENDOR_ID)) && !(await generatedOutputMatches(stage, outputRoot))) {
      throw new Error("ToolUniverse generated output has drift; run with --force after reviewing the converter inputs.");
    }
    await rm(path.join(outputRoot, "vendors", VENDOR_ID), { recursive: true, force: true });
    await mkdir(path.join(outputRoot, "vendors"), { recursive: true });
    await cp(path.join(stage, "vendors", VENDOR_ID), path.join(outputRoot, "vendors", VENDOR_ID), { recursive: true });
    await mkdir(path.join(outputRoot, "vendor-manifests"), { recursive: true });
    await mkdir(path.join(outputRoot, "conversion-reports"), { recursive: true });
    await cp(path.join(stage, "vendor-manifests", `${VENDOR_ID}.json`), path.join(outputRoot, "vendor-manifests", `${VENDOR_ID}.json`));
    await cp(path.join(stage, "conversion-reports", `${VENDOR_ID}.md`), path.join(outputRoot, "conversion-reports", `${VENDOR_ID}.md`));
    await cp(path.join(stage, "registry.json"), path.join(outputRoot, "registry.json"));
    return manifest;
  } finally { await rm(stage, { recursive: true, force: true }); }
}

export async function checkToolUniverseOutput(repoRoot: string): Promise<{ ok: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    const loaded = await loadPluginRegistry(path.join(repoRoot, "skills/plugins"));
    const vendor = loaded.vendors.get(VENDOR_ID);
    if (!vendor) errors.push("ToolUniverse vendor is absent from the bundled registry");
    else if (vendor.skills.length !== 130) errors.push(`Expected 130 ToolUniverse Skills, found ${String(vendor.skills.length)}`);
    const expected: Record<string, number> = {
      "genomics-and-systems-biology": 72,
      "molecular-and-organismal-biosciences": 40,
      "translational-medicine-and-therapeutics": 65,
    };
    for (const [domainId, count] of Object.entries(expected)) if (loaded.domains.get(domainId)?.skills.length !== count) errors.push(`Domain ${domainId} does not contain ${String(count)} direct Skills`);
    warnings.push(...loaded.diagnostics.map((item) => item.message));
  } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { ok: errors.length === 0, errors, warnings };
}

export async function checkToolUniverseIdempotence(repoRoot: string): Promise<{ ok: boolean; drift_paths: string[] }> {
  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-tooluniverse-check-"));
  try {
    await convertToolUniverse({ repoRoot, outputRoot: stage, force: true });
    const driftPaths = await treeDiff(stage, path.join(repoRoot, "skills/plugins"));
    return { ok: driftPaths.length === 0, drift_paths: driftPaths };
  } finally { await rm(stage, { recursive: true, force: true }); }
}

async function generateBundle(outputRoot: string, sourceRoot: string, audit: Audit, decisions: DependencyDecision[], domainCatalog: DomainCatalog): Promise<ToolUniverseConversionManifest> {
  const candidates = audit.skills.filter((skill) => skill.scope_disposition === "candidate").sort((a, b) => a.skill_id.localeCompare(b.skill_id));
  const requiredBySkill = new Map<string, string[]>();
  for (const decision of decisions) if (decision.relation === "required") requiredBySkill.set(decision.from, [...(requiredBySkill.get(decision.from) ?? []), decision.to]);
  const fileDispositions: FileDisposition[] = [];
  const license = await readFile(path.join(sourceRoot, audit.source.license_path), "utf8");
  const vendorSkills: PluginRegistry["vendors"][number]["skills"] = [];

  for (const skill of candidates) {
    const sourceSkillRoot = path.join(sourceRoot, skill.source_path);
    const outputSkillRoot = path.join(outputRoot, "vendors", VENDOR_ID, skill.skill_id);
    await mkdir(outputSkillRoot, { recursive: true });
    const sourceEntry = await readFile(path.join(sourceSkillRoot, "SKILL.md"), "utf8");
    const adapted = adaptSkillEntry(skill.skill_id, sourceEntry);
    await writeText(path.join(outputSkillRoot, "SKILL.md"), adapted.entry);
    fileDispositions.push(included(`${skill.source_path}/SKILL.md`, `vendors/${VENDOR_ID}/${skill.skill_id}/SKILL.md`, adapted.entry, "normalized Open Agent Skill entry"));
    if (adapted.details) {
      const detailPath = path.join(outputSkillRoot, "references", "upstream-details.md");
      await writeText(detailPath, adapted.details);
      fileDispositions.push(included(`${skill.source_path}/SKILL.md#progressive-disclosure`, `vendors/${VENDOR_ID}/${skill.skill_id}/references/upstream-details.md`, adapted.details, "progressive disclosure extraction"));
    }
    for (const sourceFile of await walkFiles(sourceSkillRoot)) {
      const relative = posix(path.relative(sourceSkillRoot, sourceFile));
      if (relative === "SKILL.md") continue;
      const exclusion = resourceExclusion(relative);
      if (exclusion) { fileDispositions.push({ source_path: `${skill.source_path}/${relative}`, disposition: "excluded", reason: exclusion }); continue; }
      const target = path.join(outputSkillRoot, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await cp(sourceFile, target);
      const bytes = await readFile(sourceFile);
      fileDispositions.push({ source_path: `${skill.source_path}/${relative}`, output_path: `vendors/${VENDOR_ID}/${skill.skill_id}/${relative}`, disposition: "included", reason: "reviewed runtime resource", sha256: sha256(bytes) });
    }
    await writeText(path.join(outputSkillRoot, "LICENSE"), license.endsWith("\n") ? license : `${license}\n`);
    const notice = `# Notice\n\nThis Skill is adapted by ResearchSpec from ToolUniverse (${audit.source.repository_url}) release ${audit.source.release}, revision ${audit.source.revision}.\n\nSource path: \`${skill.source_path}\`. The adaptation normalizes packaging and ResearchSpec authority boundaries; upstream scientific and runtime requirements remain attributable to ToolUniverse.\n`;
    await writeText(path.join(outputSkillRoot, "NOTICE.md"), notice);
    vendorSkills.push({ skill_id: skill.skill_id, dependencies: [...new Set(requiredBySkill.get(skill.skill_id) ?? [])].sort(), upstreams: [{ source_paths: [skill.source_path], adaptation: "converted" }] });
  }

  const vendor: PluginRegistry["vendors"][number] = {
    vendor_id: VENDOR_ID,
    name: "ToolUniverse",
    repository_url: audit.source.repository_url,
    release: audit.source.release,
    revision: audit.source.revision,
    license: audit.source.license,
    converter_version: "1",
    skills: vendorSkills,
  };
  const registry: PluginRegistry = { schema_version: "1", vendors: [vendor], domains: domainCatalog.domains };
  const domainCounts = Object.fromEntries(domainCatalog.domains.map((domain) => [domain.domain_id, domain.skills.length]));
  const manifest: ToolUniverseConversionManifest = {
    schema_version: "1",
    converter_version: "1",
    vendor_id: VENDOR_ID,
    release: audit.source.release,
    revision: audit.source.revision,
    candidate_skills: candidates.length,
    excluded_skills: audit.skills.length - candidates.length,
    generated_skills: candidates.map((skill) => skill.skill_id),
    excluded_skill_ids: audit.skills.filter((skill) => skill.scope_disposition === "exclude").map((skill) => skill.skill_id).sort(),
    dependency_decisions: decisions,
    file_dispositions: fileDispositions.sort((a, b) => a.source_path.localeCompare(b.source_path) || String(a.output_path).localeCompare(String(b.output_path))),
    domain_counts: domainCounts,
  };
  await writeJson(path.join(outputRoot, "registry.json"), registry);
  await writeJson(path.join(outputRoot, "vendor-manifests", `${VENDOR_ID}.json`), manifest);
  await writeText(path.join(outputRoot, "conversion-reports", `${VENDOR_ID}.md`), renderReport(manifest));
  return manifest;
}

function validateAuditAndPolicies(audit: Audit, decisions: DependencyDecision[], catalog: DomainCatalog): void {
  if (audit.summary.top_level_skills !== 150 || audit.summary.candidate_skills !== 130 || audit.summary.excluded_skills !== 20) throw new Error("ToolUniverse audit inventory does not match the reviewed 150/130/20 baseline.");
  const candidates = new Set(audit.skills.filter((skill) => skill.scope_disposition === "candidate").map((skill) => skill.skill_id));
  const expectedEdges = new Set(audit.skills.filter((skill) => skill.scope_disposition === "candidate").flatMap((skill) => skill.cross_skill_references.filter((target) => candidates.has(target)).map((target) => `${skill.skill_id}\0${target}`)));
  const actualEdges = new Set(decisions.map((item) => `${item.from}\0${item.to}`));
  if (expectedEdges.size !== audit.summary.candidate_cross_skill_edges || actualEdges.size !== expectedEdges.size || [...expectedEdges].some((edge) => !actualEdges.has(edge))) throw new Error("Dependency decision catalog must classify every audited candidate-to-candidate reference exactly once.");
  if (catalog.domains.length !== 3) throw new Error("ToolUniverse domain catalog must contain exactly three stable domains.");
  for (const domain of catalog.domains) for (const skillId of domain.skills) if (!candidates.has(skillId)) throw new Error(`Domain ${domain.domain_id} references non-candidate Skill ${skillId}.`);
  if ([...candidates].some((skillId) => !catalog.domains.some((domain) => domain.skills.includes(skillId)))) throw new Error("Every admitted ToolUniverse Skill must be a direct member of at least one domain.");
}

async function validateSource(sourceRoot: string, audit: Audit): Promise<void> {
  const { stdout } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD"]);
  if (stdout.trim() !== audit.source.revision) throw new Error(`ToolUniverse checkout revision differs from audit: ${stdout.trim()}`);
  const entries = await readdir(path.join(sourceRoot, "skills"), { withFileTypes: true });
  const skillDirs: string[] = [];
  for (const entry of entries) if (entry.isDirectory() && await pathExists(path.join(sourceRoot, "skills", entry.name, "SKILL.md"))) skillDirs.push(entry.name);
  if (skillDirs.length !== audit.summary.top_level_skills) throw new Error(`ToolUniverse checkout contains ${String(skillDirs.length)} top-level Skills; audit expects ${String(audit.summary.top_level_skills)}.`);
}

function adaptSkillEntry(skillId: string, source: string): { entry: string; details?: string } {
  const end = source.indexOf("\n---\n", source.startsWith("---\n") ? 4 : 0);
  if (end < 0) throw new Error(`Upstream Skill has no closed frontmatter: ${skillId}`);
  const rawFrontmatter = source.slice(4, end);
  const body = source.slice(end + 5).trimStart();
  let value: Record<string, unknown> = {};
  try { const parsed = parse(rawFrontmatter) as unknown; if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) value = parsed as Record<string, unknown>; } catch { /* reviewed overrides below */ }
  const description = DESCRIPTION_OVERRIDES[skillId] ?? (typeof value.description === "string" ? value.description.trim() : "");
  if (!description || description.length > 1024) throw new Error(`Skill requires a reviewed description override: ${skillId}`);
  const frontmatter = stringify({
    name: skillId,
    description,
    license: "Apache-2.0",
    compatibility: "Requires ToolUniverse-compatible retrieval tools and any local runtimes described by this Skill. ResearchSpec installs files only and never executes scripts or installs dependencies.",
    metadata: { vendor: "tooluniverse", "vendor-release": "v1.3.1", "researchspec-role": "semantic-helper" },
  }).trimEnd();
  const boundary = "> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, or receipts. Use the ResearchSpec CLI for authoritative mutations.";
  const assembledBody = `${boundary}\n\n${body}`.trimEnd();
  const lines = assembledBody.split("\n");
  if (lines.length <= 480) return { entry: `---\n${frontmatter}\n---\n\n${assembledBody}\n` };
  let split = 400;
  for (let index = Math.min(430, lines.length - 1); index >= 300; index -= 1) if ((lines[index] ?? "").startsWith("## ")) { split = index; break; }
  const retained = lines.slice(0, split).join("\n").trimEnd();
  const details = `# ${skillId} detailed guidance\n\n${lines.slice(split).join("\n").trimStart()}\n`;
  return { entry: `---\n${frontmatter}\n---\n\n${retained}\n\nDetailed upstream guidance continues in [references/upstream-details.md](references/upstream-details.md).\n`, details };
}

const DESCRIPTION_OVERRIDES: Record<string, string> = {
  "tooluniverse-fastq-qc": "Assess FASTQ read quality with FastQC and MultiQC, interpret quality, adapter, duplication, GC, and overrepresented-sequence findings, and make explicit trimming decisions with local NGS tools before downstream analysis.",
  "tooluniverse-phewas": "Run and interpret phenome-wide association studies across clinical phenotypes, including phenotype coding, association testing, multiple-testing correction, visualization, and evidence-aware follow-up.",
  "tooluniverse-clinical-risk-scoring": "Compute and interpret established bedside clinical risk scores from supplied patient variables, report the deterministic result and limitations, and distinguish individual clinical scoring from genetic risk, epidemiology, and diagnostic-test evaluation.",
  "tooluniverse-mendelian-randomization": "Design and interpret Mendelian randomization analyses using genetic instruments, harmonized exposure and outcome effects, sensitivity analyses, pleiotropy checks, and appropriately bounded causal language.",
  "tooluniverse-product-safety-surveillance": "Investigate product safety signals across regulatory reports, recalls, adverse events, and literature with traceable evidence, uncertainty, and explicit separation from clinical diagnosis or treatment advice.",
};

function resourceExclusion(relative: string): string | undefined {
  const lower = relative.toLowerCase();
  const segments = lower.split("/");
  const name = segments.at(-1) ?? lower;
  if (segments.some((segment) => ["tests", "test", "test-data", "test_data", "evals", "evaluations", "benchmarks", "benchmark"].includes(segment)) || /(^test_|_test\.|\.test\.|^eval_|_eval\.)/.test(name)) return "test, evaluation, or benchmark resource";
  if (name === ".env.template" || name === ".env.example" || name.startsWith(".env.")) return "environment or credential template";
  if (/(^|[-_.])(progress|history|changelog|issues?|verification)([-_.]|$)/.test(name)) return "maintenance or historical resource";
  return undefined;
}

function renderReport(manifest: ToolUniverseConversionManifest): string {
  const required = manifest.dependency_decisions.filter((item) => item.relation === "required").length;
  const related = manifest.dependency_decisions.filter((item) => item.relation === "related").length;
  const routing = manifest.dependency_decisions.filter((item) => item.relation === "routing").length;
  return `# ToolUniverse Vendor Conversion\n\n- Release: \`${manifest.release}\`\n- Revision: \`${manifest.revision}\`\n- Generated Skills: ${String(manifest.generated_skills.length)}\n- Excluded Skills: ${String(manifest.excluded_skills)}\n- Dependency decisions: ${String(required)} required, ${String(related)} related, ${String(routing)} routing\n\n## Domains\n\n${Object.entries(manifest.domain_counts).sort().map(([id, count]) => `- \`${id}\`: ${String(count)} direct Skills`).join("\n")}\n\nResearchSpec copied static reviewed resources only. It did not execute scripts, install dependencies, configure credentials, or grant workflow authority.\n`;
}

async function generatedOutputMatches(stage: string, outputRoot: string): Promise<boolean> { return (await treeDiff(stage, outputRoot)).length === 0; }
async function treeDiff(expectedRoot: string, actualRoot: string): Promise<string[]> {
  const expected = await relativeFileMap(expectedRoot);
  const actual = await relativeFileMap(actualRoot, (relative) => relative === "registry.json" || relative.startsWith("vendors/tooluniverse/") || relative === "vendor-manifests/tooluniverse.json" || relative === "conversion-reports/tooluniverse.md");
  const keys = new Set([...expected.keys(), ...actual.keys()]);
  return [...keys].filter((key) => expected.get(key) !== actual.get(key)).sort();
}
async function relativeFileMap(root: string, include: (relative: string) => boolean = () => true): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (!(await pathExists(root))) return result;
  for (const file of await walkFiles(root)) { const relative = posix(path.relative(root, file)); if (include(relative)) result.set(relative, sha256(await readFile(file))); }
  return result;
}
async function walkFiles(root: string): Promise<string[]> { const result: string[] = []; for (const entry of await readdir(root, { withFileTypes: true })) { const target = path.join(root, entry.name); if (entry.isDirectory()) result.push(...await walkFiles(target)); else if (entry.isFile()) result.push(target); } return result.sort(); }
async function readJson<T>(filePath: string): Promise<T> { return JSON.parse(await readFile(filePath, "utf8")) as T; }
async function writeJson(filePath: string, value: unknown): Promise<void> { await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`); }
async function writeText(filePath: string, value: string): Promise<void> { await mkdir(path.dirname(filePath), { recursive: true }); await writeFile(filePath, value, "utf8"); }
async function pathExists(filePath: string): Promise<boolean> { try { await stat(filePath); return true; } catch { return false; } }
function included(sourcePath: string, outputPath: string, content: string, reason: string): FileDisposition { return { source_path: sourcePath, output_path: outputPath, disposition: "included", reason, sha256: sha256(content) }; }
function posix(value: string): string { return value.split(path.sep).join("/"); }
