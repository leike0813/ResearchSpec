import assert from "node:assert/strict";
import { test } from "node:test";

import { analyzeDocument, roundTrip } from "../src/core-skills/paper-humanizer/document-pipeline.js";
import { acceptCandidate, reviewDocument } from "../src/core-skills/paper-humanizer/full-workflow.js";
import { PAPER_HUMANIZER_FULL_ROUTE, PAPER_HUMANIZER_REVIEW_ROUTE } from "../src/arsu-converter/routing/paper-humanizer.js";
import { PAPER_HUMANIZER_PROFILE } from "../src/arsu-converter/workflow/paper-humanizer.js";

void test("paper-humanizer exposes independent review/full routes and a one-shot profile", () => {
  assert.equal(PAPER_HUMANIZER_REVIEW_ROUTE.route_ref, "paper-humanizer:review");
  assert.equal(PAPER_HUMANIZER_REVIEW_ROUTE.gate_policy.level, "none");
  assert.deepEqual(PAPER_HUMANIZER_FULL_ROUTE.gate_policy.gate_kinds, ["paper-humanizer-acceptance"]);
  assert.deepEqual(PAPER_HUMANIZER_PROFILE.entries.map((entry) => entry.route_ref), ["paper-humanizer:review", "paper-humanizer:full"]);
  assert.equal(PAPER_HUMANIZER_PROFILE.children.length, 0);
  assert.deepEqual(PAPER_HUMANIZER_PROFILE.gates.map((gate) => gate.gate_id), ["paper-humanizer-acceptance"]);
  assert.equal(PAPER_HUMANIZER_PROFILE.revision_round_template, null);
});

void test("document runtime preserves protected regions and rejects stale plans", () => {
  const source = "---\ntitle: Demo\n---\nA sentence with enough words to produce a useful diagnostic for a human reader while preserving syntax.\n\n```js\nconst value = 1;\n```\nSee [source](https://example.com) and [@smith2020].";
  const analysis = analyzeDocument(source, "demo.qmd");
  assert.equal(analysis.format, "quarto");
  assert.ok(analysis.protectedSpans.length >= 4);
  assert.equal(roundTrip(source, "demo.qmd"), source + "\n");
  const workflow = reviewDocument(source, "demo.qmd");
  const unchanged = acceptCandidate(analysis, source, workflow.plan, "demo.qmd");
  assert.equal(unchanged.ok, true);
  const stale = acceptCandidate(analysis, source, { ...workflow.plan, plan_hash: "stale" }, "demo.qmd");
  assert.deepEqual(stale, { ok: false, code: "stale_plan", message: "The revision plan hash does not match the current analysis." });
});
