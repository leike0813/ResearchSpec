---
name: financial-research-corporate-risk
description: Identify, trace, prioritize, and monitor company and investment risks using evidence-backed likelihood, impact, timing, mitigation, and residual-exposure judgments. Use for risk-factor analysis, corporate-risk review, downside assessment, risk register creation, or investment risk monitoring.
license: Apache-2.0
metadata:
  vendor: finrobot
  vendor-release: snapshot-2717499
---

# Corporate Risk Research

## Purpose and scope

Create a decision-useful risk assessment that connects evidence to exposure,
transmission path, likelihood, impact, timing, mitigants, residual exposure, and
monitoring signals. Risk judgment is performed by the Agent; no script assigns
semantic probability or severity.

Do not treat a filing's risk-factor list as a ranked assessment, and do not use
this Skill for portfolio optimization, compliance sign-off, or automated credit
decisions.

## Inputs and prerequisites

Required inputs are the entity, decision horizon, as-of date, risk owner or
audience, materiality frame, and citable disclosures or user-provided data.
Identify the financial variables, operations, legal entities, jurisdictions, and
stakeholders within scope. Ask the user when risk horizon, materiality, or entity
scope would materially change prioritization.

Current evidence may be retrieved only through user-configured filing, browser,
news, market-data, or local-corpus tools. Record provenance and data boundaries.
Never discover credentials or upload private materials without authorization.

## Workflow

1. Define the entity, decision horizon, as-of date, risk owner, and materiality frame before collecting evidence.
2. Separate observed conditions, disclosed risks, inferred exposures, scenarios,
   and unsupported allegations. Record source incentives, corroboration,
   publication and event dates, and whether evidence establishes exposure,
   likelihood, impact, or only plausibility. Filing boilerplate establishes a
   disclosed category, not entity-specific probability or materiality.
3. For each candidate risk, identify source, exposure, trigger, transmission
   path, affected financial or operational variables, timing, and reversibility.
4. Evaluate likelihood or probability, impact, confidence, and interaction with
   other risks using explicit evidence and counterevidence.
5. Assess existing controls and mitigants, then state residual exposure rather
   than treating mitigation as elimination. Evaluate control coverage, tested
   effectiveness, capacity, timing, and any new risks introduced.
6. Rank risks for the stated decision and horizon. Explain dependencies,
   nonlinearities, and what would change the ranking.
7. Deliver a risk register, scenario narrative, early-warning indicators, and
   limitations.

## Hard constraints

- Do not invent probabilities, quantify impact without a basis, or turn generic
  boilerplate into entity-specific evidence.
- Do not suppress low-probability/high-impact risks, correlated risks,
  counterevidence, or uncertainty.
- Do not let source recency, repetition, market movement, or management language
  mechanically determine materiality.
- Preserve confidentiality and user authority for private data and external
  retrieval.
- Distinguish gross exposure, mitigants, and residual exposure.
- Treat market movements as observations requiring a causal explanation, not
  proof of the event attributed to them.

## Responsibilities

Agent procedure: identify exposures, controls, transmission paths, and evidence-backed residual risk. Agent procedure: connect each risk driver to affected metrics, timing, mitigants, and observable warning indicators. Agent procedure: prioritize risk factors using explicit likelihood, impact, confidence, and counterevidence judgments.

The Agent owns semantic classification, source quality, scenario construction,
likelihood, impact, confidence, interaction, prioritization, and final wording.
External tools only retrieve authorized evidence within the stated boundary.

Record each conclusion with evidence, assumptions, counterevidence, and limitations.
Stop when the available evidence cannot support the requested conclusion.

## Outputs and completion

Return scope, evidence ledger, risk register, transmission paths, likelihood and
impact rationale, mitigants, residual exposure, interactions, scenario effects,
monitoring indicators, counterevidence, and limitations. Make estimates and
qualitative ratings visibly attributable to the Agent's reasoning.

Completion requires that every priority risk has an evidence-backed causal path,
explicit uncertainty, a monitoring signal, and a stated reason for its rank.

## Failure handling

If an allegation lacks reliable evidence, label it unverified and exclude it
from conclusions. If probability or impact cannot be supported, use a bounded
qualitative statement and explain the missing evidence. If sources conflict,
preserve both and lower confidence. If the task requests legal, compliance, or
investment authorization, provide research only and state the authority limit.

## Examples

Happy path: assess Acme's two-year liquidity, customer-concentration, regulatory,
and execution risks; trace each to cash flow or operating consequences; rank them
with explicit evidence, mitigants, residual exposure, and warning indicators.

Near miss: assign exact probabilities to generic filing risk factors with no
entity-specific evidence. Refuse unsupported precision and provide a qualitative
assessment with stated evidence gaps.
