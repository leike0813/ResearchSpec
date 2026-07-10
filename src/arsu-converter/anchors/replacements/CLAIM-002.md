Before compiling the first prose block of the report, read the accepted claim
contract from `researchspec/specs/claims.yaml` and emit exactly ONE immutable
`claim_intent_manifest` artifact covering the substantive claims the compiled
report will make and every declared negative constraint. Preserve stable ids
and limits for accepted claims. If compilation introduces a new claim or changes
claim strength, emit a proposed
`researchspec/changes/<change-id>/contract-patch.yaml` alongside the manifest
rather than mutating the stable claim contract. Return the manifest to the
runtime registration helper for
`researchspec/runs/current/artifact-registry.json`; the audit agent reads this
registered baseline for the intended ∩ emitted ∩ supported diff in spec §4 step
5 (D6).
