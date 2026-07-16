## Why

The immutable Education Agent Skills audit records 872 named evidence
declarations, but its conservative identity findings are not a normalized,
source-backed bibliography and do not establish whether each named work exists.
ResearchSpec needs a separate exhaustive evidence-verification layer before any
production ingest scope can be reviewed responsibly.

## What Changes

- Add a ResearchSpec-owned evidence map that binds the immutable
  `snapshot-32fce5c` audit and maps every one of its 872 `evidence_id` values
  exactly once to normalized works.
- Verify work existence against reliable bibliographic or official sources,
  preserving title, author, year, edition, and composite-reference variants as
  explicit match metadata.
- Target every work that remained unresolved after the initial reliable-source
  review in a supplementary Google Scholar discovery round, preserving returned
  candidates, no-result outcomes, and provider-level blocking separately from
  verification sources.
- Represent unresolved identities, conflicting identities, original
  frameworks, and non-publication practices without upgrading them to verified
  publications.
- Add a strict schema, deterministic report renderer, and read-only offline
  `education-agent-skills:evidence:check` maintainer command.
- Keep claim-support review explicitly out of scope and leave the audit,
  production registry, domain catalog, vendor bundles, and public CLI unchanged.

## Capabilities

### New Capabilities

- `education-agent-skills-evidence-verification`: Defines exhaustive,
  snapshot-bound evidence normalization, existence verification, deterministic
  artifacts, and offline checking for all Education Agent Skills declarations.

### Modified Capabilities

None.

## Impact

- Adds `evidence-map.json` and its derived `evidence-report.md` beside the
  immutable Education Agent Skills audit.
- Adds a maintainer-only module under
  `src/vendor-evidence/education-agent-skills`, focused tests, one package
  script, and package-boundary checks.
- Requires network research only while curating the checked-in map; normal
  builds, tests, and evidence checks remain offline and do not re-evaluate
  human conclusions.
- Does not add dependencies, production Skills, vendor registration, domain
  membership, converter output, or a public ResearchSpec command.
