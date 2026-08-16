## 1. Graph-Native Plugin Projection

- [x] 1.1 Add `src/plugins/graph-delivery.ts` with selected-domain closure planning, manifest-owned writes, stale-file reconciliation, drift diagnostics, and empty-directory cleanup.
- [x] 1.2 Preserve resolution snapshots for unavailable selected domains and strict-fail explicit uninstall on drifted removal candidates.
- [x] 1.3 Reuse `ToolInstallationManifestSchema` so plugin writes preserve non-plugin installations and resolutions.

## 2. Plugin CLI Lifecycle

- [x] 2.1 Wire `plugin install` to project selected-domain Skills, update config, and commit the manifest last.
- [x] 2.2 Wire `plugin uninstall` to remove only hash-clean unreachable files and block on scheduled drift.
- [x] 2.3 Wire `plugin update` to reconcile projections and block unavailable selected domains.
- [x] 2.4 Implement `plugin instructions <skill-id>` with closure, projection, and hash verification.
- [x] 2.5 Extend `plugin list` and `plugin show` with resolved-Skill counts.

## 3. Graph Bootstrap Synchronization

- [x] 3.1 Synchronize selected plugin projections after existing-workspace `init` reconfiguration.
- [x] 3.2 Synchronize selected plugin projections after `update` tool/delivery changes.
- [x] 3.3 Block graph init/update projection refresh when a selected domain is unavailable.

## 4. Acceptance

- [x] 4.1 Add graph-workspace plugin install/instructions/update/uninstall regression coverage.
- [x] 4.2 Document graph-workspace plugin projection and instructions behavior.
- [x] 4.3 Pass typecheck, targeted graph CLI tests, and changed-file lint.
