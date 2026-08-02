import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  AnnotationInterpretationError,
  annotationIntakePaths,
  captureAnnotationSource,
  captureConversationFeedback,
  createAnnotationIntakeSession,
  deriveReviewDelta,
  generateAnnotationReviewCopy,
  materializeAnnotationCandidate,
  planAnnotationWorkingMaterial,
  removeUntouchedAnnotationSlots,
  validateAnnotationInterpretation,
  withCapturedAnnotationSources,
  withDerivedReviewDelta,
} from "../src/annotation-intake.js";
import { parseAnchoredBlocks, sha256 } from "../src/arsu-converter/revision/markdown-blocks.js";

const BASE = [
  "<!--block:b-intro-->",
  "# Introduction",
  "Original introduction.",
  "<!--block:b-methods-->",
  "## Methods",
  "Original methods.",
  "",
].join("\n");

void test("review-copy slots remain optional and preserve the exact base", () => {
  const section = generateAnnotationReviewCopy({ baseText: BASE });
  assert.equal(section.slot_density, "section");
  assert.deepEqual(section.slots.map((slot) => slot.target.kind), ["document", "section", "section"]);
  assert.equal(removeUntouchedAnnotationSlots(section), BASE);

  const block = generateAnnotationReviewCopy({ baseText: BASE, slotDensity: "block" });
  assert.deepEqual(block.slots.map((slot) => slot.target.kind), ["document", "block", "block"]);
  assert.equal(removeUntouchedAnnotationSlots(block), BASE);

  const none = generateAnnotationReviewCopy({ baseText: BASE, slotDensity: "none" });
  assert.equal(none.content, BASE);
  assert.deepEqual(none.slots, []);
});

void test("free-form intake materializes a private annotation candidate from explicit paths", () => {
  const workRoot = path.resolve("/tmp/revision-work");
  const created = createAnnotationIntakeSession({
    workRoot,
    annotationSetId: "free-review",
    manuscriptPath: path.resolve("/tmp/manuscript.md"),
    baseText: BASE,
  });
  assert.equal(created.session.paths.root, path.join(workRoot, "annotation-intake/free-review"));
  assert.ok(created.writes.every((write) => write.path.startsWith(created.session.paths.root)));

  const reviewText = created.reviewCopy.content.replace(
    "Original methods.",
    "Rewritten methods.\n\n这段我直接改了，也请解释样本选择。",
  );
  const reviewSource = captureAnnotationSource({
    destinationRoot: created.session.paths.raw_sources,
    content: reviewText,
    format: "markdown_review_copy",
  });
  const captured = withCapturedAnnotationSources({
    session: created.session,
    sources: [reviewSource],
    currentReviewText: reviewText,
  });
  const delta = deriveReviewDelta({ baseText: BASE, templateText: created.reviewCopy.content, reviewText });
  assert.equal(delta.diagnostics.length, 0);
  assert.equal(delta.entries.length, 1);
  const deltaEntry = delta.entries[0];
  assert.ok(deltaEntry);
  const withDelta = withDerivedReviewDelta({ session: captured.session, delta });
  const methods = parseAnchoredBlocks(BASE).find((block) => block.id === "b-methods");
  assert.ok(methods);
  const deltaText = `${JSON.stringify(delta, null, 2)}\n`;
  const interpretation = {
    schema_version: "1" as const,
    session_id: "free-review",
    base_sha256: sha256(BASE),
    review_sha256: sha256(reviewText),
    delta_sha256: sha256(deltaText),
    entries: [{
      annotation_id: "ann-methods",
      status: "ready" as const,
      raw_body: deltaEntry.after_text,
      source_pointer: "/entries/0",
      source_ref: {
        kind: "review_delta" as const,
        source_id: withDelta.deltaSource.source.source_id,
        delta_id: deltaEntry.delta_id,
      },
      target: { kind: "block" as const, block_id: methods.id, block_sha256: methods.hash },
      agent_interpretation: "The reviewer proposes a methods rewrite and asks for sample-selection detail.",
      expected_action: "Assess the rewrite and clarify sample selection.",
      semantic_impact: { level: "ordinary" as const },
      clarification: null,
    }],
  };
  const sourceContents = {
    [created.reviewSource.source.source_id]: created.reviewSource.content,
    [reviewSource.source.source_id]: reviewSource.content,
    [withDelta.deltaSource.source.source_id]: withDelta.deltaSource.content,
  };
  assert.deepEqual(validateAnnotationInterpretation({
    session: withDelta.session,
    interpretation,
    baseText: BASE,
    reviewText,
    delta,
    sourceContents,
  }), []);

  const candidate = materializeAnnotationCandidate({
    session: withDelta.session,
    interpretation,
    baseText: BASE,
    reviewText,
    delta,
    sourceContents,
  });
  assert.equal(candidate.schema_version, "1");
  assert.deepEqual(candidate.manuscript, created.session.manuscript);
  assert.equal(candidate.annotations[0]?.source_ref.kind, "review_delta");
  assert.equal(candidate.raw_sources.length, 3);
});

void test("unresolved Agent interpretation fails closed", () => {
  const created = createAnnotationIntakeSession({
    workRoot: "/tmp/revision-work",
    annotationSetId: "ambiguous-review",
    manuscriptPath: "/tmp/manuscript.md",
    baseText: BASE,
    slotDensity: "none",
  });
  const delta = deriveReviewDelta({ baseText: BASE, templateText: BASE, reviewText: BASE });
  const interpretation = {
    schema_version: "1" as const,
    session_id: "ambiguous-review",
    base_sha256: sha256(BASE),
    review_sha256: sha256(BASE),
    delta_sha256: sha256(`${JSON.stringify(delta, null, 2)}\n`),
    entries: [{
      annotation_id: "ann-ambiguous",
      status: "needs_clarification" as const,
      raw_body: "请调整一下",
      source_pointer: "/messages/0",
      source_ref: {
        kind: "source_span" as const,
        source_id: created.reviewSource.source.source_id,
        start_byte: 0,
        end_byte: 3,
      },
      clarification: { question: "Which passage should change?" },
    }],
  };
  assert.throws(() => materializeAnnotationCandidate({
    session: created.session,
    interpretation,
    baseText: BASE,
    reviewText: BASE,
    delta,
    sourceContents: { [created.reviewSource.source.source_id]: created.reviewSource.content },
  }), AnnotationInterpretationError);
});

void test("conversation capture and working-write plans are deterministic and private", () => {
  const paths = annotationIntakePaths({ workRoot: "/tmp/revision-work", annotationSetId: "conversation-review" });
  const input = {
    destinationRoot: paths.raw_sources,
    messages: [{ message_id: "m1", author: "reviewer", body: "引言太长，可以更直接。" }],
  };
  const first = captureConversationFeedback(input);
  const second = captureConversationFeedback(input);
  assert.deepEqual(first, second);
  assert.equal(path.dirname(first.source.path), paths.raw_sources);
  assert.deepEqual(planAnnotationWorkingMaterial([first.write, second.write]), [first.write]);
});
