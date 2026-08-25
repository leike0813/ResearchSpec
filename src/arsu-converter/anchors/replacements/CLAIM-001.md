### ResearchSpec Current Owner

Replacement scope: `CLAIM-001` for `academic-paper`.

Before drafting the first prose block of the paper, read accepted claim ids,
allowed wording, support strength, evidence links, and limits from
`researchspec/specs/claims.yaml`. Emit exactly ONE immutable
`claim_intent_manifest` artifact that lists the claims this draft intends to
make and all author-declared "must not" rules. Reuse stable ids for accepted
claims. Any new claim, stronger wording, or changed limit must also be proposed
through `researchspec/changes/<change-id>/change.md`; never edit
`claims.yaml` from the drafting agent. Record the manifest by role and path in
`researchspec/runs/<run-id>/handoff.md`. The audit
agent uses that handoff-referenced pre-commitment for the intended ∩ emitted ∩ supported
diff in spec §4 step 5 (D6).

Current ResearchSpec owners:

- `researchspec/specs/claims.yaml`
- `researchspec/changes/<change-id>/change.md`
- `researchspec/runs/<run-id>/handoff.md`
