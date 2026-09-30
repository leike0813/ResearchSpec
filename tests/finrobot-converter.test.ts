import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { availableDomains, loadPluginRegistry, resolveDomainSelection } from "../src/plugins/registry.js";
import { renderFinRobotCompleteTrees } from "../src/vendor-converters/finrobot/complete-tree.js";
import { checkFinRobotIdempotence, checkFinRobotOutput, type FinRobotConversionManifest } from "../src/vendor-converters/finrobot/converter.js";
import { assertNoSensitiveValues, loadFinRobotDraftPolicies } from "../src/vendor-converters/finrobot/policy.js";
import { PRODUCTION_VENDOR_IDS } from "../src/vendor-converters/shared/production-vendors.js";

const REPO_ROOT = path.resolve(".");
const PLUGIN_ROOT = path.resolve("skills/plugins");
const VENDOR_ROOT = path.join(PLUGIN_ROOT, "vendors/finrobot");
const APPROVED_HASH = "1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6";

const sharedPythonProject = path.join(homedir(), ".ar");
const python = existsSync(path.join(sharedPythonProject, "pyproject.toml")) && spawnSync("uv", ["--version"]).status === 0
  ? { command: "uv", prefix: ["run", `--project=${sharedPythonProject}`, "--locked", "--", "python"] }
  : spawnSync("python3", ["--version"]).status === 0
    ? { command: "python3", prefix: [] }
    : undefined;

void test("FinRobot generated bundle is the approved version 2 six-Skill projection", async () => {
  const policies = await loadFinRobotDraftPolicies(REPO_ROOT);
  const rendered = await renderFinRobotCompleteTrees(REPO_ROOT);
  const loaded = await loadPluginRegistry(PLUGIN_ROOT);
  const manifest = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-manifests/finrobot.json"), "utf8")) as FinRobotConversionManifest;

  assert.equal(policies.review.published.review_status, "approved");
  assert.equal(policies.review.published.converter_version, "2");
  assert.equal(policies.review.candidate, null);
  assert.equal(rendered.treeSetSha256, APPROVED_HASH);
  assert.equal(rendered.reviewStatus, "approved");
  assert.equal(manifest.converter_version, "2");
  assert.equal(manifest.approved_tree_set_sha256, APPROVED_HASH);
  assert.deepEqual([...loaded.vendors.keys()], [...PRODUCTION_VENDOR_IDS]);
  assert.equal(loaded.vendors.get("finrobot")?.skills.length, 6);
  assert.ok(loaded.vendors.get("finrobot")?.skills.every((skill) => skill.dependencies.length === 0));
  assert.equal(loaded.domains.size, 218);
  const domainCatalog = JSON.parse(await readFile(path.resolve("src/plugins/domain-catalog.json"), "utf8")) as { domains: Array<{ skills: string[] }> };
  assert.equal(availableDomains(loaded).length, domainCatalog.domains.filter((domain) => domain.skills.length > 0).length);
  assert.deepEqual(loaded.domains.get("accounting-auditing-and-accountability")?.skills, [
    "financial-research-company-fundamentals",
    "financial-research-statement-analysis",
  ]);
  assert.equal(loaded.domains.get("banking-finance-and-investment")?.skills.length, 6);
  assert.equal(resolveDomainSelection(loaded, ["banking-finance-and-investment"]).resolvedSkillIds.length, 6);

  for (const tree of rendered.trees) {
    assert.equal(manifest.tree_sha256[tree.skillId], tree.sha256);
    for (const file of tree.files) assert.deepEqual(await readFile(path.join(VENDOR_ROOT, tree.skillId, file.path)), file.content, `${tree.skillId}/${file.path}`);
  }
});

void test("FinRobot complete trees use only reviewed procedures, scripts, and distribution files", async () => {
  const rendered = await renderFinRobotCompleteTrees(REPO_ROOT);
  const supportHashes = new Set<string>();
  for (const tree of rendered.trees) {
    assert.equal(tree.files.some((file) => file.path.startsWith("references/")), false, tree.skillId);
    const derivationFile = tree.files.find((file) => file.path === "DERIVATION.json");
    assert.ok(derivationFile);
    const derivation = JSON.parse(derivationFile.content.toString("utf8")) as { capability_map: Array<{ implementation: { kind: string } }>; files: Array<{ path: string }> };
    assert.ok(derivation.capability_map.every((item) => ["agent-procedure", "bundled-script", "external-tool"].includes(item.implementation.kind)));
    assert.equal(derivation.files.length, tree.files.length);
    assert.deepEqual(derivation.files.map((item) => item.path).sort(), tree.files.map((item) => item.path).sort());
    for (const file of tree.files) {
      assert.doesNotMatch(file.content.toString("utf8"), /(?:^|\/)dependencies\.json|agent-specs|provider_(?:contracts|adapters)|agents\/openai\.yaml/i, `${tree.skillId}/${file.path}`);
      if (file.path === "lib/financial_support.py") supportHashes.add(file.sha256);
    }
  }
  assert.equal(supportHashes.size, 1);
});

void test("FinRobot form-safety rejects sensitive values without censoring business capability", () => {
  for (const content of [
    "token = 'sk-exampleActualSecretValue123'",
    "-----BEGIN PRIVATE KEY-----",
    "api_key = 'real-looking-secret-value'",
    "source = '/home/alice/private/model.csv'",
    "endpoint = 'https://pricing.internal/v1'",
  ]) assert.throws(() => assertNoSensitiveValues(content, "fixture"));

  assert.doesNotThrow(() => assertNoSensitiveValues(
    "User-configured provider may support a forecast, probability, sentiment, target price, rating, recommendation, and valuation conclusion.",
    "allowed-fixture",
  ));
});

void test("FinRobot copied approved trees execute deterministic offline commands", { skip: python === undefined }, async () => {
  assert.ok(python);
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-approved-"));
  try {
    const rendered = await renderFinRobotCompleteTrees(REPO_ROOT);
    for (const tree of rendered.trees) await writeTree(path.join(temporaryRoot, tree.skillId), tree.files);

    const fundamentalsRoot = path.join(temporaryRoot, "financial-research-company-fundamentals");
    await writeJson(path.join(fundamentalsRoot, "metrics.json"), {
      currency: "USD", unit: "millions", periods: [
        { period: "2024", revenue: 100, gross_profit: 60, operating_income: 20, net_income: 14, assets: 200, equity: 100, debt: 50, operating_cash_flow: 18 },
        { period: "2025", revenue: 110, gross_profit: 68, operating_income: 24, net_income: 17, assets: 215, equity: 112, debt: 48, operating_cash_flow: 21 },
      ],
    });
    runPython(["scripts/fundamentals.py", "metrics", "--input", "metrics.json", "--output", "metrics-output.json"], fundamentalsRoot);
    const metrics = await readJson(path.join(fundamentalsRoot, "metrics-output.json"));
    assert.equal((metrics.periods as Array<{ metrics: { revenue_growth: number } }>)[1]?.metrics.revenue_growth, 0.1);
    await writeJson(path.join(fundamentalsRoot, "forecast.json"), {
      currency: "USD", unit: "millions", base_period: { period: "2025", revenue: 110 }, years: 2,
      scenarios: [
        { name: "base", revenue_growth: 0.08, operating_margin: 0.22, tax_rate: 0.21 },
        { name: "upside", revenue_growth: 0.12, operating_margin: 0.25, tax_rate: 0.21 },
        { name: "downside", revenue_growth: -0.05, operating_margin: 0.15, tax_rate: 0.21 },
      ],
    });
    runPython(["scripts/fundamentals.py", "forecast", "--input", "forecast.json", "--output", "forecast-a.json"], fundamentalsRoot);
    runPython(["scripts/fundamentals.py", "forecast", "--input", "forecast.json", "--output", "forecast-b.json"], fundamentalsRoot);
    assert.deepEqual(await readFile(path.join(fundamentalsRoot, "forecast-a.json")), await readFile(path.join(fundamentalsRoot, "forecast-b.json")));

    const eventRoot = path.join(temporaryRoot, "financial-research-event-evidence");
    await writeJson(path.join(eventRoot, "events.json"), {
      as_of: "2026-07-15T12:00:00+08:00",
      events: [
        { source: "Issuer filing", published_at: "2026-07-14T16:00:00Z", event_date: "2026-07-14", title: "Acme announces project" },
        { source: "Issuer filing", published_at: "2026-07-14T16:00:00Z", event_date: "2026-07-14", title: "Acme announces project" },
      ],
    });
    runPython(["scripts/event_evidence.py", "prepare", "--input", "events.json", "--output", "prepared.json"], eventRoot);
    const prepared = await readJson(path.join(eventRoot, "prepared.json"));
    assert.equal((prepared.events as unknown[]).length, 1);
    assert.equal((prepared.duplicates as unknown[]).length, 1);
    const eventId = (prepared.events as Array<{ event_id: string }>)[0]?.event_id;
    await writeJson(path.join(eventRoot, "assessments.json"), { assessments: [
      { event_id: eventId, probability: 0.8, impact: 0.6, confidence: 0.75, sentiment: 0.4, rationale: "Agent-reviewed evidence" },
      { event_id: "event-second", probability: 0.5, impact: 0.4, confidence: 0.5, sentiment: -0.2, rationale: "Agent-reviewed countercase" },
    ] });
    runPython(["scripts/event_evidence.py", "rank", "--input", "assessments.json", "--output", "ranked.json"], eventRoot);
    const ranked = await readJson(path.join(eventRoot, "ranked.json"));
    assert.equal((ranked.ranking as Array<{ event_id: string }>)[0]?.event_id, eventId);

    const valuationRoot = path.join(temporaryRoot, "financial-research-relative-valuation");
    await writeJson(path.join(valuationRoot, "value.json"), {
      currency: "USD", unit: "millions", period: "FY2025", as_of: "2026-06-30", share_basis: "diluted",
      applicability: "Free cash flows and peer multiples describe the same non-financial issuer.",
      weight_rationale: "The DCF and the peer multiple corroborate the same operating evidence.",
      dcf: { free_cash_flows: [100, 110, 120], discount_rate: 0.1, terminal_growth: 0.03, net_debt: 50, preferred_stock: 20, noncontrolling_interest: 10, diluted_shares: 100 },
      multiples: { metric: 120, selected_multiple: 8, net_debt: 50, preferred_stock: 20, noncontrolling_interest: 10, diluted_shares: 100 },
      weights: { dcf: 0.6, multiples: 0.4 },
    });
    runPython(["scripts/valuation.py", "value", "--input", "value.json", "--output", "value-output.json"], valuationRoot);
    const value = await readJson(path.join(valuationRoot, "value-output.json"));
    assert.equal((value.composite as { certified: boolean }).certified, true);
    assert.equal(typeof value.weighted_value_per_share, "number");
    await writeJson(path.join(valuationRoot, "single.json"), {
      currency: "USD", unit: "millions",
      dcf: { free_cash_flows: [100, 110, 120], discount_rate: 0.1, terminal_growth: 0.03, net_debt: 50, diluted_shares: 100 },
    });
    runPython(["scripts/valuation.py", "value", "--input", "single.json", "--output", "single-output.json"], valuationRoot);
    const single = await readJson(path.join(valuationRoot, "single-output.json"));
    assert.equal((single.composite as { certified: boolean }).certified, false);
    assert.equal(single.weighted_value_per_share, (single.methods as Record<string, { value_per_share: number }>).dcf.value_per_share);
    await writeJson(path.join(valuationRoot, "sensitivity.json"), {
      kind: "dcf",
      base: { free_cash_flows: [100, 110, 120], discount_rate: 0.1, terminal_growth: 0.03, net_debt: 50, diluted_shares: 100 },
      grid: { discount_rates: [0.09, 0.1], terminal_growth_rates: [0.02, 0.03] },
    });
    runPython(["scripts/valuation.py", "sensitivity", "--input", "sensitivity.json", "--output", "sensitivity-output.json"], valuationRoot);
    await writeJson(path.join(valuationRoot, "invalid.json"), {
      currency: "USD", unit: "millions",
      dcf: { free_cash_flows: [100], discount_rate: 0.03, terminal_growth: 0.03, net_debt: 0, diluted_shares: 10 },
    });
    assert.notEqual(runPythonResult(["scripts/valuation.py", "value", "--input", "invalid.json", "--output", "invalid-output.json"], valuationRoot).status, 0);

    const statementsRoot = path.join(temporaryRoot, "financial-research-statement-analysis");
    await writeJson(path.join(statementsRoot, "records.json"), { records: [
      { statement: "income", line_item: "revenue", period: "2024", value: 100, currency: "USD", unit: "millions", source: "Filing p. 9", frequency: "annual", kind: "actual", period_start: "2024-01-01", period_end: "2024-12-31" },
      { statement: "income", line_item: "revenue", period: "2025", value: 110, currency: "USD", unit: "millions", source: "Filing p. 10", frequency: "annual", kind: "actual", period_start: "2025-01-01", period_end: "2025-12-31" },
      { statement: "income", line_item: "operating_income", period: "2025", value: 20, currency: "USD", unit: "millions", source: "Filing p. 10", frequency: "annual", kind: "actual", period_start: "2025-01-01", period_end: "2025-12-31" },
      { statement: "income", line_item: "net_income", period: "2025", value: 14, currency: "USD", unit: "millions", source: "Filing p. 10", frequency: "annual", kind: "actual", period_start: "2025-01-01", period_end: "2025-12-31" },
      { statement: "balance", line_item: "assets", period: "2025", value: 200, currency: "USD", unit: "millions", source: "Filing p. 11", frequency: "instant", kind: "actual", period_start: "2025-12-31", period_end: "2025-12-31" },
      { statement: "balance", line_item: "liabilities", period: "2025", value: 120, currency: "USD", unit: "millions", source: "Filing p. 11", frequency: "instant", kind: "actual", period_start: "2025-12-31", period_end: "2025-12-31" },
      { statement: "balance", line_item: "equity", period: "2025", value: 80, currency: "USD", unit: "millions", source: "Filing p. 11", frequency: "instant", kind: "actual", period_start: "2025-12-31", period_end: "2025-12-31" },
    ] });
    runPython(["scripts/statements.py", "normalize", "--input", "records.json", "--output", "normalized.json"], statementsRoot);
    runPython(["scripts/statements.py", "metrics", "--input", "normalized.json", "--output", "statement-metrics.json"], statementsRoot);
    const statementMetrics = await readJson(path.join(statementsRoot, "statement-metrics.json"));
    const metricsPeriods = statementMetrics.periods as Array<{ metrics: { revenue_growth: number | null }; checks: { balance_sheet_residual: number | null } }>;
    assert.equal(metricsPeriods[1]?.metrics.revenue_growth, 0.1);
    assert.equal(metricsPeriods[1]?.checks.balance_sheet_residual, 0);
    await writeJson(path.join(statementsRoot, "statement-forecast.json"), {
      currency: "USD", unit: "millions", base_period: { period: "2025", revenue: 100, debt: 50, cash: 20 }, years: 2,
      assumptions: { revenue_growth: 0.08, operating_margin: 0.2, tax_rate: 0.21, depreciation_rate: 0.03, capex_rate: 0.04, working_capital_rate: 0.01 },
    });
    runPython(["scripts/statements.py", "forecast", "--input", "statement-forecast.json", "--output", "statement-forecast-output.json"], statementsRoot);

    const overwrite = runPythonResult(["scripts/fundamentals.py", "metrics", "--input", "metrics.json", "--output", "metrics-output.json"], fundamentalsRoot);
    assert.notEqual(overwrite.status, 0);
    runPython(["scripts/fundamentals.py", "metrics", "--input", "metrics.json", "--output", "metrics-output.json", "--overwrite"], fundamentalsRoot);

    for (const tree of rendered.trees.filter((item) => item.tier === 3)) {
      const script = tree.files.find((file) => file.path.startsWith("scripts/"));
      assert.ok(script);
      const result = runPythonResult(["-c", "import runpy,sys; runpy.run_path(sys.argv[1], run_name='approved_module')", script.path], path.join(temporaryRoot, tree.skillId));
      assert.equal(result.status, 0, String(result.stderr));
      assert.equal(result.stdout, "");
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

void test("FinRobot output check and regeneration are idempotent", async () => {
  assert.deepEqual(await checkFinRobotOutput(REPO_ROOT), { ok: true, errors: [], warnings: [] });
  assert.deepEqual(await checkFinRobotIdempotence(REPO_ROOT), { ok: true, drift_paths: [] });
});

async function writeTree(root: string, files: Array<{ path: string; content: Buffer }>): Promise<void> {
  for (const file of files) {
    const target = path.join(root, file.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, file.content);
  }
}

async function writeJson(target: string, value: unknown): Promise<void> {
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readJson(target: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(target, "utf8")) as Record<string, unknown>;
}

function runPython(args: string[], cwd: string): string {
  assert.ok(python);
  return execFileSync(python.command, [...python.prefix, ...args], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function runPythonResult(args: string[], cwd: string): ReturnType<typeof spawnSync> {
  assert.ok(python);
  return spawnSync(python.command, [...python.prefix, ...args], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}
