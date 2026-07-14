import path from "node:path";

import { z } from "zod";

export const AuditRevisionSchema = z.string().regex(/^[a-f0-9]{40}$/, "must be a full immutable git revision");

export const AuditRelativePathSchema = z.string().min(1).refine(isSafeAuditPath, "must be a safe relative POSIX path");

export const VendorAuditSourceSchema = z.strictObject({
  source_id: z.string().min(1),
  name: z.string().min(1),
  repository_url: z.url(),
  release: z.string().min(1),
  revision: AuditRevisionSchema,
  root_license: z.string().min(1),
  license_path: AuditRelativePathSchema,
  skill_root: AuditRelativePathSchema,
});

export const VendorAuditResourcesSchema = z.strictObject({
  files: z.number().int().nonnegative(),
  bytes: z.number().int().nonnegative(),
  references: z.number().int().nonnegative(),
  scripts: z.number().int().nonnegative(),
  assets: z.number().int().nonnegative(),
  tests_or_evals: z.number().int().nonnegative(),
  environment_templates: z.number().int().nonnegative(),
});

export const VendorAuditFindingSchema = z.strictObject({
  code: z.string().min(1),
  severity: z.enum(["blocking", "review", "advisory"]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  note: z.string().min(1),
});

export const VendorAuditRelationshipSchema = z.strictObject({
  target_skill_id: z.string().min(1),
  relation: z.enum(["required", "related", "routing"]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  note: z.string().min(1),
});

export const AnzsrcAuditMetadataSchema = z.strictObject({
  primary_anzsrc_field: z.string().regex(/^\d{6}$/).nullable(),
  additional_anzsrc_fields: z.array(z.string().regex(/^\d{6}$/)),
  anzsrc_unclassified_reason: z.string().trim().min(1).nullable(),
}).superRefine((value, context) => {
  const additional = new Set(value.additional_anzsrc_fields);
  if (additional.size !== value.additional_anzsrc_fields.length) context.addIssue({ code: "custom", message: "additional ANZSRC Fields must be unique", path: ["additional_anzsrc_fields"] });
  if (value.primary_anzsrc_field) {
    if (value.anzsrc_unclassified_reason !== null) context.addIssue({ code: "custom", message: "classified records cannot have an unclassified reason", path: ["anzsrc_unclassified_reason"] });
    if (additional.has(value.primary_anzsrc_field)) context.addIssue({ code: "custom", message: "primary ANZSRC Field cannot be repeated as additional", path: ["additional_anzsrc_fields"] });
  } else if (value.anzsrc_unclassified_reason === null) {
    context.addIssue({ code: "custom", message: "unclassified records require a reason", path: ["anzsrc_unclassified_reason"] });
  } else if (value.additional_anzsrc_fields.length) {
    context.addIssue({ code: "custom", message: "unclassified records cannot have additional ANZSRC Fields", path: ["additional_anzsrc_fields"] });
  }
});

export type VendorAuditSource = z.infer<typeof VendorAuditSourceSchema>;
export type VendorAuditResources = z.infer<typeof VendorAuditResourcesSchema>;
export type VendorAuditFinding = z.infer<typeof VendorAuditFindingSchema>;
export type VendorAuditRelationship = z.infer<typeof VendorAuditRelationshipSchema>;
export type AnzsrcAuditMetadata = z.infer<typeof AnzsrcAuditMetadataSchema>;

export function isSafeAuditPath(value: string): boolean {
  if (path.posix.isAbsolute(value) || value.includes("\\")) return false;
  const normalized = path.posix.normalize(value);
  return normalized === value && normalized !== "." && !normalized.startsWith("../") && !normalized.includes("/../");
}
