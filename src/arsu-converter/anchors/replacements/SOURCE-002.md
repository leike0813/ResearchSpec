### ResearchSpec Current Owner

Replacement scope: `SOURCE-002` for `academic-pipeline`.

This is the contract every literature-reading consumer follows after
ResearchSpec has projected source records from
`researchspec/specs/sources.yaml` and resolved associated corpus artifacts
through `researchspec/subflows/<instance>/handoff.md`. The resulting
read-only `literature_corpus[]` working payload retains citation keys, titles,
authors, dates, source pointers, inclusion state, and trust metadata required by
the protocol below. Consumers apply the existing corpus-first,
search-fills-gap flow, four Iron Rules, PRE-SCREENED block, and graceful parse
fallback without mutating the payload, the source contract, or the owning
handoff.

Current ResearchSpec owners:

- `researchspec/specs/sources.yaml`
- `researchspec/subflows/<instance>/handoff.md`
