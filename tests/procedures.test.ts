import assert from "node:assert/strict";
import { test } from "node:test";

import { COMPANION_INTENTS } from "../src/adapters/companion/index.js";
import { loadCapabilityRegistry } from "../src/capabilities/registry.js";
import { ARSU_SKILL_IDS } from "../src/arsu-converter/routing/contracts.js";
import { loadPluginExtensionRegistry } from "../src/plugins/extensions.js";
import { loadProcedureCatalog, procedureCard, searchProcedures } from "../src/procedures/catalog.js";
import { buildProcedurePacket } from "../src/procedures/packet.js";

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
  assert.deepEqual(searchProcedures(catalog, "deep research").slice(0, 1).map((item) => item.id), ["deep-research"]);
  const procedure = catalog.get("deep-research");
  assert.ok(procedure);
  const card = procedureCard(procedure);
  assert.equal("content" in card, false);
  assert.equal(card.selector, "procedure:deep-research");
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
  assert.notDeepEqual(standalone.authority, graph.authority);
  assert.notDeepEqual(standalone.completion, graph.completion);
});
