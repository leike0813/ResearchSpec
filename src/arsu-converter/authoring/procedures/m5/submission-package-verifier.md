# Procedure

Generate the report with `validators/submission-package-verifier.py` using the executable report contract below.

Supply submission_package as a JSON/YAML manifest with a nonempty files array of {path, sha256?}, relative to that manifest. Optional license, disclosure, terminal_policy_stamp and manuscript fields name listed files. An explicit profile may supply max_words and required_headings. Unperformed checks remain not_checked; this producer manifest grants no workflow authority.

1. Read the supplied `submission_package` paths and package manifest.
2. Verify required package files, declared checksums, license, disclosure, and
   terminal-policy stamp presence without changing package bytes.
3. Preserve `fail`, `warn`, and `NOT-CHECKED` findings in the report. Missing
   venue/profile/parser inputs are unresolved checks; never treat absence as a
   clean package or infer a venue policy.
4. Consume the resolved ResearchSpec package-policy value as input when one is
   supplied. This verifier reports mechanical findings; it does not read or
   choose workflow policy, grant a Gate, or reinterpret citation-marker policy.
5. Return pass/fail findings without modifying package bytes.

## Output Format

Structured verifier findings from the script, including unresolved checks and
the supplied policy/result provenance.
