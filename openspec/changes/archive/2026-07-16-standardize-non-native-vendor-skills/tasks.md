## 1. Define The Authoring Standard

- [x] 1.1 Add the canonical non-native vendor Skill standard covering complete main-file instructions, progressive disclosure, capability mechanisms, dependencies, provenance, and review.
- [x] 1.2 Add the baseline authoring scaffold and the script-assisted, stateful, and resource-backed extension scaffolds without creating a generated runtime protocol.
- [x] 1.3 Update `AGENTS.md` with the non-native upstream conversion boundary and keep `ingest-histagent` paused.

## 2. Implement Maintainer Validation

- [x] 2.1 Define the internal non-native Skill definition, extension, capability implementation, reference-route, file, and diagnostic types.
- [x] 2.2 Implement deterministic validation for complete main-file structure, paths, frontmatter, placeholders, capability mappings, references, scripts, resources, distribution metadata, and unsupported runner conventions.

## 3. Record Migration Evidence

- [x] 3.1 Assess the current HistAgent draft, FinRobot production, and Materials production trees against the standard without changing or readmitting them.
- [x] 3.2 Record HistAgent, FinRobot, and Materials migration gaps and the fixed migration order in a human-reviewable baseline report.

## 4. Protect The Contract

- [x] 4.1 Add focused positive tests for the baseline and optional extensions using complete authored in-memory trees.
- [x] 4.2 Add table-driven negative tests for stable diagnostic codes covering missing instructions, placeholders, reference routing, capability implementations, scripts, resources, paths, metadata, and private runner files.
- [x] 4.3 Confirm existing production registry and package scripts remain unchanged and the new validator is not a global release gate before vendor migration.

## 5. Verify The Change

- [x] 5.1 Run `openspec validate standardize-non-native-vendor-skills --strict`, `pnpm check`, focused and full `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm release:verify`.
- [x] 5.2 Run `git diff --check` and confirm no HistAgent, FinRobot, or Materials generated tree was modified by this change.
