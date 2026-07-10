## 1. Change Artifacts And Contracts

- [x] 1.1 Rewrite the proposal, design, and delta specs for the eight-skill suite, public `propose` command, delivery expansion, and shared target validation.
- [x] 1.2 Validate the rewritten change strictly before implementation and keep the active change unarchived.

## 2. Contract Change Proposal Runtime

- [x] 2.1 Define and validate the strict semantic proposal input DTO and derived canonical contract-patch model.
- [x] 2.2 Extract a shared YAML/Markdown target resolver with operation, current-value, selector uniqueness, path, and evidence-reference validation.
- [x] 2.3 Implement create-only proposal rendering and a three-file write plan with `contract-patch.yaml` last.
- [x] 2.4 Add the public `propose` command, JSON/dry-run/confirmation behavior, error mapping, and post-create visibility through list/show/check.
- [x] 2.5 Reuse target validation during `decide accept`, including Markdown current-value drift protection.

## 3. Companion Architecture And Workflows

- [x] 3.1 Replace the monolithic companion intent source with typed manifest, shared build-time guidance, renderer, public index, and workflow modules.
- [x] 3.2 Implement self-contained `explore`, `check`, `next`, and `context` workflows with complete triggers, state branches, recovery, output contracts, and ARSU boundaries.
- [x] 3.3 Implement self-contained `propose`, `verify`, `decide`, and `archive` workflows with semantic safeguards, confirmation gates, evidence rules, recovery, and completion checks.
- [x] 3.4 Keep command projection generic and thin while preserving independent ARSU wrapper metadata.

## 4. Delivery And Documentation

- [x] 4.1 Deliver eight companion `SKILL.md` files to all 31 tools and eight wrappers to all 28 command-capable tools through existing ownership and path rules.
- [x] 4.2 Verify safe stale cleanup for old manifest-owned CLI references and drift preservation for user-modified copies.
- [x] 4.3 Synchronize CLI interface, contract schema, skill-command design, PRD, and architecture documentation with the implemented current state.

## 5. Tests

- [x] 5.1 Cover manifest uniqueness, required skill sections and semantic branches, command projection parity, near-miss routing, and ARSU separation without full-text snapshots.
- [x] 5.2 Cover proposal validation, dry-run isolation, write ordering, collision and path safety, selector and operation rules, evidence references, and JSON isolation.
- [x] 5.3 Cover proposal-to-decide-to-receipt-to-archive lifecycle and current-value drift at acceptance.
- [x] 5.4 Cover registry-derived 31-by-8 skill delivery, 28-by-8 wrapper delivery, skills-only diagnostics, Codex paths, manifest ownership, drift, force, and stale cleanup.

## 6. Validation

- [x] 6.1 Run strict change and repository-wide OpenSpec validation.
- [x] 6.2 Run build, lint, the full test suite, `pnpm arsu:check`, and `git diff --check`; resolve all regressions without weakening contracts.
