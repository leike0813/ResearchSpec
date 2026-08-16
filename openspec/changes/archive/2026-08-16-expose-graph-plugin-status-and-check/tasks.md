## 1. Graph Plugin Status

- [x] 1.1 Add `src/plugins/graph-status.ts` with lightweight registry loading and a structured `GraphPluginStatusView`.
- [x] 1.2 Include `plugins` in `status --json` and add a human plugin summary line.
- [x] 1.3 Keep plugin status load failure non-blocking with `plugin_status_unavailable`.

## 2. Graph Plugin Check

- [x] 2.1 Add `src/plugins/graph-check.ts` with selected-domain, snapshot, ownership, presence, and hash diagnostics.
- [x] 2.2 Wire `check plugins` and the default `all` target into `handleGraphCheck`.
- [x] 2.3 Validate the `check` target in the CLI and update the payload catalog and packaged handbook.

## 3. Regression

- [x] 3.1 Assert graph status exposes selected/resolved/projected plugin state after install.
- [x] 3.2 Assert `check plugins` passes on a complete projection and reports drift; drift becomes blocking under `--strict`.
- [x] 3.3 Update domain plugin documentation for status and check behavior.
- [x] 3.4 Pass typecheck, targeted graph tests, and changed-file lint.
