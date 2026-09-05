# Procedure

Generate the report with `validators/contamination-signals.py` using the executable report contract below.

Supply structured corpus records with venue, year, source pointer and any host-obtained resolver observations. Missing observations remain missing or degraded; computation never contacts services.

Use JSON/YAML `{entries: [...]}` (or a root array), with citation_key, year,
venue or source_pointer, and optional resolver_outcomes. Resolver observations
use status matched/unmatched with queried_by id/title, or unreachable/skipped
with queried_by null. Manual acquisition remains an explicit exemption;
missing and unreachable observations do not become false signals.

1. Compute bounded contamination signals from corpus and model-output evidence;
   report the exact input surface and resolver state used.
2. Do not infer contamination from style alone, and do not turn an unavailable,
   skipped, or title-only lookup into a positive match.
3. Keep heuristic, deterministic, and process signals distinct. Report advisory
   scores, evidence, and any unresolved/degraded state without relabelling it
   clean or failed.
4. This capability emits an advisory observation only. It never mints citation
   markers, changes a terminal policy, blocks output, or recommends replacement
   prose.

## Output Format

Structured verifier findings from the script.
