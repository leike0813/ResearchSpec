import type { ArsuRouteDefinition } from "./contracts.js";

const route: ArsuRouteDefinition = {
  route_kind: "mode",
  route_ref: "review-response:full",
  mode_id: "full",
  title: "Review response",
  intents: [
    "coordinate a real post-submission revision response",
    "map reviewer comments to manuscript changes and response rows",
  ],
  boundary_outputs: [
    { role: "revised_manuscript", type: "manuscript", purpose: "Reviewed revised manuscript for submission", structure: "Markdown, QMD, single-file LaTeX, or LaTeX project", validation_profile: "text-artifact" },
    { role: "response_to_reviewers", type: "response-letter", purpose: "Thread-level response letter with evidence and change references", structure: "Markdown or venue-compatible text artifact", validation_profile: "text-artifact" },
    { role: "review-response-summary", type: "process-summary", purpose: "Summary of coverage, unresolved items, and confirmed decisions", structure: "Markdown", validation_profile: "text-artifact" },
  ],
  prerequisite_groups: [
    { operator: "all_of", requirements: [{ kind: "stable_spec", id: "specs/manuscript.yaml" }], fallback_route_refs: [] },
    { operator: "any_of", requirements: [{ kind: "user_input", id: "reviewer_comments" }, { kind: "handoff_role", id: "review_report" }, { kind: "handoff_role", id: "revision_roadmap" }], fallback_route_refs: ["academic-paper:revision-coach"] },
  ],
  risk_level: "high",
  gate_policy: { level: "required", gate_kinds: [
    "review-response-comment-coverage",
    "review-response-strategy",
    "review-response-evidence",
    "review-response-response-coverage",
    "review-response-final-assembly",
  ] },
  cost: { effort: "high", interaction: "iterative" },
  start_confirmation: "required",
};

export const REVIEW_RESPONSE_ROUTE = route;
