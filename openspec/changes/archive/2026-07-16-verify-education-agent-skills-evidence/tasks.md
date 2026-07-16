## 1. Evidence Contracts and Audit Binding

- [x] 1.1 Define strict work, source, declaration-mapping, summary, and top-level evidence-map schemas with deterministic ordering and cross-reference invariants.
- [x] 1.2 Bind the evidence map to the immutable audit SHA-256, snapshot ID, revision, tree hash, and exact copied declaration fields.
- [x] 1.3 Implement deterministic JSON serialization, JSON-derived Markdown rendering, and read-only artifact synchronization checks.

## 2. Complete Evidence Verification

- [x] 2.1 Normalize all 872 declarations into stable works, including repeated citations, title variants, editions, translations, composite identities, and non-publication methods.
- [x] 2.2 Verify normalized publications against reliable bibliographic or official network sources and record returned metadata, access dates, identifiers, and field-match conclusions.
- [x] 2.3 Record explicit reasons for every unresolved, conflicting, and not-applicable work while keeping claim-support review fixed to false.
- [x] 2.4 Generate `evidence-map.json` and the deterministic `evidence-report.md`, then review actual status and affected-Skill summaries.

## 3. Maintainer CLI and Project Boundaries

- [x] 3.1 Add an internal offline evidence-check CLI and the `education-agent-skills:evidence:check` package script without changing the public CLI.
- [x] 3.2 Extend npm package verification so audit, evidence, vendor checkout, and maintainer evidence code remain excluded.
- [x] 3.3 Update project `AGENTS.md` with the evidence-map identity, existence-only boundary, offline-check rule, and deferred ingest decision.

## 4. Tests

- [x] 4.1 Test immutable audit binding, exact 872-ID coverage, copied declaration identity, unique work IDs, valid references, and stable sorting.
- [x] 4.2 Test verified-source requirements, explicit non-verified reasons, not-applicable type restrictions, and literal false claim-support review.
- [x] 4.3 Test composite one-to-many mapping, rejection of ordinary fan-out, deterministic serialization/report rendering, and read-only drift detection.
- [x] 4.4 Test package and production boundaries and confirm the audit JSON/report and existing registry/domain/vendor surfaces remain unchanged.

## 5. Validation

- [x] 5.1 Run strict OpenSpec validation, offline evidence check, focused and full tests, type checking, lint, build, package verification, and `git diff --check`.
- [x] 5.2 Map every requirement and scenario to implementation/test evidence and run `openspec-verify-change` with no remaining CRITICAL issue.

## 6. Supplementary Google Scholar Review

- [x] 6.1 Extend the evidence contract and report with a separate, deterministic Google Scholar discovery catalog covering the 428 initially unresolved works.
- [x] 6.2 Target every initially unresolved work through Google Scholar and record the exact returned, no-result, and provider-blocked boundary without treating Scholar as a verification source.
- [x] 6.3 Independently verify plausible Scholar candidates through reliable bibliographic or official destinations and update work outcomes conservatively.
- [x] 6.4 Regenerate the evidence report, update maintenance guidance and focused tests, and review the revised status and affected-Skill totals.
- [x] 6.5 Re-run all offline, project, package, and OpenSpec verification gates with no remaining CRITICAL issue.
