## 0. Identity Rule

- [x] 0.1 Add `CapabilitySkillIdSchema` for lowercase kebab-case capability IDs (1-128 chars).
- [x] 0.2 Use the dedicated schema for `capability_id` in capability manifests.
- [x] 0.3 Tighten bundled registry entries: kebab-case capability IDs and `source_path` equal to
  `capability_id`.

## 1. Rename Packages

- [x] 1.1 Rename every `cap.<class>.<name>` authoring source to `cap-<class>-<name>`.
- [x] 1.2 Update every graph profile capability reference to the kebab-case IDs.
- [x] 1.3 Update capability tests, graph tests and packaged CLI assertions to the kebab-case IDs.
- [x] 1.4 Update `docs/ars_capability_taxonomy.md` and human-review artifact generators.
- [x] 1.5 Delete the old dotted package directories and regenerate all capability packages,
  manifests and registry entries.

## 2. Regression

- [x] 2.1 Add manifest test coverage rejecting dotted or non-kebab-case capability IDs.
- [x] 2.2 Add bundled-registry test coverage asserting ID format, directory name and source path
  all match.
- [x] 2.3 Regenerate `docs/capability-parity-report.json` and verify 38/38 operational packages.
- [x] 2.4 Regenerate `arsu-mode-capability-review.html` and
  `arsu-mode-graph-match-assessment.html` and verify zero dotted IDs and zero remaining semantic
  gaps.

## 3. Acceptance

- [x] 3.1 Pass typecheck, lint, authoring idempotence, ARSU converter check and full test suite.
