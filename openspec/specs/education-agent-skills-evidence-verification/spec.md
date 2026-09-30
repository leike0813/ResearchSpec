# Education Agent Skills Evidence Verification

## Purpose

Bind the Education Agent Skills `evidence-map.json` and derived
`evidence-report.md` to the immutable `snapshot-6bbbce4` audit, verify
bibliographic existence for every normalized work, record a supplementary
Google Scholar discovery round, and keep all evidence artifacts outside the
production package while leaving admission and licensing decisions untouched.

## Requirements

### Requirement: Immutable audit binding
ResearchSpec SHALL bind the Education Agent Skills evidence map to the exact
`snapshot-6bbbce4` audit file SHA-256, snapshot ID, revision, and tree hash. It
MUST reject use with another audit snapshot or changed audit bytes.

#### Scenario: Bound audit is accepted
- **WHEN** the offline evidence check reads the unchanged immutable audit and evidence map
- **THEN** the recorded audit hash, snapshot, revision, and tree match exactly

#### Scenario: Audit drift is rejected
- **WHEN** any bound audit identity or byte hash differs
- **THEN** validation fails without changing either audit or evidence artifacts

### Requirement: Exhaustive declaration mapping
The evidence map SHALL contain exactly one declaration mapping for every one of
the audit's 872 `evidence_id` values and no extra mapping. Each mapping MUST
preserve the declaration's Skill ID, source path, source SHA-256, and original
citation.

#### Scenario: All declarations are covered once
- **WHEN** the map is validated
- **THEN** its sorted evidence IDs equal the audit evidence IDs and every copied source field matches

#### Scenario: Missing, duplicate, or foreign declaration is rejected
- **WHEN** a declaration is omitted, duplicated, added from another snapshot, or has changed source metadata
- **THEN** validation fails with an actionable declaration error

### Requirement: Normalized work catalog
The evidence map SHALL store unique stable work IDs and canonical work type,
authors, year, title, container, and publisher fields. Every work MUST be
referenced by at least one declaration mapping, and every mapping target MUST
exist.

#### Scenario: Repeated declarations share a work
- **WHEN** multiple declarations identify the same publication or
  non-publication evidence
- **THEN** their mappings may reference the same normalized work ID

#### Scenario: Orphan or missing work reference is rejected
- **WHEN** a work is unreferenced or a mapping names an absent work ID
- **THEN** schema validation fails

### Requirement: Explicit existence verification
Every normalized work SHALL have `verified`, `unresolved`, `conflicting`, or
`not-applicable` existence status, a review reason, and
`claim_support_reviewed` fixed to `false`. A verified work MUST include at least
one reliable source record with returned metadata and author, year, and title
match conclusions.

#### Scenario: Reliable record verifies existence
- **WHEN** a publisher, journal, DOI or ISBN registry, library catalog, ERIC,
  PubMed, official repository, explicit academic index, or official website
  returns a matching bibliographic identity
- **THEN** the work may be marked verified with the source URL, access date,
  returned fields, identifiers, and explained field matches

#### Scenario: Identity cannot be proved
- **WHEN** reliable-source research finds no adequate record or finds
  incompatible identities
- **THEN** the work remains unresolved or conflicting with an explicit reason

#### Scenario: Evidence is not a publication
- **WHEN** a declaration identifies an original framework, unpublished
  practice method, or another non-publication identity
- **THEN** the work is marked not-applicable rather than verified

### Requirement: Supplementary Google Scholar discovery
ResearchSpec SHALL target every work that remained unresolved after the initial
reliable-source review in one Google Scholar discovery round. The discovery
record MUST preserve the endpoint, deterministic query parameters, access date,
returned candidates, no-result work IDs, and provider-blocked work IDs
separately from reliable verification sources.

#### Scenario: Initial unresolved set is searched completely
- **WHEN** supplementary discovery is complete
- **THEN** all 428 initially unresolved work IDs occur exactly once across returned, no-result, or provider-blocked outcome buckets

#### Scenario: Scholar candidate is independently verified
- **WHEN** a Scholar result identifies a candidate whose author, year, and title are confirmed by a reliable destination
- **THEN** the work may become verified using the reliable destination as its matched source

#### Scenario: Scholar result alone is insufficient
- **WHEN** a Scholar candidate cannot be confirmed through a reliable source
- **THEN** the candidate remains discovery metadata and the work stays unresolved

#### Scenario: Scholar access is blocked or yields no result
- **WHEN** a query is challenged, throttled, or returns no plausible candidate
- **THEN** the discovery record preserves the completed boundary and blocked remainder without treating either outcome as a conflicting or negative bibliographic finding

### Requirement: Controlled mapping semantics
Each declaration mapping SHALL use exactly one of `exact`, `normalized`,
`title-variant`, `composite`, or `ambiguous` and SHALL explain the mapping.
Only a `composite` mapping MAY reference multiple work IDs.

#### Scenario: Citation variant is preserved
- **WHEN** author abbreviation, punctuation, subtitle omission, online/print
  year, translation, or edition differences are accepted
- **THEN** the mapping or source match records the relevant normalized or
  title-variant explanation

#### Scenario: Composite citation maps to multiple works
- **WHEN** one declaration explicitly identifies multiple editions,
  translations, or publications
- **THEN** it uses `composite` and may reference multiple work IDs

#### Scenario: Ordinary mapping cannot fan out
- **WHEN** a non-composite mapping references more than one work
- **THEN** validation fails

### Requirement: Deterministic offline artifacts
ResearchSpec SHALL derive `evidence-report.md` only from the validated
`evidence-map.json` and SHALL expose an internal
`education-agent-skills:evidence:check` command that performs no network access
and no writes. JSON and report ordering and rendering MUST be deterministic.

#### Scenario: Evidence check passes offline
- **WHEN** the audit, map, and report are synchronized
- **THEN** repeated evidence checks return the same successful result without
  contacting Google Scholar or any other external service

#### Scenario: Derived report drift is detected
- **WHEN** the checked-in report differs from rendering the validated map
- **THEN** the read-only check fails and leaves all files unchanged

### Requirement: Maintainer-only non-admission boundary
The evidence artifacts, vendor checkout, and evidence-maintenance code MUST stay
outside the npm tarball. Evidence verification SHALL NOT change the production
registry, domain catalog, vendor bundles, public CLI, audit conclusions, or
future licensing and admission decisions.

#### Scenario: Package remains unchanged
- **WHEN** package verification inspects the npm tarball
- **THEN** no Education Agent Skills source, audit, evidence artifact, or
  maintainer evidence implementation is included

#### Scenario: Verification completes before ingest
- **WHEN** all evidence declarations have reviewed existence outcomes
- **THEN** ResearchSpec reports the actual status totals and affected Skills but
   does not admit or generate any Skill

### Requirement: Existenceverification SHALL be disclosed during ingestion
Generated Education Agent Skills SHALL state that unmarked citations have
bibliographic identity verification only, not claim-support review. Declarations
mapped to unresolved or conflicting works SHALL receive paired unresolved
markers in their complete frontmatter citations and safely matched body units.

#### Scenario: A work identity is verified
- **WHEN** every work mapped to a declaration is `verified`
- **THEN** that declaration SHALL remain unmarked
- **AND** the general evidence-status rule SHALL still prohibit treating identity verification as support review

#### Scenario: A work identity is unresolved
- **WHEN** any work mapped to a declaration is `unresolved` or `conflicting`
- **THEN** its complete frontmatter citation SHALL be marked
- **AND** any source-bound matching body sentence or list item SHALL be marked without nesting

### Requirement: Incremental rebinding of changed declarations
When a new snapshot changes only some Skills, ResearchSpec SHALL rebind only the
declarations of those Skills to their new source hash and citation, and SHALL
inherit every other declaration, work, existence status and discovery record
unchanged from the previous evidence map.

#### Scenario: Only changed Skills are rebound
- **WHEN** an incremental evidence map is generated from a retained previous map
- **THEN** every declaration of an unchanged Skill SHALL be identical to its previous mapping
- **AND** every declaration of a changed Skill SHALL carry its new source hash and citation
- **AND** the rebinding totals SHALL be recorded for declarations, changed citations and unaffected declarations

#### Scenario: A changed citation keeps its verified work
- **WHEN** a rebound declaration corrects citation wording for an already verified work
- **THEN** it SHALL keep the same work ID and existence status
- **AND** it SHALL NOT add, remove or upgrade a work

#### Scenario: Existence conclusions are inherited, not re-verified
- **WHEN** the previous map recorded a work as verified, unresolved, conflicting or not applicable
- **THEN** the incremental map SHALL carry that status unchanged
- **AND** a discovery round SHALL remain discovery metadata only

#### Scenario: Claim support is never upgraded by a pin change
- **WHEN** an incremental update rebinds declarations
- **THEN** every work SHALL keep `claim_support_reviewed` false
- **AND** upstream evidence-strength labels SHALL NOT raise ResearchSpec evidence strength
