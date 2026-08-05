import type { ArsuRouteDefinition } from "./contracts.js";

const manuscriptInput = { operator: "any_of" as const, requirements: [
  { kind: "user_input" as const, id: "manuscript" },
  { kind: "handoff_role" as const, id: "paper_draft" },
  { kind: "handoff_role" as const, id: "verified_draft" },
], fallback_route_refs: ["academic-paper:full" as const] };

export const PAPER_HUMANIZER_REVIEW_ROUTE: ArsuRouteDefinition = {
  route_kind: "mode",
  route_ref: "paper-humanizer:review",
  mode_id: "review",
  title: "Paper humanization review",
  intents: ["diagnose mechanical or AI-like manuscript prose without editing it"],
  boundary_outputs: [{ role: "humanization_review_report", type: "review-report", purpose: "Read-only prose diagnostics and revision suggestions", structure: "Markdown or JSON-compatible report", validation_profile: "text-artifact" }],
  prerequisite_groups: [manuscriptInput],
  risk_level: "low",
  gate_policy: { level: "none", gate_kinds: [] },
  cost: { effort: "low", interaction: "single_pass" },
  start_confirmation: "required",
};

export const PAPER_HUMANIZER_FULL_ROUTE: ArsuRouteDefinition = {
  route_kind: "mode",
  route_ref: "paper-humanizer:full",
  mode_id: "full",
  title: "Full paper humanization",
  intents: ["interactively revise manuscript prose while preserving scholarly meaning and protected syntax"],
  boundary_outputs: [
    { role: "humanized_manuscript", type: "manuscript", purpose: "Humanized manuscript candidate or final copy", structure: "Markdown, QMD, or LaTeX", validation_profile: "text-artifact" },
    { role: "humanization_review_report", type: "review-report", purpose: "Sentence-level prose diagnostics", structure: "Markdown or JSON-compatible report", validation_profile: "text-artifact" },
    { role: "humanization_revision_plan", type: "revision-plan", purpose: "Approved candidate revision plan", structure: "JSON-compatible YAML or Markdown", validation_profile: "text-artifact" },
    { role: "humanization_verification_report", type: "verification-report", purpose: "Protected-content and acceptance checks", structure: "Markdown or JSON-compatible report", validation_profile: "text-artifact" },
  ],
  prerequisite_groups: [manuscriptInput],
  risk_level: "medium",
  gate_policy: { level: "required", gate_kinds: ["paper-humanizer-acceptance"] },
  cost: { effort: "medium", interaction: "iterative" },
  start_confirmation: "required",
};

export const PAPER_HUMANIZER_ROUTES = [PAPER_HUMANIZER_REVIEW_ROUTE, PAPER_HUMANIZER_FULL_ROUTE] as const;

