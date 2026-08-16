# Procedure

Run the bundled `validators/citation-verification-gate.py` with the current submission JSON.

1. Resolve each reference through the declared index/API matrix.
2. Use the degradation registry when services are unavailable.
3. Return `lookup_verified: true | false | unresolvable`.
4. `unresolvable` must never be treated as pass.

## Output Format

Structured verifier findings from the script.
