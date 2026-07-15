---
name: financial-research-statement-analysis
description: "Analyze statements, segments, reconciliations, anomalies, forecasts, and accounting quality."
license: Apache-2.0
compatibility: "Static Skill with agent-invoked Python and AgentSpec resources; external providers and credentials remain user-configured."
metadata:
  vendor: finrobot
  vendor-release: snapshot-297a8d2
  source-revision: 297a8d28d099be328c8a8eb658b4f782b93f3651
  source-capability-id: financial-statement-analysis
  researchspec-role: semantic-helper
---

# Financial Statement Research

Analyze statements, segments, reconciliations, anomalies, forecasts, and accounting quality.

## Provenance and attribution

This Skill includes source-derived materials from the official FinRobot repository at immutable revision `297a8d28d099be328c8a8eb658b4f782b93f3651`. See `DERIVATION.json` for file hashes and adaptation actions, and `LICENSE` and `NOTICE` for licensing and attribution. ResearchSpec is independent from FinRobot and is not endorsed by it.

## Financial statement analysis

Analyze the income statement, balance sheet, cash-flow statement, and segment disclosures over the requested historical and forecast periods. Reconcile related lines across statements, identify accounting-policy or presentation changes, normalize one-offs when justified, calculate growth, margins, returns, leverage, liquidity, cash conversion, and per-share measures, and investigate anomalies rather than smoothing them away.

Use `resources/python/financial_analyzer.py` to assemble source-bound prompts from market and filing providers. Use `financial_data_processor.py` for extraction, historical metrics, and forecast tables. The processor's forecast assumptions, including the PE annual factor, are explicit inputs and may be replaced with task-specific values. Use `provider_contracts.py` and `provider_adapters.py` only when external retrieval is authorized.

State whether each number is reported, adjusted, estimated, or calculated. Show reconciliation breaks and competing interpretations. The analysis may reach conclusions about earnings quality, liquidity, solvency, operating leverage, and financial trajectory; label the evidentiary and assumption basis for each conclusion.


## Operating contract

Use this Skill as a financial-research tool. It may retrieve data through user-configured providers, run the bundled Python resources through a user-approved execution environment, calculate scenarios, make analytical judgments, and produce ratings, target values, probabilities, sentiment assessments, forecasts, or investment implications when the task calls for them. Do not treat those outputs as guaranteed outcomes.

ResearchSpec only distributes static files: its converter, checker, packager, installer, and registry assembler never import or execute the Python resources, initialize provider SDKs, contact services, or read credentials. At Skill execution time, obtain credentials from the user's configured secret mechanism; never echo, serialize, log, or write a credential into an artifact. Never embed actual account identifiers, private endpoints, private datasets, or local user paths in a reusable Skill file.

For every material fact or number, retain the source, publication date, covered period, unit, currency, and as-of date. Separate reported figures from transformations and analyst judgments. When using a bundled calculation resource, record the resource name, inputs, formula or method, defaults overridden, and output. Visible source assumptions and defaults are starting points, not hidden facts; disclose and vary them where they materially affect a result.

The bundled `resources/` directory contains source-derived code and provider-neutral AgentSpec files. Read `DERIVATION.json` before use. Select only the resources required for the task. Provider adapters are optional integration examples; bind them to clients and credentials the user has already authorized.

## Output contract

Produce these sections in order.

### Scope / As-of

State the subject, question, jurisdiction or market, period, currency, valuation date, and freshness boundary.

### Evidence

Provide the source register and the facts actually used.

### Calculations

Record formulas or methods, inputs, units, transformations, outputs, and resource versions.

### Assumptions

List explicit base, upside, downside, probability, confidence, or valuation assumptions and who supplied or approved them.

### Analysis

Present findings, forecasts, comparisons, ratings, targets, implications, and counterarguments appropriate to this Skill.

### Limitations

Identify missing data, comparability problems, model risk, conflicting evidence, and uncertainty.

### Human Review

Flag decisions that need confirmation before publication or consequential use.

### ARSU Handoff

Provide concise material for a broader research synthesis, including evidence identifiers and unresolved questions.

Keep facts, calculations, assumptions, and conclusions traceable. A human remains responsible for deciding whether and how to use the output, especially for trading, portfolio, fiduciary, regulated, or personalized decisions.
