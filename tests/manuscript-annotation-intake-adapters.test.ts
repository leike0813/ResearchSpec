import assert from "node:assert/strict";
import test from "node:test";

import {
  AnnotationInterpretationError,
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
import { parseAnchoredBlocks } from "../src/core/runtime/markdown-blocks.js";
import { sha256 } from "../src/core/workspace/write-plan.js";

const BASE = [
  "<!--block:b-intro-->",
  "# Introduction",
  "Original introduction.",
  "<!--block:b-methods-->",
  "## Methods",
  "Original methods.",
  "",
].join("\n");

void test("review-copy slots are optional affordances and preserve the exact base", () => {
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

void test("arbitrary Markdown review is preserved for Agent interpretation and v2 materialization", () => {
  const created = createAnnotationIntakeSession({
    annotationSetId: "free-review",
    baseArtifactId: "A-paper",
    baseSha256: sha256(BASE),
    baseText: BASE,
  });
  const reviewText = created.reviewCopy.content.replace(
    "Original methods.",
    [
      "Rewritten methods.",
      "",
      "这段我直接改了，看看是否更清楚 🙂",
      "",
      "- 也可以把样本选择再解释一下",
      "- {>>这里是我习惯用的 CriticMarkup 提醒<<}",
    ].join("\n"),
  );
  const reviewSource = captureAnnotationSource({
    annotationSetId: "free-review",
    content: reviewText,
    format: "markdown_review_copy",
  });
  const captured = withCapturedAnnotationSources({
    session: created.session,
    sources: [reviewSource],
    currentReviewText: reviewText,
  });
  const delta = deriveReviewDelta({
    baseText: BASE,
    templateText: created.reviewCopy.content,
    reviewText,
  });
  assert.equal(delta.diagnostics.length, 0);
  assert.equal(delta.entries.length, 1);
  assert.equal(delta.entries[0]?.kind, "changed_block");
  assert.match(delta.entries[0]?.after_text ?? "", /CriticMarkup/);

  const withDelta = withDerivedReviewDelta({ session: captured.session, delta });
  const deltaEntry = delta.entries[0];
  assert.ok(deltaEntry);
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
      target: {
        kind: "block" as const,
        block_id: methods.id,
        block_sha256: methods.hash,
      },
      agent_interpretation: "The user proposes a rewrite and asks for a clearer explanation of sample selection.",
      expected_action: "Assess the rewrite and revise the methods explanation.",
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
  assert.equal(candidate.schema_version, "2");
  assert.equal(candidate.annotations.length, 1);
  assert.equal(candidate.raw_sources.length, 3);
  assert.equal(candidate.annotations[0]?.raw_body, deltaEntry.after_text);
});

void test("unresolved or fabricated Agent interpretation fails closed", () => {
  const created = createAnnotationIntakeSession({
    annotationSetId: "ambiguous-review",
    baseArtifactId: "A-paper",
    baseSha256: sha256(BASE),
    baseText: BASE,
    slotDensity: "none",
  });
  const delta = deriveReviewDelta({ baseText: BASE, templateText: BASE, reviewText: BASE });
  const deltaSource = captureAnnotationSource({
    annotationSetId: "ambiguous-review",
    content: `${JSON.stringify(delta, null, 2)}\n`,
    format: "review_delta_json",
  });
  const session = withCapturedAnnotationSources({
    session: created.session,
    sources: [deltaSource],
  }).session;
  const interpretation = {
    schema_version: "1" as const,
    session_id: "ambiguous-review",
    base_sha256: sha256(BASE),
    review_sha256: sha256(BASE),
    delta_sha256: deltaSource.source.sha256,
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
    session,
    interpretation,
    baseText: BASE,
    reviewText: BASE,
    delta,
    sourceContents: {
      [created.reviewSource.source.source_id]: created.reviewSource.content,
      [deltaSource.source.source_id]: deltaSource.content,
    },
  }), AnnotationInterpretationError);
});

void test("conversation capture and working-write plans are deterministic", () => {
  const first = captureConversationFeedback({
    annotationSetId: "conversation-review",
    messages: [{ message_id: "m1", author: "reviewer", body: "引言太长，可以更直接。" }],
  });
  const second = captureConversationFeedback({
    annotationSetId: "conversation-review",
    messages: [{ message_id: "m1", author: "reviewer", body: "引言太长，可以更直接。" }],
  });
  assert.deepEqual(first, second);
  assert.match(first.source.path, /^runs\/current\/annotation-sessions\/conversation-review\/sources\/[a-f0-9]{64}\.json$/);
  assert.deepEqual(planAnnotationWorkingMaterial([first.write, second.write]), [first.write]);
});
