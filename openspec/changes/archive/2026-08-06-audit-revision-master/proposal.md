# Audit revision-master as the review-response Core Skill anchor

## Why

The previously archived change `2026-08-05-absorb-revision-master-core-skill`
absorbed the upstream `revision-master` Skill into `skills/review-response/`
without leaving an auditable provenance anchor. Unlike the other ResearchSpec
vendors (ARS, ToolUniverse, Scientific Agent Skills, Materials-Science-Skills-
For-LLM, FinRobot, HistAgent, Education Agent Skills), there is no upstream
commit pin, no `audits/revision-master/<snapshot>/` machine SSOT, no `metadata.json`
inside the published Skill, no `NOTICE` attribution entry, and no maintainer
converter. Future upstream pushes to `leike0813/agent-skills` would have no
baseline to diff against, and no future change could honestly claim to be
"re-applying" the absorption.

This change adds the missing anchor without modifying the published Skill
tree. It freezes the source provenance so a future `ingest-revision-master`
change can perform incremental updates deterministically.

## What Changes

- Pin the official `leike0813/agent-skills` repository at commit
  `13e69610f216f816f106d1a2a1672eedfa01ac9a` as maintainer-only input
  `vendor/revision-master/upstream/skills/revision-master/`, with a typed
  `vendor/revision-master/SOURCE.json` that declares the snapshot name
  `snapshot-13e69610`, the upstream author identity, and the implicit-only
  license status (upstream root LICENSE is absent; per-skill LICENSE is absent;
  the only attribution is the commit author `Joshua Reed (leike0813)`, the same
  principal as ResearchSpec contributors).
- Add an immutable audit directory `audits/revision-master/snapshot-13e69610/`
  with `capability-audit.json` (machine SSOT: 48-entry tracked blob inventory,
  per-entry SHA-256, sortable 48-line set-hash manifest, content origin
  records, license claims, runtime authorities, zero external resources, six
  security findings, knowledge surfaces, seven documented adaptations, and
  future-change id `ingest-revision-master`) and a human-readable `report.md`.
- Add a typed `skills/review-response/metadata.json` that binds the published
  Skill to the snapshot and source commit, declares capabilities and
  exclusions, and explicitly records the same-author license interpretation.
- Add a TypeScript maintainer converter at
  `src/vendor-converters/revision-master/cli.ts` exposing
  `convert [--force] [--dry-run]` / `check` / `idempotence`, wired into
  `package.json` as `pnpm revision-master:{convert,check,idempotence}` and
  producing structured JSON with `source_tree_sha256`, `generated_tree_sha256`,
  `drift_paths`, `missing_source_paths`, `missing_published_paths`,
  `unexpected_published_paths`, and `errors`.
- Add a focused regression test `tests/revision-master-audit.test.ts` that
  validates `SOURCE.json`, the staged upstream files, the audit JSON shape,
  the set-hash reproducibility, the `metadata.json` binding, the package
  scripts, the converter CLI subcommand dispatch, and a clean
  `revision-master:check` exit against the current Skill tree.
- Record the upstream author attribution and the seven adaptations in the
  root `NOTICE` file and in `AGENTS.md`'s vendor path block and vendor policy
  paragraph.

## Capabilities

### New Capabilities

- `revision-master-domain-skill-audit`: Defines the immutable audit, the
  source-provenance SSOT, the `tracked_entry_set_sha256` reproducibility
  contract, the seven recorded adaptations, the future-change id
  `ingest-revision-master`, and the maintainer converter contract.

### Modified Capabilities

None.

## Non-goals

- No production Skill regeneration.
- No new public CLI command.
- No Python dependency installation, no Python script execution during
  conversion, checking, packaging, installation, or release verification.
- No upstream LICENSE fabrication.
- No removal of the existing `skills/review-response/SKILL.md`,
  `assets/`, `references/`, `scripts/`, or `LICENSE` files; this change only
  adds the anchor and a `metadata.json` next to them.
- No change to the review-response Core Skill route, profile, control plane,
  or ARSU-facing user model.

## Impact

The change affects maintainer-only paths:
- a new vendor snapshot directory `vendor/revision-master/`,
- a new audit directory `audits/revision-master/snapshot-13e69610/`,
- a new converter at `src/vendor-converters/revision-master/cli.ts` and its
  compiled `dist/` equivalent,
- three new `package.json` scripts,
- a new `skills/review-response/metadata.json`,
- a new focused regression test,
- `NOTICE` and `AGENTS.md` text additions.

It adds no dependency, no public CLI surface, no production vendor Skill,
no registry or domain publication, no provider configuration, no credential
handling, no service contact, and no upstream-code execution.