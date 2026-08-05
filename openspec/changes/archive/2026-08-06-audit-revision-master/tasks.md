# Tasks

## 1. Pin and Stage Source

- [x] 1.1 Confirm the official upstream commit `13e69610f216f816f106d1a2a1672eedfa01ac9a` and snapshot name `snapshot-13e69610`.
- [x] 1.2 Reproduce the 48-entry blob inventory, per-entry SHA-256, and sortable set-hash manifest from `https://api.github.com/repos/leike0813/agent-skills/git/trees/0716e9227ee92273fd6016f166672cb13bbbb2fb`.
- [x] 1.3 Stage every tracked blob under `vendor/revision-master/upstream/skills/revision-master/` and verify byte size matches upstream.

## 2. Define Source and Audit Contracts

- [x] 2.1 Write `vendor/revision-master/SOURCE.json` declaring name, repository, commit, snapshot, subpath, license status, upstream author, status, and runtime policy.
- [x] 2.2 Encode the seven documented adaptations, four runtime authorities, six security findings, one content origin, one license claim, and zero external resources in `audits/revision-master/snapshot-13e69610/capability-audit.json`.
- [x] 2.3 Set `policies.future_change = "ingest-revision-master"` and `policies.audit_is_admission = false`.

## 3. Record Audit Evidence

- [x] 3.1 Confirm `tracked_entry_set_sha256 = 9d134f411e440250d3bcda12a082bfeb8df74467556dabb7eb7668793fa7005a` reproduces from the staged bytes.
- [x] 3.2 Author `audits/revision-master/snapshot-13e69610/report.md` as the human-readable counterpart of the machine SSOT.
- [x] 3.3 Author `skills/review-response/metadata.json` binding the published Skill to the snapshot and source commit.
- [x] 3.4 Update root `NOTICE` with the same-author attribution entry and the seven adaptations.
- [x] 3.5 Update `AGENTS.md` with the vendor path block and the vendor policy paragraph.

## 4. Maintainer Converter and Tests

- [x] 4.1 Add `src/vendor-converters/revision-master/cli.ts` exposing `convert [--force] [--dry-run]` / `check` / `idempotence` with the paper-humanizer-compatible JSON result shape.
- [x] 4.2 Wire three `package.json` scripts `revision-master:{convert,check,idempotence}`.
- [x] 4.3 Add `tests/revision-master-audit.test.ts` covering `SOURCE.json`, staged bytes, audit shape, set hash, `metadata.json`, package scripts, CLI dispatch, and a clean `revision-master:check` exit.
- [x] 4.4 Confirm the converter forbids `scripts/__pycache__/` and any `agents/` directory under `skills/review-response/`.

## 5. Verify the Change

- [x] 5.1 Run `revision-master:check` and confirm exit 0 with `ok: true`.
- [x] 5.2 Run `revision-master:idempotence` and confirm `generated_tree_sha256` is stable across runs.
- [x] 5.3 Run `pnpm check`, `pnpm lint`, `pnpm build`, full `pnpm test`, `openspec validate audit-revision-master --strict`, and `pnpm release:verify`.
- [x] 5.4 Run `git diff --check` and confirm no staged production content, no credential residue, and no missing reviewer signature.