## Context

See proposal.md. The shared write executor already supports current-byte preconditions, trusted path roots, backups and rollback. Plugin handlers currently split projection, selection and ownership into separate commits. Minimal completion is already tested; the installed verifier does not yet complete a pipeline with children and revisions.

## Goals / Non-Goals

Reuse existing transaction mechanisms and real packaged profiles. Do not add a transaction framework, public command, schema, dependency, test-only profile or runtime authority bypass. Keep broad documentation cleanup and scientific-quality dogfooding outside this change.

## Decisions

- Plan plugin projection, config and manifest together; commit manifest last. Use index file bytes for preconditions and explicit read preconditions even when content is unchanged, because skipped operations do not receive write preflight. Preserve missing-manifest semantics and trusted roots.
- Delete separate config/manifest writers. Keep projection counts limited to projection operations, with empty-directory cleanup after a successful shared commit.
- Use the complete selected-domain set as projection/config authority for subset updates. Bound forced refresh to the requested domains' resolved resources so unrelated selections and user edits remain intact.
- Reuse the executor's committed-state validation hook for deterministic rollback tests. Exercise stale config and manifest snapshots without changing executor-wide skip behavior.
- Extend the installed-tarball verifier with one complete academic-pipeline journey. Use its existing fresh-process runner and small local helpers; retain compiled unit/CLI tests without duplicating the full complex journey.
- Follow real instructions and frontier through research, writing, review, two revision/re-review rounds, Markdown formatting and final integrity. Gate and Decision confirmations use public CLI calls. Producer fixtures only create external semantic files; they never edit workflow authority or execute research tools.
- Temporary npm installation is authorized and uses the existing verifier flags disabling install scripts. No dependency declarations change.
- The installed end-to-end journey exposed a first-round reachability defect: a revision template's continue edge was checked against nonexistent round 0. Let the initial revision enter after its ordinary prerequisites and Gates; subsequent rounds still require the preceding continue Decision. Extend the existing runtime journey from an earlier node so entry exemption cannot hide this defect.

## Risks / Trade-offs

- Rollback covers caught errors when safe restoration remains possible; a killed process, power failure or adversarial path swap is not covered by a cross-file crash-atomic guarantee. Preserve existing path safety even if it prevents rollback.
- Fresh-process snapshot checking detects stale plans, not serializable cross-process locking.
- Automated fixtures validate workflow contracts, not research quality; manual dogfooding remains separate.

## Migration Plan

No migration or format changes. Keep this OpenSpec change active with verification results for review; do not commit or publish.
