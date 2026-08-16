# Procedure

Run the bundled `validators/submission-package-verifier.py` with the current submission JSON.

1. Read `submission_package` paths.
2. Verify required package files exist and match declared checksums.
3. Verify license, disclosure, and terminal-policy stamp presence.
4. Return pass/fail findings without modifying package bytes.

## Output Format

Structured verifier findings from the script.
