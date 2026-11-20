# Procedure

When delegated, do not ask the user questions or certify a human Gate. Report missing reconciliations to the parent.

Reconcile completed screening decisions into a traceable PRISMA-style report and eligible corpus.

## Inputs and outputs

- Required: `screening_config` (screening-config.v1), `screening_log` (screening-log.v1), and `full_text_decisions` (full-text-decisions.v1).
- Optional trace inputs: `ta_adjudication`, `ft_adjudication`, `exclusion_audit`, and `human_confirmed_decisions`. Record approved integrations and their provenance; advisory outputs alone never change counts or labels.
- Produce `prisma_counts` (prisma-counts.v1) and `literature_corpus` (literature-corpus.v1).

## Rules

## Steps

1. Count records from their stable record identities and recorded decision states. Do not infer missing transitions or count a pending record as excluded.
2. Reconcile every reported total to the underlying records; show unresolved records and explain any count that cannot yet reconcile.
3. For full-text exclusions preserve the first failing protocol criterion and its page/section location.
4. Corpus entries include eligible records only and retain source identifiers and decision provenance. Do not add newly retrieved studies.
5. Report the protocol revision and configuration identity. Human verification is required before the report is treated as final.
6. Treat adjudication and audit as evidence unless the supplied human confirmation explicitly approves an integration. Never change a decision in report compilation.

7. Require a complete authoritative decision set and current retrieved/not-retrieved partition and TA snapshot before final methods or full-text report. If inputs are pending or stale, label the log provisional and omit methods text and final result claims.
8. Methods-only facts such as search dates, who verified decisions, AI disagreement resolution, and the final human-confirmed numbers remain `[TO COMPLETE]` until supplied by the team. Never fill these slots with invented facts. Model labels must match the exact models recorded in config.
9. Explain outputs and handoff to the parent: methods selection and PRISMA counts for manuscript writing; after full text, excluded reports with reasons; eligible corpus for synthesis. Corpus entries retain screening tags/provenance and omit abstracts.

## Importing the RIS groups

When an RIS export is supplied, preserve the decision in the label and reasons in notes. Keep decision groups separate in reference-manager imports. The screening log remains authoritative for both seats' labels/reasons, adjudication, QC, overrides, and final decision maker.

## Completion

Counts reconcile, or each discrepancy is explicit; every included corpus entry maps to a completed eligible decision.

## Data tools

`screening_data_identity` is `<work>/records.json`; its parent directory is `--work`. For a completed FT run, export PRISMA counts with `python3 tools/screening_tools.py export <work>/ft-merged.json <work>/records.json --format prisma --work <work> --config <config.json> --output <prisma.json>` and the eligible corpus with the same command using `--format corpus --output <literature-corpus.json>`. Other formats are `ris`, `method`, and `log`. For a TA-only report, pass `<work>/ta-merged.json` as the merged input. Export validates the full-text retrieval partition in the private work manifest and the current TA snapshot; pending or stale records remain provisional and must not be presented as final results. Never include `full_text_manifest.json` or the coordinator's work directory in reviewer packets.
