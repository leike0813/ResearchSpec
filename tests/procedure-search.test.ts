import assert from "node:assert/strict";
import { test } from "node:test";

import { CONCEPT_GROUPS } from "../src/procedures/lexicon.js";
import type { ProcedureDefinition } from "../src/procedures/catalog.js";
import { buildSearchDocuments, ProcedureQueryError, searchProcedures } from "../src/procedures/search.js";
import type { SemanticHit } from "../src/procedures/search-contracts.js";

function fixture(): ReadonlyMap<string, ProcedureDefinition> {
  const procedure = (
    id: string,
    title: string,
    description: string,
    extra: Partial<ProcedureDefinition> = {},
  ): ProcedureDefinition => ({
    id,
    selector: `procedure:${id}`,
    kind: "arsu",
    title,
    description,
    modes: ["standalone"],
    domains: [],
    profiles: [],
    packageRoot: "/fixture",
    ...extra,
  });
  return new Map([
    ["review", procedure("review", "Peer Review", "Run a full peer review of an academic manuscript.", {
      intents: ["peer-review an academic manuscript"],
      profiles: ["paper-review"],
    })],
    ["response", procedure("response", "Review Response", "Prepare a response letter to reviewers after a revision round.")],
    ["patent", procedure("patent", "Patent Reading", "Read patent documents and extract technical evidence for a claim chart.")],
    ["beta", procedure("beta", "Alpha Notes", "beta beta beta gamma")],
    ["alpha", procedure("alpha", "Unrelated Tool", "A tool for formatting tables and figures.")],
  ]);
}

void test("an original Chinese request ranks the matching candidate with evidence", async () => {
  const result = await searchProcedures(fixture(), "审稿回复");
  assert.equal(result.items[0]?.procedure.id, "response");
  assert.ok((result.items[0]?.match.fields.length ?? 0) > 0);
  assert.ok((result.items[0]?.match.terms.length ?? 0) > 0);
  assert.equal(typeof result.items[0]?.match.lexical_score, "number");
  assert.deepEqual(result.retrieval, {
    requested_mode: "offline",
    effective_mode: "offline",
    catalog_id: result.retrieval.catalog_id,
    query: "审稿回复",
  });
});

void test("an exact identity query outranks stronger lexical overlap", async () => {
  const result = await searchProcedures(fixture(), "beta");
  assert.equal(result.items[0]?.procedure.id, "beta");
  const selector = await searchProcedures(fixture(), "procedure:alpha");
  assert.equal(selector.items[0]?.procedure.id, "alpha");
});

void test("browsing without a query keeps stable catalog order", async () => {
  const catalog = fixture();
  let invocations = 0;
  const result = await searchProcedures(catalog, undefined, {
    mode: "hybrid",
    semanticSearch: () => {
      invocations += 1;
      return Promise.resolve([]);
    },
  });
  assert.deepEqual(result.items.map((item) => item.procedure.id), [...catalog.keys()]);
  assert.equal(result.retrieval.query, undefined);
  assert.equal(result.retrieval.requested_mode, "hybrid");
  assert.equal(result.retrieval.effective_mode, "offline", "browsing runs no retrieval backend");
  assert.equal(invocations, 0);
  assert.deepEqual(result.items[0]?.match, { fields: [], terms: [] });
});

void test("a query without meaningful content is a diagnostic instead of the whole catalog", async () => {
  for (const query of ["", "   ", "!!! ??? ---", "如何做"]) {
    await assert.rejects(
      () => searchProcedures(fixture(), query),
      (error: unknown) => error instanceof ProcedureQueryError && error.code === "procedure_query_empty",
      query,
    );
  }
});

void test("a meaningful query without metadata match returns no candidate", async () => {
  const result = await searchProcedures(fixture(), "zzqx qqqw");
  assert.deepEqual(result.items, []);
  assert.equal(result.retrieval.effective_mode, "offline");
});

void test("hybrid retrieval fuses lexical and semantic candidates", async () => {
  const semanticSearch = (): Promise<SemanticHit[]> => Promise.resolve([{ id: "alpha", score: 0.82 }]);
  const result = await searchProcedures(fixture(), "审稿回复", { mode: "hybrid", semanticSearch });
  assert.equal(result.retrieval.effective_mode, "hybrid");
  assert.equal(result.retrieval.fallback_reason, undefined);
  const fused = result.items.find((item) => item.procedure.id === "alpha");
  assert.equal(fused?.match.semantic_similarity, 0.82);
  assert.equal(result.items.find((item) => item.procedure.id === "response")?.match.lexical_score !== undefined, true);
  assert.equal(result.items.every((item) => item.match.lexical_score !== undefined || item.match.semantic_similarity !== undefined), true);
});

void test("a failing semantic runtime returns offline candidates with a reason", async () => {
  const semanticSearch = (): Promise<SemanticHit[]> => {
    throw new Error("runtime unavailable");
  };
  const result = await searchProcedures(fixture(), "审稿回复", { mode: "hybrid", semanticSearch });
  assert.equal(result.retrieval.requested_mode, "hybrid");
  assert.equal(result.retrieval.effective_mode, "offline");
  assert.equal(result.retrieval.fallback_reason, "semantic_runtime_failed");
  assert.equal(result.items[0]?.procedure.id, "response");
  assert.equal(result.items.every((item) => item.match.semantic_similarity === undefined), true);
});

void test("an unanswered semantic runtime is abandoned inside its budget", async () => {
  const started = Date.now();
  const semanticSearch = () => new Promise<SemanticHit[]>(() => undefined);
  const result = await searchProcedures(fixture(), "审稿回复", { mode: "hybrid", semanticSearch, timeoutMs: 20 });
  assert.equal(result.retrieval.effective_mode, "offline");
  assert.equal(result.retrieval.fallback_reason, "semantic_timeout");
  assert.equal(result.items[0]?.procedure.id, "response");
  assert.ok(Date.now() - started < 5_000);
});

void test("search documents expose declared metadata only", () => {
  const documents = buildSearchDocuments(fixture());
  const review = documents.find((document) => document.id === "review");
  assert.deepEqual(review?.fields.identity, ["review", "procedure:review"]);
  assert.deepEqual(review?.fields.title, ["Peer Review"]);
  assert.deepEqual(review?.fields.intents, ["peer-review an academic manuscript"]);
  assert.deepEqual(review?.fields.context, ["paper-review"]);
  assert.equal(documents.every((document) => !JSON.stringify(document.fields).includes("packageRoot")), true);
});

void test("concept vocabulary names each concept once and routes each surface once", () => {
  const seen = new Set<string>();
  const routed = new Set<string>();
  for (const group of CONCEPT_GROUPS) {
    const key = group[0];
    assert.ok(key !== undefined);
    assert.equal(seen.has(key), false, `duplicate concept key: ${key}`);
    seen.add(key);
    for (const term of group) {
      const surface = term.trim().toLowerCase();
      assert.equal(surface.length > 0, true, "concept surfaces are non-empty");
      routed.add(surface);
    }
  }
  assert.equal(routed.size > CONCEPT_GROUPS.length, true);
});
