4. **Version tracking:** every handoff resolves a stable artifact id, version
   label, content hash, and supersession relationship from
   `researchspec/runs/current/artifact-registry.json`. Version labels increase
   monotonically within a lineage.
5. **Failure on missing:** missing required fields or artifacts produce
   `HANDOFF_INCOMPLETE` with the exact gaps; consumers do not proceed partially.
6. **Producer validation:** the producer validates payload shape before returning
   the artifact for runtime registration.
7. **Consumer validation:** the consumer checks payload shape, expected artifact
   id/hash, and required upstream gate receipts before use; violations request a
   corrected artifact rather than an in-place edit.
8. **Integrity gating:** verification status comes from the gate entry tied to
   the artifact hash in `researchspec/runs/current/gate-ledger.jsonl`, not from a
   mutable payload field.
9. **Staleness detection:** when an upstream artifact hash changes or is
   superseded, dependent artifacts and prior gate receipts are stale until their
   responsible helpers recompute them.
10. **Freshness:** apply the configured freshness policy to gate timestamps and
    current artifact hashes. Expired evidence requires re-verification.
11. **Stage-skip eligibility:** Stage 2.5 may be skipped only when the current
    artifact hash has a fresh VERIFIED receipt, version expectations match, the
    workflow permits the skip, and the user confirms it. Return that confirmation
    to the decision runtime; otherwise run full verification.
12. **Final integrity is never skipped:** Stage 4.5 always performs its configured
    full verification, regardless of imported Passport status or earlier gates.

Validators and runtime helpers own registry and gate writes; producer and
consumer agents only emit payloads and findings.
