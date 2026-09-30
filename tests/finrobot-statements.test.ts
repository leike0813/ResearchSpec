import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

const REPO_ROOT = path.resolve(".");
const CANDIDATE_ROOT = path.join(REPO_ROOT, "audits/finrobot/snapshot-2717499/candidate-authoring");
const SUPPORT_SOURCE = path.join(REPO_ROOT, "src/vendor-converters/finrobot/lib/financial_support.py");
const sharedPythonProject = path.join(homedir(), ".ar");
const python = existsSync(path.join(sharedPythonProject, "pyproject.toml")) && spawnSync("uv", ["--version"]).status === 0
  ? { command: "uv", prefix: ["run", "--project=" + sharedPythonProject, "--locked", "--", "python"] }
  : undefined;

interface CoverageEntry { line_item: string; revision: string | null; frequency: string | null; status: string; periods: unknown[]; gaps: unknown[]; overlaps: unknown[]; issues: string[] }
interface PeriodMetrics { period: string; currency: string; order: string | null; metrics: { revenue_growth: number | null; return_on_assets: number | null; gross_margin: number | null }; revenue_growth_reason: string | null; ratio_reasons: Record<string, string>; checks: { balance_sheet_residual: number | null } }
interface ComparedEntry { verdict: string; difference: number; reasons: string[]; contributions: Array<{ unit: string }> }
interface AuditResult {
  period_coverage: CoverageEntry[];
  cross_source: { compared: ComparedEntry[]; unaligned: Array<{ period: string; bounds: string[][] }> };
  market_cap: Array<{ verdict: string; calculation: string; residual: number | null; notes: string[] }>;
  currency_caliber: Array<{ status: string; unresolved: string[]; fx_evidence: Array<{ source: string; date: string }> }>;
}

const quarter = (label: string, start: string, end: string, value: number, source: string) => ({
  statement: "income", line_item: "revenue", period: label, value, currency: "USD", unit: "millions",
  source, frequency: "quarter", period_start: start, period_end: end, kind: "actual",
});

const QUARTERS = [
  quarter("2025-Q1", "2025-01-01", "2025-03-31", 100, "Filing"),
  quarter("2025-Q2", "2025-04-01", "2025-06-30", 110, "Filing"),
  quarter("2025-Q3", "2025-07-01", "2025-09-30", 120, "Filing"),
  quarter("2025-Q4", "2025-10-01", "2025-12-31", 130, "Filing"),
];
const FULL_YEAR_WINDOW = [{ statement: "income", line_item: "revenue", start: "2025-01-01", end: "2025-12-31" }];

void test("statement audit certifies a period window only from bounded actual periods", { skip: python === undefined }, async () => {
  const runtimeRoot = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-statements-"));
  try {
    const skillRoot = await prepareSkill(runtimeRoot);
    const intervalOnly = await audit(skillRoot, runtimeRoot, "coverage-plain", { records: QUARTERS });
    assert.equal(intervalOnly.period_coverage[0]?.status, "interval-only");

    const covered = await audit(skillRoot, runtimeRoot, "coverage-window", { records: QUARTERS, windows: FULL_YEAR_WINDOW });
    assert.equal(covered.period_coverage[0]?.status, "covered");

    const gapped = await audit(skillRoot, runtimeRoot, "coverage-gap", {
      records: QUARTERS.filter((record) => record.period !== "2025-Q3"),
      windows: FULL_YEAR_WINDOW,
    });
    assert.equal(gapped.period_coverage[0]?.status, "incomplete");
    assert.equal(gapped.period_coverage[0]?.gaps.length, 1);

    const overlapping = await audit(skillRoot, runtimeRoot, "coverage-overlap", {
      records: [QUARTERS[0], QUARTERS[1], { ...QUARTERS[2], period_start: "2025-06-15" }],
      windows: FULL_YEAR_WINDOW,
    });
    assert.equal(overlapping.period_coverage[0]?.status, "incomplete");
    assert.equal(overlapping.period_coverage[0]?.overlaps.length, 1);

    const inexact = await audit(skillRoot, runtimeRoot, "coverage-inexact", {
      records: QUARTERS,
      windows: [{ statement: "income", line_item: "revenue", start: "2025-04-01", end: "2025-09-30" }],
    });
    assert.equal(inexact.period_coverage[0]?.status, "incomplete");

    const restated = await audit(skillRoot, runtimeRoot, "coverage-revision", {
      records: [QUARTERS[0], QUARTERS[1], { ...QUARTERS[2], revision: "restated" }, { ...QUARTERS[3], revision: "restated" }],
      windows: FULL_YEAR_WINDOW,
    });
    const asReported = restated.period_coverage.find((entry) => entry.revision === null);
    assert.equal(asReported?.status, "incomplete");
    assert.equal(asReported?.periods.length, 2);

    const annual = await audit(skillRoot, runtimeRoot, "coverage-annual", {
      records: [{ statement: "income", line_item: "revenue", period: "FY2025", value: 400, currency: "USD", unit: "millions", source: "Filing", frequency: "annual", kind: "actual", period_start: "2025-01-01", period_end: "2025-12-31" }],
      windows: [{ statement: "income", line_item: "revenue", start: "2025-01-01", end: "2025-12-31" }],
    });
    assert.equal(annual.period_coverage[0]?.frequency, "annual");
    assert.equal(annual.period_coverage[0]?.status, "covered");

    const instant = await audit(skillRoot, runtimeRoot, "coverage-instant", {
      records: [{ statement: "balance", line_item: "assets", period: "2025-12-31", value: 200, currency: "USD", unit: "millions", source: "Filing", frequency: "instant", kind: "actual", period_start: "2025-12-31", period_end: "2025-12-31" }],
      windows: [{ statement: "balance", line_item: "assets", start: "2025-12-31", end: "2025-12-31" }],
    });
    assert.equal(instant.period_coverage[0]?.frequency, null);
    assert.equal(instant.period_coverage[0]?.status, "uncertified");

    const unbounded = await audit(skillRoot, runtimeRoot, "coverage-unbounded", {
      records: [{ ...QUARTERS[0], period_end: null }],
      windows: FULL_YEAR_WINDOW,
    });
    assert.equal(unbounded.period_coverage[0]?.status, "uncertified");
  } finally {
    await rm(runtimeRoot, { recursive: true, force: true });
  }
});

void test("statement audit aligns cross-source records on bounds, units, and declared lineage", { skip: python === undefined }, async () => {
  const runtimeRoot = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-statements-"));
  try {
    const skillRoot = await prepareSkill(runtimeRoot);
    const bounded = { period_start: "2025-01-01", period_end: "2025-12-31" };
    const aligned = await audit(skillRoot, runtimeRoot, "cross-source", { records: [
      { statement: "income", line_item: "net_income", period: "FY2025", value: 15, currency: "USD", unit: "millions", source: "Filing", lineage: "audited filing", ...bounded },
      { statement: "income", line_item: "net_income", period: "FY2025", value: 15000, currency: "USD", unit: "thousands", source: "Vendor", lineage: "vendor feed", ...bounded },
    ] });
    assert.equal(aligned.cross_source.compared[0]?.verdict, "independent");
    assert.equal(aligned.cross_source.compared[0]?.difference, 0);
    assert.deepEqual(aligned.cross_source.compared[0]?.contributions.map((item) => item.unit), ["millions", "thousands"]);

    const shared = await audit(skillRoot, runtimeRoot, "cross-source-shared", { records: [
      { statement: "income", line_item: "net_income", period: "FY2025", value: 15, currency: "USD", unit: "millions", source: "Filing", lineage: "one upstream", ...bounded },
      { statement: "income", line_item: "net_income", period: "FY2025", value: 16, currency: "USD", unit: "millions", source: "Vendor", lineage: "one upstream", ...bounded },
    ] });
    assert.equal(shared.cross_source.compared[0]?.verdict, "not_independent");

    const unknown = await audit(skillRoot, runtimeRoot, "cross-source-unknown", { records: [
      { statement: "income", line_item: "net_income", period: "FY2025", value: 15, currency: "USD", unit: "millions", source: "Filing", ...bounded },
      { statement: "income", line_item: "net_income", period: "FY2025", value: 15, currency: "USD", unit: "millions", source: "Vendor", lineage: "vendor feed", ...bounded },
    ] });
    assert.equal(unknown.cross_source.compared[0]?.verdict, "uncertified");

    const unaligned = await audit(skillRoot, runtimeRoot, "cross-source-unaligned", { records: [
      { statement: "income", line_item: "net_income", period: "FY2025", value: 15, currency: "USD", unit: "millions", source: "Filing", lineage: "a", period_start: "2025-01-01", period_end: "2025-12-31" },
      { statement: "income", line_item: "net_income", period: "FY2025", value: 15, currency: "USD", unit: "millions", source: "Vendor", lineage: "b", period_start: "2025-04-01", period_end: "2026-03-31" },
    ] });
    assert.equal(unaligned.cross_source.compared.length, 0);
    assert.equal(unaligned.cross_source.unaligned[0]?.period, "FY2025");
    assert.equal(unaligned.cross_source.unaligned[0]?.bounds.length, 2);
  } finally {
    await rm(runtimeRoot, { recursive: true, force: true });
  }
});

void test("statement audit needs independent price and share lineage without converting share counts", { skip: python === undefined }, async () => {
  const runtimeRoot = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-statements-"));
  try {
    const skillRoot = await prepareSkill(runtimeRoot);
    const marketCap = (shares: Record<string, unknown>, price: Record<string, unknown> = {}) => ({
      statement: "reconciliation", line_item: "market_cap", period: "2026-06-30", value: 5000, currency: "USD", unit: "millions",
      source: "Quote", source_date: "2026-06-30", kind: "computed",
      inputs: [
        { name: "price", value: 50, unit: "ones", currency: "USD", source: "Exchange", lineage: "exchange close", ...price },
        { name: "shares", value: 100, unit: "millions", source: "Filing", lineage: "audited diluted share count", ...shares },
      ],
    });
    const independent = await audit(skillRoot, runtimeRoot, "market-cap", { records: [marketCap({})] });
    assert.equal(independent.market_cap[0]?.verdict, "independent");
    assert.equal(independent.market_cap[0]?.residual, 0);

    const derived = await audit(skillRoot, runtimeRoot, "market-cap-derived", { records: [marketCap({ derived_from: "market_cap divided by price" })] });
    assert.equal(derived.market_cap[0]?.verdict, "not_independent");

    const uncertified = await audit(skillRoot, runtimeRoot, "market-cap-unknown", { records: [marketCap({ lineage: null })] });
    assert.equal(uncertified.market_cap[0]?.verdict, "uncertified");

    const sameLineage = await audit(skillRoot, runtimeRoot, "market-cap-same-lineage", { records: [marketCap({ lineage: "exchange close" })] });
    assert.equal(sameLineage.market_cap[0]?.verdict, "not_independent");

    const declaredCurrency = await audit(skillRoot, runtimeRoot, "market-cap-currency", { records: [marketCap({ currency: "EUR" })] });
    assert.equal(declaredCurrency.market_cap[0]?.verdict, "independent");
    assert.equal(declaredCurrency.market_cap[0]?.residual, 0);
    assert.equal(declaredCurrency.market_cap[0]?.notes.length, 1);

    const noRate = await audit(skillRoot, runtimeRoot, "market-cap-no-rate", { records: [marketCap({}, { currency: "EUR" })] });
    assert.equal(noRate.market_cap[0]?.verdict, "independent");
    assert.equal(noRate.market_cap[0]?.calculation, "not_computed");
    assert.equal(noRate.market_cap[0]?.residual, null);

    const withRate = await audit(skillRoot, runtimeRoot, "market-cap-with-rate", {
      records: [marketCap({}, { currency: "EUR" })],
      fx: [{ from: "EUR", to: "USD", rate: 1.1, source: "Central bank", date: "2025-12-31" }],
    });
    assert.equal(withRate.market_cap[0]?.calculation, "computed");
    assert.notEqual(withRate.market_cap[0]?.residual, null);
  } finally {
    await rm(runtimeRoot, { recursive: true, force: true });
  }
});

void test("statement audit reports currency caliber and only uses supplied exchange-rate evidence", { skip: python === undefined }, async () => {
  const runtimeRoot = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-statements-"));
  try {
    const skillRoot = await prepareSkill(runtimeRoot);
    const records = [
      { statement: "income", line_item: "revenue", period: "FY2025", value: 140, currency: "EUR", unit: "millions", source: "Filing" },
      { statement: "balance", line_item: "assets", period: "FY2025", value: 200, currency: "USD", unit: "millions", source: "Filing" },
    ];
    const missing = await audit(skillRoot, runtimeRoot, "caliber-missing", { reporting_currency: "USD", records });
    assert.equal(missing.currency_caliber[0]?.status, "fx-missing");
    assert.deepEqual(missing.currency_caliber[0]?.unresolved, ["EUR"]);

    const resolved = await audit(skillRoot, runtimeRoot, "caliber-resolved", {
      reporting_currency: "USD",
      records,
      fx: [{ from: "EUR", to: "USD", rate: 1.1, source: "Central bank", date: "2025-12-31" }],
    });
    assert.equal(resolved.currency_caliber[0]?.status, "fx-resolved");
    assert.equal(resolved.currency_caliber[0]?.fx_evidence[0]?.source, "Central bank");
    assert.equal(resolved.currency_caliber[0]?.fx_evidence[0]?.date, "2025-12-31");
  } finally {
    await rm(runtimeRoot, { recursive: true, force: true });
  }
});

void test("statement normalize keeps the period and number-kind fields and still rejects mixed currencies", { skip: python === undefined }, async () => {
  const runtimeRoot = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-statements-"));
  try {
    const skillRoot = await prepareSkill(runtimeRoot);
    const normalized = await runJson(skillRoot, runtimeRoot, "normalize", "normalize", { records: [
      { statement: "income", line_item: "revenue", period: "2025", value: 100, currency: "USD", unit: "millions", source: "Filing", frequency: "annual", fiscal_year: 2025, revision: "as-reported", period_start: "2025-01-01", period_end: "2025-12-31" },
      { statement: "balance", line_item: "assets", period: "2025", value: 200, currency: "USD", unit: "millions", source: "Filing" },
      { statement: "balance", line_item: "liabilities", period: "2025", value: 120, currency: "USD", unit: "millions", source: "Filing" },
      { statement: "balance", line_item: "equity", period: "2025", value: 80, currency: "USD", unit: "millions", source: "Filing" },
    ] });
    const normalizedRecords = normalized.records as Array<Record<string, unknown>>;
    const revenue = normalizedRecords.find((record) => record.line_item === "revenue") ?? {};
    assert.equal(revenue.kind, "actual");
    assert.equal(revenue.period_bounded, true);
    assert.equal(revenue.fiscal_year, 2025);

    const metrics = await runJson(skillRoot, runtimeRoot, "metrics", "metrics", { records: normalized.records });
    const periods = metrics.periods as Array<{ checks: { balance_sheet_residual: number } }>;
    assert.equal(periods[0]?.checks.balance_sheet_residual, 0);

    const mixed = await runStatus(skillRoot, runtimeRoot, "mixed-currency", "metrics", { records: [
      { statement: "income", line_item: "revenue", period: "2025", value: 100, currency: "USD", unit: "millions", source: "Filing" },
      { statement: "income", line_item: "net_income", period: "2025", value: 14, currency: "EUR", unit: "millions", source: "Filing" },
    ] });
    assert.notEqual(mixed, 0);
  } finally {
    await rm(runtimeRoot, { recursive: true, force: true });
  }
});

void test("statement metrics report revenue growth only on a shared chronological basis", { skip: python === undefined }, async () => {
  const runtimeRoot = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-statements-"));
  try {
    const skillRoot = await prepareSkill(runtimeRoot);
    const revenue = (period: string, value: number, extra: Record<string, unknown> = {}) => ({
      statement: "income", line_item: "revenue", period, value, currency: "USD", unit: "millions", source: "Filing", ...extra,
    });

    const years = await metricsOf(skillRoot, runtimeRoot, "growth-years", [revenue("2024", 100), revenue("2025", 110)]);
    assert.equal(years[1]?.order, "year-label");
    assert.equal(years[1]?.metrics.revenue_growth, 0.1);
    assert.equal(years[1]?.revenue_growth_reason, null);

    const currencies = await metricsOf(skillRoot, runtimeRoot, "growth-currency", [revenue("2024", 100), revenue("2025", 110, { currency: "EUR" })]);
    assert.equal(currencies[1]?.metrics.revenue_growth, null);
    assert.ok((currencies[1]?.revenue_growth_reason ?? "").length > 0);

    const frequencies = await metricsOf(skillRoot, runtimeRoot, "growth-frequency", [
      revenue("FY2025", 400, { frequency: "annual", period_start: "2025-01-01", period_end: "2025-12-31" }),
      revenue("2025-Q4", 130, { frequency: "quarter", period_start: "2025-10-01", period_end: "2025-12-31" }),
    ]);
    assert.equal(frequencies[1]?.metrics.revenue_growth, null);
    assert.ok((frequencies[1]?.revenue_growth_reason ?? "").length > 0);

    const dated = await metricsOf(skillRoot, runtimeRoot, "growth-dates", [
      revenue("z", 100, { period_start: "2025-01-01", period_end: "2025-03-31" }),
      revenue("y", 110, { period_start: "2025-04-01", period_end: "2025-06-30" }),
      revenue("x", 121, { period_start: "2025-07-01", period_end: "2025-09-30" }),
    ]);
    assert.deepEqual(dated.map((entry) => entry.period), ["z", "y", "x"]);
    assert.equal(dated[1]?.metrics.revenue_growth, 0.1);
    assert.equal(dated[2]?.metrics.revenue_growth, 0.1);

    const unorderable = await metricsOf(skillRoot, runtimeRoot, "growth-unorderable", [revenue("2024", 100), revenue("2025-H1", 110)]);
    assert.equal(unorderable[1]?.order, null);
    assert.equal(unorderable[1]?.metrics.revenue_growth, null);
    assert.ok((unorderable[1]?.revenue_growth_reason ?? "").length > 0);

    const otherStatement = await metricsOf(skillRoot, runtimeRoot, "growth-other-statement", [
      revenue("2024", 100),
      revenue("2025", 110),
      { statement: "balance", line_item: "revenue", period: "2025", value: 999, currency: "USD", unit: "millions", source: "Note" },
    ]);
    assert.equal(otherStatement[1]?.metrics.revenue_growth, 0.1);

    const mixedCaliber = await metricsOf(skillRoot, runtimeRoot, "ratio-frequency", [
      revenue("2025-Q4", 100, { frequency: "quarter", period_start: "2025-10-01", period_end: "2025-12-31" }),
      { statement: "income", line_item: "gross_profit", period: "2025-Q4", value: 40, currency: "USD", unit: "millions", source: "Filing", frequency: "annual", period_start: "2025-01-01", period_end: "2025-12-31" },
    ]);
    assert.equal(mixedCaliber[0]?.metrics.gross_margin, null);
    assert.ok(Object.keys(mixedCaliber[0]?.ratio_reasons ?? {}).length > 0);

    const income = (lineItem: string, value: number) => ({ statement: "income", line_item: lineItem, period: "2025", value, currency: "USD", unit: "millions", source: "Filing", frequency: "annual", period_start: "2025-01-01", period_end: "2025-12-31" });
    const assets = (date: string) => ({ statement: "balance", line_item: "assets", period: "2025", value: 200, currency: "USD", unit: "millions", source: "Filing", frequency: "instant", period_start: date, period_end: date });

    const stockFlow = await metricsOf(skillRoot, runtimeRoot, "ratio-stock-flow", [income("net_income", 14), assets("2025-12-31")]);
    assert.equal(stockFlow[0]?.metrics.return_on_assets, 0.07);

    const misdated = await metricsOf(skillRoot, runtimeRoot, "ratio-stock-date", [income("net_income", 14), assets("2025-09-30")]);
    assert.equal(misdated[0]?.metrics.return_on_assets, null);
    assert.ok(Object.keys(misdated[0]?.ratio_reasons ?? {}).length > 0);
  } finally {
    await rm(runtimeRoot, { recursive: true, force: true });
  }
});

async function prepareSkill(runtimeRoot: string): Promise<string> {
  const skillRoot = path.join(runtimeRoot, "financial-research-statement-analysis");
  const candidateRoot = path.join(CANDIDATE_ROOT, "financial-research-statement-analysis");
  await mkdir(path.join(skillRoot, "scripts"), { recursive: true });
  await mkdir(path.join(skillRoot, "lib"), { recursive: true });
  await writeFile(path.join(skillRoot, "scripts", "statements.py"), await readFile(path.join(candidateRoot, "scripts", "statements.py")));
  await writeFile(path.join(skillRoot, "lib", "financial_support.py"), await readFile(SUPPORT_SOURCE));
  return skillRoot;
}

async function audit(skillRoot: string, runtimeRoot: string, name: string, payload: unknown): Promise<AuditResult> {
  return await runJson(skillRoot, runtimeRoot, name, "audit", payload) as unknown as AuditResult;
}

async function metricsOf(skillRoot: string, runtimeRoot: string, name: string, records: unknown[]): Promise<PeriodMetrics[]> {
  const result = await runJson(skillRoot, runtimeRoot, name, "metrics", { records });
  return result.periods as PeriodMetrics[];
}

async function runJson(skillRoot: string, runtimeRoot: string, name: string, command: string, payload: unknown): Promise<Record<string, unknown>> {
  const output = path.join(runtimeRoot, name + "-output.json");
  const status = await runStatus(skillRoot, runtimeRoot, name, command, payload);
  assert.equal(status, 0);
  return JSON.parse(await readFile(output, "utf8")) as Record<string, unknown>;
}

async function runStatus(skillRoot: string, runtimeRoot: string, name: string, command: string, payload: unknown): Promise<number> {
  assert.ok(python);
  const input = path.join(runtimeRoot, name + "-input.json");
  const output = path.join(runtimeRoot, name + "-output.json");
  await writeFile(input, JSON.stringify(payload) + "\n", "utf8");
  const result = spawnSync(python.command, [...python.prefix, path.join(skillRoot, "scripts", "statements.py"), command, "--input", input, "--output", output], { encoding: "utf8" });
  return result.status ?? -1;
}
