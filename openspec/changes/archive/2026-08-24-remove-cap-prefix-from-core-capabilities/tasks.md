## 0. Naming Rule

- [x] 0.1 Record the new naming rule in the OpenSpec capability-manifest spec delta.
- [x] 0.2 Keep plugin extension IDs (`plugin-*`) unchanged and covered by the same kebab-case schema.

## 1. Rename Packages

- [x] 1.1 Rename every core authoring source from `cap-<class>-<name>` to `<class>-<name>`.
- [x] 1.2 Update every graph profile capability reference to the prefix-free IDs.
- [x] 1.3 Update packaged ARSU paper-humanizer Reference-mode path guidance.
- [x] 1.4 Update capability, graph, CLI, paper-humanizer, review-response, and maintenance tests.
- [x] 1.5 Update taxonomy documentation, current OpenSpec specs, and human-review artifact generators.
- [x] 1.6 Delete the old `cap-*` package directories and regenerate all capability packages,
  manifests, registry entries, and the generated ARSU skill trees.

## 2. Review Artifacts And Anchors

- [x] 2.1 Regenerate `docs/capability-parity-report.json` and verify 47/47 operational packages.
- [x] 2.2 Regenerate the three ARSU review HTML artifacts with no old core `cap-*` IDs.
- [x] 2.3 Refresh the current ARSU anchor and both own-vendor anchors with the renamed IDs.

## 3. Acceptance

- [x] 3.1 Pass typecheck, lint, authoring idempotence, ARSU converter check, maintenance anchor
  checks, and the full test suite.
