# Tasks

## 1. OpenSpec Artifacts

- [x] 1.1 Update proposal, design, spec delta, and tasks from review findings.
- [x] 1.2 Validate the change and all specs in strict mode.

## 2. Anchor Model And Coverage

- [x] 2.1 Consolidate anchor DTOs and upgrade the anchor asset schema.
- [x] 2.2 Separate match evidence from explicit replacement boundaries.
- [x] 2.3 Add deterministic high-risk coverage decisions and validation.
- [x] 2.4 Add the missing state, claim, compliance, review, source, and gate anchors.

## 3. Replacement Semantics

- [x] 3.1 Make the template registry the semantic metadata source of truth.
- [x] 3.2 Correct sprint, rebuttal, claim, compliance, ground-truth, and Passport semantics.
- [x] 3.3 Share ResearchSpec mutation ownership between preflight and templates.
- [x] 3.4 Emit minimal runtime markers containing only paired anchor ids.

## 4. Matcher And Validation

- [x] 4.1 Match unique ordered full spans and reject ambiguous or overlapping spans.
- [x] 4.2 Preserve LF/CRLF and standalone Markdown marker boundaries.
- [x] 4.3 Validate exact marker blocks, local targets, coverage, and semantic metadata.
- [x] 4.4 Canonicalize semantic manifest comparison for idempotence.

## 5. Tests, Documentation, And Regeneration

- [x] 5.1 Extend focused matcher, boundary, coverage, validation, and idempotence tests.
- [x] 5.2 Update the human anchor audit documentation.
- [x] 5.3 Regenerate `skills/arsu` only through the converter.
- [x] 5.4 Run build, lint, test, anchor check, output check, two idempotence checks,
  and targeted generated-output searches.
