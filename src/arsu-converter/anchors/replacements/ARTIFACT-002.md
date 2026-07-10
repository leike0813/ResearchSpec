- Emit `timeline.yaml` as the temporal-facts artifact for this Investigation-stage invocation; link every source reference to its stable source id in `researchspec/specs/sources.yaml`.
- Emit `citation_provenance.yaml` as the first-party citation-verification artifact; include the source ids, checks performed, evidence locations, and result status without changing source records.
- Emit `version_records.yaml` as the citation version-family artifact for preprint → proceedings → journal chains; link any claim relevance to stable ids in `researchspec/specs/claims.yaml`.

Return all three paths, hashes, producer identity, and stage metadata to the
runtime registration helper for
`researchspec/runs/current/artifact-registry.json`. These are separate immutable
artifacts; do not store their contents in phase state, Material Passport, or
stable specs.
