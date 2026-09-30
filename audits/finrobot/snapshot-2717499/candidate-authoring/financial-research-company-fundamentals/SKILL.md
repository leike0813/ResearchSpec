---
name: financial-research-company-fundamentals
description: Analyze a public company's business drivers, historical fundamentals, scenarios, and investment implications. Use when the user requests a company overview, fundamental analysis, operating-driver review, forecast, investment thesis, rating rationale, or evidence-backed financial outlook.
license: Apache-2.0
metadata:
  vendor: finrobot
  vendor-release: snapshot-2717499
---

# Company Fundamentals Research

## Purpose and scope

Build an evidence-backed view of a company's business model, operating drivers,
historical financial trajectory, forecast scenarios, investment thesis, and
rating rationale. This Skill supports consequential conclusions but does not
replace professional judgment or authorize trades.

Do not use it for statement-only normalization, peer-only comparison, event-only
analysis, or a valuation with no operating thesis; route those tasks to the
corresponding financial-research Skill.

## Inputs and prerequisites

Required inputs are the company and legal entity, reporting currency, as-of
date, decision question, period range, and citable disclosures or user-provided
data. Identify units, fiscal calendars, restatements, and whether values are
reported or adjusted. Ask the user before proceeding when entity scope, as-of
date, currency, or decision purpose would materially change the result.

Current data may be retrieved only through a user-configured browser, filing
source, market-data tool, or local corpus. The Agent must disclose the provider,
requested fields, date boundary, and returned provenance before relying on it.
Never discover credentials, persist secrets, or treat provider output as a
conclusion.

## Workflow

1. Define the company, reporting currency, as-of date, and decision question before collecting evidence.
2. Build a source ledger that separates audited filings, company disclosures,
   market data, third-party research, and user assumptions. Prefer primary
   filings for reported facts; reconcile earnings releases and investor
   materials to the filed period. Align fiscal calendars, period length,
   currencies, units, restatements, acquisitions, divestitures, discontinued
   operations, and reported versus adjusted definitions.
3. Describe the business model, segments, customers, geography, and revenue
   logic from cited evidence. Connect disclosed business highlights to
   measurable drivers and limits.
4. Prepare normalized period values and run `metrics`. Inspect growth, margins,
   returns, leverage, cash conversion, and any missing denominators. Reuse the
   normalized statements and the period coverage, cross-source, and market-cap
   audit already produced for the same entity, period, and currency instead of
   recomputing them.
5. Choose base, upside, and downside driver assumptions. The base case is the
   best-supported path, not an arithmetic midpoint. Change coherent driver sets,
   avoid double-counting one shock across revenue and margin, and record each
   value, applicable years, source, rationale, confidence, and invalidation
   condition before running `forecast`.
6. Interpret the calculated output. Distinguish historical facts, deterministic
   calculations, assumptions, forecasts, and Agent judgments.
7. Synthesize the operating profile, financial trajectory, investment thesis,
   risks, disconfirming evidence, valuation implications, rating rationale, and
   monitoring indicators.

### Formal entrypoint

Path: `scripts/fundamentals.py`

Use this entrypoint for every deterministic metrics or forecast command.

Minimal command:

```bash
python scripts/fundamentals.py metrics --input INPUT.json --output OUTPUT.json
```

Forecast command:

```bash
python scripts/fundamentals.py forecast --input INPUT.json --output OUTPUT.json
```

Inputs come from one purpose-specific JSON file containing normalized periods and explicit assumptions.
For `metrics`, provide `currency`, `unit`, and `periods`; each period has a label
and any available revenue, operating income, net income, assets, equity, debt,
cash, and operating cash flow. For `forecast`, provide `base_period`, explicit
scenario assumptions, and forecast years.

Success writes deterministic JSON to the requested output path and prints its path and SHA-256.
Python 3.11 and the standard library are the only runtime dependencies.
Failure exits nonzero, reports the invalid field on stderr, and leaves existing output unchanged.
Pass `--overwrite` only after the user has authorized replacing the named output.

The entrypoint imports `lib/financial_support.py` before parsing a command.
If the support library is missing, stop because the copied tree is incomplete.

## Hard constraints

- Preserve source dates, reporting periods, currencies, units, and restatement
  status; never silently coerce incomparable data.
- Keep actual, computed, assumed, forecast, and unsupported numbers
  distinguishable, and consume the shared statement normalization and evidence
  audit rather than recomputing the same values.
- Judge evidence independence by provenance lineage, never by source count, and
  withdraw or restate a rating, target, or thesis whose supporting number is
  invalidated.
- Treat management targets as attributed guidance rather than observed
  performance, and preserve both original and overridden assumptions.
- Do not invent missing values, citations, peers, management guidance, ratings,
  targets, or probabilities.
- Do not let a script choose source quality, forecast assumptions, business
  meaning, materiality, investment thesis, or rating.
- Do not run network calls, credential lookup, dependency installation, or
  repository-local imports through bundled scripts.
- Do not overwrite an output without explicit `--overwrite` authorization.
- Label estimates and user assumptions and retain contradictory evidence.

## Responsibilities

The Agent selects and evaluates sources, interprets the business model, chooses
forecast drivers and scenarios, resolves conflicts, assesses materiality, and
writes the thesis and rating rationale. Agent procedure: connect disclosed business highlights to measurable drivers and limits. Agent procedure: describe the business model, segments, customers, geography, and revenue logic from cited evidence. Agent procedure: choose forecast assumptions and explain why each assumption fits the evidence. Agent procedure: synthesize the operating profile, financial trajectory, and investment thesis. Agent procedure: rank the decision-relevant takeaways and identify disconfirming evidence. Agent procedure: classify each material number as actual, computed, assumed, or forecast and retain its source, dependencies, and limitations.

The Agent re-evaluates any rating, target, or thesis whose supporting number was
invalidated instead of retaining the earlier conclusion.

The script validates structured input, calculates ratios and scenario paths,
sorts output deterministically, hashes the result, and writes atomically. It
does not retrieve data or generate semantic conclusions.

Record each conclusion with evidence, assumptions, counterevidence, and limitations.
Stop when the available evidence cannot support the requested conclusion.

## Outputs and completion

Return a report containing scope and as-of date, source ledger, business model,
historical metrics, scenario assumptions, forecast tables, thesis, catalysts,
risks, valuation implications, rating rationale, limitations, and monitoring
indicators. Link every material statement to evidence or label it as an
assumption or calculation.

The task is complete when calculations are reproducible from the saved input,
all semantic conclusions are traceable, conflicting evidence is addressed, and
the user can distinguish facts, assumptions, forecasts, and judgments.

## Failure handling

If required scope is ambiguous, ask one focused question before collecting more
data. If sources conflict, preserve both and explain the resolution or leave the
point unresolved. If a script rejects input, fix the named field; do not bypass
validation. If current data tools are unavailable, continue only with a clearly
dated user-provided corpus and narrow the conclusion. Preserve existing outputs
unless replacement is explicitly authorized.

## Examples

Happy path: “Analyze Acme's five-year fundamentals and build three revenue and
margin scenarios as of 2026-06-30.” Align the five years, run `metrics`, record
three explicit scenario payloads, run `forecast`, then interpret the result with
cited evidence and counterevidence.

Near miss: “Tell me whether Acme is a buy” with no entity, as-of date, evidence,
or decision horizon. Ask for the missing scope and do not manufacture a rating.
