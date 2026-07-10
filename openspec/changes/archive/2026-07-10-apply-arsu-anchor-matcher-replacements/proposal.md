## Why

ResearchSpec now has an audited ARSU contract anchor table, but conversion still
only injects a generic preflight block at each skill entrypoint. The next step
is to use the anchor table during conversion so generated ARSU skills contain
ResearchSpec-compatible runtime contract instructions at the execution points
where agents actually read them.

## What Changes

- Add robust anchor matching for `vendor/ars` runtime sources using source
  paths, headings, snippets, and keywords rather than line numbers.
- Block conversion when `required` or `recommended` anchors cannot be matched.
- Treat `diagnostic` anchors as report-only findings.
- Replace matched `required` and `recommended` anchor spans with generated
  ResearchSpec contract guidance during conversion.
- Record anchor match and replacement results in generated metadata and reports.
- Validate generated output markers against the conversion manifest.
- Regenerate `skills/arsu` from the fixed `vendor/ars` checkout after the
  implementation is complete.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `arsu-converter`: add conversion-time robust anchor matching and contract
  replacement for audited ARS-native contract instructions.

## Impact

- Affected code: ARSU converter matching/replacement modules, text transform
  pipeline, generated manifest/report, compatibility manifest, validation, and
  tests.
- Affected generated output: `skills/arsu` will be regenerated with
  `researchspec-anchor-replacement` marker blocks.
- Public CLI impact: none. This remains developer-only converter behavior.
- Non-goals:
  - no public `researchspec` command changes;
  - no maintainer companion skill;
  - no broad upstream current-only cleanup;
  - no semantic workflow execution;
  - no LLM API calls.
