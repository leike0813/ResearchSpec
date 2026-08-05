# Design

## Context

The previously archived change `2026-08-05-absorb-revision-master-core-skill`
replaced a thin SQLite wrapper with the full six-stage `revision-master`
workflow sourced from `leike0813/agent-skills`. The published tree in
`skills/review-response/` already includes the SKILL.md, three localization
messages, two schema/template/runtime asset directories, ten references, and
eight Python scripts. The published tree is therefore a complete, executable
Skill package, but it ships without an audit anchor.

The seven other ResearchSpec vendors each ship one of:

1. a `vendor/<x>/` submodule or static snapshot that pins the upstream commit
   and stages the source bytes;
2. an `audits/<x>/<snapshot>/{*-audit.json, report.md}` machine-and-human SSOT
   that records per-entry SHA-256s, content origins, license claims, runtime
   authorities, external resources, security findings, knowledge surfaces, and
   the future-change id;
3. a `skills/.../metadata.json` (paper-humanizer) or per-Skill
   `LICENSE` + `NOTICE` (FinRobot, HistAgent, Education Agent Skills) that
   binds the published Skill to the source;
4. a maintainer converter at `src/vendor-converters/<x>/cli.ts` that
   recomputes source-tree and generated-tree hashes and rejects drift;
5. an `AGENTS.md` vendor policy paragraph, a `NOTICE` attribution entry, and
   an `OpenSpec` change directory for the audit step.

The `review-response` Skill ships only `LICENSE` and the published tree, so a
future upstream push cannot be diffed and no future change can claim to be
"re-applying" the absorption.

The upstream repository `leike0813/agent-skills` aggregates Skills as
submodules; the relevant subpath is `skills/revision-master/`. The only
upstream commit touching that subpath on `main` is
`13e69610f216f816f106d1a2a1672eedfa01ac9a` dated 2026-06-01 by Joshua Reed
(leike0813). The repository root has no `LICENSE` file; the
`skills/revision-master/` subtree has no per-skill `LICENSE` or copyright
notice. The published Skill LICENSE therefore declares
`Copyright (c) 2026 ResearchSpec contributors` (the same principal as the
upstream author) to keep redistribution authority explicit.

The upstream bytes (48 blobs, 567,926 bytes) have been staged at
`vendor/revision-master/upstream/skills/revision-master/` and confirmed
byte-for-byte against `https://raw.githubusercontent.com/leike0813/agent-skills/13e69610f216f816f106d1a2a1672eedfa01ac9a/...`.

## Goals / Non-Goals

**Goals:**

- Bind official source `https://github.com/leike0813/agent-skills` to
  immutable revision `13e69610f216f816f106d1a2a1672eedfa01ac9a` and
  snapshot name `snapshot-13e69610`.
- Inventory every tracked blob, give every entry exactly one explicit
  disposition (`retain` is sufficient here because no entry is unsafe),
  compute a sortable per-entry SHA-256 manifest, and bind the manifest with
  `tracked_entry_set_sha256 = 9d134f411e440250d3bcda12a082bfeb8df74467556dabb7eb7668793fa7005a`.
- Freeze the seven documented adaptations that produced
  `skills/review-response/` from upstream `revision-master/`.
- Add `skills/review-response/metadata.json` binding the published Skill to
  the snapshot and source commit.
- Add a TypeScript maintainer converter that byte-compares the 25
  byte-identical upstream files against the published tree, verifies
  existence of the 22 adapted files, verifies the one renamed
  (`assets/schema/revision-master-schema.yaml` →
  `assets/schema/review-response-schema.yaml`), forbids the upstream
  `scripts/.gitkeep` placeholder and any `scripts/__pycache__` residue, and
  rejects any unexpected file under `skills/review-response/`.
- Record the audit in `AGENTS.md` and `NOTICE` so future agents can find it.

**Non-Goals:**

- Creating a converter for paper-humanizer-style runtime regeneration;
  `review-response` SKILL.md was manually adapted at the prose level and the
  converter only verifies the byte-identical subset (the 25 templates,
  `localization/source-messages.yaml`, and `scripts/detect_main_tex.py`).
- Importing or executing upstream Python.
- Installing dependencies, reading credentials, contacting services.
- Editing the published `skills/review-response/SKILL.md`,
  `assets/`, `references/`, `scripts/`, or `LICENSE`.
- Replicating or interpreting the upstream commit author's earlier Git
  history, tests, examples, or publish scripts.

## Decisions

### Pin as a static snapshot, not a submodule

The upstream repository is a meta-repo of submodule-wrapped Skills. Vendoring
the whole repository as a submodule would introduce a 1.4 MB tarball of
unrelated Skills (paper-condenser, literature-digest, etc.) that this change
must never reference, and would force the audit to scan 200+ files that are
out of scope. A static snapshot under `vendor/revision-master/upstream/`
containing only the absorbed subpath matches the paper-humanizer pattern and
keeps the audit scoped to the relevant 48 blobs.

### Use a SHA-256 set hash, not a Git blob SHA-1

The upstream blobs are Git blob SHA-1s computed over `blob <size>\0<content>`.
Reproducing them from raw.githubusercontent.com would require running `git
cat-file` or `git hash-object --stdin` for every file. SHA-256 of working-tree
bytes is reproducible with `sha256sum` and matches the convention used by
`histagent`, `education-agent-skills`, and `materials-science-skills-for-llm`.
The audit's `blob_sha_field_semantics` field records this choice explicitly.

### Classify files into four buckets

The converter classifies the 48 upstream blobs and the 49 expected published
files into four buckets:

1. `byteIdenticalFiles` (25 entries): `assets/templates/*.j2`,
   `assets/templates/render-manifest.yaml`,
   `assets/localization/source-messages.yaml`, and
   `scripts/detect_main_tex.py`. These are byte-compared on every `check`.
2. `adaptedFiles` (1 entry): `assets/schema/revision-master-schema.yaml` →
   `assets/schema/review-response-schema.yaml`. Existence-only; the byte diff
   is documented in the audit.
3. `adaptedSourceFiles` (22 entries): `SKILL.md`,
   `assets/localization/messages/{en,zh-CN}.json`,
   `assets/runtime/skill-runtime-digest.md`, 9 `references/*.md`, and 7
   `scripts/*.py` (excluding `detect_main_tex.py`). Existence-only; each
   adaptation is documented in the audit.
4. `expectedExistenceOnly` (1 entry): `LICENSE`. No upstream source; the
   converter verifies presence but does not byte-compare.

`metadata.json` is generated by the converter and byte-compared. The
`scripts/__pycache__/` and `agents/` paths are forbidden.

### Treat the upstream author identity as the license anchor

The upstream root LICENSE is absent and per-skill LICENSE is absent. The
published `LICENSE` declares `Copyright (c) 2026 ResearchSpec contributors`
(the same principal as upstream author `Joshua Reed (leike0813)`) and the
audit's `license_claims[0]` records this as `root-mit-absent` /
`implicit-only`. The `NOTICE` entry and `metadata.json.license_note` restate
the same fact. This is the same-author pattern, not a third-party grant.

### Freeze exactly seven adaptations, at section granularity

The diff between `vendor/revision-master/upstream/skills/revision-master/SKILL.md`
(29,032 bytes) and `skills/review-response/SKILL.md` (30,574 bytes) shows 33
hunks touching frontmatter name, H1, paths, dependency tone, the new
ResearchSpec control-plane boundary, and minor editorial rewrites. The
audit lists seven adaptations at section granularity (skill-rename,
instance-root-paths, researchspec-control-plane, control-projection,
schema-renamed, third-party-runtime-tone, review-comment-coverage-appendix),
matching the paper-humanizer pattern.

### Inherit the paper-humanizer converter pattern

`src/vendor-converters/revision-master/cli.ts` follows
`src/vendor-converters/paper-humanizer/cli.ts` for the CLI surface
(`convert [--force] [--dry-run]` / `check` / `idempotence`) and the JSON
result shape (`ok`, `command`, `source_commit`, `source_repository`,
`source_subpath`, `source_snapshot`, `generated_files`,
`source_tree_sha256`, `generated_tree_sha256`, `errors`, `drift_paths`,
`missing_source_paths`, `missing_published_paths`,
`unexpected_published_paths`). The paper-humanizer pattern is the lightest
weight precedent that already ships and already passes its own `check`.

## Risks / Trade-offs

- **[Manual SKILL.md edits bypass byte-compare]** → The seven adapted files
  are documented in the audit `adaptations` array; future
  `ingest-revision-master` work must re-validate each adaptation before
  publishing.
- **[Same-author license is not a third-party grant]** → The audit and
  `NOTICE` state this explicitly. A later reviewer who cannot confirm the
  same-author identity must escalate before re-publishing.
- **[Set hash is per-byte, not per-commit]** → Any re-fetch from raw.githubusercontent.com
  that yields different bytes (line-ending normalization, encoding change)
  will change the per-entry SHA-256 and break the set hash. Future audits
  should re-fetch with `--raw` mode or use `git cat-file blob <sha>` for
  byte-identical upstream reproduction.
- **[Maintainer converter only protects 25 of 48 files]** → The 22 adapted
  files are documented; future drift in those files is not detected by
  `check`. The audit's `summary_counts.adaptations = 7` plus the documented
  `adaptedSourceFiles` make this explicit.
- **[Python `__pycache__` residue breaks `check`]** → Tests for
  `review-response.test.ts` invoke the upstream Python scripts as
  subprocesses, which create `__pycache__/`. The audit test cleans the
  cache before running `revision-master:check`. The published Skill ships
  without `__pycache__/`.

## Migration Plan

1. Stage upstream bytes at `vendor/revision-master/upstream/`.
2. Add `vendor/revision-master/SOURCE.json` and
   `audits/revision-master/snapshot-13e69610/{capability-audit.json, report.md}`.
3. Add `skills/review-response/metadata.json`.
4. Add `src/vendor-converters/revision-master/cli.ts` and the three
   `package.json` scripts.
5. Add `tests/revision-master-audit.test.ts`.
6. Update `NOTICE` and `AGENTS.md`.
7. Run `revision-master:check`, `revision-master:idempotence`,
   `pnpm check`, `pnpm lint`, `pnpm build`, `pnpm test`, `openspec
   validate audit-revision-master --strict`, and `pnpm release:verify`.

Rollback removes the audit directory, the vendor snapshot directory, the
converter, the `metadata.json`, the package scripts, the focused test, and
the `NOTICE` and `AGENTS.md` paragraphs. The published Skill tree and
`review-response` business behavior are not touched and require no
migration.

## Open Questions

None. Future incremental update work belongs to `ingest-revision-master`,
which must consume this audit as its sole evidence source.