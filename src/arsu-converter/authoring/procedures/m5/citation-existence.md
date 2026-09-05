# Procedure

Generate the report with `validators/citation-verification-gate.py` using the executable report contract below.

Supply structured bibliography records with per-resolver observations gathered by user-authorized host tools. Computation is offline: missing observations remain unresolvable, never nonexistence evidence. No services or credentials are accessed.

Use JSON/YAML `{entries: [...]}` (or a root array). Each entry has citation_key
and resolver_outcomes, keyed by crossref/openalex/semantic_scholar/arxiv. Each
observation contains status (`matched`, `unmatched`, `unreachable`, `skipped`)
and queried_by (`id` or `title` for matched/unmatched, null otherwise). Preserve
the citation metadata and evidence accompanying those observations. Missing
outcomes are allowed and reported as not_checked.

1. Resolve each reference through the declared index/API matrix and preserve every
   resolver outcome, including skipped, unreachable, matched, and unmatched.
2. Use the degradation registry when services are unavailable; distinguish an
   outage from evidence that an identifier does not exist.
3. Return `lookup_verified: true | false | unresolvable`. `false` is reserved for
   an ID-keyed unmatched result with no matching resolver; title-only unmatched,
   all-skipped/manual input, and unavailable coverage remain `unresolvable`.
4. Preserve any supplied retraction-status finding as a separate bibliographic
   integrity fact. Do not infer it from a legacy field or decide terminal policy
   in this checker.
5. `unresolvable` must never be treated as pass, and no missing source or status
   may be filled from model memory.

## Output Format

Structured verifier findings from the script, including resolver outcomes and any
retraction advisory.
