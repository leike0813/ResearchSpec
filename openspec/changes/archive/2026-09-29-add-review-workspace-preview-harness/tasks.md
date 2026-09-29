# Tasks

## 1. Sample preview generation

- [x] 1.1 Add three adapter-built sample workspaces and a generated-page bootstrap; verify a focused test validates each descriptor and safe HTML embedding.
- [x] 1.2 Extend the existing harness runner with a preview mode and `--no-open`; verify the command writes three populated pages under `.harness-dist/` and prints their URL.

## 2. Maintainer workflow

- [x] 2.1 Add the `dev:review-workspace` script and update harness documentation; verify the documented headless command runs and preview pages are absent from production `dist`.
- [x] 2.2 Open the generated preview in a browser, switch all three scenarios, exercise review controls and export, and validate the exported result with the existing schema.

## 3. Integration checks

- [x] 3.1 Run OpenSpec validation, TypeScript check, lint, and focused tests; resolve any failures and confirm the change has no public CLI or production-page edits.
