---
name: financial-research-statement-analysis
description: Normalize and analyze income statements, balance sheets, cash flows, segments, reconciliations, ratios, anomalies, forecasts, and accounting quality. Use for financial-statement analysis, three-statement review, earnings-quality research, statement normalization, ratio analysis, or forecast consistency checks.
license: Apache-2.0
metadata:
  vendor: finrobot
  vendor-release: snapshot-297a8d2
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
   balance. For non-GAAP bridges, retain the starting measure, adjustments, tax
   treatment, scope, period, and recurring status.
6. If a forecast is required, record explicit driver assumptions and run
   `forecast`; review whether income, balance-sheet, and cash-flow effects remain
   coherent. Flag an incomplete model instead of inventing a balancing entry.
7. Assess segment mix, earnings quality, financial trajectory, anomalies,
   accounting limits, and disconfirming evidence.

### Formal entrypoint

Path: `scripts/statements.py`

Use this entrypoint for every deterministic normalize, metrics, or forecast command.

```bash
python scripts/statements.py normalize --input INPUT.json --output OUTPUT.json
```

```bash
python scripts/statements.py metrics --input NORMALIZED.json --output METRICS.json
```

```bash
python scripts/statements.py forecast --input FORECAST.json --output OUTPUT.json
```

Inputs come from one purpose-specific JSON file containing statement records or explicit forecast assumptions.
Normalize records require `statement`, `line_item`, `period`, `value`, `currency`,
`unit`, and `source`; optional `reported_label`, `restated`, and `adjustment` keep
provenance. Metrics consumes normalized records. Forecast consumes a base period,
years, and explicit revenue, margin, tax, depreciation, capital expenditure,
working-capital, and financing assumptions as applicable.

Success writes deterministic JSON to the requested output path and prints its path and SHA-256.
Python 3.11 and the standard library are the only runtime dependencies.
Failure exits nonzero, reports the invalid field on stderr, and leaves existing output unchanged.
Pass `--overwrite` only after explicit authorization.

The entrypoint imports `lib/financial_support.py` before parsing a command.
If the support library is missing, stop because the copied tree is incomplete.

## Hard constraints

- Preserve source, period, currency, unit, sign, restatement, and reported label.
- Do not infer missing values, arbitrary taxonomy mappings, or semantic
  adjustments in the script.
- Do not treat a failed reconciliation as zero; surface the residual and reason.
- Do not mix reported and adjusted measures without a visible bridge.
- Preserve both original and normalized values whenever unit or sign changes.
- Bundled scripts perform no network, credential, installation, or repository
  access and refuse overwrite by default.

## Responsibilities

Agent procedure: assess segment mix, segment definition changes, allocation limits, and concentration evidence. Agent procedure: explain earnings quality and financial trajectory using normalized calculations and cited disclosures.

The Agent owns source verification, taxonomy mapping, restatement treatment,
normalization judgment, anomaly interpretation, forecast assumptions, segment
analysis, earnings-quality assessment, and final conclusions. The script owns
structural validation, stable normalization, deterministic ratios and checks,
forecast arithmetic, hashing, and atomic writes.

Record each conclusion with evidence, assumptions, counterevidence, and limitations.
Stop when the available evidence cannot support the requested conclusion.

## Outputs and completion

Return scope, source and normalization ledger, normalized statements, calculated
ratios, reconciliation results, segment findings, anomalies, forecast and
assumptions when requested, earnings-quality assessment, financial trajectory,
counterevidence, and limitations.

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
