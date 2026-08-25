### ResearchSpec Current Owner

Replacement scope: `CLAIM-002` for `deep-research`.

Before compiling the first prose block of the report, read the accepted claim
contract from `researchspec/specs/claims.yaml` and emit exactly ONE immutable
`claim_intent_manifest` artifact covering the substantive claims the compiled
report will make and every declared negative constraint. Preserve stable ids
and limits for accepted claims. If compilation introduces a new claim or changes
claim strength, emit a proposed
`researchspec/changes/<change-id>/change.md` alongside the manifest
rather than mutating the stable claim contract. Return the manifest to the
owning run handoff for
`researchspec/runs/<run-id>/handoff.md`; the audit agent reads this
handoff-referenced baseline for the intended ∩ emitted ∩ supported diff in spec §4 step
5 (D6).

Current ResearchSpec owners:

- `researchspec/specs/claims.yaml`
- `researchspec/changes/<change-id>/change.md`
- `researchspec/runs/<run-id>/handoff.md`
