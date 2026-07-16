## Why

Education Agent Skills is a possible sixth source of project-maintained domain
Skills, but its untagged upstream tree mixes educational content, named research
claims, platform surfaces, sensitive learner-facing behavior, and repository-wide
licensing signals. ResearchSpec needs a complete, immutable, reproducible audit
before any production admission or converter work can be proposed safely.

## What Changes

- Pin the official Education Agent Skills repository at commit
  `32fce5c0d097ec675cf81c750a65a379e4d87e3c` as maintainer-only
  `snapshot-32fce5c` input, with remote, commit, tree hash, and tracked-file
  identity verified deterministically.
- Add a complete audit of every tracked file and every `skills/**/SKILL.md`,
  including parsed metadata, evidence, relationships, provenance, licensing,
  contributors, overlap, sensitive-audience risks, prospective ANZSRC Group
  mappings, and non-production ingest recommendations.
- Add deterministic internal audit and read-only audit-check commands, a
  machine-readable audit SSOT, a report derived from that SSOT, and tests for
  completeness, stability, source drift, and representative risk conditions.
- Freeze the boundaries for a separate future
  `ingest-education-agent-skills` change without creating a converter,
  admitting a Skill, registering a vendor, or modifying the public CLI.
- Preserve unresolved claims and license conclusions as explicit blockers;
  audit completion is not production admission.

## Capabilities

### New Capabilities

- `education-agent-skills-domain-skill-audit`: Defines immutable source pinning,
  exhaustive repository and Skill review, deterministic audit artifacts, and
  the evidence boundary for a future native-Skill ingest change.

### Modified Capabilities

None.

## Impact

- Adds a maintainer-only source checkout under `vendor/education-agent-skills`
  and immutable evidence under `audits/education-agent-skills/`.
- Adds a vendor-local audit implementation and internal package scripts; no new
  runtime dependency, public CLI command, production registry entry, vendor
  bundle, domain membership, or published Skill is introduced.
- Updates project constraints and package verification so the source checkout
  and audit evidence remain outside the npm tarball.
- Establishes source-hash-bound design decisions consumed only by a later,
  separately reviewed ingest change.
