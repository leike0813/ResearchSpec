This is the contract every literature-reading consumer follows after
ResearchSpec has projected source records from
`researchspec/specs/sources.yaml` and resolved associated corpus artifacts
through `researchspec/runs/current/artifact-registry.json`. The resulting
read-only `literature_corpus[]` working payload retains citation keys, titles,
authors, dates, source pointers, inclusion state, and trust metadata required by
the protocol below. Consumers apply the existing corpus-first,
search-fills-gap flow, four Iron Rules, PRE-SCREENED block, and graceful parse
fallback without mutating either the payload, the source contract, or registry
records.
