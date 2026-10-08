import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { parse as parseYaml, stringify } from "yaml";

import { handleGraphInit, type GraphBootstrapPromptPort } from "../src/cli/handlers/graph-bootstrap.js";
import type { CommandContext } from "../src/cli/types.js";
import { domainIsAvailable, loadPluginRegistry } from "../src/plugins/registry.js";
import { loadProcedureCatalog, type ProcedureDefinition } from "../src/procedures/catalog.js";
import { loadProcedureEligibilityContext, procedureEligibility, procedureEligibilityContextFromSelection, procedureEligibilityContextKey } from "../src/procedures/eligibility.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

interface Card {
  selector: string;
  kind: string;
  eligibility: { state: string; domains: string[]; available_domains: string[]; unavailable_domains: string[] };
}

interface ListData { total: number; next_cursor?: string; items: Card[] }

const silentPrompts: GraphBootstrapPromptPort = {
  multiSelect: () => { throw new Error("No noninteractive prompt"); },
  confirm: () => { throw new Error("No noninteractive consent"); },
  select: () => { throw new Error("No noninteractive recovery prompt"); },
};

async function initWorkspace(root: string, selectedDomains: string[]): Promise<void> {
  const context: CommandContext = { command: "init", cwd: root, json: true, dryRun: false, force: false, yes: true, quiet: false, interactive: false };
  await handleGraphInit(root, { tools: "none" }, context, silentPrompts, () => Promise.resolve({ prepared: false, ready: false, cache_root: path.join(root, "cache"), reason: "runtime_missing" }));
  const configPath = path.join(root, "researchspec/config.yaml");
  const config = parseYaml(await readFile(configPath, "utf8")) as { plugins?: { selected: string[] } };
  config.plugins = { ...config.plugins, selected: selectedDomains };
  await writeFile(configPath, stringify(config), "utf8");
}

void test("cards state static selection conditions without hiding or reranking candidates", async () => {
  const root = await tempProject();
  try {
    const catalog = await loadProcedureCatalog();
    const registry = await loadPluginRegistry();
    const plugin = [...catalog.values()].find((item) => item.kind === "plugin" && item.domains.some((id) => domainIsAvailable(registry.domains.get(id))));
    assert.ok(plugin, "a plugin Procedure owned by an available domain");
    const [owningDomain] = plugin.domains;
    const core = [...catalog.values()].find((item) => item.kind === "arsu");
    assert.ok(core);
    const pluginSelector = "procedure:" + plugin.id;
    const coreSelector = "procedure:" + core.id;

    const outside = parseEnvelope<ListData>(runCli(["list", "procedures", "--json"], root));
    assert.equal(outside.ok, true);
    assert.equal(outside.data?.items.length, 10);
    for (const card of outside.data?.items ?? []) assert.equal(card.eligibility.state, "workspace_required", card.selector);
    const shown = parseEnvelope<Card>(runCli(["show", pluginSelector, "--json"], root));
    assert.equal(shown.ok, true);
    assert.equal(shown.data?.eligibility.state, "workspace_required");

    await initWorkspace(root, []);
    const unselected = parseEnvelope<ListData>(runCli(["list", "procedures", "--json"], root));
    assert.equal(unselected.ok, true);
    assert.equal(unselected.data?.total, outside.data?.total, "workspace presence must not hide candidates");
    const unselectedPlugin = parseEnvelope<Card>(runCli(["show", pluginSelector, "--json"], root));
    assert.equal(unselectedPlugin.data?.eligibility.state, "domain_selection_required");
    assert.equal(parseEnvelope<Card>(runCli(["show", coreSelector, "--json"], root)).data?.eligibility.state, "eligible");

    await initWorkspace(root, [owningDomain]);
    const selectedPlugin = parseEnvelope<Card>(runCli(["show", pluginSelector, "--json"], root));
    assert.equal(selectedPlugin.data?.eligibility.state, "eligible");
    assert.deepEqual(selectedPlugin.data?.eligibility.available_domains, [owningDomain]);

    const query = "分析实验数据并撰写方法章节";
    const before = parseEnvelope<ListData>(runCli(["list", "procedures", "--query", query, "--limit", "5", "--json"], root));
    await initWorkspace(root, []);
    const after = parseEnvelope<ListData>(runCli(["list", "procedures", "--query", query, "--limit", "5", "--json"], root));
    assert.ok((after.data?.items.length ?? 0) > 0);
    assert.deepEqual(after.data?.items.map((item) => item.selector), before.data?.items.map((item) => item.selector), "selection must not rerank");
  } finally {
    await cleanup(root);
  }
});

void test("procedure pagination cursors bind the selection context", async () => {
  const root = await tempProject();
  try {
    const catalog = await loadProcedureCatalog();
    const registry = await loadPluginRegistry();
    const plugin = [...catalog.values()].find((item) => item.kind === "plugin" && item.domains.some((id) => domainIsAvailable(registry.domains.get(id))));
    assert.ok(plugin);
    const query = "检索文献找出研究空白";

    await initWorkspace(root, []);
    const page = parseEnvelope<ListData>(runCli(["list", "procedures", "--query", query, "--limit", "1", "--json"], root));
    assert.ok(page.data?.next_cursor);
    const sameSelection = parseEnvelope<ListData>(runCli(["list", "procedures", "--query", query, "--limit", "1", "--cursor", page.data.next_cursor, "--json"], root));
    assert.equal(sameSelection.ok, true);

    await initWorkspace(root, [plugin.domains[0]]);
    const stale = parseEnvelope(runCli(["list", "procedures", "--query", query, "--limit", "1", "--cursor", page.data.next_cursor, "--json"], root));
    assert.equal(stale.error?.code, "list_cursor_stale");

    const elsewhere = await tempProject();
    const outside = parseEnvelope<ListData>(runCli(["list", "procedures", "--limit", "1", "--json"], elsewhere));
    assert.ok(outside.data?.next_cursor);
    const moved = parseEnvelope(runCli(["list", "procedures", "--limit", "1", "--cursor", outside.data?.next_cursor, "--json"], root));
    assert.equal(moved.error?.code, "list_cursor_stale");
    await cleanup(elsewhere);
  } finally {
    await cleanup(root);
  }
});

void test("pure derivation separates unavailable selections from unknown conditions", async () => {
  const root = await tempProject();
  try {
    const registry = await loadPluginRegistry();
    const empty = [...registry.domains.values()].find((domain) => domain.skills.length === 0);
    assert.ok(empty, "a selected domain that became unavailable");
    assert.equal(domainIsAvailable(empty), false);
    const synthetic: ProcedureDefinition = {
      id: "synthetic-plugin",
      selector: "procedure:synthetic-plugin",
      kind: "plugin",
      title: "Synthetic",
      description: "Synthetic plugin Procedure owned by an unavailable domain.",
      modes: ["standalone", "graph"],
      domains: [empty.domain_id],
      profiles: [],
      packageRoot: root,
    };
    const selectedContext = procedureEligibilityContextFromSelection(root, [empty.domain_id], (id) => domainIsAvailable(registry.domains.get(id)));
    const unavailable = procedureEligibility(synthetic, selectedContext);
    assert.equal(unavailable.state, "selected_domain_unavailable");
    assert.deepEqual(unavailable.unavailable_domains, [empty.domain_id]);
    assert.equal(procedureEligibility(synthetic, { status: "outside_workspace" }).state, "workspace_required");
    assert.equal(procedureEligibility(synthetic, { status: "unsupported_configuration", reason: "unreadable" }).state, "unknown");

    const keys = [
      procedureEligibilityContextKey({ status: "outside_workspace" }),
      procedureEligibilityContextKey({ status: "unsupported_configuration", reason: "unreadable" }),
      procedureEligibilityContextKey(selectedContext),
      procedureEligibilityContextKey(procedureEligibilityContextFromSelection(root, [], () => false)),
    ];
    assert.equal(new Set(keys).size, keys.length, "selection contexts must not share a cursor key");

    await initWorkspace(root, []);
    const loaded = await loadProcedureEligibilityContext(root);
    assert.equal(loaded.status, "workspace");
    assert.equal(loaded.status === "workspace" ? loaded.availableSelectedDomainIds.length : -1, 0);
    assert.notEqual(procedureEligibilityContextKey(loaded), procedureEligibilityContextKey({ status: "outside_workspace" }));
  } finally {
    await cleanup(root);
  }
});

void test("an unreadable domain catalog leaves only domain-owning Procedures unknown", async () => {
  const root = await tempProject();
  try {
    const catalog = await loadProcedureCatalog();
    const registry = await loadPluginRegistry();
    const owned = [...catalog.values()].find((item) => item.kind === "plugin" && item.domains.length > 0);
    const core = [...catalog.values()].find((item) => item.kind === "arsu");
    const empty = [...registry.domains.values()].find((domain) => domain.skills.length === 0);
    assert.ok(owned && core && empty);
    const unavailableCatalog = {
      status: "workspace" as const,
      workspace: root,
      selectedDomainIds: [empty.domain_id, ...owned.domains],
      availableSelectedDomainIds: [],
      unavailableSelectedDomainIds: [empty.domain_id, ...owned.domains],
      procedureSearchMode: "hybrid" as const,
      catalogFailure: "Domain availability metadata is unavailable",
    };
    assert.equal(procedureEligibility(owned, unavailableCatalog).state, "unknown");
    assert.equal(procedureEligibility(core, unavailableCatalog).state, "eligible");
    assert.equal(unavailableCatalog.procedureSearchMode, "hybrid", "a catalog failure must not discard the configured search mode");
    assert.notEqual(
      procedureEligibilityContextKey(unavailableCatalog),
      procedureEligibilityContextKey(procedureEligibilityContextFromSelection(root, unavailableCatalog.selectedDomainIds, () => false, "hybrid")),
    );
  } finally {
    await cleanup(root);
  }
});

void test("an unsupported configuration keeps browse available and rejects Procedure search", async () => {
  const root = await tempProject();
  try {
    await mkdir(path.join(root, "researchspec"));
    await writeFile(path.join(root, "researchspec/config.yaml"), stringify({ schema_version: "1", agent_tools: { selected: [], delivery: "skills" } }), "utf8");
    const browse = parseEnvelope<ListData>(runCli(["list", "procedures", "--json"], root));
    assert.equal(browse.ok, true);
    for (const card of browse.data?.items ?? []) assert.equal(card.eligibility.state, "unknown", card.selector);
    const search = parseEnvelope(runCli(["list", "procedures", "--query", "文献综述", "--json"], root));
    assert.equal(search.error?.code, "workspace_unsupported");
  } finally {
    await cleanup(root);
  }
});
