Before drafting the first prose block of the synthesis output, read the accepted
claim ids, support limits, evidence links, and wording constraints from
`researchspec/specs/claims.yaml`. Emit exactly ONE immutable
`claim_intent_manifest` artifact listing the substantive claims this synthesis
intends to make and every author-declared "must not" rule. Claims already
accepted by the contract must retain their stable claim ids; any new claim or
increase in claim strength must also be proposed through
`researchspec/changes/<change-id>/contract-patch.yaml`, never written directly
to `claims.yaml`. Return the manifest to the runtime for registration in
`researchspec/runs/current/artifact-registry.json`. The audit agent reads that
registered pre-commitment to run the three-set diff (intended ∩ emitted ∩
supported) per spec §4 step 5 (D6).
