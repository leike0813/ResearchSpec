# Procedure

When delegated, do not ask the user questions or change the screening record. Return audit findings to the parent.

Audit a bounded set of exclusions against the confirmed protocol and report possible misses. An audit finding is advisory and does not rewrite screening decisions.

## Inputs and output

- `screening_protocol` (screening-protocol.v1), `screening_config` (screening-config.v1), and `excluded_records` (excluded-records.v1) are required. The candidate file contains blind record text and stable IDs only, with no earlier decisions, codes or reasons.
- Return `exclusion_audit` (exclusion-audit.v1) with record id, recheck result, evidence, and follow-up recommendation.

## Rules

## Pilot (Phase 2)

1. Recheck only the isolated candidate file using the supplied confirmed protocol and ordered codes. Do not read the work directory or retrieve prior labels.
2. Distinguish a confirmed exclusion, a possible missed eligible record, and an unresolved record. Missing evidence remains unresolved.
3. Do not silently reopen or change the screening log, and do not infer a population-level error rate from a nonrepresentative sample.
4. Surface protocol ambiguity and route any decision-changing amendment through the human owner.

Report plainly whether the screening can be trusted and what to fix, citing the seeds, human-label misses, disagreements, unclear share, exclusion-code distribution, and QC recheck results that support that assessment. The audit itself never changes a decision; any change comes only from the configured recheck policy or an explicit human override.

Check seeds individually; an excluded seed blocks progression until the protocol or decision is resolved. Compare independent reviewer labels with human labels, list every human-advance/AI-exclude miss, and assess disagreements for a shared ambiguous rule. Report advance and unclear shares against expectations and show exclusion-code distribution so unused or overused codes can be corrected. Any clarification is a protocol amendment, not a scope change.

## After the full run (Phase 5)

The full-run QC recheck is required before preparing full-text screening. Pending records return for review first. QC candidates are a reproducible sample of jointly excluded records plus exclusions matching every near-miss keyword group; they remain pending until rechecked. Report how many the senior reviewer advanced. Human verification should include every advanced record plus a random exclusion sample; if a sampled exclusion is eligible, widen the check. Record human overrides with identity, decision, code, reason and decision-maker; overrides are explicit human decisions and appear in downstream records.

## How to read the numbers

- At extreme exclusion prevalence, kappa can understate agreement; report counts, observed agreement, kappa and PABAK together and inspect conflicts.
- Concentrated conflicts by batch type can signal a protocol definition gap.
- Interpret unclear share against the team's expected yield. Repeated full-text exclusion for one unclear reason may indicate that the criterion belongs at TA.

## Completion

Every supplied record appears once with traceable evidence and an explicit advisory status.

An audit finding never changes a decision. Only the configured recheck policy or a separately recorded human override can do that. QC candidate selection is performed by the TA screening tool before this checker runs.
