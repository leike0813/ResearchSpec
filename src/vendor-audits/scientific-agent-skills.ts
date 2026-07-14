import { z } from "zod";

import {
  AnzsrcAuditMetadataSchema,
  AuditRelativePathSchema,
  VendorAuditFindingSchema,
  VendorAuditRelationshipSchema,
  VendorAuditResourcesSchema,
  VendorAuditSourceSchema,
} from "./contracts.js";

export const ContentLicenseReviewSchema = z.strictObject({
  status: z.enum(["confirmed", "ambiguous", "prohibited"]),
  expression: z.string().min(1).nullable(),
  evidence: z.array(AuditRelativePathSchema).min(1),
});

export const UpstreamSecurityReviewSchema = z.strictObject({
  highest_severity: z.enum(["critical", "high", "medium", "low", "info", "none"]),
  findings: z.number().int().nonnegative(),
  upstream_safe: z.boolean(),
  evidence: z.array(AuditRelativePathSchema).min(1),
});

export const ScientificAgentSkillsAuditSkillSchema = z.strictObject({
  skill_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  source_path: AuditRelativePathSchema,
  scope_disposition: z.enum(["candidate", "exclude"]),
  ingest_readiness: z.enum(["standard-adaptation", "needs-curation", "blocked-review", "not-applicable"]),
  upstream_categories: z.array(z.string().min(1)).min(1),
  ...AnzsrcAuditMetadataSchema.shape,
  resources: VendorAuditResourcesSchema,
  relationships: z.array(VendorAuditRelationshipSchema),
  content_license: ContentLicenseReviewSchema,
  security: UpstreamSecurityReviewSchema,
  findings: z.array(VendorAuditFindingSchema),
});

export const ScientificAgentSkillsAuditSchema = z.strictObject({
  schema_version: z.literal("1"),
  source: VendorAuditSourceSchema,
  summary: z.strictObject({
    top_level_skills: z.number().int().positive(),
    candidate_skills: z.number().int().nonnegative(),
    excluded_skills: z.number().int().nonnegative(),
    blocked_review_skills: z.number().int().nonnegative(),
    files: z.number().int().nonnegative(),
    bytes: z.number().int().nonnegative(),
    skills_with_references: z.number().int().nonnegative(),
    skills_with_scripts: z.number().int().nonnegative(),
    script_files: z.number().int().nonnegative(),
    skills_with_assets: z.number().int().nonnegative(),
    validator_adaptation_skills: z.number().int().nonnegative(),
    required_environment_variable_skills: z.number().int().nonnegative(),
    install_or_download_instruction_skills: z.number().int().nonnegative(),
    upstream_security_findings: z.number().int().nonnegative(),
    upstream_tabulated_skill_findings: z.number().int().nonnegative(),
    upstream_critical_findings: z.number().int().nonnegative(),
    upstream_high_findings: z.number().int().nonnegative(),
    upstream_severity_skill_counts: z.record(z.string(), z.number().int().nonnegative()),
    license_status_counts: z.record(z.string(), z.number().int().nonnegative()),
  }),
  upstream_categories: z.array(z.strictObject({
    category_id: z.string().min(1),
    title: z.string().min(1),
    source_path: AuditRelativePathSchema,
  })).min(1),
  skills: z.array(ScientificAgentSkillsAuditSkillSchema).min(1),
});

export type ScientificAgentSkillsAudit = z.infer<typeof ScientificAgentSkillsAuditSchema>;
export type ScientificAgentSkillsAuditSkill = z.infer<typeof ScientificAgentSkillsAuditSkillSchema>;
