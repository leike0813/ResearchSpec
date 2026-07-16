## Context

ResearchSpec currently maintains five isolated vendor converters and their
immutable audits. Education Agent Skills is a native Open Agent Skills-style
repository, but its source commit is untagged and its tree combines Skill
content with installer, MCP runtime, tests, maintenance, generated, showcase,
and project documentation surfaces. Its Skills also contain two frontmatter
blocks, named educational research or framework claims, cross-Skill
`chains_well_with` references, learner-facing behavior, and a repository-level
CC BY-SA 4.0 claim that is insufficient by itself for production redistribution.

The audit must be useful even when it reaches only negative or unresolved
conclusions. It therefore separates immutable observations from prospective
ingest recommendations and keeps ResearchSpec production state unchanged.

## Goals / Non-Goals

**Goals:**

- Bind the official upstream remote, commit, tree, and every tracked file to a
  reproducible `snapshot-32fce5c` audit.
- Parse and review every upstream Skill and every named research source,
  relationship, licensing/provenance claim, overlap, sensitive-content risk,
  and prospective ANZSRC 2020 FoR Group mapping.
- Make one JSON document the audit SSOT and derive the human report from it.
- Provide deterministic generation and read-only drift checks without running
  upstream code, installing dependencies, configuring credentials, or
  contacting services.
- Freeze a conservative converter and admission boundary for a future separate
  `ingest-education-agent-skills` change.

**Non-Goals:**

- Creating a production converter or generated vendor bundle.
- Admitting or publishing any upstream Skill, registering a sixth vendor, or
  changing any domain membership.
- Executing the upstream installer, MCP server, tests, scripts, or workflows.
- Treating upstream ratings, domains, tags, Fields, or relationship declarations
  as ResearchSpec conclusions.
- Adding a public CLI command, runtime dependency, or external evidence lookup
  to normal audit checking.

## Decisions

### Decision: pin an untagged commit by snapshot name

The source is identified as `snapshot-32fce5c`, commit
`32fce5c0d097ec675cf81c750a65a379e4d87e3c`, plus its exact remote and tree
hash. An upstream version string without a corresponding immutable tag is not
used. The checkout is maintainer-only and excluded from the npm package.

Alternative considered: copy selected Skill files into fixtures. Rejected
because it would lose complete tracked-tree coverage and repository-level
licensing, attribution, installer, runtime, and maintenance evidence.

### Decision: one typed JSON SSOT with a derived report

`audits/education-agent-skills/snapshot-32fce5c/skill-audit.json` is the sole
authoritative audit. Its top-level fields are `schema_version`, `vendor`,
`snapshot`, `repository_inventory`, `skills`, `evidence`, `relationships`,
`findings`, and `summary`. The audit module validates its own generated value
through a strict schema before serialization. `report.md` is rendered only from
that validated value, including actual Skill, domain, reference, and risk
counts; README or analysis-report totals are never copied as constants.

Every tracked file has exactly one classification from `skill-content`,
`license-provenance`, `project-doc`, `installer`, `mcp-runtime`, `maintenance`,
`test`, `generated`, or `showcase`. Every Skill record contains explicit
conclusions for metadata, audience, capabilities, I/O, resources and external
authority, license and provenance, contributors, named research evidence,
relationships, overlap, sensitive risks, prospective ANZSRC Group mappings,
and `candidate | defer | exclude`. Missing review is represented by a finding
or unresolved status, never by an implicit default.

Alternative considered: separate hand-authored decision files. Rejected for
this audit because it would create synchronization risk across the dense,
cross-referenced source review. The structured evidence arrays within the JSON
preserve individual review decisions.

### Decision: generation may inspect only the local fixed checkout

`education-agent-skills:audit` reads the local Git tree and checked-out files,
parses both frontmatter documents, computes source hashes, combines deterministic
parser observations with source-hash-bound review decisions, validates the
complete model, and writes JSON and the derived report. Re-running it twice must
be byte-identical.

`education-agent-skills:audit:check` performs the same computation in memory,
compares expected bytes to checked-in artifacts, and fails on remote, commit,
tree, file-set, file-hash, coverage, relationship, or report drift. It never
writes and never performs network access. One CLI implementation owns both
commands so generation and checking cannot diverge.

Alternative considered: let tests independently reconstruct only selected
facts. Rejected because source drift and report synchronization must be normal
maintainer operations, not scattered test-only logic.

### Decision: evidence and licensing remain conservative

Every named reference is recorded with existence, author/year/title match,
support-scope, and misattribution conclusions. `evidence_strength` is one of
`verified | partial | unverified | conflicting`; these conclusions are frozen
in the JSON after manual review, and normal checks do not browse the web.

Licensing uses `clear | conditional | unresolved`. Repository-root CC BY-SA 4.0
signals are evidence but do not establish Skill-level production clearance.
Each relevant file receives a provenance conclusion, and any unknown origin or
scope remains a blocker. Upstream quality/security/evidence labels are retained
as observations only.

Alternative considered: inherit root licensing and upstream ratings. Rejected
because Skill-level content may embed third-party frameworks, quotations,
examples, or ambiguous contributions outside the proved scope.

### Decision: retain relationships and overlap without production authority

All `chains_well_with` declarations are preserved and target-resolved as audit
relationships, including duplicate or missing targets. They are prospective
advisory relationships only and cannot become hard dependencies automatically.
Every Skill also receives an explicit overlap conclusion against ARSU and the
five current vendors: ToolUniverse, Scientific Agent Skills,
Materials-Science-Skills-For-LLM, FinRobot, and HistAgent.

### Decision: freeze the future ingest contract without implementing it

A future `ingest-education-agent-skills` change may consume only this immutable
audit. It will use native-Skill conversion and IDs
`education-agent-skills-<upstream-name>`, merge the two frontmatter documents
into one ResearchSpec-standard frontmatter, and preserve the approved body by
default. Any removal, split, or semantic adaptation must be separately approved
and bound to the source hash.

Each admitted output must carry a reviewed CC BY-SA 4.0 `LICENSE`, Skill-local
`NOTICE.md`, and source binding. The converter will not distribute MCP runtime,
installer, upstream orchestration, tests, showcase, or maintenance code.
Teacher-facing learning-science, curriculum/assessment, literacy/critical
thinking, curriculum-alignment, and teacher-professional-learning Skills are
the initial candidate focus. Real-time student tutoring, minor learning
analytics, wellbeing or motivation diagnosis, `original` frameworks, and
content requiring further citation review default to `defer`. Platform
surfaces, maintenance content, and unresolved licensing default to `exclude`.
Upstream domains, tags, and Fields are evidence only; a later change must
approve every ANZSRC Group membership manually.

## Risks / Trade-offs

- [A large hand-reviewed decision set can contain mistakes] → Bind every record
  to source paths and hashes, require explicit enum conclusions, validate total
  coverage, and make future admission separately reviewable.
- [The upstream repository may disappear or rewrite history] → Keep the exact
  maintainer-only checkout and record remote, commit, tree hash, and every file
  hash in the immutable audit.
- [Named references can be difficult to disambiguate] → Preserve partial,
  unverified, or conflicting results as blockers rather than guessing.
- [Sensitive educational behavior can be hidden in general pedagogy prose] →
  record explicit minor, privacy, learning-analytics, wellbeing, diagnosis, and
  original-framework risk conclusions for every Skill.
- [A future ingest could treat recommendations as approval] → Mark audit policy
  as non-admission, require a separate change, and keep candidate/defer/exclude
  recommendations prospective.
- [The maintainer checkout increases repository size] → Exclude `vendor/` and
  `audits/` from the npm tarball and never execute or install upstream content.

## Migration Plan

1. Add the fixed upstream checkout and verify remote, commit, tree, and clean
   state.
2. Implement the typed audit builder, source-bound review decisions, derived
   report renderer, and generation/check CLI.
3. Generate and review the immutable JSON and report, then run representative,
   full, package, and OpenSpec validation.
4. Keep the completed change ready to archive. Production remains unchanged;
   rollback is removal of the audit-only source, module, scripts, artifacts,
   tests, and project constraint text.

## Open Questions

None for this audit. Production admission, exact generated Skill set, body
adaptations, and domain memberships remain explicit decisions for the future
`ingest-education-agent-skills` change.
