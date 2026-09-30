---
name: financial-research-competitive-position
description: Compare a company with defensible peers across business model, operating performance, moat durability, relative valuation, and investment attractiveness. Use for competitor analysis, peer benchmarking, market-position review, moat assessment, or comparative investment research.
license: Apache-2.0
metadata:
  vendor: finrobot
  vendor-release: snapshot-2717499
---

# Competitive Position Research

## Purpose and scope

Produce an evidence-backed comparison of a focal company and a defensible peer
set. The Skill supports peer benchmarking, moat analysis, relative valuation,
and investment attractiveness through an Agent procedure; it has no calculation
script because peer selection and comparability are semantic judgments.

Do not use a broad industry label as proof of comparability. Do not use this
Skill when the request is only to normalize one company's statements or perform
a full standalone DCF.

## Inputs and prerequisites

Required inputs are the focal entity, comparison question, as-of date, decision
horizon, candidate peers, and citable evidence. Obtain business mix, geography,
customer type, scale, growth, profitability, capital intensity, balance-sheet
risk, and valuation definitions on aligned dates and units. Ask the user when
the comparison objective or peer boundary would change the result.

Current data may be retrieved through a user-configured browser, filing source,
market-data tool, or local corpus. Disclose tool authority, fields, dates, and
provenance. Never read or persist credentials.

## Workflow

1. Define the focal company, comparison question, as-of date, and candidate peer universe before collecting evidence.
2. Establish inclusion and exclusion criteria based on economic drivers rather
   than sector labels. Evaluate revenue model, end market, customer type,
   geography, scale, growth phase, margins, capital intensity, financing, and
   cyclicality. Record each candidate as included, excluded, or limited-purpose;
   use separate operating and valuation peer groups when appropriate.
3. Align reporting periods, currency, units, accounting definitions, enterprise
   value date, and exceptional events. Reuse the normalized statements and the
   coverage, cross-source, and market-cap audit already produced for the same
   dates, and align the quote and reporting currencies with user-supplied
   exchange-rate evidence that carries a source and date.
4. Compare business model, segment mix, growth, margins, returns, balance-sheet
   capacity, cash conversion, capital allocation, valuation, and relevant
   operating indicators.
5. Test claimed advantages against persistence, substitutability, customer
   behavior, competitive response, and disconfirming evidence. Connect market
   share, pricing power, retention, switching costs, cost advantage, brand,
   intellectual property, regulation, or network effects to an observable
   mechanism and a falsifying metric.
6. Explain relative valuation only after identifying comparability limits and
   currency alignment and the operating differences that could justify a premium
   or discount.
7. Synthesize moat durability, peer advantages, investment attractiveness,
   uncertainty, and monitoring indicators.

## Hard constraints

- Do not select peers solely by industry code, company suggestion, or available
  market data.
- Do not compare unaligned periods, currencies, units, equity values, enterprise
  values, or adjusted metrics without a documented bridge.
- Do not infer moat, quality, rating, or investment attractiveness from a single
  multiple or growth rate.
- Preserve rejected peers, contradictory evidence, data gaps, and structural
  differences that limit comparison.
- Reuse the shared normalized statements and evidence audit for the focal company
  and each peer instead of recomputing the same values.
- Judge evidence independence by provenance lineage, never by source label or
  count, and never resolve a data conflict with a fixed materiality threshold.
- Treat high margins and growth as evidence requiring causal explanation, not
  automatic proof of moat durability.
- External tools retrieve authorized evidence only; they do not decide the peer
  set or the conclusion.

## Responsibilities

Agent procedure: select comparable peers and compare operating, strategic, and financial evidence on aligned definitions. Agent procedure: synthesize moat durability, peer advantages, relative valuation, and investment attractiveness.

The Agent owns peer selection, source quality, normalization judgments, moat
assessment, causal interpretation, valuation-premium reasoning, uncertainty,
and the final conclusion. External tools may retrieve filings and market data
only under user configuration and the stated as-of boundary.

Record each conclusion with evidence, assumptions, counterevidence, and limitations.
Stop when the available evidence cannot support the requested conclusion.

## Outputs and completion

Return the comparison scope, peer inclusion/exclusion ledger, normalized metric
table, business-model comparison, advantage and weakness assessment, relative
valuation interpretation, investment attractiveness, counterevidence,
limitations, and monitoring indicators.

Completion requires a defensible peer set, aligned definitions, citations for
material facts, explicit separation of evidence and judgment, and a conclusion
that survives review of the strongest counterexample.

## Failure handling

If no peer is sufficiently comparable, say so and use narrower reference groups
for individual metrics. If periods or definitions cannot be reconciled, omit the
comparison or present it as non-comparable. If a source conflicts with a filing,
retain both and explain which is authoritative. If current tools are unavailable,
use a dated local corpus and narrow the as-of claim.

## Examples

Happy path: compare Acme with three peers selected by revenue model, customer
base, geography, and capital intensity; align periods; explain why Acme's margin
premium may or may not justify its valuation premium.

Near miss: compare Acme to the five largest companies sharing its industry code
without checking business-model differences. Reject the automatic peer set and
construct a defensible one first.
