# Tasks

## 1. OpenSpec Artifacts

- [x] 1.1 Create proposal, design, spec delta, and tasks for
  `apply-arsu-anchor-matcher-replacements`.
- [x] 1.2 Validate the new change with
  `openspec validate apply-arsu-anchor-matcher-replacements --type change --strict`.
- [x] 1.3 Validate all specs with `openspec validate --all --strict`.

## 2. Matcher And Templates

- [x] 2.1 Add robust anchor matcher using source path, heading hints,
  whitespace-tolerant snippets, and case-insensitive keywords.
- [x] 2.2 Treat `required` and `recommended` anchors as blocking when unmatched.
- [x] 2.3 Treat `diagnostic` anchors as report-only findings.
- [x] 2.4 Add replacement template registry keyed by `future_template_id`.
- [x] 2.5 Generate stable `researchspec-anchor-replacement` start/end markers.

## 3. Converter Integration

- [x] 3.1 Run anchor matching before generated output overwrite/removal.
- [x] 3.2 Apply replacements in the text transform pipeline for source files
  copied directly, shared dependencies, and cross-skill dependencies.
- [x] 3.3 Keep existing dependency rewrite and `SKILL.md` Contract Preflight
  behavior intact.
- [x] 3.4 Extend `researchspec-contracts.json` with anchor replacement profile
  metadata.
- [x] 3.5 Extend conversion manifest and report with anchor replacement summary
  and per-anchor records.

## 4. Validation And Tests

- [x] 4.1 Validate generated replacement markers against manifest records.
- [x] 4.2 Add matcher unit tests for whitespace-tolerant matching and
  line-number independence.
- [x] 4.3 Add conversion tests for missing required/recommended blocking.
- [x] 4.4 Add conversion tests for diagnostic-only missing anchors.
- [x] 4.5 Add generated marker and manifest validation tests.
- [x] 4.6 Add idempotence coverage after replacements.

## 5. Regeneration And Verification

- [x] 5.1 Run `pnpm arsu:check` before conversion to confirm existing generated
  output is clean.
- [x] 5.2 Run `pnpm arsu:convert` without `--force`.
- [x] 5.3 Run `pnpm arsu:check`.
- [x] 5.4 Run `pnpm arsu:idempotence`.
- [x] 5.5 Run `pnpm run build`.
- [x] 5.6 Run `pnpm run lint`.
- [x] 5.7 Run `pnpm run test`.
- [x] 5.8 Run `pnpm arsu:anchors:check`.
- [x] 5.9 Run targeted `rg` checks over `skills/arsu` for replacement markers
  and ResearchSpec runtime terms.
