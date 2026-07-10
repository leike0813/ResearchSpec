When `researchspec/specs/sources.yaml` contains included literature sources,
resolve their registered source and screening artifacts through
`researchspec/runs/current/artifact-registry.json` and present them to the
Bibliography Agent as a read-only `literature_corpus[]` working projection. The
agent then runs the existing **corpus-first, search-fills-gap** flow with all
five steps, four Iron Rules, and the PRE-SCREENED reproducibility block intact.
External search results and proposed additions remain output artifacts until an
accepted source-contract change is applied; the agent must not mutate
`sources.yaml`, the registry, or the projected corpus.
