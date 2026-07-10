## Context

Five technical changes implement the canonical routing, subflow, Gate/transition, profile, and Agent-surface layers. Existing tests exercise those components, but several call core planners directly and no durable artifact proves complete coverage of the three umbrella capabilities. The acceptance layer must remain test-only, use packaged public interfaces, and survive archival of the umbrella change.

## Goals / Non-Goals

**Goals:**

- Exercise eleven canonical user journeys through independent CLI processes.
- Simulate only Agent-owned semantic outputs; require every authoritative state mutation to pass through public CLI dry-run and bound execution.
- Validate a single machine-readable mapping from main capability requirements/scenarios to archived technical changes and stable test IDs.
- Produce enough evidence to archive the surface, acceptance, and umbrella changes without warnings.

**Non-Goals:**

- Running real literature research, manuscript generation, or LLM APIs.
- Adding runtime commands, schemas, production acceptance endpoints, or test bypasses.
- Replacing focused unit tests or asserting fragile prose and serialization order.

## Decisions

1. **Black-box state boundary.** Journey helpers spawn `dist/src/cli/main.js`; they may create files at instruction-declared candidate paths but never import core runtime planners or edit authoritative runtime stores.
2. **Dynamic frontier driver.** Helpers consume status/instructions packets and their returned selectors, dependencies, validation profiles, hashes, and plan hashes. Stable route/branch IDs may express the simulated user's choice, but stage order is never recreated in the test.
3. **Traceability as data.** A JSON fixture is the SSOT for capability requirement/scenario coverage, responsible technical changes, journey IDs, and test IDs. A test parses main specs and requires exact coverage; the human guide links to this fixture rather than duplicating it.
4. **Umbrella specs become main specs before acceptance.** The three existing ADDED specs are intelligently synced first, allowing the acceptance suite to remain valid after the umbrella directory is archived.
5. **Isolated delivery.** Bootstrap uses ForgeCode so all installed assets remain project-local. Tests do not touch Codex global prompts.
6. **Dependency-ordered archival.** Verify/archive surface first, then sync/verify/archive acceptance, then verify/archive umbrella. No archive proceeds with critical or warning findings.

## Risks / Trade-offs

- [Full pipeline journeys may be slow] → Share small CLI helpers, use minimal valid candidate bytes, and keep each workspace isolated without installing all 31 tool projections.
- [Tests could accidentally encode profile internals] → Drive stage/subflow selection from frontier packets; hard-code only public route and explicit user-choice IDs under acceptance.
- [Traceability could become stale] → Parse the main spec requirement/scenario headers and require exact one-or-more mapping from the JSON manifest.
- [A black-box failure may expose a product defect] → Fix the owning production module and keep the acceptance expectation unchanged; do not add test-only state mutation.

## Migration Plan

No workspace migration is required. Sync the three umbrella capability specs to main, add test/documentation assets, validate, and archive changes in dependency order. Rollback consists of reverting the acceptance assets and archive moves; runtime workspaces are untouched.

## Open Questions

None.
