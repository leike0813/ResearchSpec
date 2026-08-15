import assert from "node:assert/strict";
import { test } from "node:test";

import { getArsuRoute } from "../src/arsu-converter/routing/catalog.js";
import { REVIEW_RESPONSE_PROFILE } from "../src/arsu-converter/workflow/review-response.js";

void test("review-response remains a standalone ARSU route and profile", () => {
  const route = getArsuRoute("review-response:full");
  assert.equal(route.route_ref, "review-response:full");
  const entry = REVIEW_RESPONSE_PROFILE.entries[0];
  assert.equal(entry?.kind, "end-to-end");
  assert.equal(entry?.kind === "end-to-end" ? entry.checkpoint : undefined, "intake");
  assert.deepEqual(REVIEW_RESPONSE_PROFILE.children.map((item) => item.node_id), [
    "intake", "manuscript-analysis", "comment-atomization", "workboard", "strategy-execution", "final-assembly",
  ]);
  assert.equal(REVIEW_RESPONSE_PROFILE.gates.length, 5);
});
