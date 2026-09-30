---
name: financial-research-relative-valuation
description: Calculate and interpret DCF, peer-multiple, weighted valuation, and sensitivity ranges with explicit assumptions and uncertainty. Use for fair-value analysis, target-price research, relative valuation, EV/EBITDA comparison, margin-of-safety analysis, or valuation sensitivity.
license: Apache-2.0
metadata:
  vendor: finrobot
  vendor-release: snapshot-2717499
---

# Relative Valuation Research

## Purpose and scope

Produce reproducible valuation calculations and an evidence-backed
interpretation of fair value, target price, margin of safety, uncertainty, and
rating implications. The script calculates only from explicit assumptions; the
Agent chooses methods, assumptions, peers, weights, and conclusions.

Do not use the Skill to infer a discount rate or target from market price alone,
and do not treat calculated value as investment authorization.

Method applicability is an Agent judgment, not a label match. For banks and
balance-sheet-driven insurers, enterprise-value and free-cash-flow methods do not
apply automatically; choose the methods the business model supports instead of
forcing a DCF or EV multiple. Express a loss-making company's price-to-earnings
as `NM` (not meaningful) rather than a number, and never let an industry name or
substring select a method on its own.

## Inputs and prerequisites

Required inputs are the entity, valuation date, reporting currency, share basis,
decision question, permitted methods, normalized financial values, and explicit
assumptions. State net debt, preferred stock, noncontrolling interest, diluted
shares, non-operating items, fiscal timing, and peer definitions. Ask the user
when method, share basis, currency, or valuation date would materially change the
result.

Current financial and market data may come only from user-configured filing,
browser, market-data, or local-corpus tools. Record provenance and date. Never
discover credentials or let provider output determine assumptions automatically.

## Workflow

1. Define the valuation date, currency, share basis, decision question, and permitted methods before selecting assumptions.
2. Reconcile normalized operating inputs, net debt, preferred stock,
   noncontrolling interest, diluted shares, non-operating assets, and peer data
   to cited evidence. Preserve period convention and keep the money and share
   scales aligned. The script discounts every cash flow at year end; midyear
   convention is not supported.
3. Choose defensible methods, forecast cash flows, discount rate, terminal
   growth or exit multiple, peer statistic, and method weights. Explain why each
   fits the decision context. Terminal growth must be economically sustainable;
   peer multiples require aligned enterprise/equity definitions, dates,
   accounting, growth, profitability, capital intensity, and risk.
4. Run `value` for DCF, peer-multiple, or weighted valuation. Inspect all
   intermediate values, diagnostics, and uncertified reasons.
5. Run `sensitivity` for explicit discount-rate and terminal-growth grids (DCF)
   or multiple grids (peer multiple). For revenue, margin, or other operating
   sensitivity, recompute the free-cash-flow or metric base from explicit
   assumptions and re-run `value`; the grid command adds no method.
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

The `value` payload defines these fields:

- `currency` and `unit`: the ISO currency code requested for the run and the single scale applied to every monetary amount and every share count. `unit: millions` means millions of `currency` and also millions of shares, so a per-share value is in `currency` units because the scale cancels. Do not mix share counts on another scale, such as actual ones, into a run declared in millions.
- `period`, `as_of`, `share_basis`, `applicability`: caller-supplied valuation metadata. `period` is the financial period the methods value (`FY2025`, `TTM`), `as_of` is the valuation date (`YYYY-MM-DD`), `share_basis` names the share-count basis such as `diluted`, and `applicability` states why the chosen methods suit the entity's business model and data.
- `weight_rationale`: the reason the chosen weights hold; required to certify a weighted composite.
- `dcf`: `free_cash_flows`, `discount_rate`, `terminal_growth`, `net_debt`, `diluted_shares`, and optional `preferred_stock` and `noncontrolling_interest`.
- `multiples`: `metric`, `selected_multiple`, `net_debt`, `diluted_shares`, and optional `preferred_stock` and `noncontrolling_interest`.
- `weights`: per-method weights that sum to 1, with one entry per present method.
- Any `dcf` or `multiples` object may carry its own `currency`, `period`, `as_of`, or `share_basis` to record parameters that differ from the run-wide basis.

The script refuses any field it does not define instead of ignoring it. Supply `net_debt` alone: `debt`, `total_debt`, `cash`, and `cash_and_equivalents` are rejected when combined with `net_debt` because the bridge already nets debt and cash.

### Units and per-share output

`unit` is one run-wide scale for money and shares together; there is no separate
shares scale. The output states `share_count_unit` so the share-count scale is
explicit, and every method carries `value_per_share_currency`. The run `currency`
is only the requested label: a method may override it, and that method's
`metadata` and `value_per_share_currency` are authoritative for its own per-share
values. Do not compare or average per-share values from methods whose resolved
currency differs.

### Equity bridge

`net_debt` is total debt minus cash and equivalents. `preferred_stock` and
`noncontrolling_interest` are separate claims the bridge deducts once each; they
are never folded into `net_debt` and must be non-negative. Common equity is
`enterprise value - net_debt - preferred_stock - noncontrolling_interest`, and
the per-share value divides that equity by `diluted_shares`. When
`preferred_stock` or `noncontrolling_interest` is absent, the script records an
unverified claim, assumes zero for a single-method conditional estimate, and
reports it in `composite.advisories`; that assumed zero never certifies a
weighted composite. Because the methods price one issuer, they must use identical
`net_debt`, `preferred_stock`, and `noncontrolling_interest` to certify a
composite; differing bridge inputs block it.

### Composite certification

A weighted composite is certified only when both methods share one currency,
financial period, valuation date, share basis, diluted share count, and bridge
inputs; the caller supplies `weight_rationale` and `applicability`; the weights
sum to 1; and no bridge claim is unverified. Otherwise the script reports each
method with diagnostics, keeps every unverified claim in `composite.advisories`,
and publishes no blended point. Divergence, spread, and the terminal-value share
of enterprise value are diagnostics; no threshold selects a method and the
script never falls back to an alternate method, discount rate, or industry
heuristic. When a method overrides `currency`, per-share values are not
comparable: the spread and span diagnostics are reported as null and each
method's own metadata governs.

A single-method run returns that method's value with weight 1 and reports it as
uncertified, because no second method corroborates it.

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
- `net_debt` is required; a missing net debt or a non-positive terminal cash flow is rejected, never defaulted to zero.
- A non-positive common equity value fails the run instead of publishing a negative fair value.
- The script refuses undefined fields; `debt`, `total_debt`, `cash`, and `cash_and_equivalents` must not be combined with `net_debt`.
- `preferred_stock` and `noncontrolling_interest` must be non-negative; a missing value stays an unverified advisory rather than a certified zero.
- Do not infer assumptions, peer sets, method weights, price targets, or ratings
  in the script.
- Preserve currencies, units, valuation dates, share basis, and intermediate
  calculations.
- Do not mix equity and enterprise multiples or stale market values.
- A weighted composite requires one currency, financial period, valuation date, share basis, and diluted share count, identical `net_debt`, `preferred_stock`, and `noncontrolling_interest` across methods, plus `weight_rationale` and `applicability`, with no unverified bridge claim; otherwise the script reports methods with diagnostics instead of a blended point.
- Divergence, spread, and terminal-value share are diagnostics; they never select a method, apply a fixed threshold, or fall back to an alternate method.
- One `unit` scale covers money and shares; per-share values are in each method's resolved currency, and cross-currency spread or span diagnostics are null.
- A target price must state its horizon, expected information path, share basis,
  and relationship to the fair-value range.
- Bundled scripts perform no network, credential, installation, or repository
  access and refuse overwrite by default.

## Responsibilities

Agent procedure: choose defensible methods, assumptions, weights, and limitations for the decision context. Agent procedure: interpret fair value, target price, margin of safety, and rating with explicit uncertainty.

The Agent owns source quality, peer selection, normalized inputs, method choice,
assumptions, weights, interpretation, target, rating, and final conclusion. The
script owns validation, the equity bridge, DCF, multiples, weighted
certification, sensitivity, hashing, and atomic writes.

Record each conclusion with evidence, assumptions, counterevidence, and limitations.
Stop when the available evidence cannot support the requested conclusion.

## Outputs and completion

Return valuation scope, source ledger, normalized inputs, methods and rationale,
assumptions, intermediate calculations, bridge components, method results with
their resolved currency and `value_per_share_currency`, `share_count_unit`,
composite certification and advisories, sensitivity tables, diagnostics,
fair-value range, target price and rating if requested, margin of safety,
counterevidence, and limitations.

Completion requires reproducible calculations, valid assumptions, an explained
range, and clear separation between deterministic values and Agent judgment.

## Failure handling

If discount rate is not above terminal growth, stop and correct assumptions. If
the terminal cash flow or common equity value is non-positive, treat the method
as inapplicable and state why. If peer data are not comparable, exclude the
multiple or narrow its weight. If the currency, valuation date, share basis,
share count, or bridge inputs differ across methods, certify no composite and
report each method; read a method's currency from its own metadata rather than
the requested run currency. If an unverified bridge claim matters, resolve it
before relying on the equity value.
If share count or net debt cannot be reconciled, present enterprise value only
or state the unresolved gap. Fix rejected input rather than bypassing validation.

## Examples

Happy path: calculate Acme's DCF and EV/EBITDA peer value on one currency, date,
and diluted share basis, supply the weight rationale and applicability, combine
them with explicit weights, run discount-rate and terminal-growth sensitivity,
and explain the resulting target range.

Near miss: combine a USD DCF with a EUR peer multiple. The script certifies no
composite, reports each method with the currency mismatch, reports null spread
and span diagnostics, and publishes no blended point.

Near miss: combine two methods that share a currency but use different net debt
or preferred-stock bridge values. The script certifies no composite because one
issuer cannot carry two different bridges.

Near miss: supply `net_debt` together with `debt` and `cash`. The script rejects
the input instead of deducting the bridge twice.

Near miss: choose the terminal growth rate that reproduces today's share price.
Reject circular calibration unless the user explicitly asks for an implied
assumption analysis and label it accordingly.
