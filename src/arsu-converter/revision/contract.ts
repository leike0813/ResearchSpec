import { z } from "zod";

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/);
const Hash12Schema = z.string().regex(/^[a-f0-9]{12}$/);
const BlockIdSchema = z.string().regex(/^B[0-9]{4,}$/);

export const RevisionAnnotationReferenceSchema = z.strictObject({
  annotation_set_id: SafeIdSchema,
  annotation_id: SafeIdSchema,
});

export const RevisionAnnotationDispositionSchema = z.enum([
  "implemented",
  "answered_without_text_change",
  "deferred",
  "rejected",
  "unresolved",
  "superseded",
]);

export const RevisionAnnotationMappingEntrySchema = z.strictObject({
  annotation_set_id: SafeIdSchema,
  annotation_id: SafeIdSchema,
  disposition: RevisionAnnotationDispositionSchema,
  answer: z.string().trim().min(1).optional(),
  reason: z.string().trim().min(1).optional(),
  superseded_by: RevisionAnnotationReferenceSchema.optional(),
}).superRefine((entry, context) => {
  if (entry.disposition === "answered_without_text_change" && !entry.answer) {
    context.addIssue({ code: "custom", message: "answered_without_text_change requires answer.", path: ["answer"] });
  }
  if (["deferred", "rejected", "unresolved"].includes(entry.disposition) && !entry.reason) {
    context.addIssue({ code: "custom", message: `${entry.disposition} requires reason.`, path: ["reason"] });
  }
  if (entry.disposition === "superseded" && !entry.superseded_by) {
    context.addIssue({ code: "custom", message: "superseded requires superseded_by.", path: ["superseded_by"] });
  }
});

const AnnotationReferencesSchema = z.array(RevisionAnnotationReferenceSchema).min(1).superRefine((values, context) => {
  const keys = values.map(annotationKey);
  if (new Set(keys).size !== keys.length) context.addIssue({ code: "custom", message: "Annotation references must be unique." });
});

const RevisionOperationCoreSchema = z.strictObject({
  operation_id: SafeIdSchema,
  block_id: z.union([BlockIdSchema, z.literal("DOC-BODY-START")]),
  roadmap_item_ids: z.array(SafeIdSchema).min(1).superRefine((values, context) => {
    if (new Set(values).size !== values.length) context.addIssue({ code: "custom", message: "Roadmap item IDs must be unique." });
  }),
  annotation_refs: AnnotationReferencesSchema.optional(),
});

const ReplaceBlockOperationSchema = RevisionOperationCoreSchema.extend({
  op: z.literal("replace_block"),
  block_id: BlockIdSchema,
  old_hash: Hash12Schema,
  new_text: z.string().min(1),
});

const DeleteBlockOperationSchema = RevisionOperationCoreSchema.extend({
  op: z.literal("delete_block"),
  block_id: BlockIdSchema,
  old_hash: Hash12Schema,
});

const InsertAfterOperationSchema = z.union([
  RevisionOperationCoreSchema.extend({
    op: z.literal("insert_after"),
    block_id: BlockIdSchema,
    old_hash: Hash12Schema,
    new_text: z.string().min(1),
  }),
  RevisionOperationCoreSchema.extend({
    op: z.literal("insert_after"),
    block_id: z.literal("DOC-BODY-START"),
    new_text: z.string().min(1),
  }),
]);

export const RevisionPatchOperationSchema = z.union([
  ReplaceBlockOperationSchema,
  InsertAfterOperationSchema,
  DeleteBlockOperationSchema,
]);

export const RevisionPatchSchema = z.strictObject({
  patch_format_version: z.literal("2.0"),
  revision_round: z.number().int().positive(),
  base_draft_hash: Hash12Schema,
  revision_rationale: z.string().trim().min(1),
  emitted_by: z.string().trim().min(1),
  ops: z.array(RevisionPatchOperationSchema).min(1).superRefine((values, context) => {
    const operationIds = values.map((operation) => operation.operation_id);
    if (new Set(operationIds).size !== operationIds.length) context.addIssue({ code: "custom", message: "Operation IDs must be unique." });
  }),
  annotation_mapping: z.strictObject({
    annotations: z.array(RevisionAnnotationMappingEntrySchema).min(1).superRefine((values, context) => {
      const keys = values.map(annotationKey);
      if (new Set(keys).size !== keys.length) context.addIssue({ code: "custom", message: "Annotation mapping entries must be unique." });
    }),
  }).optional(),
});

export interface RevisionPatchDiagnostic {
  code: "schema_invalid" | "annotation_mapping_incomplete" | "annotation_mapping_invalid";
  path?: Array<string | number>;
  message: string;
}

export type RevisionPatch = z.infer<typeof RevisionPatchSchema>;
export type RevisionPatchOperation = z.infer<typeof RevisionPatchOperationSchema>;
export type RevisionAnnotationReference = z.infer<typeof RevisionAnnotationReferenceSchema>;

export type RevisionPatchValidationResult =
  | { ok: true; patch: RevisionPatch }
  | { ok: false; diagnostics: RevisionPatchDiagnostic[] };

export function validateRevisionPatch(value: unknown): RevisionPatchValidationResult {
  const parsed = RevisionPatchSchema.safeParse(value);
  if (!parsed.success) {
    return {
      ok: false,
      diagnostics: parsed.error.issues.map((issue) => ({
        code: issue.path.includes("annotation_mapping") || issue.path.includes("annotation_refs")
          ? "annotation_mapping_invalid" as const
          : "schema_invalid" as const,
        path: issue.path.map((item) => typeof item === "symbol" ? String(item) : item),
        message: issue.message,
      })),
    };
  }
  const diagnostics = validateAnnotationMapping(parsed.data);
  return diagnostics.length ? { ok: false, diagnostics } : { ok: true, patch: parsed.data };
}

export function revisionPatchJsonSchema(): string {
  const schema = z.toJSONSchema(RevisionPatchSchema, { target: "draft-2020-12" }) as Record<string, unknown>;
  return `${JSON.stringify({
    ...schema,
    $id: "researchspec://arsu/contracts/revision-patch/v2",
    title: "ResearchSpec-adapted ARSU Revision Patch",
    description: "The sole manuscript patch contract for ARSU revision work.",
  }, null, 2)}\n`;
}

function validateAnnotationMapping(patch: RevisionPatch): RevisionPatchDiagnostic[] {
  const references = patch.ops.flatMap((operation) => operation.annotation_refs ?? []);
  if (!patch.annotation_mapping) {
    return references.length ? [{ code: "annotation_mapping_incomplete", message: "Operations with annotation_refs require annotation_mapping." }] : [];
  }
  const entries = new Map(patch.annotation_mapping.annotations.map((entry) => [annotationKey(entry), entry]));
  const referenced = new Set(references.map(annotationKey));
  const diagnostics: RevisionPatchDiagnostic[] = [];
  for (const reference of references) {
    if (!entries.has(annotationKey(reference))) diagnostics.push({ code: "annotation_mapping_incomplete", message: `Annotation reference is absent from annotation_mapping: ${annotationKey(reference)}` });
  }
  for (const [key, entry] of entries) {
    if (entry.disposition === "implemented" && !referenced.has(key)) {
      diagnostics.push({ code: "annotation_mapping_incomplete", message: `Implemented annotation is not mapped to an operation: ${key}` });
    }
    if (entry.disposition !== "implemented" && referenced.has(key)) {
      diagnostics.push({ code: "annotation_mapping_invalid", message: `Only implemented annotations may be mapped to an operation: ${key}` });
    }
    if (entry.superseded_by) {
      const target = annotationKey(entry.superseded_by);
      if (target === key || !entries.has(target)) diagnostics.push({ code: "annotation_mapping_invalid", message: `superseded_by must reference another annotation in this mapping: ${key}` });
    }
  }
  return diagnostics;
}

function annotationKey(value: RevisionAnnotationReference): string {
  return `${value.annotation_set_id}:${value.annotation_id}`;
}
