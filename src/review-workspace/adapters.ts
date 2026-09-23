import path from "node:path";
import { z } from "zod";

import { AnnotationSetCandidateSchema, type AnnotationSetCandidate } from "../core/contracts/annotation.js";
import { sha256 } from "../core/workspace/write-plan.js";
import {
  ReviewWorkspaceDescriptorSchema,
  ReviewWorkspaceResultSchema,
  type ReviewDisposition,
  type ReviewWorkspaceDescriptor,
  type ReviewWorkspaceItem,
  type ReviewWorkspaceResult,
} from "./contracts.js";

const NonEmptySchema = z.string().trim().min(1);

export const PaperHumanizerPlanItemSchema = z.strictObject({
  item_id: NonEmptySchema,
  finding_ids: z.array(NonEmptySchema),
  locators: z.array(NonEmptySchema).min(1),
  operation: NonEmptySchema,
  expected_effect: NonEmptySchema,
  preservation_constraints: z.array(NonEmptySchema),
  risk: NonEmptySchema,
  recommendation: z.enum(["include", "optional", "defer"]),
  disposition: z.enum(["include", "exclude", "pending"]),
});

export const PaperHumanizerPlanSchema = z.strictObject({
  summary: z.string(),
  user_constraints: z.array(z.string()),
  items: z.array(PaperHumanizerPlanItemSchema).min(1),
});

export const ReviewResponseWorkboardItemSchema = z.strictObject({
  comment_id: NonEmptySchema,
  title: NonEmptySchema,
  source_text: z.string().min(1),
  source_pointer: z.string(),
  target_locations: z.array(NonEmptySchema).min(1),
  status: NonEmptySchema,
  priority: NonEmptySchema,
  evidence_gap: z.string(),
  user_confirmation_needed: z.boolean(),
  next_action: NonEmptySchema,
  proposed_text: z.string().nullable().optional(),
});

export const ReviewResponseWorkboardSchema = z.strictObject({
  items: z.array(ReviewResponseWorkboardItemSchema).min(1),
});

export interface ReviewManuscriptInput {
  path: string;
  content: string;
  format?: ReviewWorkspaceDescriptor["manuscript"]["format"];
  entryPath?: string;
  expectedSha256?: string;
}

interface ProjectionContext {
  workspaceId: string;
  title: string;
  manuscript: ReviewManuscriptInput;
  selector?: string;
  formalAction?: ReviewWorkspaceDescriptor["workflow"]["formal_action"];
}

export function annotationCandidateReviewWorkspace(input: ProjectionContext & {
  candidate: AnnotationSetCandidate;
}): ReviewWorkspaceDescriptor {
  const candidate = AnnotationSetCandidateSchema.parse(input.candidate);
  const manuscript = manuscriptProjection(input.manuscript, candidate.manuscript.sha256);
  return descriptor(input, "annotation-intake", manuscript, candidate.annotations.map((annotation) => ({
    item_id: annotation.annotation_id,
    title: annotation.expected_action,
    source_text: annotation.raw_body,
    source_pointer: annotation.source_pointer,
    target: annotation.target,
    recommendation: {
      action: annotation.expected_action,
      rationale: annotation.agent_interpretation,
      proposed_text: null,
      risk: annotation.semantic_impact.level === "ordinary"
        ? "ordinary"
        : `high: ${annotation.semantic_impact.categories.join(", ")}`,
    },
    initial_disposition: "pending",
    metadata: {
      source_ref: annotation.source_ref,
      semantic_impact: annotation.semantic_impact,
      clarification: annotation.clarification,
    },
  })));
}

export function paperHumanizerReviewWorkspace(input: ProjectionContext & {
  plan: z.input<typeof PaperHumanizerPlanSchema>;
}): ReviewWorkspaceDescriptor {
  const plan = PaperHumanizerPlanSchema.parse(input.plan);
  return descriptor(input, "paper-humanizer", manuscriptProjection(input.manuscript), plan.items.map((item) => ({
    item_id: item.item_id,
    title: item.operation,
    source_text: item.finding_ids.length > 0 ? item.finding_ids.join(", ") : item.operation,
    source_pointer: item.locators.join(" | "),
    target: { kind: "locator", label: item.locators.join(" | ") },
    recommendation: {
      action: item.operation,
      rationale: item.expected_effect,
      proposed_text: null,
      risk: item.risk,
    },
    initial_disposition: item.disposition,
    metadata: {
      finding_ids: item.finding_ids,
      locators: item.locators,
      preservation_constraints: item.preservation_constraints,
      recommendation: item.recommendation,
      plan_summary: plan.summary,
      user_constraints: plan.user_constraints,
    },
  })));
}

export function reviewResponseReviewWorkspace(input: ProjectionContext & {
  workboard: z.input<typeof ReviewResponseWorkboardSchema>;
}): ReviewWorkspaceDescriptor {
  const workboard = ReviewResponseWorkboardSchema.parse(input.workboard);
  return descriptor(input, "review-response", manuscriptProjection(input.manuscript), workboard.items.map((item) => ({
    item_id: item.comment_id,
    title: item.title,
    source_text: item.source_text,
    source_pointer: item.source_pointer,
    target: { kind: "locator", label: item.target_locations.join(" | ") },
    recommendation: {
      action: item.next_action,
      rationale: item.evidence_gap || "No evidence gap recorded.",
      proposed_text: item.proposed_text ?? null,
      risk: item.priority,
    },
    initial_disposition: dispositionFromStatus(item.status),
    metadata: {
      status: item.status,
      priority: item.priority,
      evidence_gap: item.evidence_gap,
      user_confirmation_needed: item.user_confirmation_needed,
      target_locations: item.target_locations,
    },
  })));
}

export function createReviewWorkspaceResult(input: {
  workspace: ReviewWorkspaceDescriptor;
  decisions?: Array<{ item_id: string; disposition: ReviewDisposition; note?: string; proposed_text?: string | null }>;
  overallNote?: string;
  exportedAt: string;
}): ReviewWorkspaceResult {
  const workspace = ReviewWorkspaceDescriptorSchema.parse(input.workspace);
  const byId = new Map(input.decisions?.map((decision) => [decision.item_id, decision]));
  return ReviewWorkspaceResultSchema.parse({
    schema_version: "1",
    workspace,
    source_sha256: workspace.manuscript.sha256,
    decisions: workspace.items.map((item) => {
      const decision = byId.get(item.item_id);
      return {
        item_id: item.item_id,
        disposition: decision?.disposition ?? item.initial_disposition,
        note: decision?.note ?? "",
        proposed_text: decision?.proposed_text ?? item.recommendation.proposed_text,
      };
    }),
    overall_note: input.overallNote ?? "",
    exported_at: input.exportedAt,
  });
}

function descriptor(
  input: ProjectionContext,
  adapter: ReviewWorkspaceDescriptor["adapter"],
  manuscript: ReviewWorkspaceDescriptor["manuscript"],
  items: ReviewWorkspaceItem[],
): ReviewWorkspaceDescriptor {
  return ReviewWorkspaceDescriptorSchema.parse({
    schema_version: "1",
    workspace_id: input.workspaceId,
    adapter,
    title: input.title,
    manuscript,
    items,
    workflow: {
      selector: input.selector ?? null,
      formal_action: input.formalAction ?? "none",
      mutation_authority: "researchspec-cli-only",
      handoff_instruction: "Return the exported result to the owning Agent. Re-read current instructions before any Gate, Decision, node, handoff, SQLite, or manuscript mutation.",
    },
  });
}

function manuscriptProjection(input: ReviewManuscriptInput, requiredSha256?: string): ReviewWorkspaceDescriptor["manuscript"] {
  const actual = sha256(input.content);
  const expected = requiredSha256 ?? input.expectedSha256;
  if (expected !== undefined && expected !== actual) throw new Error("Review workspace manuscript hash does not match the supplied content.");
  const format = input.format ?? inferFormat(input.path);
  return {
    path: input.path,
    entry_path: input.entryPath ?? null,
    format,
    sha256: actual,
    content: input.content,
  };
}

function inferFormat(filePath: string): ReviewWorkspaceDescriptor["manuscript"]["format"] {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".qmd") return "quarto";
  if (extension === ".md" || extension === ".markdown") return "markdown";
  if (extension === ".tex") return "latex";
  return "plain";
}

function dispositionFromStatus(status: string): ReviewDisposition {
  const normalized = status.trim().toLowerCase();
  if (["include", "accepted", "approved", "ready"].includes(normalized)) return "include";
  if (["exclude", "rejected", "closed"].includes(normalized)) return "exclude";
  if (["defer", "deferred", "blocked"].includes(normalized)) return "defer";
  if (["revise", "revision", "needs_revision"].includes(normalized)) return "revise";
  return "pending";
}

