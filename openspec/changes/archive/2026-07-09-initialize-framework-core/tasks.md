# Tasks

## 1. Project Scaffold

- [x] 1.1 Create `package.json` with package metadata, pnpm package manager metadata, scripts, and `researchspec` bin entry.
- [x] 1.2 Create TypeScript configuration for strict `src/` compilation.
- [x] 1.3 Add source and test directory structure.
- [x] 1.4 Add package ignore/build output hygiene without removing existing user files.
- [x] 1.5 Initialize a lint tool and add a package `lint` script.

## 2. CLI Entrypoint

- [x] 2.1 Implement the `researchspec` CLI dispatcher.
- [x] 2.2 Implement help output listing only first-slice commands.
- [x] 2.3 Implement version output that does not require a workspace.
- [x] 2.4 Return clear errors for unsupported commands.

## 3. Workspace Layout

- [x] 3.1 Define the canonical first-slice workspace file list.
- [x] 3.2 Add templates for `specs/project.md`, `sources.yaml`, `claims.yaml`, `manuscript.yaml`, and `workflow.yaml`.
- [x] 3.3 Add templates for `runs/current/state.yaml`, `artifact-registry.json`, `decision-ledger.jsonl`, and `gate-ledger.jsonl`.
- [x] 3.4 Ensure templates are parseable and do not invent research content.

## 4. `init`

- [x] 4.1 Implement `researchspec init [path] --tools none`.
- [x] 4.2 Implement `--dry-run` planned-write reporting without file writes.
- [x] 4.3 Refuse unsupported `--tools` values with a clear adapter-out-of-scope message.
- [x] 4.4 Avoid overwriting existing workspace files by default.

## 5. `status`

- [x] 5.1 Implement nearest workspace discovery.
- [x] 5.2 Report missing workspace with a `researchspec init` next step.
- [x] 5.3 Report initialized workspace status from the skeleton and `state.yaml`.
- [x] 5.4 Implement `status --json` as a single stdout JSON object.

## 6. `check`

- [x] 6.1 Validate required workspace directories and files.
- [x] 6.2 Parse YAML and JSON machine-facing contracts.
- [x] 6.3 Parse JSONL ledger files line by line, allowing empty ledgers.
- [x] 6.4 Report blocking diagnostics for missing or invalid required files.
- [x] 6.5 Keep full field-level schema validation out of this slice.

## 7. Tests

- [x] 7.1 Add tests for `init --dry-run` no-write behavior.
- [x] 7.2 Add tests for `init --tools none` skeleton creation.
- [x] 7.3 Add tests for idempotent init not overwriting existing files.
- [x] 7.4 Add tests for `status` missing and initialized workspace behavior.
- [x] 7.5 Add tests for `check` success on fresh workspace.
- [x] 7.6 Add tests for missing file and invalid YAML/JSON/JSONL diagnostics.

## 8. Verification And Docs Alignment

- [x] 8.1 Run the package build and focused test suite.
- [x] 8.2 Run `openspec validate initialize-framework-core --type change --strict`.
- [x] 8.3 Update design docs only if implementation discovers a mismatch with the current CLI/workspace design.
