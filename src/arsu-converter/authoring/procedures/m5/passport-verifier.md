# Procedure

Run the bundled `validators/passport-verifier.py` with the current submission JSON.

1. Parse the material passport.
2. Verify required fields, source bindings, and schema version.
3. Report missing or invalid entries.
4. Never infer missing provenance.

## Reset Boundary Verification

When the submission carries a passport resume request, also verify the reset ledger:

1. Locate the `kind: boundary` entry by the requested 12-hex `resume_from_passport` hash; mismatch is a hard error.
2. Verify no later `kind: resume` entry already carries `consumes_hash` equal to that hash; a second resume is forbidden.
3. Compute `awaiting_resume`: a boundary entry is awaiting resume iff no later resume entry consumes its hash.
4. Validate `verification_status`: STALE or UNVERIFIED requires a warning and human re-verification; VERIFIED may proceed.
5. Validate pending decision options: if `pending_decision` is present, every option must carry `value`, `next_stage`, and optional `next_mode`; never auto-advance from the advisory `next` field.
6. Verify ledger append-only semantics and boundary hash chain placeholders before accepting the resume request.

## Output Format

Structured verifier findings from the script, plus:

```markdown
## Passport Resume Verification
- boundary_hash: [...]
- awaiting_resume: true | false
- consumed_already: true | false
- verification_status: [...]
- pending_decision: none | [...]
- verdict: pass | fail | needs_decision
```
