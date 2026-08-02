### ResearchSpec Current Owner

Replacement scope: `SOURCE-001` for `academic-paper`.

When `researchspec/specs/sources.yaml` contains included literature sources,
resolve their bibliography, screening, and full-text artifacts through
`researchspec/subflows/<instance>/handoff.md` and expose them to this agent
as a read-only `literature_corpus[]` working projection. Enter the existing
**corpus-first, search-fills-gap** flow using that projection. Preserve the five
steps, four Iron Rules, PRE-SCREENED reproducibility block, and the formats of
the Annotated Bibliography, Literature Matrix, Research Gap Identification, and
Recommended Sources by Paper Section. Consumer output may propose new source
candidates as artifacts, but this agent must not edit `sources.yaml` or the
handoff-referenced corpus in place.

Current ResearchSpec owners:

- `researchspec/specs/sources.yaml`
- `researchspec/subflows/<instance>/handoff.md`
