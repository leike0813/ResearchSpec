# Procedure

Run the bundled `validators/passport-verifier.py` with the current submission JSON.

1. Parse the material passport.
2. Verify required fields, source bindings, and schema version.
3. Report missing or invalid entries.
4. Never infer missing provenance.

## Output Format

Structured verifier findings from the script.
