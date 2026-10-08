# Tasks

## 1. Semantic runtime and cache ownership

- [x] 1.1 Add optional stage, byte and index progress plus readable failure details; verify progress, failure and reuse with semantic-runtime tests.
- [x] 1.2 Implement read-only cache inventory, bounded all-version cleanup and preparation/clear mutual exclusion; verify unknown-file preservation, unsafe paths, busy/dead owners and deletion results in cache/runtime tests.

## 2. Bootstrap interaction

- [x] 2.1 Separate multiline setup disclosures from confirmation and render preparation progress; verify consent, quiet/JSON/non-TTY behavior and narrow-terminal output.
- [x] 2.2 Add retry/offline selection to fresh init, re-init and explicit hybrid update, retaining preference; verify retry success, repeated failure, abandonment and non-interactive single-attempt behavior.
- [x] 2.3 Document visible setup, shared resource reuse and recovery limits in the user model and Procedure discovery guide; check against implemented behavior.

## 3. Cache CLI and documentation

- [x] 3.1 Register doctor search-cache inspection and confirmed/dry-run clearing, available outside workspaces; verify subprocess CLI behavior, confirmation defaults and the unchanged sixteen-command catalog.
- [x] 3.2 Update project instructions and cache user guidance, then regenerate handbook and website catalog projections; verify generator check mode.

## 4. Integration acceptance

- [x] 4.1 Run type checks, relevant tests, changed-file lint and OpenSpec validation; verify all checks pass.
- [x] 4.2 Exercise the packaged CLI with isolated temporary cache for inspect, dry-run, confirmation and cleanup, and inspect the prompt on a narrow terminal; record results without downloading or deleting the user's real cache.
