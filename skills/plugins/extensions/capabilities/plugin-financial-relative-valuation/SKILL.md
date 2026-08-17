---
name: plugin-financial-relative-valuation
description: Calculate and interpret DCF, peer-multiple, weighted valuation, and sensitivity ranges in an evidence-backed brief for one graph node.
metadata:
  capability_id: plugin-financial-relative-valuation
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: Apache-2.0
---

# Relative Valuation Research

Execute exactly one ResearchSpec capability node.

## Inputs

- `task_request` (plugin-task.v1)

## Outputs

- `research_brief` (plugin-result.v1): a JSON object at the declared output path.

## Knowledge

- Load knowledge ID `relative-valuation-tool` from `tools/valuation.py`.
- Load knowledge ID `financial-support` from `tools/financial_support.py`.

## Procedure

Work from `task_request` and produce a JSON `research_brief`.

1. Define the valuation date, currency, share basis, decision question, and permitted methods before selecting assumptions.
2. Reconcile normalized operating inputs, net debt, diluted shares, non-operating assets, and peer data to cited evidence. Preserve period convention and state whether cash flows are discounted at year end or midyear.
3. Choose defensible methods, forecast cash flows, discount rate, terminal growth or exit multiple, peer statistic, and method weights. Explain why each fits the decision context. Terminal growth must be economically sustainable; peer multiples require aligned definitions, dates, accounting, growth, profitability, capital intensity, and risk.
4. Write the normalized values and explicit assumptions into a purpose-specific JSON file and run the packaged tool through the host Agent's Python runtime:
   `python3 tools/valuation.py value --input valuation-input.json --output value-results.json`.
5. Run sensitivity grids relevant to the thesis:
   `python3 tools/valuation.py sensitivity --input sensitivity-input.json --output sensitivity-results.json`.
6. Interpret the range rather than selecting the most favorable point. Connect differences to assumptions, operating evidence, and uncertainty. Do not average incompatible methods merely to create precision.
7. Write the `research_brief` JSON with these required sections: `scope`, `source_ledger`, `assumptions`, `method_results`, `sensitivity`, `fair_value_range`, and `conclusions`. Include target price and rating only if requested, with horizon, expected information path, and share basis; include margin of safety, counterevidence, and limitations.

## Hard constraints

- The discount rate must exceed terminal growth; reject invalid combinations.
- Do not infer assumptions, peer sets, method weights, price targets, or ratings in the script.
- Preserve currencies, units, valuation dates, share basis, and intermediate calculations.
- Do not mix equity and enterprise multiples or stale market values.
- The tool uses only Python 3.11 and the standard library. It performs no network, credential, installation, or repository access and refuses to overwrite without explicit `--overwrite`.
- If the support library is missing, stop; the copied tool tree is incomplete.

## Failure handling

- If discount rate is not above terminal growth, stop and correct assumptions.
- If peer data are not comparable, exclude the multiple or narrow its weight.
- If share count or net debt cannot be reconciled, present enterprise value only or state the unresolved gap.
- Fix rejected input rather than bypassing validation.

## Completion

When the brief is written, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
