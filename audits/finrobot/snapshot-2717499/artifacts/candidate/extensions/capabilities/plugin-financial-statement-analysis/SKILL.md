---
name: plugin-financial-statement-analysis
description: Normalize financial statement records and produce an evidence-backed statement analysis brief for one graph node.
metadata:
  capability_id: plugin-financial-statement-analysis
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: Apache-2.0
---

# Financial Statement Research

## Purpose and scope

Create a reproducible normalized statement set, calculate stable ratios and
checks, and interpret earnings quality and financial trajectory. The script
does not parse arbitrary PDFs or APIs: the Agent or user-configured tools extract
source values and provenance, then the script validates purpose-specific JSON.

Do not use this Skill to make an investment rating without a broader thesis, or
to hide unresolved accounting definitions behind normalized numbers.

## Inputs and prerequisites

Required inputs are the entity, reporting periods, currency, unit, consolidation
scope, accounting basis, source locations, and statement records. Record fiscal
calendar, period duration, restatement status, sign convention, reported versus
adjusted values, and provenance for every material line. Ask the user when entity
scope, accounting basis, currency, or period selection is ambiguous.

User-configured filing, browser, extraction, or market-data tools may provide
source values. The Agent must verify the relevant pages or sections and record
tool, source, date, units, and confidence. Never discover credentials or upload
private statements without authorization.

Each statement record carries `period` plus optional `period_start`, `period_end`,
`frequency`, `fiscal_year`, `revision`, `kind`, `source_date`, `lineage`, and
`inputs`. `frequency` is one of `annual`, `quarter`, `ttm`, `ytd`, or `instant`.
`kind` is one of `actual`, `computed`, `assumed`, `forecast`, or `unsupported` and
defaults to `actual`. `inputs` lists the named inputs of a derived value, each
with its own source, source date, unit, lineage, and optional currency.

## Workflow

1. Define the entity, reporting periods, currency, units, consolidation scope, and accounting basis before normalizing statements.
2. Extract values with provenance. Separate income statement, balance sheet,
   cash flow, segment, and non-GAAP reconciliation records.
3. Run `normalize` to validate line names, periods, units, signs, and duplicate
   keys and to produce stable statement records. Map a line only when its
   economic definition is clear; preserve source-specific labels when definitions
   differ, and never fill a missing value with zero.
4. Review restatements, missing values, classification differences, exceptional
   items, acquisitions, divestitures, and changes in segment definitions.
5. Run `metrics` to calculate growth, margins, returns, leverage, liquidity,
   cash conversion, and available three-statement checks. Report each residual
   with its exact formula and likely classification causes rather than forcing a
   balance. Compare revenue only against the immediately preceding period in
   chronological order when both share one currency and one frequency, so a
   reported growth never mixes periods or statements. For non-GAAP bridges,
   retain the starting measure, adjustments, tax treatment, scope, period, and
   recurring status.
6. Run `audit` to check period coverage, cross-source reconciliation, currency
   caliber, and any market-cap cross-check. Carry every gap, overlap, unaligned
   period, conflict, and missing exchange-rate item forward as an explicit
   unresolved finding.
7. If a forecast is required, record explicit driver assumptions and run
   `forecast`; review whether income, balance-sheet, and cash-flow effects remain
   coherent. Flag an incomplete model instead of inventing a balancing entry.
8. Assess segment mix, earnings quality, financial trajectory, anomalies,
   accounting limits, and disconfirming evidence.

### Formal entrypoint

Path: `tools/statements.py`

Use this entrypoint for every deterministic normalize, metrics, or forecast command.

```bash
python tools/statements.py normalize --input INPUT.json --output OUTPUT.json
```

```bash
python tools/statements.py metrics --input NORMALIZED.json --output METRICS.json
```

```bash
python tools/statements.py forecast --input FORECAST.json --output OUTPUT.json
```

```bash
python tools/statements.py audit --input INPUT.json --output OUTPUT.json
```

Inputs come from one purpose-specific JSON file containing statement records or explicit forecast assumptions.
Normalize records require `statement`, `line_item`, `period`, `value`, `currency`,
`unit`, and `source`; optional `reported_label`, `restated`, `adjustment`, the
period and number-kind fields above, and derived-value `inputs` keep provenance.
Metrics consumes normalized records. Forecast consumes a base period,
years, and explicit revenue, margin, tax, depreciation, capital expenditure,
working-capital, and financing assumptions as applicable.

Metrics reports, for each period, the comparison basis in `order` (`period-dates`
or `year-label`, otherwise null) and `revenue_growth_reason`. A reported growth
requires the same currency, the same frequency, and one order basis for the period
and its immediate predecessor; an undeclared currency, frequency, or order basis
leaves `revenue_growth` null with the reason stated. Revenue is the income-statement
`revenue` line item only, so a line of the same name on another statement never
enters growth or margin inputs.

Each ratio also needs one duration caliber: a flow and a stock combine only when
the instant date equals the flow period end, a period rejects two different
periods declared for one frequency, and any ratio withheld for caliber is named
in `ratio_reasons`.

Audit reads the same records plus an optional `reporting_currency`, an optional
`windows` list of target periods, and an optional `fx` list of user-supplied
`from`, `to`, `rate`, `source`, and `date` entries. It reports per-chain period
coverage of bounded `annual`, `quarter`, `ttm`, and `ytd` chains, cross-source
differences aligned on period bounds, market-cap cross-checks, and per-period
currency caliber. An `instant` period never forms a coverage chain and is never
certified. Coverage is certified only for a declared window that one contiguous
chain of actual periods matches exactly, and
the certification covers the calendar window alone, never the amount of a trailing
twelve month total. It never derives an exchange rate, ranks sources by count, or
applies a numeric materiality threshold.

Success writes deterministic JSON to the requested output path and prints its path and SHA-256.
Python 3.11 and the standard library are the only runtime dependencies.
Failure exits nonzero, reports the invalid field on stderr, and leaves existing output unchanged.
Pass `--overwrite` only after explicit authorization.

The entrypoint imports `tools/financial_support.py` before parsing a command.
If the support library is missing, stop because the copied tree is incomplete.

## Hard constraints

- Preserve source, period, currency, unit, sign, restatement, and reported label.
- Do not infer missing values, arbitrary taxonomy mappings, or semantic
  adjustments in the script.
- Do not treat a failed reconciliation as zero; surface the residual and reason.
- Do not mix reported and adjusted measures without a visible bridge.
- Preserve both original and normalized values whenever unit or sign changes.
- Certify period coverage only when a declared window is matched exactly by one
  contiguous chain of actual periods that each carry explicit `period_start` and
  `period_end`, and report the covered interval alone when no window is declared.
  Certification covers the calendar window, never the amount of a trailing twelve
  month total, partial quarters never chain into a certified total, and an
  `instant` period is never certified.
- Keep actual, computed, assumed, forecast, and unsupported numbers
  distinguishable in every output.
- Compare revenue only between periods that establish chronological order from
  explicit period dates or an explicit numeric year label and share one currency
  and one frequency; otherwise report growth as null with the reason stated, and
  never order periods by comparing label strings.
- Compare aligned periods only when both sides define the same `period_start` and
  `period_end`, and compare base units after unit normalization instead of
  splitting the comparison by unit label.
- Keep as-reported and restated revisions in separate coverage and comparison
  chains; never stitch a declared window across revisions, and report periods
  that share a label but not their bounds.
- Judge source independence by provenance `lineage`, never by source label or
  count; a missing lineage leaves independence uncertified.
- Treat a market-cap cross-check as independent only when price and shares carry
  distinct lineages and neither is derived from the reported market cap, and read
  the calculation status separately: a null residual means the conversion was not
  computed, not that the cross-check passed.
- Convert currencies only from user-supplied evidence that carries an explicit
  source and a date the Agent has confirmed for the reporting period; a supplied
  date alone does not establish the applicable financial caliber. Never infer a
  rate, and never apply a rate to a share count.
- Bundled scripts perform no network, credential, installation, or repository
  access and refuse overwrite by default.

## Responsibilities

Agent procedure: assess segment mix, segment definition changes, allocation limits, and concentration evidence. Agent procedure: explain earnings quality and financial trajectory using normalized calculations and cited disclosures.

The Agent owns source verification, taxonomy mapping, restatement treatment,
normalization judgment, anomaly interpretation, forecast assumptions, segment
analysis, earnings-quality assessment, and final conclusions. The script owns
structural validation, stable normalization, deterministic ratios and checks,
forecast arithmetic, hashing, and atomic writes.

The Agent reads the audit output, explains each unresolved coverage, conflict,
caliber, and independence finding, and re-evaluates every conclusion that depends
on an invalidated number instead of carrying a prior rating forward.

Record each conclusion with evidence, assumptions, counterevidence, and limitations.
Stop when the available evidence cannot support the requested conclusion.

## Outputs and completion

Return scope, source and normalization ledger, normalized statements, calculated
ratios, reconciliation results, segment findings, anomalies, forecast and
assumptions when requested, earnings-quality assessment, financial trajectory,
counterevidence, limitations, and the period-coverage, cross-source, currency,
and market-cap audit findings.

Completion requires traceable normalized values, explicit unresolved residuals,
reproducible calculations, and separation of reported facts, adjustments,
assumptions, calculations, and Agent interpretation.

## Failure handling

If a value lacks unit, currency, period, or source, stop and correct it. If two
reported values conflict, preserve both until the restatement or scope difference
is resolved. If an extraction tool cannot verify its output, cite the source page
and mark the record unverified. If a script rejects input, fix the field instead
of bypassing validation.

## Examples

Happy path: normalize Acme's three annual statements, calculate margins,
leverage, cash conversion and three-statement checks, then explain earnings
quality and the causes of a reconciliation residual.

Near miss: feed an arbitrary PDF path to the script and expect semantic
extraction. Use a user-configured extraction tool, verify and structure the
records, then run `normalize`.

## ResearchSpec node contract

Execute exactly one ResearchSpec capability node. Input: `task_request` (plugin-task.v1). Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path. Required brief sections: `scope`, `source_ledger`, `normalized_statements`, `metrics`, `conclusions`, `evidence_checks`. All sections must carry evidence or explicit limitations.

Return the declared outputs and follow the active procedure packet. In standalone mode, report ordinary output paths without modifying ResearchSpec workflow state. In graph mode, use only the packet's handoff and exact advance selector.
