import { randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";

import { ReviewAssetSchema, ReviewAnchorSchema, ReviewBlockSchema } from "./v2.js";

const Id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/);
const Text = z.string().min(1);
const RelativePath = Text.refine((value) => !/^(?:[A-Za-z]:|[/\\])/.test(value) && !value.split(/[/\\]/).includes(".."));
const SourceFile = z.strictObject({ path: RelativePath, sha256: z.string().regex(/^[a-f0-9]{64}$/) });
export const RevisionMasterStageSchema = z.enum(["coverage", "board", "strategy", "round"]);

/** Explicit domain rows. SQL selection and dependency ownership stay in the package runtime. */
export const RevisionMasterBusinessSchema = z.strictObject({
  runtime_language_context: z.array(z.strictObject({ id: z.number().int(), document_language: z.string(), working_language: z.string(), manuscript_detected_language: z.string(), review_comments_detected_language: z.string(), prompt_detected_language: z.string(), document_language_source: z.string(), working_language_source: z.string(), languages_confirmed: z.string() })),
  manuscript_summary: z.array(z.strictObject({ id: z.number().int(), main_entry: z.string(), project_shape: z.string(), high_risk_areas: z.string() })),
  manuscript_sections: z.array(z.strictObject({ section_id: z.string(), section_title: z.string(), purpose_in_manuscript: z.string(), key_files_or_locations: z.string() })),
  manuscript_claims: z.array(z.strictObject({ claim_id: z.string(), core_claim: z.string(), main_evidence: z.string(), supporting_section_ids: z.string(), risk_level: z.string() })),
  raw_review_threads: z.array(z.strictObject({ thread_id: z.string(), reviewer_id: z.string(), thread_order: z.number().int(), source_type: z.string(), original_text: z.string(), normalized_summary: z.string() })),
  atomic_comments: z.array(z.strictObject({ comment_id: z.string(), comment_order: z.number().int(), canonical_summary: z.string(), required_action: z.string() })),
  raw_thread_atomic_links: z.array(z.strictObject({ thread_id: z.string(), comment_id: z.string(), link_order: z.number().int() })),
  atomic_comment_source_spans: z.array(z.strictObject({ comment_id: z.string(), thread_id: z.string(), excerpt_text: z.string(), note: z.string() })),
  review_comment_source_documents: z.array(z.strictObject({ source_document_id: z.string(), source_kind: z.string(), document_order: z.number().int(), source_label: z.string(), source_path: z.string(), original_text: z.string() })),
  raw_thread_source_spans: z.array(z.strictObject({ thread_id: z.string(), source_document_id: z.string(), span_order: z.number().int(), span_role: z.string(), start_offset: z.number().int(), end_offset: z.number().int(), span_text: z.string() })),
  review_comment_coverage_segments: z.array(z.strictObject({ source_document_id: z.string(), segment_order: z.number().int(), coverage_status: z.string(), segment_text: z.string(), thread_id: z.string().nullable() })),
  review_comment_coverage_segment_comment_links: z.array(z.strictObject({ source_document_id: z.string(), segment_order: z.number().int(), link_order: z.number().int(), comment_id: z.string() })),
  atomic_comment_state: z.array(z.strictObject({ comment_id: z.string(), status: z.string(), priority: z.string(), evidence_gap: z.string(), user_confirmation_needed: z.string(), next_action: z.string() })),
  atomic_comment_target_locations: z.array(z.strictObject({ comment_id: z.string(), location_order: z.number().int(), target_location: z.string(), location_role: z.string() })),
  atomic_comment_analysis_links: z.array(z.strictObject({ comment_id: z.string(), analysis_order: z.number().int(), manuscript_claim_or_section: z.string(), existing_evidence: z.string(), gap_summary: z.string(), dependency_comment_id: z.string().nullable() })),
  strategy_cards: z.array(z.strictObject({ comment_id: z.string(), proposed_stance: z.string(), stance_rationale: z.string() })),
  strategy_card_actions: z.array(z.strictObject({ comment_id: z.string(), action_order: z.number().int(), manuscript_change: z.string(), expected_response_letter_effect: z.string() })),
  strategy_action_target_locations: z.array(z.strictObject({ comment_id: z.string(), action_order: z.number().int(), location_order: z.number().int(), target_location: z.string() })),
  strategy_card_evidence_items: z.array(z.strictObject({ comment_id: z.string(), evidence_order: z.number().int(), required_material: z.string(), available_now: z.string(), gap_note: z.string() })),
  strategy_card_pending_confirmations: z.array(z.strictObject({ comment_id: z.string(), confirmation_order: z.number().int(), message: z.string() })),
  strategy_action_manuscript_execution_items: z.array(z.strictObject({ comment_id: z.string(), action_order: z.number().int(), item_order: z.number().int(), category: z.string(), content_text: z.string(), rationale: z.string(), target_scope_note: z.string() })),
  comment_response_drafts: z.array(z.strictObject({ comment_id: z.string(), draft_text: z.string(), rationale: z.string() })),
  supplement_suggestion_items: z.array(z.strictObject({ comment_id: z.string(), suggestion_order: z.number().int(), analysis_order: z.number().int().nullable(), request_summary: z.string(), request_recommendation: z.string(), status: z.string() })),
  supplement_suggestion_intake_links: z.array(z.strictObject({ comment_id: z.string(), suggestion_order: z.number().int(), round_id: z.string(), file_path: z.string(), link_note: z.string() })),
  supplement_intake_items: z.array(z.strictObject({ round_id: z.string(), file_path: z.string(), concern_summary: z.string(), decision: z.string(), decision_rationale: z.string() })),
  supplement_landing_links: z.array(z.strictObject({ round_id: z.string(), file_path: z.string(), comment_id: z.string(), action_order: z.number().int(), location_order: z.number().int(), planned_usage_note: z.string() })),
  comment_completion_status: z.array(z.strictObject({ comment_id: z.string(), manuscript_execution_items_done: z.string(), response_draft_done: z.string(), evidence_gap_closed: z.string(), user_strategy_confirmed: z.string(), one_to_one_link_checked: z.string(), export_ready: z.string() })),
  comment_blockers: z.array(z.strictObject({ comment_id: z.string(), blocker_order: z.number().int(), message: z.string() })),
  response_thread_resolution_links: z.array(z.strictObject({ thread_id: z.string(), comment_id: z.string(), response_order: z.number().int(), response_role: z.string() })),
  style_profiles: z.array(z.strictObject({ profile_target: z.string(), profile_summary: z.string(), anti_ai_focus: z.string() })),
  style_profile_rules: z.array(z.strictObject({ profile_target: z.string(), rule_order: z.number().int(), rule_type: z.string(), rule_text: z.string() })),
  workspace_manuscript_copies: z.array(z.strictObject({ copy_role: z.string(), source_kind: z.string(), source_root: z.string(), copy_root: z.string(), main_entry_relative_path: z.string() })),
  revision_plan_actions: z.array(z.strictObject({ plan_action_id: z.string(), plan_order: z.number().int(), comment_id: z.string(), action_order: z.number().int().nullable(), execution_category: z.string(), title: z.string(), objective: z.string(), suggested_change: z.string(), evidence_requirement: z.string(), status: z.string() })),
  revision_plan_dependencies: z.array(z.strictObject({ plan_action_id: z.string(), depends_on_plan_action_id: z.string() })),
  revision_action_logs: z.array(z.strictObject({ log_id: z.string(), log_order: z.number().int(), status: z.string(), operator_role: z.string(), summary: z.string(), change_note: z.string(), response_note: z.string(), created_at: z.string() })),
  revision_action_log_plan_links: z.array(z.strictObject({ log_id: z.string(), plan_action_id: z.string() })),
  revision_action_log_thread_links: z.array(z.strictObject({ log_id: z.string(), thread_id: z.string() })),
  revision_action_log_entries: z.array(z.strictObject({ log_id: z.string(), entry_order: z.number().int(), target_file: z.string(), target_locator: z.string(), change_type: z.string(), change_summary: z.string(), rationale: z.string(), evidence_source: z.string(), expected_response_use: z.string() })),
  revision_action_log_file_diffs: z.array(z.strictObject({ log_id: z.string(), file_order: z.number().int(), relative_path: z.string(), change_kind: z.string(), diff_excerpt: z.string(), before_excerpt: z.string(), after_excerpt: z.string() })),
  working_copy_file_state: z.array(z.strictObject({ relative_path: z.string(), snapshot_sha256: z.string(), last_audited_sha256: z.string(), current_sha256: z.string(), last_log_id: z.string().nullable() })),
  action_copy_variants: z.array(z.strictObject({ comment_id: z.string(), action_order: z.number().int(), location_order: z.number().int(), variant_label: z.string(), variant_text: z.string(), rationale: z.string() })),
  selected_action_copy_variants: z.array(z.strictObject({ comment_id: z.string(), action_order: z.number().int(), location_order: z.number().int(), variant_label: z.string() })),
  response_thread_rows: z.array(z.strictObject({ thread_id: z.string(), response_resolution_kind: z.string(), original_comment: z.string(), modification_scope: z.string(), key_revision_excerpt: z.string(), response_explanation: z.string(), latex_excerpt: z.string(), latex_response_text: z.string() })),
  response_thread_action_log_links: z.array(z.strictObject({ thread_id: z.string(), log_id: z.string(), link_order: z.number().int() })),
  export_patch_sets: z.array(z.strictObject({ patch_set_id: z.string(), artifact_kind: z.string(), source_root: z.string(), output_root: z.string(), status: z.string() })),
  export_patches: z.array(z.strictObject({ patch_set_id: z.string(), patch_order: z.number().int(), comment_id: z.string(), action_order: z.number().int(), location_order: z.number().int(), target_file: z.string(), anchor_text: z.string(), operation: z.string(), marked_text: z.string(), clean_text: z.string(), notes: z.string() })),
  export_artifacts: z.array(z.strictObject({ artifact_name: z.string(), artifact_status: z.string(), output_path: z.string() })),
  workflow_state: z.array(z.strictObject({ id: z.number().int(), current_stage: z.string(), stage_gate: z.string(), active_comment_id: z.string().nullable(), next_action: z.string() })),
  workflow_pending_user_confirmations: z.array(z.strictObject({ position: z.number().int(), message: z.string() })),
  workflow_global_blockers: z.array(z.strictObject({ position: z.number().int(), message: z.string() })),
});

export const RevisionMasterContextSchema = z.strictObject({
  task_id: Id, selector: Text, run_id: Id, node_id: Id, round_id: Id.nullable(),
  stage: RevisionMasterStageSchema, formal_status: Text, active_comment_id: Id.nullable(),
}).superRefine((context, issue) => {
  const expected = `node:${context.run_id}/${context.node_id}${context.round_id ? `@${context.round_id}` : ""}`;
  if (context.selector !== expected) issue.addIssue({ code: "custom", message: "Exact node and round selector required.", path: ["selector"] });
  if ((context.stage === "strategy" || context.stage === "round") && !context.round_id) issue.addIssue({ code: "custom", message: "Execution handoff requires graph round.", path: ["round_id"] });
});

export const RevisionMasterScopeSchema = z.strictObject({
  scope_id: Id, kind: RevisionMasterStageSchema, target_ids: z.array(Text),
  baseline: z.strictObject({ tables: RevisionMasterBusinessSchema.partial(), files: z.array(SourceFile), unresolved: z.array(Text).optional() }),
});
const Feedback = { feedback_id: Id, scope_id: Id, target_id: Text, note: z.string() };
export const RevisionMasterFeedbackSchema = z.strictObject({
  dispositions: z.array(z.strictObject({ ...Feedback, action: z.enum(["include", "exclude", "adjust", "defer"]) })),
  annotations: z.array(z.strictObject({ ...Feedback, anchor: ReviewAnchorSchema.nullable() })),
  confirmations: z.array(z.strictObject({ ...Feedback, kind: z.enum(["coverage", "board", "strategy"]), members: z.array(Text) })),
  seen: z.array(z.strictObject(Feedback)),
  focus_requests: z.array(z.strictObject(Feedback)),
  overall_note: z.array(z.strictObject(Feedback)),
});
const Pending = z.strictObject({ result_id: Id, feedback_id: Id, scope_id: Id, status: z.enum(["pending", "conflict"]), note: z.string() });

export const RevisionMasterWorkspaceSchema = z.strictObject({
  schema_version: z.literal("revision-master-review-workspace.v1"), workspace_id: Id, snapshot_id: Id,
  title: Text, context: RevisionMasterContextSchema, business: RevisionMasterBusinessSchema,
  scopes: z.array(RevisionMasterScopeSchema).min(1),
  sources: z.strictObject({ files: z.array(SourceFile), capture_limitations: z.array(z.string()) }),
  documents: z.array(z.strictObject({
    document_id: Id, title: Text, source_path: RelativePath.nullable(), role: z.enum(["review", "manuscript", "before", "after"]),
    original_text: z.string(), blocks: z.array(ReviewBlockSchema).min(1),
  })).min(1),
  assets: z.array(ReviewAssetSchema),
  locations: z.array(z.strictObject({
    location_id: Id, comment_id: Id, document_id: Id, block_id: Id, start: z.number().int().nonnegative(), end: z.number().int().nonnegative(),
    label: Text, paired_location_id: Id.nullable(),
  })),
  unresolved: z.array(z.string()), next_step: Text, pending_feedback: z.array(Pending),
}).superRefine((workspace, context) => {
  const fail = (message: string) => context.addIssue({ code: "custom", message });
  const unique = (ids: string[]) => new Set(ids).size === ids.length;
  const b = workspace.business;
  const comments = new Set(b.atomic_comments.map((row) => row.comment_id));
  const threads = new Set(b.raw_review_threads.map((row) => row.thread_id));
  const originals = new Map(b.review_comment_source_documents.map((row) => [row.source_document_id, row]));
  const docs = new Map(workspace.documents.map((doc) => [doc.document_id, doc]));
  const blocks = new Map(workspace.documents.flatMap((doc) => doc.blocks.map((block) => [block.id, block] as const)));
  const sources = new Set(workspace.sources.files.map((file) => file.path));
  const assets = new Set(workspace.assets.map((asset) => asset.id));
  const plans = new Set(b.revision_plan_actions.map((row) => row.plan_action_id));
  const logs = new Set(b.revision_action_logs.map((row) => row.log_id));
  const actions = new Set(b.strategy_card_actions.map((row) => `${row.comment_id}:${String(row.action_order)}`));
  const patches = new Set(b.export_patch_sets.map((row) => row.patch_set_id));
  const targets = revisionMasterTargets(workspace);
  if (!unique([...b.atomic_comments.map((row) => row.comment_id)])) fail("Duplicate comment identity.");
  if (!unique(b.raw_review_threads.map((row) => row.thread_id)) || !unique(b.review_comment_source_documents.map((row) => row.source_document_id))) fail("Duplicate source identity.");
  for (const ids of [workspace.scopes.map((row) => row.scope_id), workspace.documents.map((row) => row.document_id), workspace.documents.flatMap((doc) => doc.blocks.map((block) => block.id)), workspace.locations.map((row) => row.location_id), workspace.sources.files.map((file) => file.path), workspace.assets.map((asset) => asset.id)]) if (!unique(ids)) fail("Duplicate snapshot identity.");
  if (workspace.context.active_comment_id && !comments.has(workspace.context.active_comment_id)) fail("Active comment missing.");
  for (const rows of Object.values(b)) for (const row of rows) {
    if ("comment_id" in row && !comments.has(row.comment_id)) fail("Missing comment reference.");
    if ("thread_id" in row && row.thread_id !== null && !threads.has(row.thread_id)) fail("Missing thread reference.");
    if ("dependency_comment_id" in row && row.dependency_comment_id !== null && !comments.has(row.dependency_comment_id)) fail("Missing dependency comment.");
    if ("source_document_id" in row && !originals.has(row.source_document_id)) fail("Missing source document.");
    if ("plan_action_id" in row && !plans.has(row.plan_action_id)) fail("Missing plan action.");
    if ("depends_on_plan_action_id" in row && !plans.has(row.depends_on_plan_action_id)) fail("Missing plan dependency.");
    if ("log_id" in row && !logs.has(row.log_id)) fail("Missing revision log.");
    if ("patch_set_id" in row && !patches.has(row.patch_set_id)) fail("Missing patch set.");
    if ("action_order" in row && row.action_order !== null && "comment_id" in row && !actions.has(`${row.comment_id}:${String(row.action_order)}`)) fail("Missing strategy action.");
  }
  for (const span of b.raw_thread_source_spans) {
    const source = originals.get(span.source_document_id);
    // SQLite source offsets count Unicode code points, not browser UTF-16 units.
    if (!source || span.start_offset < 0 || span.end_offset < span.start_offset || span.end_offset > Array.from(source.original_text).length || Array.from(source.original_text).slice(span.start_offset, span.end_offset).join("") !== span.span_text) fail("Original source span mismatch.");
  }
  for (const scope of workspace.scopes) {
    if (!unique(scope.target_ids) || scope.target_ids.some((id) => !targets.has(id))) fail("Invalid scope membership.");
    if (scope.baseline.files.some((file) => !workspace.sources.files.some((source) => source.path === file.path && source.sha256 === file.sha256))) fail("Scope source baseline missing.");
  }
  const kindScopes = workspace.scopes.filter((scope) => scope.kind !== "strategy");
  if (kindScopes.length !== 3 || new Set(kindScopes.map((scope) => scope.kind)).size !== 3) fail("Exactly one coverage, board, and round scope is required.");
  for (const scope of kindScopes) if (scope.scope_id !== scope.kind) fail("Scope identity must match its kind.");
  for (const scope of workspace.scopes) {
    if (scope.kind !== "strategy") continue;
    const commentId = scope.scope_id.startsWith("strategy:") ? scope.scope_id.slice("strategy:".length) : "";
    if (!commentId || !isDeepStrictEqual(scope.target_ids, [`comment:${commentId}`])) fail("Strategy scope must name only its own card.");
  }
  for (const doc of workspace.documents) {
    if (doc.source_path && !sources.has(doc.source_path)) fail("Document source not captured.");
    for (const block of doc.blocks) {
      if (block.source_path && !sources.has(block.source_path)) fail("Block source not captured.");
      if (block.kind === "image" && (!block.resource_id || !assets.has(block.resource_id))) fail("Image asset missing.");
    }
  }
  for (const asset of workspace.assets) if (asset.source_path && !sources.has(asset.source_path)) fail("Asset source not captured.");
  const locations = new Map(workspace.locations.map((location) => [location.location_id, location]));
  for (const location of workspace.locations) {
    const block = blocks.get(location.block_id);
    if (!comments.has(location.comment_id) || !docs.get(location.document_id)?.blocks.some((entry) => entry.id === location.block_id) || !block || location.end < location.start || location.end > (block?.text.length ?? 0)) fail("Invalid display location.");
    if (location.paired_location_id) {
      const pair = locations.get(location.paired_location_id);
      if (!pair || pair.comment_id !== location.comment_id || pair.paired_location_id !== location.location_id || pair.document_id === location.document_id) fail("Invalid comparison pairing.");
    }
  }
});

export type RevisionMasterWorkspace = z.infer<typeof RevisionMasterWorkspaceSchema>;
export type RevisionMasterContext = z.infer<typeof RevisionMasterContextSchema>;
export type RevisionMasterBusiness = z.infer<typeof RevisionMasterBusinessSchema>;

export function revisionMasterTargets(workspace: { business: RevisionMasterBusiness; documents: Array<{ document_id: string }>; scopes: Array<{ scope_id: string }> }): Set<string> {
  return new Set([
    ...workspace.business.atomic_comments.map((row) => `comment:${row.comment_id}`),
    ...workspace.business.raw_review_threads.map((row) => `thread:${row.thread_id}`),
    ...workspace.business.raw_thread_atomic_links.map((row) => `relation:${row.thread_id}:${row.comment_id}`),
    ...workspace.documents.map((row) => `document:${row.document_id}`),
    ...workspace.scopes.map((row) => `scope:${row.scope_id}`),
  ]);
}

export const RevisionMasterResultSchema = z.strictObject({
  schema_version: z.literal("revision-master-review-result.v1"), workspace: RevisionMasterWorkspaceSchema,
  snapshot_id: Id, result_id: Id, draft_id: Id, export_revision: z.number().int().positive(), exported_at: z.iso.datetime({ offset: true }),
  feedback: RevisionMasterFeedbackSchema,
}).superRefine((result, context) => {
  const fail = (message: string) => context.addIssue({ code: "custom", message });
  const w = result.workspace;
  if (result.snapshot_id !== w.snapshot_id) fail("Snapshot mismatch.");
  const scopes = new Map(w.scopes.map((scope) => [scope.scope_id, scope]));
  const entries = Object.values(result.feedback).flat();
  if (new Set(entries.map((row) => row.feedback_id)).size !== entries.length) fail("Duplicate feedback identity.");
  const blocks = new Map(w.documents.flatMap((doc) => doc.blocks.map((block) => [block.id, block] as const)));
  for (const entry of entries) {
    const scope = scopes.get(entry.scope_id);
    if (!scope || !(scope.target_ids.includes(entry.target_id) || entry.target_id === `scope:${entry.scope_id}`)) fail("Feedback outside declared scope.");
  }
  for (const annotation of result.feedback.annotations) {
    if (!annotation.note.trim()) fail("Empty annotation.");
    const a = annotation.anchor;
    if (!a) continue;
    const block = blocks.get(a.block_id);
    if (!block || a.snapshot_id !== w.snapshot_id) { fail("Stale annotation anchor."); continue; }
    if (a.kind === "text") {
      if (a.end <= a.start || a.end > block.text.length || block.text.slice(a.start, a.end) !== a.exact_quote || !block.text.slice(0, a.start).endsWith(a.prefix) || !block.text.slice(a.end).startsWith(a.suffix)) fail("Annotation quote mismatch.");
    } else if (a.exact_quote !== block.text || a.resource_id !== block.resource_id) fail("Whole block mismatch.");
  }
  for (const confirmation of result.feedback.confirmations) {
    const scope = scopes.get(confirmation.scope_id);
    if (!scope || scope.kind !== confirmation.kind || !isDeepStrictEqual(confirmation.members, scope.target_ids)) fail("Confirmation must cover the exact candidate.");
    if (confirmation.target_id !== `scope:${confirmation.scope_id}`) fail("Confirmation must identify its scope.");
    if (scope?.baseline.unresolved?.length) fail("Unresolved source dependencies keep confirmation pending.");
    if (confirmation.kind === "strategy") {
      const active = w.context.active_comment_id;
      if (confirmation.scope_id !== `strategy:${String(active)}`) fail("Only the current active strategy scope can be confirmed.");
      const state = w.business.atomic_comment_state.find((row) => row.comment_id === active);
      const materialGap = w.business.comment_blockers.some((row) => row.comment_id === active)
        || w.business.strategy_card_evidence_items.some((row) => row.comment_id === active && row.available_now === "no");
      if (materialGap || state?.status === "blocked" || state?.evidence_gap === "yes") fail("A blocked or evidence-gapped strategy cannot be confirmed.");
    }
    const targetSet = new Set([...(scope?.target_ids ?? []), ...(scope?.kind === "strategy" ? scope.baseline.tables.atomic_comments ?? [] : []).flatMap((row) => typeof row.comment_id === "string" ? [`comment:${row.comment_id}`] : [])]);
    const overlaps = (entry: { scope_id: string; target_id: string }) => {
      if (entry.target_id.startsWith("comment:")) return targetSet.has(entry.target_id);
      if (entry.target_id.startsWith("relation:")) return targetSet.has(`comment:${entry.target_id.split(":").at(-1) ?? ""}`) || targetSet.has(`thread:${entry.target_id.split(":")[1] ?? ""}`) || targetSet.has(entry.target_id);
      if (entry.target_id.startsWith("thread:")) return targetSet.has(entry.target_id) || w.business.raw_thread_atomic_links.some((row) => `thread:${row.thread_id}` === entry.target_id && targetSet.has(`comment:${row.comment_id}`));
      return entry.scope_id === confirmation.scope_id || (scopes.get(entry.scope_id)?.target_ids.some((target) => targetSet.has(target)) ?? true);
    };
    if (result.feedback.dispositions.some((entry) => overlaps(entry) && (entry.action === "adjust" || entry.action === "defer" || entry.note.trim())) || result.feedback.annotations.some(overlaps) || result.feedback.overall_note.some((entry) => overlaps(entry) && entry.note.trim())) fail("Unresolved feedback keeps confirmation pending.");
  }
  for (const seen of result.feedback.seen) if (scopes.get(seen.scope_id)?.kind !== "round") fail("Seen is a round marker.");
  for (const request of result.feedback.focus_requests) if (!request.target_id.startsWith("comment:") || !w.business.atomic_comments.some((row) => `comment:${row.comment_id}` === request.target_id)) fail("Focus request requires a comment.");
});
export type RevisionMasterResult = z.infer<typeof RevisionMasterResultSchema>;

export function createRevisionMasterResult(input: { workspace: RevisionMasterWorkspace; draftId?: string; revision: number; feedback?: z.infer<typeof RevisionMasterFeedbackSchema>; exportedAt?: string }): RevisionMasterResult {
  return RevisionMasterResultSchema.parse({
    schema_version: "revision-master-review-result.v1", workspace: input.workspace, snapshot_id: input.workspace.snapshot_id,
    result_id: randomUUID(), draft_id: input.draftId ?? randomUUID(), export_revision: input.revision, exported_at: input.exportedAt ?? new Date().toISOString(),
    feedback: input.feedback ?? { dispositions: [], annotations: [], confirmations: [], seen: [], focus_requests: [], overall_note: [] },
  });
}

export function validateRevisionMasterResult(result: unknown, retained: unknown): RevisionMasterResult {
  const workspace = RevisionMasterWorkspaceSchema.parse(retained);
  const parsed = RevisionMasterResultSchema.parse(result);
  if (!isDeepStrictEqual(parsed.workspace, workspace)) throw new Error("Result candidate differs from the separately retained snapshot.");
  return parsed;
}
