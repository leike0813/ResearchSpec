## Why

The first ARSU converter slice injects ResearchSpec contract guidance only at
skill entrypoints. That is not strong enough for ARS-derived skills whose real
runtime instructions live across agent and reference documents, so the next
step is to audit upstream contract surfaces and create stable assets for future
targeted replacements.

## What Changes

- Add a curated audit document for ARS runtime contract surfaces in `vendor/ars`.
- Add a machine-readable contract anchor table for high-risk upstream contract
  text that should later be matched and replaced during conversion.
- Add a deterministic upstream manifest that records the audited runtime file
  tree, headings, frontmatter, content hashes, and contract-risk keyword hits.
- Add a lightweight developer check for the anchor table and upstream manifest.
- Add a package script for anchor/manifest validation.
- Keep this change read-only with respect to generated ARSU skills:
  - do not implement the matcher;
  - do not replace upstream contract text;
  - do not regenerate `skills/arsu`;
  - do not add public CLI commands;
  - do not perform current-only cleanup.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `arsu-converter`: add requirements for ARSU contract anchor audit assets,
  upstream manifest tracking, and developer-only validation.

## Impact

- Affected OpenSpec specs: `arsu-converter`.
- Affected documentation: new ARSU contract anchor audit document under `docs/`.
- Affected converter assets: new anchor table and upstream manifest under
  `src/arsu-converter/anchors/`.
- Affected developer tooling: package script for validating anchor assets
  against the current `vendor/ars` checkout.
- Non-goals:
  - no matcher implementation;
  - no conversion-time replacement;
  - no maintainer companion skill;
  - no generated `skills/arsu` changes;
  - no public `researchspec` CLI changes;
  - no LLM API calls.
