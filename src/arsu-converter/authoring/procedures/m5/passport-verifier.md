# Procedure

Generate the report with `validators/passport-verifier.py` using the executable report contract below.

Supply material_passport as JSON/YAML with literature_corpus entries. Computation checks required citation key, title, source pointer, year, CSL authors, unique keys and acquisition/audit consistency. Source truth, citation existence and full upstream runtime schema validation remain explicitly not_checked.

1. Parse the material passport and validate the current schema and required
   source bindings.
2. Report missing or invalid entries, preserving unknown, stale, degraded, and
   not-checked states as such. Never infer missing provenance, review, consent,
   or authorization from a schema-shaped document.
3. The passport is a supplied evidence record. This verifier does not mutate it,
   append compliance history, grant a Gate, or decide whether a workflow may
   advance.

## ResearchSpec boundary

Treat the passport as optional, read-only evidence. This capability validates its
shape and source pointers only. It does not interpret `resume_from_passport`,
consume boundary/resume entries, append a ledger, acquire a lock sidecar, or
create a hash chain. If those upstream fields are supplied, report them as
unconsumed context rather than acting on them. Resume routing, Gate verdicts, and
run completion remain the authority of the ResearchSpec CLI, the frozen graph,
the owning node instance, and the external handoff.

## Output Format

Structured verifier findings from the script, with unconsumed upstream resume
context clearly labelled when present.
