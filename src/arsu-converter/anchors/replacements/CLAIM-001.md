Before drafting the first prose block of the paper, read accepted claim ids,
allowed wording, support strength, evidence links, and limits from
`researchspec/specs/claims.yaml`. Emit exactly ONE immutable
`claim_intent_manifest` artifact that lists the claims this draft intends to
make and all author-declared "must not" rules. Reuse stable ids for accepted
claims. Any new claim, stronger wording, or changed limit must also be proposed
through `researchspec/changes/<change-id>/contract-patch.yaml`; never edit
`claims.yaml` from the drafting agent. Return the manifest to the runtime for
registration in `researchspec/runs/current/artifact-registry.json`. The audit
agent uses that registered pre-commitment for the intended ∩ emitted ∩ supported
diff in spec §4 step 5 (D6).
