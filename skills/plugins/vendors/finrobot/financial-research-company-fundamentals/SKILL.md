---
name: financial-research-company-fundamentals
description: "Analyze business drivers and historical fundamentals, build scenarios, and produce investment implications."
license: Apache-2.0
compatibility: "Static Skill with agent-invoked Python and AgentSpec resources; external providers and credentials remain user-configured."
metadata:
  vendor: finrobot
  vendor-release: snapshot-297a8d2
  source-revision: 297a8d28d099be328c8a8eb658b4f782b93f3651
  source-capability-id: company-fundamentals-analysis
  researchspec-role: semantic-helper
---

# Company Fundamentals Research

Analyze business drivers and historical fundamentals, build scenarios, and produce investment implications.

## Provenance and attribution

This Skill includes source-derived materials from the official FinRobot repository at immutable revision `297a8d28d099be328c8a8eb658b4f782b93f3651`. See `DERIVATION.json` for file hashes and adaptation actions, and `LICENSE` and `NOTICE` for licensing and attribution. ResearchSpec is independent from FinRobot and is not endorsed by it.

## Company fundamentals research

Build a decision-useful view of the company: business model, products and services, revenue streams, customer and geographic concentration, leadership and strategy, industry setting, historical operating record, capital intensity, unit economics, growth drivers, and constraints. Identify causal links between operational drivers and financial results, then construct base, upside, and downside forecasts when requested.

Use `resources/agent-specs/company_overview.json` for the foundational company profile and `major_takeaways.json` for strategic implications. Use `resources/python/financial_analyzer.py`, `financial_data_processor.py`, and `enhanced_text_generator.py` for filing-grounded prompts, forecasts, executive synthesis, and investment implications. Provider and text generation implementations are injected through `provider_contracts.py`; optional examples live in `provider_adapters.py`.

The output may include forecasts, an investment thesis, key takeaways, rating rationale, and scenario implications. Distinguish sourced facts from forecast inputs and analyst judgment, expose material defaults, and show what would falsify the thesis.


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
