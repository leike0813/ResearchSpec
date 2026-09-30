import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import {
  loadPluginExtensionRegistry,
  PLUGIN_EXTENSION_ROOT,
  resolveDomainExtensions,
} from "../src/plugins/extensions.js";
import { loadPluginRegistry } from "../src/plugins/registry.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("plugin extension registry loads all extension packages", async () => {
  const extensions = await loadPluginExtensionRegistry();
  assert.equal(extensions.registry.schema_version, "1");
  const registryFile = JSON.parse(await readFile(path.join(PLUGIN_EXTENSION_ROOT, "registry.json"), "utf8")) as {
    capabilities: Array<{ capability_id: string }>;
    profiles: Array<{ profile_id: string }>;
  };
  assert.deepEqual([...extensions.capabilities.keys()].sort(), registryFile.capabilities.map((item) => item.capability_id).sort());
  assert.deepEqual([...extensions.profiles.keys()].sort(), registryFile.profiles.map((item) => item.profile_id).sort());

  const capability = extensions.capabilities.get("plugin-ecology-biodiversity");
  assert.ok(capability);
  assert.equal(capability.manifest.node_kind, "producer");
  assert.equal(capability.manifest.provenance.origin, "vendor-derived");
  assert.equal(capability.files.includes(path.join(PLUGIN_EXTENSION_ROOT, "capabilities/plugin-ecology-biodiversity/SKILL.md")), true);

  const profile = extensions.profiles.get("plugin-ecology-biodiversity");
  assert.ok(profile);
  assert.equal(profile.profile.profile_version, "0.1.0");
  assert.deepEqual(resolveDomainExtensions(extensions, ["ecology"]), {
    capabilityIds: ["plugin-ecology-biodiversity", "plugin-tooluniverse-ecology-biodiversity"],
    profileIds: ["plugin-ecology-biodiversity", "plugin-tooluniverse-ecology-biodiversity"],
  });

  assert.deepEqual(resolveDomainExtensions(extensions, ["accounting-auditing-and-accountability"]), {
    capabilityIds: ["plugin-financial-company-fundamentals", "plugin-financial-statement-analysis"],
    profileIds: ["plugin-financial-company-fundamentals", "plugin-financial-statement-analysis"],
  });
  assert.deepEqual(resolveDomainExtensions(extensions, ["banking-finance-and-investment"]), {
    capabilityIds: [
      "plugin-financial-company-fundamentals",
      "plugin-financial-competitive-position",
      "plugin-financial-corporate-risk",
      "plugin-financial-event-evidence",
      "plugin-financial-relative-valuation",
      "plugin-financial-statement-analysis",
    ],
    profileIds: [
      "plugin-financial-company-fundamentals",
      "plugin-financial-competitive-position",
      "plugin-financial-corporate-risk",
      "plugin-financial-event-evidence",
      "plugin-financial-relative-valuation",
      "plugin-financial-statement-analysis",
    ],
  });

  const plugins = await loadPluginRegistry(undefined, false);
  assert.equal(plugins.domains.get("ecology") !== undefined, true);
  assert.equal(plugins.skills.has("plugin-ecology-biodiversity"), false);
  assert.deepEqual(resolveDomainExtensions(extensions, ["historical-studies"]), {
    capabilityIds: [
      "plugin-historical-research",
      "plugin-historical-source-analysis",
      "plugin-historical-source-identification",
    ],
    profileIds: [
      "plugin-historical-research",
      "plugin-historical-source-analysis",
      "plugin-historical-source-identification",
    ],
  });
  assert.deepEqual(resolveDomainExtensions(extensions, ["heritage-archive-and-museum-studies"]), {
    capabilityIds: ["plugin-historical-source-analysis", "plugin-historical-source-identification"],
    profileIds: ["plugin-historical-source-analysis", "plugin-historical-source-identification"],
  });
  assert.deepEqual(resolveDomainExtensions(extensions, ["materials-engineering"]), {
    capabilityIds: [
      "plugin-materials-apex-alloy-workflows",
      "plugin-materials-atomsk-cli",
      "plugin-materials-deeptb-helper",
      "plugin-materials-dpgen-workflow",
      "plugin-materials-gpumd-workflow",
      "plugin-materials-phonopy-workflows",
    ],
    profileIds: [
      "plugin-materials-apex-alloy-workflows",
      "plugin-materials-atomsk-cli",
      "plugin-materials-deeptb-helper",
      "plugin-materials-dpgen-workflow",
      "plugin-materials-gpumd-workflow",
      "plugin-materials-phonopy-workflows",
    ],
  });
  assert.deepEqual(resolveDomainExtensions(extensions, ["macromolecular-and-materials-chemistry"]), {
    capabilityIds: ["plugin-materials-phonopy-workflows", "plugin-materials-unimol-ops", "plugin-scientific-agent-skills-pymatgen"],
    profileIds: ["plugin-materials-phonopy-workflows", "plugin-materials-unimol-ops", "plugin-scientific-agent-skills-pymatgen"],
  });

  for (const capabilityId of extensions.capabilities.keys()) assert.equal(plugins.skills.has(capabilityId), false);
});

void test("plugin graph extensions project and run through the graph engine", async () => {
  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));

    const installed = parseEnvelope<{ resolved_capability_ids: string[]; resolved_profile_ids: string[] }>(
      runCli(["plugin", "install", "ecology", "--yes", "--json"], root),
    );
    assert.equal(installed.ok, true, JSON.stringify(installed.error));
    assert.deepEqual(installed.data?.resolved_capability_ids ?? [], ["plugin-ecology-biodiversity", "plugin-tooluniverse-ecology-biodiversity"]);
    assert.deepEqual(installed.data?.resolved_profile_ids ?? [], ["plugin-ecology-biodiversity", "plugin-tooluniverse-ecology-biodiversity"]);

    const status = parseEnvelope<{ plugins: { resolved_capability_ids: string[]; resolved_profile_ids: string[]; projected_capability_ids: string[]; projected_profile_ids: string[] } }>(runCli(["status", "--json"], root));
    assert.equal(status.ok, true, JSON.stringify(status.error));
    assert.deepEqual(status.data?.plugins.resolved_capability_ids ?? [], ["plugin-ecology-biodiversity", "plugin-tooluniverse-ecology-biodiversity"]);
    assert.deepEqual(status.data?.plugins.resolved_profile_ids ?? [], ["plugin-ecology-biodiversity", "plugin-tooluniverse-ecology-biodiversity"]);
    assert.deepEqual(status.data?.plugins.projected_capability_ids ?? [], []);
    assert.deepEqual(status.data?.plugins.projected_profile_ids ?? [], ["plugin-ecology-biodiversity", "plugin-tooluniverse-ecology-biodiversity"]);

    const profilePath = path.join(root, "researchspec/profiles/plugin-ecology-biodiversity.yaml");
    await readFile(profilePath, "utf8");
    await assert.rejects(readFile(path.join(root, ".agents/skills/plugin-ecology-biodiversity/manifest.yaml"), "utf8"), { code: "ENOENT" });

    const startInput = path.join(root, "start.yaml");
    await writeFile(path.join(root, "task.md"), "# Research task\n", "utf8");
    await writeFile(startInput, stringify({
      schema_version: "2",
      confirmed_at: "2026-08-16T12:00:00+08:00",
      entry_id: "main",
      entry_node_id: "research",
      prerequisites: [],
      handoff_inputs: [{ role: "task_request", type: "markdown", path: "task.md", purpose: "ecology task" }],
      planned_outputs: [{ role: "research_brief", type: "markdown", path: "brief.md", purpose: "research brief" }],
      formal_gates: [],
      cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const started = parseEnvelope<{ run_id: string }>(runCli(["start", "plugin-ecology-biodiversity", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(started.ok, true, JSON.stringify(started.error));
    const runId = started.data?.run_id ?? "";
    assert.match(runId, /^run-[a-f0-9]+$/);

    const instructions = parseEnvelope<{ capability: { capability_id: string }; procedure_packet: { procedure: { id: string } } }>(runCli(["instructions", `node:${runId}/research`, "--json"], root));
    assert.equal(instructions.ok, true, JSON.stringify(instructions.error));
    assert.equal(instructions.data?.capability.capability_id, "plugin-ecology-biodiversity");
    assert.equal(instructions.data?.procedure_packet.procedure.id, "plugin-ecology-biodiversity");

    const advanceInput = path.join(root, "advance.yaml");
    await writeFile(advanceInput, stringify({ outputs: [{ role: "research_brief", path: "brief.md" }] }), "utf8");
    const advanced = parseEnvelope<{ node: { state: string } }>(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
    assert.equal(advanced.ok, true, JSON.stringify(advanced.error));
    assert.equal(advanced.data?.node.state, "complete");

    const uninstalled = parseEnvelope(runCli(["plugin", "uninstall", "ecology", "--yes", "--json"], root));
    assert.equal(uninstalled.ok, true, JSON.stringify(uninstalled.error));
    await assert.rejects(readFile(profilePath, "utf8"), { code: "ENOENT" });
  } finally {
    await cleanup(root);
  }
});

void test("script-validated plugin extension capability runs through advance", async () => {
  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));
    const installed = parseEnvelope<{ resolved_capability_ids: string[] }>(
      runCli(["plugin", "install", "accounting-auditing-and-accountability", "--yes", "--json"], root),
    );
    assert.equal(installed.ok, true, JSON.stringify(installed.error));
    assert.equal(installed.data?.resolved_capability_ids.includes("plugin-financial-statement-analysis"), true);

    const startInput = path.join(root, "start.yaml");
    await writeFile(path.join(root, "task.md"), "# Research task\n", "utf8");
    await writeFile(startInput, stringify({
      schema_version: "2",
      confirmed_at: "2026-08-16T12:00:00+08:00",
      entry_id: "main",
      entry_node_id: "research",
      prerequisites: [],
      handoff_inputs: [{ role: "task_request", type: "markdown", path: "task.md", purpose: "financial statement task" }],
      planned_outputs: [{ role: "research_brief", type: "json", path: "statement-brief.json", purpose: "statement analysis brief" }],
      formal_gates: [],
      cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const started = parseEnvelope<{ run_id: string }>(runCli(["start", "plugin-financial-statement-analysis", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(started.ok, true, JSON.stringify(started.error));
    const runId = started.data?.run_id ?? "";

    const briefPath = path.join(root, "statement-brief.json");
    const advanceInput = path.join(root, "advance.yaml");

    await writeFile(briefPath, JSON.stringify({ scope: "Acme 2024" }), "utf8");
    await writeFile(advanceInput, stringify({ outputs: [{ role: "research_brief", path: "statement-brief.json" }] }), "utf8");
    const invalid = parseEnvelope(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
    assert.equal(invalid.ok, false);
    assert.match(invalid.error?.code ?? "", /node_validators_failed/);

    await writeFile(briefPath, JSON.stringify({
      scope: "Acme 2024 annual statements",
      source_ledger: [{ source: "10-K", period: "2024" }],
      normalized_statements: [{ period: "2024", revenue: 100 }],
      metrics: { net_margin: 0.1 },
      evidence_checks: { period_comparability: "annual, consolidated, USD", source_independence: "single filing; corroboration pending" },
      conclusions: "Traceable normalized results with unresolved assumptions noted.",
    }), "utf8");
    const valid = parseEnvelope<{ node: { state: string } }>(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
    assert.equal(valid.ok, true, JSON.stringify(valid.error));
    assert.equal(valid.data?.node.state, "complete");
  } finally {
    await cleanup(root);
  }
});

void test("every FinRobot extension profile runs through the graph engine", async () => {
  const cases = [
    {
      profile_id: "plugin-financial-company-fundamentals",
      execution_type: "mixed",
      brief: {
        scope: "Acme five-year fundamentals",
        source_ledger: [{ source: "10-K", period: "2024" }],
        business_model: "Global widget manufacturer",
        historical_metrics: { net_margin: 0.1 },
        scenarios: [{ name: "base", years: 3 }],
        forecast_tables: [{ year: 2027, revenue: 110 }],
        numeric_evidence: [{ metric: "revenue", reported: 100, normalized: 100, unit: "USD millions", source: "10-K" }],
        conclusions: "Traceable calculations with explicit assumptions.",
      },
    },
    {
      profile_id: "plugin-financial-competitive-position",
      execution_type: "llm",
      brief: {
        scope: "Acme versus three peers",
        source_ledger: [{ source: "10-K", period: "2024" }],
        peer_ledger: [{ peer: "Peer A", decision: "included" }],
        normalized_comparison: [{ metric: "gross_margin", values: { Acme: 0.4, "Peer A": 0.3 } }],
        moat_assessment: "Evidence-backed with disconfirming checks.",
        valuation_interpretation: "Premium is partially explained by margins.",
        conclusions: "Defensible comparison with stated limits.",
      },
    },
    {
      profile_id: "plugin-financial-corporate-risk",
      execution_type: "llm",
      brief: {
        scope: "Acme two-year risk assessment",
        source_ledger: [{ source: "10-K", period: "2024" }],
        risk_register: [{ risk_id: "customer-concentration", rank: 1 }],
        transmission_paths: [{ risk_id: "customer-concentration", path: "Revenue to cash flow" }],
        mitigants: [{ risk_id: "customer-concentration", control: "Contract diversification" }],
        residual_exposure: "Bounded qualitative assessment with evidence gaps.",
        monitoring_indicators: [{ indicator: "Top customer share", threshold: ">30%" }],
        conclusions: "Prioritized risks with invalidation conditions.",
      },
    },
    {
      profile_id: "plugin-financial-event-evidence",
      execution_type: "mixed",
      brief: {
        scope: "Acme events in Q3 2026",
        source_ledger: [{ source: "8-K", published_at: "2026-07-01T08:00:00Z" }],
        event_timeline: [{ event_id: "event-abc", event_date: "2026-07-01" }],
        duplicate_decisions: [{ event_id: "event-abc", decision: "retained" }],
        assessments: [{ event_id: "event-abc", probability: 0.6, impact: 0.4, confidence: 0.7, rationale: "Filed disclosure" }],
        ranking: [{ event_id: "event-abc", rank: 1 }],
        conclusions: "Ranked events with Agent-supplied scores.",
      },
    },
    {
      profile_id: "plugin-financial-relative-valuation",
      execution_type: "mixed",
      brief: {
        scope: "Acme valuation as of 2026-06-30",
        source_ledger: [{ source: "10-K", period: "2025" }],
        assumptions: { discount_rate: 0.1, terminal_growth: 0.02 },
        method_results: { dcf: { value_per_share: 42 } },
        sensitivity: [{ variable: "discount_rate", values: [{ value: 0.09, result: 45 }] }],
        fair_value_range: { low: 38, high: 47 },
        comparability_checks: { status: "conditional", reason: "Single-method result; no certified composite" },
        equity_bridge: { enterprise_value: 450, net_debt: 30, shares: 10, value_per_share: 42 },
        conclusions: "Explained range with counterevidence.",
      },
    },
    {
      profile_id: "plugin-financial-statement-analysis",
      execution_type: "mixed",
      brief: {
        scope: "Acme 2024 annual statements",
        source_ledger: [{ source: "10-K", period: "2024" }],
        normalized_statements: [{ period: "2024", revenue: 100 }],
        metrics: { net_margin: 0.1 },
        evidence_checks: { period_comparability: "annual, consolidated, USD", source_independence: "single filing; corroboration pending" },
        conclusions: "Traceable normalized results with unresolved assumptions noted.",
      },
    },
  ] as const;

  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));

    const installed = parseEnvelope<{ resolved_capability_ids: string[]; resolved_profile_ids: string[] }>(
      runCli(["plugin", "install", "banking-finance-and-investment", "--yes", "--json"], root),
    );
    assert.equal(installed.ok, true, JSON.stringify(installed.error));
    assert.deepEqual(installed.data?.resolved_capability_ids ?? [], [
      "plugin-financial-company-fundamentals",
      "plugin-financial-competitive-position",
      "plugin-financial-corporate-risk",
      "plugin-financial-event-evidence",
      "plugin-financial-relative-valuation",
      "plugin-financial-statement-analysis",
    ]);

    for (const entry of cases) {
      const startInput = path.join(root, `start-${entry.profile_id}.yaml`);
      const advanceInput = path.join(root, `advance-${entry.profile_id}.yaml`);
      const briefRelative = `brief-${entry.profile_id}.json`;
      const briefPath = path.join(root, briefRelative);
      await writeFile(path.join(root, `task-${entry.profile_id}.md`), "# Research task\n", "utf8");
      await writeFile(startInput, stringify({
        schema_version: "2",
        confirmed_at: "2026-08-17T00:00:00+08:00",
        entry_id: "main",
        entry_node_id: "research",
        prerequisites: [],
        handoff_inputs: [{ role: "task_request", type: "markdown", path: `task-${entry.profile_id}.md`, purpose: entry.profile_id }],
        planned_outputs: [{ role: "research_brief", type: "json", path: briefRelative, purpose: `${entry.profile_id} brief` }],
        formal_gates: [],
        cost: { effort: "low", interaction: "single_pass" },
      }), "utf8");

      const started = parseEnvelope<{ run_id: string }>(runCli(["start", entry.profile_id, "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
      assert.equal(started.ok, true, `${entry.profile_id}: ${JSON.stringify(started.error)}`);
      const runId = started.data?.run_id ?? "";
      assert.match(runId, /^run-[a-f0-9]+$/);

      const instructions = parseEnvelope<{ capability: { capability_id: string } }>(runCli(["instructions", `node:${runId}/research`, "--json"], root));
      assert.equal(instructions.ok, true, `${entry.profile_id}: ${JSON.stringify(instructions.error)}`);
      assert.equal(instructions.data?.capability.capability_id, entry.profile_id);

      await writeFile(advanceInput, stringify({ outputs: [{ role: "research_brief", path: briefRelative }] }), "utf8");
      if (entry.execution_type === "mixed") {
        await writeFile(briefPath, JSON.stringify({ scope: "incomplete" }), "utf8");
        const invalid = parseEnvelope(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
        assert.equal(invalid.ok, false, `${entry.profile_id} invalid advance unexpectedly succeeded`);
        assert.match(invalid.error?.code ?? "", /node_validators_failed/);
      }

      await writeFile(briefPath, JSON.stringify(entry.brief), "utf8");
      const advanced = parseEnvelope<{ node: { state: string } }>(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
      assert.equal(advanced.ok, true, `${entry.profile_id}: ${JSON.stringify(advanced.error)}`);
      assert.equal(advanced.data?.node.state, "complete");
    }
  } finally {
    await cleanup(root);
  }
});

void test("every HistAgent extension profile runs through the graph engine", async () => {
  const cases = [
    {
      profile_id: "plugin-historical-research",
      brief: {
        scope: "Acme Port records 1920-1924",
        source_ledger: [{ source_id: "src-1", locator: "catalog.xml" }],
        gate_trace: [{ action: "submit-source", status_token: "token-1" }],
        evidence_ledger: [{ evidence_id: "ev-1", record_type: "evidence" }],
        conflicts: [{ conflict_id: "cf-1", state: "resolved" }],
        limitations: [{ limitation_id: "lm-1", statement: "Partial run" }],
        synthesis: "Traceable synthesis citing registered evidence IDs.",
      },
    },
    {
      profile_id: "plugin-historical-source-analysis",
      brief: {
        scope: "Inspect and collate two witnesses of a ledger",
        source_ledger: [{ source_id: "src-1", path: "ledger.html", sha256: "a".repeat(64) }],
        layer_inventory: [{ layer_id: "ly-1", kind: "raw-observation-or-ocr" }],
        operation_receipts: [{ command: "inspect", artifact: "inspection.json" }],
        validation_results: [{ command: "validate", valid: true }],
        conclusions: "Layers remain distinct with explicit lineage and hashes.",
      },
    },
    {
      profile_id: "plugin-historical-source-identification",
      brief: {
        scope: "Identify the shelfmark of a catalog record",
        query_ledger: [{ query_id: "q-1", query: "port records" }],
        candidate_ledger: [{ candidate_id: "c-1", status: "verified" }],
        retrieval_ledger: [{ candidate_id: "c-1", status: "retrieved", sha256: "b".repeat(64) }],
        verification_decisions: [{ candidate_id: "c-1", decision: "verified", note: "Matched title page." }],
        conclusions: "Candidate status reflects observed evidence only.",
      },
    },
  ] as const;

  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));

    const installed = parseEnvelope<{ resolved_capability_ids: string[]; resolved_profile_ids: string[] }>(
      runCli(["plugin", "install", "historical-studies", "--yes", "--json"], root),
    );
    assert.equal(installed.ok, true, JSON.stringify(installed.error));
    assert.deepEqual(installed.data?.resolved_capability_ids ?? [], [
      "plugin-historical-research",
      "plugin-historical-source-analysis",
      "plugin-historical-source-identification",
    ]);

    for (const entry of cases) {
      const startInput = path.join(root, `start-${entry.profile_id}.yaml`);
      const advanceInput = path.join(root, `advance-${entry.profile_id}.yaml`);
      const briefRelative = `brief-${entry.profile_id}.json`;
      const briefPath = path.join(root, briefRelative);
      await writeFile(path.join(root, `task-${entry.profile_id}.md`), "# Research task\n", "utf8");
      await writeFile(startInput, stringify({
        schema_version: "2",
        confirmed_at: "2026-08-17T01:00:00+08:00",
        entry_id: "main",
        entry_node_id: "research",
        prerequisites: [],
        handoff_inputs: [{ role: "task_request", type: "markdown", path: `task-${entry.profile_id}.md`, purpose: entry.profile_id }],
        planned_outputs: [{ role: "research_brief", type: "json", path: briefRelative, purpose: `${entry.profile_id} brief` }],
        formal_gates: [],
        cost: { effort: "low", interaction: "single_pass" },
      }), "utf8");

      const started = parseEnvelope<{ run_id: string }>(runCli(["start", entry.profile_id, "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
      assert.equal(started.ok, true, `${entry.profile_id}: ${JSON.stringify(started.error)}`);
      const runId = started.data?.run_id ?? "";
      assert.match(runId, /^run-[a-f0-9]+$/);

      const instructions = parseEnvelope<{ capability: { capability_id: string } }>(runCli(["instructions", `node:${runId}/research`, "--json"], root));
      assert.equal(instructions.ok, true, `${entry.profile_id}: ${JSON.stringify(instructions.error)}`);
      assert.equal(instructions.data?.capability.capability_id, entry.profile_id);

      await writeFile(advanceInput, stringify({ outputs: [{ role: "research_brief", path: briefRelative }] }), "utf8");
      await writeFile(briefPath, JSON.stringify({ scope: "incomplete" }), "utf8");
      const invalid = parseEnvelope(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
      assert.equal(invalid.ok, false, `${entry.profile_id} invalid advance unexpectedly succeeded`);
      assert.match(invalid.error?.code ?? "", /node_validators_failed/);

      await writeFile(briefPath, JSON.stringify(entry.brief), "utf8");
      const advanced = parseEnvelope<{ node: { state: string } }>(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
      assert.equal(advanced.ok, true, `${entry.profile_id}: ${JSON.stringify(advanced.error)}`);
      assert.equal(advanced.data?.node.state, "complete");
    }
  } finally {
    await cleanup(root);
  }
});

void test("every Materials extension profile runs through the graph engine", async () => {
  const cases = [
    {
      profile_id: "plugin-materials-apex-alloy-workflows",
      brief: {
        scope: "Elastic property workflow for a relaxed alloy",
        input_inventory: [{ path: "param_joint.json", role: "candidate parameters" }],
        validation_criteria: [{ criterion: "convergence", required: true }],
        authority_ledger: [{ action: "submit", confirmed: true }],
        task_results: [{ task_id: "JOB-1", state: "complete" }],
        convergence_checks: [{ task_id: "JOB-1", result: "converged" }],
        conclusions: "Evidence-backed property interpretation with limitations.",
      },
    },
    {
      profile_id: "plugin-materials-atomsk-cli",
      brief: {
        scope: "Create an oriented aluminum supercell in CFG format",
        operation_plan: [{ step: 1, mode: "create", explanation: "FCC Al orientation" }],
        command_ledger: [{ command: "atomsk --create fcc 4.02 Al orient 0-11 100 011 out.cfg" }],
        confirmation_ledger: [{ path: "out.cfg", decision: "new output" }],
        validation_evidence: [{ check: "atom_count", expected: 4, observed: 4 }],
        conclusions: "Only intended structural changes occurred.",
      },
    },
    {
      profile_id: "plugin-materials-deeptb-helper",
      brief: {
        scope: "E3 training evaluation with trajectory-grouped splits",
        dataset_ledger: [{ split: "train", frames: 100, provenance: "local" }],
        configuration_review: [{ version: "installed", schema: "version-matched" }],
        command_ledger: [{ command: "dptb train input.json -o OUTPUT_DIR", confirmed: true }],
        evaluation_metrics: [{ split: "test", metric: "rmse_e", value: 0.01 }],
        conclusions: "Held-out metrics separate from scientific interpretation.",
      },
    },
    {
      profile_id: "plugin-materials-dpgen-workflow",
      brief: {
        scope: "One DP-GEN concurrent-learning iteration",
        stage_ledger: [{ stage: "exploration", state: "complete" }],
        parameter_review: [{ path: "param.json", state: "reviewed" }],
        authority_ledger: [{ action: "run", confirmed: true }],
        convergence_evidence: [{ iteration: 1, converged: true }],
        conclusions: "Stage evidence and convergence traced.",
      },
    },
    {
      profile_id: "plugin-materials-gpumd-workflow",
      brief: {
        scope: "NEP molecular dynamics run and output review",
        run_ledger: [{ run_id: "run-1", model: "nep.txt" }],
        command_ledger: [{ command: "gpumd", confirmed: true }],
        output_inventory: [{ path: "thermo.out", present: true }],
        validation_results: [{ check: "energy_drift", result: "acceptable" }],
        conclusions: "Outputs validated under stated model assumptions.",
      },
    },
    {
      profile_id: "plugin-materials-phonopy-workflows",
      brief: {
        scope: "Finite-displacement phonon workflow",
        configuration_review: [{ file: "phonopy.conf", tags: "reviewed" }],
        force_ledger: [{ supercell: "SPOSCAR", forces: "FORCE_SETS", present: true }],
        run_ledger: [{ command: "phonopy", state: "complete" }],
        validation_results: [{ check: "force_handoff", result: "complete" }],
        conclusions: "Configuration and force provenance preserved.",
      },
    },
    {
      profile_id: "plugin-materials-unimol-ops",
      brief: {
        scope: "Local Uni-Mol inference mode",
        data_ledger: [{ source: "molecule.sdf", state: "present" }],
        mode_plan: [{ mode: "inference", checkpoint: "local" }],
        command_ledger: [{ command: "unimol inference ...", confirmed: true }],
        result_ledger: [{ output: "predictions.csv", state: "reviewed" }],
        conclusions: "Mode-specific outputs reviewed without claiming training validity.",
      },
    },
  ] as const;

  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));

    const installed = parseEnvelope<{ resolved_capability_ids: string[]; resolved_profile_ids: string[] }>(
      runCli(["plugin", "install", "computational-modeling-and-simulation", "--yes", "--json"], root),
    );
    assert.equal(installed.ok, true, JSON.stringify(installed.error));
    assert.equal(installed.data?.resolved_capability_ids.includes("plugin-materials-apex-alloy-workflows"), true);
    assert.equal(installed.data?.resolved_capability_ids.includes("plugin-materials-unimol-ops"), true);

    for (const entry of cases) {
      const startInput = path.join(root, `start-${entry.profile_id}.yaml`);
      const advanceInput = path.join(root, `advance-${entry.profile_id}.yaml`);
      const briefRelative = `brief-${entry.profile_id}.json`;
      const briefPath = path.join(root, briefRelative);
      await writeFile(path.join(root, `task-${entry.profile_id}.md`), "# Research task\n", "utf8");
      await writeFile(startInput, stringify({
        schema_version: "2",
        confirmed_at: "2026-08-17T02:00:00+08:00",
        entry_id: "main",
        entry_node_id: "research",
        prerequisites: [],
        handoff_inputs: [{ role: "task_request", type: "markdown", path: `task-${entry.profile_id}.md`, purpose: entry.profile_id }],
        planned_outputs: [{ role: "research_brief", type: "json", path: briefRelative, purpose: `${entry.profile_id} brief` }],
        formal_gates: [],
        cost: { effort: "low", interaction: "single_pass" },
      }), "utf8");

      const started = parseEnvelope<{ run_id: string }>(runCli(["start", entry.profile_id, "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
      assert.equal(started.ok, true, `${entry.profile_id}: ${JSON.stringify(started.error)}`);
      const runId = started.data?.run_id ?? "";
      assert.match(runId, /^run-[a-f0-9]+$/);

      const instructions = parseEnvelope<{ capability: { capability_id: string } }>(runCli(["instructions", `node:${runId}/research`, "--json"], root));
      assert.equal(instructions.ok, true, `${entry.profile_id}: ${JSON.stringify(instructions.error)}`);
      assert.equal(instructions.data?.capability.capability_id, entry.profile_id);

      await writeFile(advanceInput, stringify({ outputs: [{ role: "research_brief", path: briefRelative }] }), "utf8");
      await writeFile(briefPath, JSON.stringify({ scope: "incomplete" }), "utf8");
      const invalid = parseEnvelope(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
      assert.equal(invalid.ok, false, `${entry.profile_id} invalid advance unexpectedly succeeded`);
      assert.match(invalid.error?.code ?? "", /node_validators_failed/);

      await writeFile(briefPath, JSON.stringify(entry.brief), "utf8");
      const advanced = parseEnvelope<{ node: { state: string } }>(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
      assert.equal(advanced.ok, true, `${entry.profile_id}: ${JSON.stringify(advanced.error)}`);
      assert.equal(advanced.data?.node.state, "complete");
    }
  } finally {
    await cleanup(root);
  }
});

void test("plugin show exposes graph extension counts", async () => {
  const root = await tempProject();
  try {
    const shown = parseEnvelope<{ domain: { capabilities: number; profiles: number } }>(runCli(["plugin", "show", "ecology", "--summary", "--json"], root));
    assert.equal(shown.ok, true, JSON.stringify(shown.error));
    assert.equal(shown.data?.domain.capabilities, 2);
    assert.equal(shown.data?.domain.profiles, 2);
  } finally {
    await cleanup(root);
  }
});
