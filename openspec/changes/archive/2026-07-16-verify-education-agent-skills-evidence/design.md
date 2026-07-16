## Context

The completed `audit-education-agent-skills` change pins the upstream repository
and records 872 evidence declarations across all 165 Skills. Those declarations
are source-hash-bound, but the audit deliberately preserves conservative
existence and identity conclusions and does not provide a deduplicated
bibliographic catalog. The new verification layer must consume that immutable
audit without changing it, support publication variants and composite
citations, and remain useful when a work cannot be resolved.

Evidence research is a curation activity. Network sources are consulted only
while producing the checked-in map. Routine validation must be deterministic,
offline, and unable to silently upgrade a human conclusion.

## Goals / Non-Goals

**Goals:**

- Bind the evidence map to the exact audit bytes, snapshot, revision, and tree.
- Cover every audit `evidence_id` exactly once and normalize repeated
  declarations to a smaller work catalog.
- Store enough returned bibliographic metadata and field-match reasoning to
  audit every `verified`, `unresolved`, `conflicting`, or `not-applicable`
  conclusion.
- Support title variants, multiple editions, translations, and genuinely
  composite citations without assuming one raw string equals one work.
- Derive a stable human report from the validated JSON and provide one offline
  check command for maintainers.

**Non-Goals:**

- Reviewing whether a source supports the Skill's claim, effect size,
  interpretation, or recommended practice.
- Deciding licensing, production admission, converter behavior, generated
  Skill content, or domain membership.
- Persisting source documents, web pages, PDFs, credentials, search-engine
  abstract snippets, or network caches in the repository; compact returned
  candidate citation metadata is permitted for discovery auditability.
- Performing live network lookup during builds, tests, or normal checks.

## Decisions

### Decision: use a two-layer strict JSON model

`evidence-map.json` is the SSOT. Its `works` array stores normalized evidence
identities, and `declaration_mappings` maps every immutable audit declaration to
one or more work IDs. Work records contain a stable `work_id`, evidence type,
canonical bibliographic fields, existence status,
`claim_support_reviewed: false`, a reason, and reviewed network-source records.

Each source record identifies its reliable source kind and URL, access date,
returned bibliographic metadata, identifiers, and author/year/title match
conclusions. Unsuccessful reliable-catalog searches may be recorded for
`unresolved` works. `not-applicable` is restricted to original frameworks,
practice methods, or other non-publication identities.

Alternative considered: enrich the existing audit evidence records. Rejected
because that would mutate the immutable audit and conflate its source review
with a separately maintained bibliographic SSOT.

### Decision: map declarations independently from normalized works

Every mapping repeats the audit's Skill, source path, source hash, and original
citation so drift is visible without positional joins. A mapping records
`exact`, `normalized`, `title-variant`, `composite`, or `ambiguous`, references
at least one work, and includes a rationale. Multiple mappings may share a work.
A non-composite mapping may reference only one work; multi-work mappings require
`composite`.

Stable work IDs are snapshot-local sequential IDs assigned after normalized
identity grouping and never derived from array position during validation.
Ordering is by `work_id` and `evidence_id`.

Alternative considered: use normalized citation strings as IDs. Rejected
because punctuation fixes, title variants, translations, and edition
distinctions would make references unstable and unreadable.

### Decision: reliable bibliographic metadata is sufficient for existence

One publisher, journal, DOI or ISBN registry, library catalog, ERIC, PubMed,
official institutional repository, explicit academic-index record, or official
website may establish existence when returned author, year, and title fields
match or have an explained variant. Search engines are discovery aids only and
their result snippets are never stored as verification sources.

Conflicting returned identities remain `conflicting`; identities not found in a
reliable source remain `unresolved`. Publication-year differences caused by
online-first publication, translations, or editions are permitted only when the
record states the variant.

Alternative considered: require two independent sources for every work.
Rejected because the user-approved policy accepts one reliable source and the
extra requirement would add cost without resolving claim support.

### Decision: preserve Google Scholar as a separate discovery layer

Every work that was unresolved after the initial reliable-source review is
targeted by one supplementary Google Scholar discovery round. The evidence map
stores the endpoint, deterministic query parameters, access date, returned
candidate metadata, no-result work IDs, and provider-blocked work IDs in a
separate discovery record. This distinguishes completed lookups from intended
lookups blocked by a provider-wide challenge without adding Google Scholar
result pages or snippets to a work's reliable `sources`.

A Scholar candidate can change a work to `verified` only after its identity is
confirmed through a reliable destination such as a DOI registry, publisher,
journal, library catalog, or official repository. Candidate metadata that
cannot be independently confirmed remains a discovery record and the work
remains `unresolved`.

Alternative considered: add Scholar results directly to each work's `sources`.
Rejected because it would collapse discovery and verification and contradict
the source-reliability boundary.

### Decision: keep claim support structurally impossible to imply

Every work has `claim_support_reviewed` fixed to literal `false`. The schema has
no effect-size, support-strength, or claim-validity field. Source-match records
describe bibliographic identity only.

### Decision: one module owns schema, checking, and report rendering

`src/vendor-evidence/education-agent-skills` owns constants, strict Zod
contracts, cross-reference and audit-binding validation, canonical JSON
serialization, report rendering, and the internal CLI. The CLI exposes only
`check`; evidence curation writes are deliberate repository edits rather than a
networked normal command.

The check command reads the immutable audit and checked-in map, validates the
audit hash and all copied declaration fields, renders the expected report in
memory, and compares bytes. It never writes or contacts the network.

Alternative considered: add a public ResearchSpec command. Rejected because
evidence verification is maintainer-only pre-ingest work.

## Risks / Trade-offs

- [Automatic catalog matching can select a similarly titled work] → Require
  stored returned metadata, explicit field matches, conservative unresolved or
  conflicting outcomes, and focused validation of every verified record.
- [A single citation can name editions or multiple publications] → Permit
  one-to-many mapping only through the explicit `composite` type.
- [Bibliographic services can change after review] → Preserve access dates and
  returned metadata; offline checks validate the reviewed snapshot rather than
  replaying network calls.
- [Automated Scholar access can be throttled or challenged] → Search
  sequentially, record the exact returned/no-result boundary and shared blocked
  remainder explicitly, and never interpret a blocked or empty result as proof
  that a work does not exist.
- [The large curated map can drift from its audit input] → Bind the audit
  SHA-256 and compare all 872 copied declaration fields during every check.
- [A verified publication could be mistaken for support of a Skill claim] →
  Fix `claim_support_reviewed` to `false` and state the boundary in both
  artifacts.

## Migration Plan

1. Add the change artifacts and evidence contracts.
2. Normalize and verify all audit declarations against reliable sources.
3. Check in the map and generate the Markdown report from it.
4. Add offline validation, tests, package exclusions, and maintenance guidance.
5. Run the full project and OpenSpec verification suite. Leave the change
   unarchived and production state unchanged.

Rollback is removal of this change's evidence artifacts, module, package
script, tests, and maintenance text. The immutable audit remains unchanged.

## Open Questions

None. Production licensing and admission decisions remain deferred to a later
`ingest-education-agent-skills` change after the evidence results are reviewed.
