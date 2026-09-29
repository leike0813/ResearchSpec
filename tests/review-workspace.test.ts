import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { generateAnnotationReviewCopy, removeUntouchedAnnotationSlots } from "../src/annotation-intake.js";
import { sha256 } from "../src/arsu-converter/revision/markdown-blocks.js";
import {
  ReviewWorkspaceDescriptorSchema,
  ReviewWorkspaceV2Schema,
  annotationCandidateReviewWorkspace,
  createReviewWorkspaceResult,
  paperHumanizerReviewWorkspace,
  reviewWorkspaceInstruction,
  reviewResponseReviewWorkspace,
} from "../src/review-workspace.js";
import { REVIEW_PREVIEW_CASES, renderReviewWorkspacePreview, reviewWorkspacePreviewSamples } from "../harness/review-workspace-preview.js";

const MANUSCRIPT = "<!--block:intro-->\n# Introduction\n原始段落。\n";

void test("annotation candidate projection preserves evidence and rejects stale manuscript bytes", () => {
  const candidate = {
    schema_version: "1" as const,
    annotation_set_id: "review-1",
    intake_session_id: "review-1",
    manuscript: { path: "paper.qmd", sha256: sha256(MANUSCRIPT) },
    raw_sources: [{ source_id: "source-1", path: "feedback.md", sha256: sha256("改写"), format: "markdown_feedback" as const, media_type: "text/markdown" }],
    annotations: [{
      annotation_id: "ann-1",
      raw_body: "改写",
      source_pointer: "/comment/0",
      source_ref: { kind: "source_span" as const, source_id: "source-1", start_byte: 0, end_byte: 6 },
      target: { kind: "block" as const, block_id: "intro", block_sha256: sha256("# Introduction\n原始段落。") },
      agent_interpretation: "Make the opening more direct.",
      expected_action: "Revise the opening sentence.",
      semantic_impact: { level: "ordinary" as const },
      clarification: null,
    }],
  };
  const workspace = annotationCandidateReviewWorkspace({ workspaceId: "review-1", title: "Review", manuscript: { path: "paper.qmd", content: MANUSCRIPT }, candidate });
  assert.equal(workspace.adapter, "annotation-intake");
  assert.equal(workspace.manuscript.format, "quarto");
  assert.deepEqual(workspace.items[0]?.target, candidate.annotations[0]?.target);
  assert.throws(() => annotationCandidateReviewWorkspace({ workspaceId: "review-1", title: "Review", manuscript: { path: "paper.qmd", content: `${MANUSCRIPT}stale` }, candidate }), /hash/);
});

void test("paper-humanizer and review-response adapters keep workflow-specific evidence", () => {
  const humanizer = paperHumanizerReviewWorkspace({
    workspaceId: "humanizer-1", title: "Humanizer plan", selector: "gate:run/plan", formalAction: "gate",
    manuscript: { path: "paper.tex", content: "\\section{Intro}\nText" },
    plan: { summary: "Conservative pass", user_constraints: ["Keep terminology"], items: [{
      item_id: "RP-001", finding_ids: ["F-001"], locators: ["paragraph 1"], operation: "Vary sentence openings",
      expected_effect: "Reduce repetition", preservation_constraints: ["Keep citations"], risk: "low", recommendation: "include", disposition: "pending",
    }] },
  });
  assert.equal(humanizer.manuscript.format, "latex");
  assert.deepEqual(humanizer.items[0]?.metadata.preservation_constraints, ["Keep citations"]);

  const response = reviewResponseReviewWorkspace({
    workspaceId: "response-1", title: "Response workboard", manuscript: { path: "paper.md", content: MANUSCRIPT },
    workboard: { items: [{ comment_id: "C-001", title: "Clarify sample", source_text: "Explain sampling.", source_pointer: "R1.2", target_locations: ["Methods"], status: "blocked", priority: "high", evidence_gap: "Sample rationale", user_confirmation_needed: true, next_action: "Add rationale" }] },
  });
  assert.equal(response.items[0]?.initial_disposition, "defer");
  assert.equal(response.items[0]?.metadata.user_confirmation_needed, true);
});

void test("workspace results cover every item and review-copy JSON round trips exact bytes", () => {
  const copy = generateAnnotationReviewCopy({ baseText: MANUSCRIPT });
  const roundTrip = JSON.parse(JSON.stringify(copy)) as typeof copy;
  assert.equal(removeUntouchedAnnotationSlots(roundTrip), MANUSCRIPT);

  const workspace = ReviewWorkspaceDescriptorSchema.parse({
    schema_version: "1", workspace_id: "result-1", adapter: "paper-humanizer", title: "Review",
    manuscript: { path: "paper.md", entry_path: null, format: "markdown", sha256: sha256(MANUSCRIPT), content: MANUSCRIPT },
    items: [{ item_id: "RP-001", title: "Edit", source_text: "Evidence", source_pointer: "p1", target: { kind: "document" }, recommendation: { action: "Edit", rationale: "Reason", proposed_text: null, risk: "low" }, initial_disposition: "pending", metadata: {} }],
    workflow: { selector: null, formal_action: "none", mutation_authority: "researchspec-cli-only", handoff_instruction: "Return to the owning Agent." },
  });
  const result = createReviewWorkspaceResult({ workspace, decisions: [{ item_id: "RP-001", disposition: "exclude", note: "Keep author voice." }], exportedAt: "2026-09-23T12:00:00+08:00" });
  assert.equal(result.workspace.items[0]?.recommendation.action, "Edit");
  assert.equal(result.decisions[0]?.note, "Keep author voice.");
});

void test("duplicate review item ids fail closed", () => {
  const base = {
    schema_version: "1" as const, workspace_id: "duplicates", adapter: "paper-humanizer" as const, title: "Review",
    manuscript: { path: "paper.md", entry_path: null, format: "markdown" as const, sha256: sha256(MANUSCRIPT), content: MANUSCRIPT },
    workflow: { selector: null, formal_action: "none" as const, mutation_authority: "researchspec-cli-only" as const, handoff_instruction: "Return to the owning Agent." },
  };
  const item = { item_id: "same", title: "Edit", source_text: "Evidence", source_pointer: "", target: { kind: "document" as const }, recommendation: { action: "Edit", rationale: "Reason", proposed_text: null, risk: "low" }, initial_disposition: "pending" as const, metadata: {} };
  assert.equal(ReviewWorkspaceDescriptorSchema.safeParse({ ...base, items: [item, item] }).success, false);
});

void test("static workspace stays self-contained and keeps user content out of HTML parsing", async () => {
  const html = await readFile(path.resolve("review-workspace/index.html"), "utf8");
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /review-workspace\.v2/);
  assert.match(html, /review-workspace-result\.v2/);
  assert.doesNotMatch(html, /<script\s+src=|<link\s+[^>]*href=/i);
  assert.doesNotMatch(html, /innerHTML|insertAdjacentHTML|document\.write|eval\(/);
});

void test("preview samples use the real v2 adapters and embed manuscript content safely", async () => {
  const sourceHtml = await readFile(path.resolve("review-workspace/index.html"), "utf8");
  const samples = reviewWorkspacePreviewSamples();
  assert.deepEqual(Object.keys(samples), REVIEW_PREVIEW_CASES.map((item) => item.id));
  for (const { id } of REVIEW_PREVIEW_CASES) {
    const sample = ReviewWorkspaceV2Schema.parse(samples[id]);
    if (id === "empty") assert.equal(sample.items.length, 0);
    else { assert.equal(sample.adapter, id); assert.ok(sample.items.length >= 3); }
    const preview = renderReviewWorkspacePreview(sourceHtml, sample);
    const embedded = /atob\('([^']+)'\)/.exec(preview)?.[1];
    assert.ok(embedded);
    assert.deepEqual(JSON.parse(Buffer.from(embedded, "base64").toString("utf8")), sample);
    assert.equal(preview.includes("window.__previewUnsafe"), false);
    assert.match(preview, /<\/body>\s*<\/html>\s*$/);
  }
  assert.doesNotMatch(renderReviewWorkspacePreview(sourceHtml, samples["annotation-intake"]), /<script>window\.__previewUnsafe/);
});

void test("instruction hints are additive only for the two review profiles", () => {
  const humanizer = reviewWorkspaceInstruction({ profileId: "paper-humanizer", selector: "node:run/review", capabilityId: "check-paper-humanization-review", packageRoot: "/tmp/package" });
  assert.equal(humanizer?.adapter, "paper-humanizer");
  assert.equal(humanizer?.asset_path, path.join("/tmp/package", "review-workspace/index.html"));
  const response = reviewWorkspaceInstruction({ profileId: "review-response", selector: "gate:run/review-response-strategy" });
  assert.equal(response?.mutation_authority, "researchspec-cli-only");
  assert.equal(reviewWorkspaceInstruction({ profileId: "minimal", selector: "profile:minimal" }), undefined);
});
