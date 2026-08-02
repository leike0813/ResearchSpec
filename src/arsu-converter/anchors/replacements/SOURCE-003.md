### ResearchSpec Current Owner

Replacement scope: `SOURCE-003` for `deep-research`.

When `researchspec/specs/sources.yaml` contains included literature sources,
resolve their handoff-referenced source and screening artifacts through
`researchspec/subflows/<instance>/handoff.md` and present them to the
Bibliography Agent as a read-only `literature_corpus[]` working projection.
Apply the confirmed source policy without turning provider priority into
workflow authority:

- `adapter-native`: call `zotero-library-query` first and record the uncovered
  source class before using `zotero-literature-acquisition` or bounded external
  search.
- `protocol-multi-source`: let the systematic-review protocol determine
  databases, searches, screening, and coverage; use Zotero for seeds,
  duplicate checks, full text, and supplemental coverage.
- `external-first`: use current authoritative external sources first or in
  parallel, then use Zotero for academic context.
- `library-bound`: use only the requested current selection, private
  collection, or offline library; pause when just-in-time readiness fails.

Call `zotero-literature-analysis` only for a source-level evidence goal and
`zotero-research-synthesis` only for a bounded cross-source goal. Do not invoke
every task mechanically. Consume results through a explicit
`ProviderRetrievalHandoff`; an empty result is not proof of absence, and the
handoff remains working evidence until this producer screens, verifies, and
returns a durable bibliography artifact. Without a current, user-authorized,
collection-bound `ManagedLibraryAuthorization`, Acquisition is candidate-only.
That authorization never permits `zotero-library-curation`.

Keep the existing five-step flow, four Iron Rules, and PRE-SCREENED
reproducibility block intact. External search results and proposed additions
remain output artifacts until an accepted source-contract change is applied;
the agent must not mutate `sources.yaml`, the projected corpus, or any other
ResearchSpec authority file.

Current ResearchSpec owners:

- `researchspec/specs/sources.yaml`
- `researchspec/subflows/<instance>/handoff.md`
