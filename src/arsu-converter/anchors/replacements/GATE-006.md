### ResearchSpec Current Owner

Replacement scope: `GATE-006` for `shared`.

4. **Traceable handoff:** every boundary file is resolved by its unique role and
   safe project-relative path from
   `researchspec/subflows/<instance>/handoff.md`. When a producer supersedes a
   file, it updates the owning handoff entry instead of creating another
   lifecycle authority.
5. **Failure on missing:** missing required fields or boundary files produce
   `HANDOFF_INCOMPLETE` with the exact gaps; consumers do not proceed partially.
6. **Producer validation:** the producer validates the payload shape before
   returning the file to the producing subflow for handoff recording.
7. **Consumer validation:** the consumer checks the declared role, path, payload
   shape, and required upstream human-confirmed Gate attempts before use;
   violations request a corrected boundary file rather than an in-place edit.
8. **Integrity gating:** verification status comes from the Gate attempt in
   `researchspec/subflows/<instance>/control.yaml`, not from a mutable field in
   the boundary file.
9. **Staleness detection:** when an upstream boundary file changes, dependent
   findings and prior Gate attempts must be recomputed before they authorize a
   transition.
10. **Freshness:** apply the profile's configured freshness policy to Gate
    attempts and their referenced boundary inputs. Expired evidence requires
    re-verification.
11. **Stage-skip eligibility:** a profile-declared optional stage may be skipped
    only when the current inputs satisfy its Gate requirements and the user
    confirms the skip through the CLI.
12. **Final integrity is never skipped:** a required final-integrity Gate always
    performs its configured verification, regardless of external metadata or
    earlier Gate attempts.

The producing Agent writes validated boundary references to the owning handoff
and returns formal findings to ResearchSpec CLI. The CLI is the only writer for
Gate, Decision, frontier, and transition mutations in `control.yaml`.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
