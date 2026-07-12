## 1. Current Contracts

- [x] 1.1 Replace workflow and run-state unions with the strict current instance contracts and remove singleton stage fields.
- [x] 1.2 Restrict runtime selectors, submission policies, confirmation bases and validation profiles to current scoped forms.
- [x] 1.3 Replace loose artifact, Gate and Decision compatibility records with explicit current native and imported-evidence schemas.

## 2. Runtime And CLI

- [x] 2.1 Delete static workflow evaluation and legacy artifact-submit target resolution; update status, instructions and handoff to instance state.
- [x] 2.2 Make init profile-free and `arsu-v0-1`-only; remove transitional profile source and migration paths.
- [x] 2.3 Remove product-retired Companion reconciliation while retaining generic ownership and drift protection.

## 3. ARS Import And Converter

- [x] 3.1 Rename Material Passport request, state and type contracts to explicit import terminology and preserve imported-evidence non-authority.
- [x] 3.2 Rename converter compatibility metadata to contract integration metadata and remove Passport export/legacy runtime guidance from converter-owned replacements.
- [x] 3.3 Regenerate ARSU outputs and verify report, manifest and idempotence consistency.

## 4. Specifications And Documentation

- [x] 4.1 Revise the active Material Passport change to remove old ResearchSpec compatibility promises and use the new interface names.
- [x] 4.2 Clean current main specs, AGENTS guidance and current design/user documents so they describe only the current model.

## 5. Tests And Verification

- [x] 5.1 Replace legacy behavior tests with rejection boundaries and current end-to-end workflow, import and delivery coverage.
- [x] 5.2 Run strict OpenSpec validation, TypeScript checks, lint, tests, build, ARSU converter gates and release verification.
