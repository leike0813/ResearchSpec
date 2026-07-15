import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { AuditRelativePathSchema, VendorAuditResourcesSchema } from "../../vendor-audits/contracts.js";
import { ScientificAgentSkillsAuditSchema } from "../../vendor-audits/scientific-agent-skills.js";

const SkillIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(64);
const DomainIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const ReviewActionSchema = z.enum(["pending", "clear", "clear-with-adaptation", "fail", "defer"]);
const FindingVerdictSchema = z.enum(["pending", "confirmed", "partially-confirmed", "false-positive", "not-applicable"]);
const FindingSeveritySchema = z.enum(["critical", "high", "medium", "low", "info"]);
const AdmissionSummaryCatalogSchema = z.object({
  decisions: z.array(z.object({
    upstream_skill_id: SkillIdSchema,
    disposition: z.enum(["admitted", "excluded"]),
    reason_codes: z.array(z.string()),
    security_review: z.object({ outcome: z.enum(["passed", "failed", "not-applicable"]) }),
  })),
});

const InventoryFileSchema = z.strictObject({
  source_path: AuditRelativePathSchema,
  bytes: z.number().int().nonnegative(),
});

const UpstreamFindingReviewSchema = z.strictObject({
  finding_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*:\d+$/),
  code: z.string().trim().min(1),
  severity: FindingSeveritySchema,
  title: z.string().trim().min(1),
  verdict: FindingVerdictSchema,
  evidence: z.array(AuditRelativePathSchema).min(1),
  analysis: z.string().trim().min(1).nullable(),
  residual_risk: z.string().trim().min(1).nullable(),
});

const ReviewAdaptationSchema = z.strictObject({
  kind: z.enum(["generated-entry-guidance", "compatibility-guidance", "fixed-configuration", "resource-exclusion"]),
  source_path: AuditRelativePathSchema.nullable(),
  note: z.string().trim().min(1),
});

export const ScientificAgentSkillsSecurityReviewSchema = z.strictObject({
  skill_id: SkillIdSchema,
  batch: z.number().int().min(1).max(8),
  upstream: z.strictObject({
    highest_severity: z.enum(["critical", "high"]),
    finding_count: z.number().int().positive(),
  }),
  inventory: z.strictObject({
    summary: VendorAuditResourcesSchema,
    files: z.array(InventoryFileSchema).min(1),
  }),
  reviewed_paths: z.array(AuditRelativePathSchema),
  findings: z.array(UpstreamFindingReviewSchema).min(1),
  recommendation: ReviewActionSchema,
  maintainer_decision: ReviewActionSchema,
  adaptations: z.array(ReviewAdaptationSchema),
  independent_blockers: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)),
  proposed_domains: z.array(DomainIdSchema),
});

export const ScientificAgentSkillsSecurityReviewCatalogSchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor_id: z.literal("scientific-agent-skills"),
  release: z.literal("v2.53.0"),
  revision: z.literal("9c9bd2e92af12311ecd0c1a643e0931643f9ea04"),
  source_report: z.literal("SECURITY.md"),
  target_reason: z.literal("static-security-review-failed"),
  reviews: z.array(ScientificAgentSkillsSecurityReviewSchema).length(40),
});

export type ScientificAgentSkillsSecurityReviewCatalog = z.infer<typeof ScientificAgentSkillsSecurityReviewCatalogSchema>;
export type ScientificAgentSkillsSecurityReview = z.infer<typeof ScientificAgentSkillsSecurityReviewSchema>;

export const SCIENTIFIC_AGENT_SKILLS_SECURITY_REVIEW_BATCHES = [
  ["fluidsim", "geomaster", "infographics", "latex-posters", "markitdown"],
  ["modal", "pacsomatic", "parallel-web", "pptx-posters", "qutip"],
  ["scientific-schematics", "scientific-slides", "seaborn", "transformers", "umap-learn"],
  ["venue-templates", "bgpt-paper-search", "bids", "cellxgene-census", "citation-management"],
  ["clinical-decision-support", "clinical-reports", "consciousness-council", "database-lookup", "dhdna-profiler"],
  ["flowio", "histolab", "hypothesis-generation", "literature-review", "paperzilla"],
  ["pathml", "peer-review", "primekg", "research-lookup", "scholar-evaluation"],
  ["scientific-writing", "tiledbvcf", "treatment-plans", "usfiscaldata", "zarr-python"],
] as const;

export async function loadScientificAgentSkillsSecurityReview(repoRoot: string): Promise<ScientificAgentSkillsSecurityReviewCatalog> {
  const catalogPath = path.join(repoRoot, "src/vendor-converters/scientific-agent-skills/security-review-decisions.json");
  const catalog = ScientificAgentSkillsSecurityReviewCatalogSchema.parse(JSON.parse(await readFile(catalogPath, "utf8")) as unknown);
  await validateScientificAgentSkillsSecurityReview(repoRoot, catalog);
  return catalog;
}

export async function validateScientificAgentSkillsSecurityReview(
  repoRoot: string,
  catalog: ScientificAgentSkillsSecurityReviewCatalog,
): Promise<void> {
  const sourceRoot = path.join(repoRoot, "vendor/scientific-agent-skills");
  const audit = ScientificAgentSkillsAuditSchema.parse(JSON.parse(await readFile(path.join(repoRoot, "audits/scientific-agent-skills/v2.53.0/skill-audit.json"), "utf8")) as unknown);
  const admission = AdmissionSummaryCatalogSchema.parse(JSON.parse(await readFile(path.join(repoRoot, "src/vendor-converters/scientific-agent-skills/admission-decisions.json"), "utf8")) as unknown);
  const domainCatalog = z.object({ domains: z.array(z.object({ domain_id: DomainIdSchema })) }).parse(JSON.parse(await readFile(path.join(repoRoot, "src/plugins/domain-catalog.json"), "utf8")) as unknown);
  const domainIds = new Set(domainCatalog.domains.map((domain) => domain.domain_id));
  const auditById = new Map(audit.skills.map((skill) => [skill.skill_id, skill]));
  const admissionById = new Map(admission.decisions.map((decision) => [decision.upstream_skill_id, decision]));
  const expected = SCIENTIFIC_AGENT_SKILLS_SECURITY_REVIEW_BATCHES.flat();

  if (catalog.release !== audit.source.release || catalog.revision !== audit.source.revision) throw new Error("Manual security review source does not match the pinned audit.");
  if (new Set(expected).size !== 40) throw new Error("Manual security review batches must contain 40 unique Skills.");
  if (catalog.reviews.map((review) => review.skill_id).join("\0") !== expected.join("\0")) throw new Error("Manual security review targets or stable order do not match the approved batches.");

  for (const [index, review] of catalog.reviews.entries()) {
    const expectedBatch = Math.floor(index / 5) + 1;
    if (review.batch !== expectedBatch) throw new Error(`Manual security review batch mismatch: ${review.skill_id}.`);
    const auditSkill = auditById.get(review.skill_id);
    const admissionDecision = admissionById.get(review.skill_id);
    if (!auditSkill || !admissionDecision) throw new Error(`Manual security review references unknown Skill ${review.skill_id}.`);
    const cleared = review.maintainer_decision === "clear" || review.maintainer_decision === "clear-with-adaptation";
    const expectedSecurityOutcome = cleared ? "passed" : review.maintainer_decision === "defer" ? "not-applicable" : "failed";
    if (review.recommendation !== review.maintainer_decision) throw new Error(`Manual security recommendation and maintainer decision differ: ${review.skill_id}.`);
    if (admissionDecision.security_review.outcome !== expectedSecurityOutcome) throw new Error(`Admission security summary differs from the manual review: ${review.skill_id}.`);
    if (cleared && admissionDecision.reason_codes.includes(catalog.target_reason)) throw new Error(`Cleared manual security review retains ${catalog.target_reason}: ${review.skill_id}.`);
    if (review.maintainer_decision === "fail" && !admissionDecision.reason_codes.includes(catalog.target_reason)) throw new Error(`Failed manual security review removed ${catalog.target_reason}: ${review.skill_id}.`);
    if (review.maintainer_decision === "defer" && (!admissionDecision.reason_codes.includes("manual-security-review-deferred") || admissionDecision.reason_codes.includes(catalog.target_reason))) throw new Error(`Deferred manual security review has an invalid production blocker: ${review.skill_id}.`);
    if (review.upstream.highest_severity !== auditSkill.security.highest_severity || review.upstream.finding_count !== auditSkill.security.findings) throw new Error(`Upstream security summary drift: ${review.skill_id}.`);

    const actualInventory = await resourceInventory(sourceRoot, auditSkill.source_path);
    if (JSON.stringify(review.inventory) !== JSON.stringify(actualInventory)) throw new Error(`Manual security review inventory drift: ${review.skill_id}.`);
    const inventoryPaths = new Set(review.inventory.files.map((file) => file.source_path));
    const reviewedPaths = new Set(review.reviewed_paths);
    if (reviewedPaths.size !== review.reviewed_paths.length) throw new Error(`Manual security review repeats reviewed paths: ${review.skill_id}.`);
    for (const reviewedPath of reviewedPaths) if (!inventoryPaths.has(reviewedPath)) throw new Error(`Manual security review cites a reviewed path outside the Skill inventory: ${reviewedPath}.`);

    const expectedBlockers = admissionDecision.reason_codes.filter((reason) => reason !== catalog.target_reason && reason !== "manual-security-review-deferred");
    if (review.independent_blockers.join("\0") !== expectedBlockers.join("\0")) throw new Error(`Independent blocker drift: ${review.skill_id}.`);
    const securityOnlyAdmission = cleared && review.independent_blockers.length === 0;
    if (securityOnlyAdmission !== (admissionDecision.disposition === "admitted")) throw new Error(`Manual security production effect differs from admission: ${review.skill_id}.`);
    if (new Set(review.proposed_domains).size !== review.proposed_domains.length || review.proposed_domains.some((domainId) => !domainIds.has(domainId))) throw new Error(`Manual security review has an invalid proposed domain: ${review.skill_id}.`);

    const findingIds = new Set<string>();
    if (review.findings.length !== review.upstream.finding_count) throw new Error(`Manual security review finding count mismatch: ${review.skill_id}.`);
    for (const [findingIndex, finding] of review.findings.entries()) {
      const expectedFindingId = `${review.skill_id}:${String(findingIndex + 1)}`;
      if (finding.finding_id !== expectedFindingId || findingIds.has(finding.finding_id)) throw new Error(`Manual security review finding identity mismatch: ${finding.finding_id}.`);
      findingIds.add(finding.finding_id);
      for (const evidence of finding.evidence) {
        if (evidence !== catalog.source_report && evidence !== auditSkill.source_path && !inventoryPaths.has(evidence)) throw new Error(`Manual security review finding evidence is outside the pinned Skill: ${review.skill_id}:${evidence}.`);
        await access(path.join(sourceRoot, evidence));
      }
    }

    for (const adaptation of review.adaptations) {
      if (["fixed-configuration", "resource-exclusion"].includes(adaptation.kind) && !adaptation.source_path) throw new Error(`Manual security review adaptation requires a source path: ${review.skill_id}.`);
      if (["generated-entry-guidance", "compatibility-guidance"].includes(adaptation.kind) && adaptation.source_path) throw new Error(`Manual security review guidance adaptation cannot patch a source file: ${review.skill_id}.`);
      if (adaptation.source_path && !inventoryPaths.has(adaptation.source_path)) throw new Error(`Manual security review adaptation is outside the Skill inventory: ${review.skill_id}:${adaptation.source_path}.`);
      if (adaptation.kind === "fixed-configuration" && adaptation.source_path && isExecutablePath(adaptation.source_path)) throw new Error(`Manual security review cannot patch executable business logic: ${review.skill_id}:${adaptation.source_path}.`);
    }
  }
}

export function assertScientificAgentSkillsSecurityReviewComplete(catalog: ScientificAgentSkillsSecurityReviewCatalog): void {
  for (const review of catalog.reviews) {
    if (review.recommendation === "pending" || review.maintainer_decision === "pending") throw new Error(`Manual security review decision is pending: ${review.skill_id}.`);
    if (review.reviewed_paths.length !== review.inventory.files.length) throw new Error(`Manual security review attack surface is incomplete: ${review.skill_id}.`);
    if (review.findings.some((finding) => finding.verdict === "pending" || !finding.analysis || !finding.residual_risk)) throw new Error(`Manual security review finding is incomplete: ${review.skill_id}.`);
    if (review.maintainer_decision === "clear-with-adaptation" && !review.adaptations.length) throw new Error(`Manual security review curation decision lacks an adaptation: ${review.skill_id}.`);
    if (review.maintainer_decision !== "clear-with-adaptation" && review.adaptations.length) throw new Error(`Manual security review adaptations require a curation decision: ${review.skill_id}.`);
  }
}

async function resourceInventory(sourceRoot: string, skillPath: string): Promise<ScientificAgentSkillsSecurityReview["inventory"]> {
  const root = path.join(sourceRoot, skillPath);
  const files = await walkFiles(root);
  const entries = await Promise.all(files.map(async (file) => ({
    source_path: path.relative(sourceRoot, file).split(path.sep).join("/"),
    bytes: (await stat(file)).size,
  })));
  const relativeToSkill = entries.map((entry) => path.posix.relative(skillPath, entry.source_path));
  const countRoot = (name: string): number => relativeToSkill.filter((item) => item === name || item.startsWith(`${name}/`)).length;
  return {
    summary: {
      files: entries.length,
      bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
      references: countRoot("references"),
      scripts: countRoot("scripts"),
      assets: countRoot("assets"),
      tests_or_evals: relativeToSkill.filter((item) => {
        const name = path.posix.basename(item);
        return item.startsWith("tests/") || item.startsWith("evals/") || name.startsWith("test_") || /_test\.[^.]+$/.test(name);
      }).length,
      environment_templates: relativeToSkill.filter((item) => path.posix.basename(item) === ".env.template").length,
    },
    files: entries,
  };
}

async function walkFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await walkFiles(target));
    else if (entry.isFile()) result.push(target);
  }
  return result.sort(compareText);
}

function isExecutablePath(sourcePath: string): boolean {
  return /\.(?:bash|cjs|js|mjs|ps1|py|rb|sh|ts)$/i.test(sourcePath);
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "en");
}
