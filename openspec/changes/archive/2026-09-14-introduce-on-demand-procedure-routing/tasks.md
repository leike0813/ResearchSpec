## 1. Procedure Catalog And Packets

- [x] 1.1 Add the runtime-derived Procedure catalog over ARSU, Companion, core, and extension registries; verify deterministic identities, lexical ranking, default limit, and stable pagination with focused tests.
- [x] 1.2 Add the shared versioned activation-packet builder for standalone and graph modes; verify identical package content/hash and distinct authority/completion envelopes with focused tests.

## 2. CLI Activation Surface

- [x] 2.1 Extend `list`, `show`, and `instructions` with procedure discovery and standalone activation while keeping global discovery read-only and activation workspace-bound; verify CLI JSON behavior and domain-selection diagnostics.
- [x] 2.2 Embed graph-mode procedure packets in eligible node instructions and remove `plugin instructions`; verify existing node eligibility/role behavior and replacement guidance.

## 3. Agent Delivery And Navigation

- [x] 3.1 Reduce desired Agent projections to Navigate-only delivery plus unchanged selected Zotero Skills, including Skill-only commands fallback and one Navigate wrapper; verify all delivery modes and safe retirement/drift behavior.
- [x] 3.2 Make Navigate compact and route through progressive procedure discovery, mode selection, graph authority, and native fallback; verify rendered Companion content and catalog ownership checks.
- [x] 3.3 Stop domain plugin Skill/capability projection while preserving selection, resolution snapshots, profile projection, and activation eligibility; verify plugin install/update/uninstall behavior and stable Agent catalog counts.

## 4. Mode-Neutral Generated Packages

- [x] 4.1 Update core capability authoring and ARSU preflight generation to defer lifecycle completion to activation packets; regenerate through the ARSU maintenance workflow and verify converter/idempotence checks.
- [x] 4.2 Update all six vendor extension generation paths to emit mode-neutral completion, regenerate through each owning maintenance workflow, and verify package registries, reviewed bytes, and maintenance checks.

## 5. Harness And Documentation

- [x] 5.1 Update the read-only browser harness to separate visible entries from hidden procedure inventory; verify catalog loading, hierarchy search, and safe file boundaries.
- [x] 5.2 Update `AGENTS.md`, the canonical usage model, CLI/architecture/plugin docs, and diagrams to describe on-demand procedures, two activation modes, and Navigate-only delivery; verify documentation checks and stale-term searches.

## 6. Integration Verification

- [x] 6.1 Run focused delivery, CLI, graph, plugin, Companion, and harness tests; fix regressions without adding implementation-detail assertions.
- [x] 6.2 Run typecheck, build, OpenSpec strict validation, affected maintenance checks, and package verification; record any environment-only limitation.
