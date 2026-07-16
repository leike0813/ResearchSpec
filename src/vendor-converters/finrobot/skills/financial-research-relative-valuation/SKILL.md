---
name: financial-research-relative-valuation
description: Calculate and interpret DCF, peer-multiple, weighted valuation, and sensitivity ranges with explicit assumptions and uncertainty. Use for fair-value analysis, target-price research, relative valuation, EV/EBITDA comparison, margin-of-safety analysis, or valuation sensitivity.
license: Apache-2.0
metadata:
  vendor: finrobot
  vendor-release: snapshot-297a8d2
---

# Relative Valuation Research

## Purpose and scope

Produce reproducible valuation calculations and an evidence-backed
interpretation of fair value, target price, margin of safety, uncertainty, and
rating implications. The script calculates only from explicit assumptions; the
Agent chooses methods, assumptions, peers, weights, and conclusions.

Do not use the Skill to infer a discount rate or target from market price alone,
and do not treat calculated value as investment authorization.

## Inputs and prerequisites

Required inputs are the entity, valuation date, reporting currency, share basis,
decision question, permitted methods, normalized financial values, and explicit
assumptions. State net debt, diluted shares, non-operating items, fiscal timing,
and peer definitions. Ask the user when method, share basis, currency, or
valuation date would materially change the result.

Current financial and market data may come only from user-configured filing,
browser, market-data, or local-corpus tools. Record provenance and date. Never
discover credentials or let provider output determine assumptions automatically.

## Workflow

1. Define the valuation date, currency, share basis, decision question, and permitted methods before selecting assumptions.
2. Reconcile normalized operating inputs, net debt, diluted shares, non-operating
   assets, and peer data to cited evidence. Preserve period convention and state
   whether cash flows are discounted at year end or midyear.
3. Choose defensible methods, forecast cash flows, discount rate, terminal
   growth or exit multiple, peer statistic, and method weights. Explain why each
   fits the decision context. Terminal growth must be economically sustainable;
   peer multiples require aligned enterprise/equity definitions, dates,
   accounting, growth, profitability, capital intensity, and risk.
4. Run `value` for DCF, peer-multiple, or weighted valuation. Inspect all
   intermediate values and warnings.
5. Run `sensitivity` across explicit discount-rate, terminal-growth, multiple,
   revenue, or margin grids relevant to the thesis.
6. Interpret the range rather than selecting the most favorable point. Connect
   differences to assumptions, operating evidence, and uncertainty. Do not
   average incompatible methods merely to create precision.
7. State fair-value range, target price if requested, margin of safety, rating
   rationale, disconfirming evidence, and invalidation conditions.

### Formal entrypoint

Path: `scripts/valuation.py`

Use this entrypoint for every deterministic value or sensitivity command.

```bash
python scripts/valuation.py value --input INPUT.json --output OUTPUT.json
```

```bash
python scripts/valuation.py sensitivity --input INPUT.json --output OUTPUT.json
```

Inputs come from one purpose-specific JSON file containing normalized financial values and explicit assumptions.
`value` accepts explicit `dcf`, `multiples`, or both, plus optional method
weights. DCF requires forecast free cash flows, discount rate, terminal growth,
net debt, and diluted shares. Multiples requires metric, selected multiple, net
debt, and diluted shares. `sensitivity` accepts an explicit base method and grids.

Success writes deterministic JSON to the requested output path and prints its path and SHA-256.
Python 3.11 and the standard library are the only runtime dependencies.
Failure exits nonzero, reports the invalid field on stderr, and leaves existing output unchanged.
Pass `--overwrite` only after explicit authorization.

The entrypoint imports `lib/financial_support.py` before parsing a command.
If the support library is missing, stop because the copied tree is incomplete.

## Hard constraints

- The discount rate must exceed terminal growth; reject invalid combinations.
- Do not infer assumptions, peer sets, method weights, price targets, or ratings
  in the script.
- Preserve currencies, units, valuation dates, share basis, and intermediate
  calculations.
- Do not mix equity and enterprise multiples or stale market values.
- A target price must state its horizon, expected information path, share basis,
  and relationship to the fair-value range.
- Bundled scripts perform no network, credential, installation, or repository
  access and refuse overwrite by default.

## Responsibilities

Agent procedure: choose defensible methods, assumptions, weights, and limitations for the decision context. Agent procedure: interpret fair value, target price, margin of safety, and rating with explicit uncertainty.

The Agent owns source quality, peer selection, normalized inputs, method choice,
assumptions, weights, interpretation, target, rating, and final conclusion. The
script owns validation, DCF, multiples, weighted aggregation, sensitivity,
hashing, and atomic writes.

Record each conclusion with evidence, assumptions, counterevidence, and limitations.
Stop when the available evidence cannot support the requested conclusion.

## Outputs and completion

Return valuation scope, source ledger, normalized inputs, methods and rationale,
assumptions, intermediate calculations, method results, sensitivity tables,
fair-value range, target price and rating if requested, margin of safety,
counterevidence, and limitations.

Completion requires reproducible calculations, valid assumptions, an explained
range, and clear separation between deterministic values and Agent judgment.

## Failure handling

If discount rate is not above terminal growth, stop and correct assumptions. If
peer data are not comparable, exclude the multiple or narrow its weight. If share
count or net debt cannot be reconciled, present enterprise value only or state
the unresolved gap. Fix rejected input rather than bypassing validation.

## Examples

Happy path: calculate Acme's DCF and EV/EBITDA peer value, combine them with
explicit weights, run discount-rate and terminal-growth sensitivity, and explain
the resulting target range.

Near miss: choose the terminal growth rate that reproduces today's share price.
Reject circular calibration unless the user explicitly asks for an implied
assumption analysis and label it accordingly.
