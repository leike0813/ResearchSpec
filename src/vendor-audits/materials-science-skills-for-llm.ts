import { z } from "zod";

import {
  AnzsrcAuditMetadataSchema,
  AuditRelativePathSchema,
  ContentLicenseReviewSchema,
  VendorAuditFindingSchema,
  VendorAuditRelationshipSchema,
  VendorAuditResourcesSchema,
  VendorAuditSourceSchema,
} from "./contracts.js";

export const MaterialsScienceProspectiveDomainSchema = z.enum([
  "materials-engineering",
  "macromolecular-and-materials-chemistry",
  "computational-modeling-and-simulation",
  "research-computing-infrastructure",
]);

export const MaterialsScienceOperationalRiskSchema = z.strictObject({
  risk: z.enum([
    "absolute-path",
    "command-execution",
    "credential",
    "dependency-installation",
    "external-service",
    "hpc-or-scheduler",
    "privileged-operation",
    "resource-download",
    "stateful-operation",
  ]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  note: z.string().min(1),
});

export const MaterialsScienceOverlapSchema = z.strictObject({
  target_kind: z.enum(["arsu", "existing-vendor", "upstream-sibling"]),
  target_id: z.string().min(1),
  disposition: z.enum(["duplicate", "complementary", "related", "review"]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  note: z.string().min(1),
});

export const MaterialsScienceSkillsAuditSkillSchema = z.strictObject({
  skill_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  source_path: AuditRelativePathSchema,
  scope: z.enum([
    "research-workflow",
    "reusable-scientific-computing",
    "development-maintenance",
    "platform-management",
    "private-local-tooling",
  ]),
  scope_disposition: z.enum(["candidate", "exclude"]),
  ingest_readiness: z.enum(["standard-adaptation", "needs-curation", "blocked-review", "not-applicable"]),
  frontmatter: z.strictObject({
    name: z.string().min(1),
    keys: z.array(z.string().min(1)).min(2),
    yaml_valid: z.boolean(),
    validation_error: z.string().min(1).nullable(),
    compatibility_declared: z.boolean(),
  }),
  ...AnzsrcAuditMetadataSchema.shape,
  prospective_domains: z.array(MaterialsScienceProspectiveDomainSchema),
  resources: VendorAuditResourcesSchema,
  relationships: z.array(VendorAuditRelationshipSchema),
  content_license: ContentLicenseReviewSchema,
  operational_risks: z.array(MaterialsScienceOperationalRiskSchema),
  overlaps: z.array(MaterialsScienceOverlapSchema),
  findings: z.array(VendorAuditFindingSchema),
  recommendation: z.string().min(1),
}).superRefine((value, context) => {
  if (new Set(value.frontmatter.keys).size !== value.frontmatter.keys.length) {
    context.addIssue({ code: "custom", message: "frontmatter keys must be unique", path: ["frontmatter", "keys"] });
  }
  if (value.frontmatter.yaml_valid === (value.frontmatter.validation_error !== null)) {
    context.addIssue({ code: "custom", message: "frontmatter validation error must match YAML validity", path: ["frontmatter", "validation_error"] });
  }
  if (new Set(value.prospective_domains).size !== value.prospective_domains.length) {
    context.addIssue({ code: "custom", message: "prospective domains must be unique", path: ["prospective_domains"] });
  }
  const risks = value.operational_risks.map((risk) => risk.risk);
  if (new Set(risks).size !== risks.length) {
    context.addIssue({ code: "custom", message: "operational risks must be unique", path: ["operational_risks"] });
  }
  if (value.scope_disposition === "exclude" && value.ingest_readiness !== "not-applicable") {
    context.addIssue({ code: "custom", message: "excluded Skills must be not-applicable for ingestion", path: ["ingest_readiness"] });
  }
  if (value.scope_disposition === "candidate" && value.ingest_readiness === "not-applicable") {
    context.addIssue({ code: "custom", message: "candidate Skills require an ingestion readiness", path: ["ingest_readiness"] });
  }
  if (value.scope_disposition === "exclude" && value.prospective_domains.length > 0) {
    context.addIssue({ code: "custom", message: "excluded Skills cannot carry prospective domain placement", path: ["prospective_domains"] });
  }
});

export const MaterialsScienceSkillsAuditSchema = z.strictObject({
  schema_version: z.literal("1"),
  source: VendorAuditSourceSchema,
  policy: z.strictObject({
    audit_is_admission: z.literal(false),
    future_change: z.literal("ingest-materials-science-skills-for-llm"),
    generated_id_prefix: z.literal("materials-science-skills-"),
    allowed_domains: z.array(MaterialsScienceProspectiveDomainSchema).length(4),
    anzsrc_field_creates_membership: z.literal(false),
    converter_executes_upstream_content: z.literal(false),
  }),
  summary: z.strictObject({
    top_level_skills: z.literal(12),
    candidate_skills: z.number().int().nonnegative(),
    excluded_skills: z.number().int().nonnegative(),
    blocked_review_skills: z.number().int().nonnegative(),
    files: z.number().int().nonnegative(),
    bytes: z.number().int().nonnegative(),
    reference_files: z.number().int().nonnegative(),
    license_status_counts: z.record(z.string(), z.number().int().nonnegative()),
    risk_counts: z.record(z.string(), z.number().int().nonnegative()),
  }),
  skills: z.array(MaterialsScienceSkillsAuditSkillSchema).length(12),
});

export type MaterialsScienceSkillsAudit = z.infer<typeof MaterialsScienceSkillsAuditSchema>;
export type MaterialsScienceSkillsAuditSkill = z.infer<typeof MaterialsScienceSkillsAuditSkillSchema>;
