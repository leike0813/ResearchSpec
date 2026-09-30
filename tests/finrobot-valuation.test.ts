import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

const REPO_ROOT = path.resolve(".");
const CANDIDATE_SCRIPT = path.join(REPO_ROOT, "audits/finrobot/snapshot-2717499/candidate-authoring/financial-research-relative-valuation/scripts/valuation.py");
const SUPPORT_LIBRARY = path.join(REPO_ROOT, "src/vendor-converters/finrobot/lib/financial_support.py");

const sharedPythonProject = path.join(homedir(), ".ar");
const python = existsSync(path.join(sharedPythonProject, "pyproject.toml")) && spawnSync("uv", ["--version"]).status === 0
  ? { command: "uv", prefix: ["run", `--project=${sharedPythonProject}`, "--locked", "--", "python"] }
  : undefined;

interface MethodMetadata { currency: string | null; as_of: string | null; share_basis: string | null }
interface MethodResult {
  enterprise_value: number;
  equity_value: number;
  value_per_share: number;
  value_per_share_currency: string;
  terminal_value_share_of_ev: number | null;
  unverified_claims: string[];
  metadata: MethodMetadata;
}
interface ValueResult {
  requested_currency: string;
  share_count_unit: string;
  methods: Record<string, MethodResult>;
  weights: Record<string, number>;
  weighted_value_per_share: number | null;
  composite: { certified: boolean; weight_rationale: string | null; uncertified_reasons: string[]; advisories: string[] };
  diagnostics: { method_absolute_spread: number | null; method_span_ratio: number | null; terminal_value_share_of_ev: number | null };
}
interface SensitivityResult {
  columns: number[];
  rows: Array<{ discount_rate: number; values: Array<{ terminal_growth: number; value_per_share: number }> }>;
}

const comparableDcf = { free_cash_flows: [100, 110, 120], discount_rate: 0.1, terminal_growth: 0.03, net_debt: 50, preferred_stock: 20, noncontrolling_interest: 10, diluted_shares: 100 };
const comparableMultiples = { metric: 120, selected_multiple: 8, net_debt: 50, preferred_stock: 20, noncontrolling_interest: 10, diluted_shares: 100 };
const leanDcf = { free_cash_flows: [100, 110, 120], discount_rate: 0.1, terminal_growth: 0.03, net_debt: 50, diluted_shares: 100 };
const leanMultiples = { metric: 120, selected_multiple: 8, net_debt: 50, diluted_shares: 100 };

void test("FinRobot relative valuation certifies a composite only for comparable, declared methods", { skip: python === undefined }, async () => {
  const root = await stagedTree();
  try {
    const declared = {
      currency: "USD", unit: "millions", as_of: "2026-06-30", share_basis: "diluted",
      period: "FY2025",
      applicability: "Free cash flows and peer multiples describe the same non-financial issuer.",
      weight_rationale: "The DCF and the peer multiple corroborate the same operating evidence.",
      dcf: comparableDcf, multiples: comparableMultiples, weights: { dcf: 0.6, multiples: 0.4 },
    };
    const certified = await runValue(root, "certified", declared);
    const dcf = certified.methods.dcf;
    const multiples = certified.methods.multiples;
    assert.equal(certified.composite.certified, true);
    assert.deepEqual(certified.composite.advisories, []);
    assert.deepEqual(dcf.unverified_claims, []);
    assert.equal(certified.requested_currency, "USD");
    assert.equal(certified.share_count_unit, "millions");
    assert.equal(dcf.value_per_share_currency, "USD");
    assert.equal(multiples.value_per_share_currency, "USD");
    assert.equal(multiples.equity_value, 880);
    assertClose(dcf.equity_value, dcf.enterprise_value - 80, "bridge deducts net debt, preferred, and NCI once", 1e-6);
    assertClose(certified.weighted_value_per_share ?? 0, 0.6 * dcf.value_per_share + 0.4 * 8.8, "certified blend", 1e-9);
    assertClose(certified.diagnostics.method_span_ratio ?? 0, Math.max(dcf.value_per_share, 8.8) / Math.min(dcf.value_per_share, 8.8), "diagnostic span", 1e-9);
    assert.ok(dcf.terminal_value_share_of_ev !== null && dcf.terminal_value_share_of_ev > 0 && dcf.terminal_value_share_of_ev < 1);

    const uncertified = await runValue(root, "uncertified", { currency: "USD", unit: "millions", dcf: comparableDcf, multiples: comparableMultiples, weights: { dcf: 0.6, multiples: 0.4 } });
    assert.equal(uncertified.composite.certified, false);
    assert.equal(uncertified.weighted_value_per_share, null);
    assert.deepEqual(uncertified.weights, { dcf: 0.6, multiples: 0.4 });
    assert.match(uncertified.composite.uncertified_reasons.join(" "), /weight_rationale/);
    assert.equal(typeof uncertified.methods.dcf.value_per_share, "number");

    const mismatched = await runValue(root, "mismatch", { ...declared, multiples: { ...comparableMultiples, currency: "EUR" } });
    assert.equal(mismatched.composite.certified, false);
    assert.equal(mismatched.methods.multiples.metadata.currency, "EUR");
    assert.match(mismatched.composite.uncertified_reasons.join(" "), /currency/);
    assert.equal(mismatched.diagnostics.method_span_ratio, null);
    assert.equal(mismatched.diagnostics.method_absolute_spread, null);
    assert.equal(mismatched.methods.dcf.value_per_share_currency, "USD");
    assert.equal(mismatched.methods.multiples.value_per_share_currency, "EUR");

    const reweighted = await runValue(root, "share-count", { ...declared, multiples: { ...comparableMultiples, diluted_shares: 200 } });
    assert.equal(reweighted.composite.certified, false);
    assert.match(reweighted.composite.uncertified_reasons.join(" "), /diluted share/);

    const splitBridge = await runValue(root, "split-bridge", { ...declared, multiples: { ...comparableMultiples, net_debt: 60 } });
    assert.equal(splitBridge.composite.certified, false);
    assert.equal(splitBridge.weighted_value_per_share, null);
    assert.match(splitBridge.composite.uncertified_reasons.join(" "), /bridge/);

    const advisory = await runValue(root, "advisory", { currency: "USD", unit: "millions", period: "FY2025", as_of: "2026-06-30", share_basis: "diluted", applicability: "Both methods describe the issuer.", weight_rationale: "Both methods corroborate.", dcf: leanDcf, multiples: leanMultiples, weights: { dcf: 0.5, multiples: 0.5 } });
    assert.equal(advisory.composite.certified, false);
    assert.equal(advisory.weighted_value_per_share, null);
    assert.deepEqual(advisory.methods.dcf.unverified_claims, ["preferred_stock", "noncontrolling_interest"]);
    assert.equal(advisory.composite.advisories.length, 4);
    assert.match(advisory.composite.advisories.join(" "), /preferred_stock/);
    assert.match(advisory.composite.uncertified_reasons.join(" "), /unverified/);

    const single = await runValue(root, "single", { currency: "USD", unit: "millions", dcf: leanDcf });
    assert.deepEqual(single.weights, { dcf: 1 });
    assert.equal(single.weighted_value_per_share, single.methods.dcf.value_per_share);
    assert.equal(single.composite.certified, false);

    const rejected: Array<[string, unknown]> = [
      ["duplicate-bridge", { currency: "USD", unit: "millions", dcf: { ...leanDcf, debt: 40, cash: 10 } }],
      ["unknown-field", { currency: "USD", unit: "millions", dcf: { ...leanDcf, ebitda: 1 } }],
      ["negative-claim", { currency: "USD", unit: "millions", dcf: { ...leanDcf, preferred_stock: -5 } }],
      ["negative-equity", { currency: "USD", unit: "millions", dcf: { ...leanDcf, net_debt: 100000 } }],
      ["non-positive-terminal", { currency: "USD", unit: "millions", dcf: { ...leanDcf, free_cash_flows: [100, -5] } }],
      ["zero-terminal-cash-flow", { currency: "USD", unit: "millions", dcf: { ...leanDcf, terminal_growth: -1 } }],
      ["missing-net-debt", { currency: "USD", unit: "millions", dcf: { free_cash_flows: [100, 110], discount_rate: 0.1, terminal_growth: 0.03, diluted_shares: 100 } }],
    ];
    for (const [name, payload] of rejected) {
      await writeJson(path.join(root, `${name}.json`), payload);
      assert.notEqual(runValuation(root, ["value", "--input", `${name}.json`, "--output", `${name}-out.json`]), 0, name);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("FinRobot sensitivity shares the value validation and grid shape", { skip: python === undefined }, async () => {
  const root = await stagedTree();
  try {
    const base = { free_cash_flows: [100, 110, 120], discount_rate: 0.1, terminal_growth: 0.03, net_debt: 50, preferred_stock: 20, noncontrolling_interest: 10, diluted_shares: 100 };
    const value = await runValue(root, "value", { currency: "USD", unit: "millions", dcf: base });
    await writeJson(path.join(root, "grid.json"), { kind: "dcf", base, grid: { discount_rates: [0.09, 0.1], terminal_growth_rates: [0.02, 0.03] } });
    assert.equal(runValuation(root, ["sensitivity", "--input", "grid.json", "--output", "grid-out.json"]), 0);
    const table = await readJson<SensitivityResult>(path.join(root, "grid-out.json"));
    assert.deepEqual(table.columns, [0.02, 0.03]);
    assert.equal(table.rows.length, 2);
    const row = table.rows.find((item) => item.discount_rate === 0.1);
    assert.ok(row);
    const cell = row.values.find((item) => item.terminal_growth === 0.03);
    assert.ok(cell);
    assertClose(cell.value_per_share, value.methods.dcf.value_per_share, "shared DCF validation", 1e-9);

    await writeJson(path.join(root, "grid-bad.json"), { kind: "dcf", base: { ...base, free_cash_flows: [100, -5] }, grid: { discount_rates: [0.1], terminal_growth_rates: [0.03] } });
    assert.notEqual(runValuation(root, ["sensitivity", "--input", "grid-bad.json", "--output", "grid-bad-out.json"]), 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function stagedTree(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-valuation-"));
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await mkdir(path.join(root, "lib"), { recursive: true });
  await writeFile(path.join(root, "scripts/valuation.py"), await readFile(CANDIDATE_SCRIPT));
  await writeFile(path.join(root, "lib/financial_support.py"), await readFile(SUPPORT_LIBRARY));
  return root;
}

function runValuation(root: string, args: string[]): number | null {
  if (!python) throw new Error("the shared Python runtime is unavailable");
  return spawnSync(python.command, [...python.prefix, "scripts/valuation.py", ...args], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).status;
}

async function runValue(root: string, name: string, payload: unknown): Promise<ValueResult> {
  await writeJson(path.join(root, `${name}.json`), payload);
  assert.equal(runValuation(root, ["value", "--input", `${name}.json`, "--output", `${name}-out.json`]), 0, `${name} should succeed`);
  return readJson<ValueResult>(path.join(root, `${name}-out.json`));
}

async function writeJson(target: string, value: unknown): Promise<void> {
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readJson<T>(target: string): Promise<T> {
  return JSON.parse(await readFile(target, "utf8")) as T;
}

function assertClose(actual: number, expected: number, message: string, delta: number): void {
  assert.ok(Math.abs(actual - expected) <= delta, `${message}: ${String(actual)} vs ${String(expected)}`);
}
