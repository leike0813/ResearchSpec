import assert from "node:assert/strict";
import { test } from "node:test";

import { COMPANION_INTENTS } from "../src/adapters/companion/index.js";
import { loadCapabilityRegistry } from "../src/capabilities/registry.js";
import { ARSU_SKILL_IDS } from "../src/arsu-converter/routing/contracts.js";
import { loadPluginExtensionRegistry } from "../src/plugins/extensions.js";
import { loadProcedureCatalog, procedureCard } from "../src/procedures/catalog.js";
import { buildProcedurePacket } from "../src/procedures/packet.js";
import { searchProcedures } from "../src/procedures/search.js";

void test("procedure catalog is derived, ranked, and progressively disclosed", async () => {
  const [catalog, core, extensions] = await Promise.all([
    loadProcedureCatalog(),
    loadCapabilityRegistry(),
    loadPluginExtensionRegistry(),
  ]);
  assert.equal(catalog.size, ARSU_SKILL_IDS.length + COMPANION_INTENTS.length - 1 + core.capabilities.size + extensions.capabilities.size);
  assert.deepEqual(
    [...catalog.values()].filter((item) => item.kind === "companion").map((item) => item.id).sort(),
    ["researchspec-decide", "researchspec-propose", "researchspec-verify"],
  );
  assert.equal(catalog.has("researchspec-cli-handbook"), false);
  const deep = await searchProcedures(catalog, "deep research");
  assert.deepEqual(deep.items.slice(0, 1).map((item) => item.procedure.id), ["deep-research"]);
  const procedure = catalog.get("deep-research");
  assert.ok(procedure);
  const card = procedureCard(procedure);
  assert.equal("content" in card, false);
  assert.equal(card.selector, "procedure:deep-research");
  assert.equal(card.inputs.length, 0);
  assert.equal(card.outputs.length, 0);
});

void test("candidate cards carry declared manifest roles and routing intents", async () => {
  const catalog = await loadProcedureCatalog();
  const required = (id: string) => {
    const procedure = catalog.get(id);
    assert.ok(procedure, id);
    return procedure;
  };
  const literature = procedureCard(required("discovery-literature-search-screening"));
  assert.deepEqual(literature.inputs, ["rq_brief", "methodology_blueprint"]);
  assert.deepEqual(literature.outputs, ["annotated_bibliography"]);
  const routed = required("deep-research");
  assert.ok((routed.intents?.length ?? 0) > 0, "routing intents come from ARSU skills and routes");
  assert.ok((routed.intents ?? []).includes("synthesize scholarly evidence"));
  const companion = procedureCard(required("researchspec-verify"));
  assert.deepEqual(companion.inputs, []);
  assert.deepEqual(companion.outputs, []);
});

void test("bilingual natural requests reach suitable candidates without Agent translation", async () => {
  const catalog = await loadProcedureCatalog();
  const cases = [
    ["文献检索与综合", [
      "discovery-literature-search-screening",
      "deep-research",
      "analysis-evidence-synthesis",
      "discovery-literature-monitoring",
    ]],
    ["帮我写一份论文大纲 outline", [
      "design-manuscript-structure-design",
      "academic-paper",
      "generation-manuscript-drafting",
    ]],
    ["证据检查 claim verification", [
      "check-claim-faithfulness-audit",
      "analysis-evidence-synthesis",
      "check-citation-verification-summary",
      "check-temporal-integrity-verification",
    ]],
    ["审稿回复", [
      "design-review-response-intake",
      "generation-review-response-round",
      "transform-review-response-comment-atomization",
      "design-review-response-workboard-planning",
    ]],
    ["专利文献阅读", ["analysis-patent-reading", "transform-patent-research-evidence"]],
    ["历史档案研究", [
      "plugin-historical-research",
      "plugin-historical-source-analysis",
      "plugin-historical-source-identification",
    ]],
    ["金融财报分析", [
      "plugin-financial-statement-analysis",
      "plugin-financial-event-evidence",
      "plugin-financial-company-fundamentals",
    ]],
    ["课程与教学设计", [
      "plugin-education-agent-skills-curriculum-knowledge-architecture-designer",
      "plugin-education-agent-skills-curriculum-crosswalk",
      "plugin-education-agent-skills-competency-unpacker",
      "plugin-education-agent-skills-scope-and-sequence-designer",
    ]],
  ] as const;
  for (const [query, suitable] of cases) {
    const result = await searchProcedures(catalog, query);
    const top = result.items.slice(0, 5).map((item) => item.procedure.id);
    assert.equal(top.some((id) => suitable.includes(id as never)), true, `${query} found no suitable candidate: ${top.join(", ")}`);
  }
});

void test("real research sentences reach suitable candidates offline", async () => {
  const catalog = await loadProcedureCatalog();
  const cases = [
    ["帮我把这一章的文献综述整理出来", ["discovery-literature-search-screening", "deep-research", "analysis-evidence-synthesis"], []],
    [
      "I need to write a patent disclosure from my research results",
      ["generation-patent-disclosure", "design-patent-intake", "check-patent-disclosure"],
      [],
    ],
    [
      "check whether the citations in my bibliography are real",
      [
        "check-reference-integrity-verification",
        "check-citation-format-compliance",
        "check-citation-existence-verification",
        "check-citation-verification-summary",
      ],
      [],
    ],
    [
      "审稿人提了意见，帮我起草逐条回复",
      [
        "transform-review-response-comment-atomization",
        "design-review-response-workboard-planning",
        "analysis-review-response-manuscript-analysis",
      ],
      ["design-writing-intake", "generation-abstract-writing"],
    ],
    [
      "screen 这批 papers for duplicate and 低质量 records",
      ["discovery-literature-search-screening", "deep-research", "discovery-source-quality-grading"],
      ["plugin-tooluniverse-crispr-screen-analysis", "plugin-tooluniverse-functional-genomics-screens"],
    ],
  ] as const;
  for (const [query, suitable, unsuitable] of cases) {
    const result = await searchProcedures(catalog, query);
    assert.equal(result.retrieval.effective_mode, "offline", query);
    const top = result.items.slice(0, 5).map((item) => item.procedure.id);
    assert.equal(top.some((id) => suitable.includes(id as never)), true, `${query} found no suitable candidate: ${top.join(", ")}`);
    const leading = result.items.slice(0, 3).map((item) => item.procedure.id);
    for (const id of unsuitable) assert.equal(leading.includes(id), false, `${query} leads with ${id}`);
  }
  // Screening a set of papers is a literature-screening task even though a genomics tool
  // repeats the same word; the leading candidate must still be the screening procedure.
  const screening = await searchProcedures(catalog, "screen 这批 papers for duplicate and 低质量 records");
  assert.equal(screening.items[0]?.procedure.id, "discovery-literature-search-screening");
});

void test("standalone and graph packets share package content but not authority", async () => {
  const procedure = (await loadProcedureCatalog()).get("design-research-question-formulation");
  assert.ok(procedure);
  const standalone = await buildProcedurePacket(procedure, { mode: "standalone", workspace: "/workspace" });
  const graph = await buildProcedurePacket(procedure, {
    mode: "graph",
    workspace: "/workspace",
    authority: { workflow_state: "cli-only" },
    completion: { action: "advance_node", selector: "node:run-a/node" },
  });
  assert.equal(standalone.procedure.content_sha256, graph.procedure.content_sha256);
  assert.equal(standalone.package.root, graph.package.root);
  assert.deepEqual(standalone.delegation, { recommended_agent: "researchspec-executor", reason: "llm-producer" });
  assert.deepEqual(graph.delegation, standalone.delegation);
  assert.notDeepEqual(standalone.authority, graph.authority);
  assert.notDeepEqual(standalone.completion, graph.completion);
});

void test("procedure packets recommend native roles only for eligible LLM work", async () => {
  const catalog = await loadProcedureCatalog();
  const cases = [
    ["check-claim-faithfulness-audit", { recommended_agent: "researchspec-reviewer", reason: "llm-independent-review" }],
    ["transform-revision-patching", { recommended_agent: null, reason: "non-llm" }],
    ["generation-humanization-reference", { recommended_agent: null, reason: "reference-only" }],
    ["deep-research", { recommended_agent: null, reason: "coordinator" }],
  ] as const;
  for (const [id, expected] of cases) {
    const procedure = catalog.get(id);
    assert.ok(procedure, id);
    const packet = await buildProcedurePacket(procedure, { mode: "standalone", workspace: "/workspace" });
    assert.deepEqual(packet.delegation, expected, id);
  }
});
