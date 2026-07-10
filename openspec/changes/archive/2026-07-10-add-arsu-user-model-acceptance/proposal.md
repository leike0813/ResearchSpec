## Why

The canonical ARSU user model is implemented across routing, runtime, profiles, Gate/transition control, and Agent delivery, but its final umbrella tasks still lack one durable public-CLI acceptance suite and a machine-checkable requirement-to-evidence map. Component tests alone do not prove that the complete user journeys compose without hidden state or internal planner shortcuts.

## What Changes

- Add a black-box acceptance harness that simulates Agent-produced candidates while performing every workflow-state transaction through the public ResearchSpec CLI.
- Cover bootstrap, vague routing, expert direct routing, standalone, pipeline, parallel join, Gate challenge/override, revision rounds, resume, context export, and terminal completion journeys.
- Add a strict traceability manifest mapping every requirement and scenario in the three canonical umbrella capabilities to technical changes, journey IDs, and test IDs.
- Add a concise acceptance guide and update current-state documentation after the suite passes.
- Verify and archive the completed surface, acceptance, and umbrella changes in dependency order.

## Capabilities

### New Capabilities

- `arsu-user-model-acceptance`: Public-CLI journey acceptance, canonical capability traceability, and archive-readiness evidence for ARSU user model v0.1.

### Modified Capabilities

None. The accepted user-visible contracts are unchanged.

## Impact

- Adds test-only CLI journey infrastructure, a machine-readable traceability fixture, and acceptance documentation.
- Synchronizes the existing umbrella capability specs into main specs before validation and archives all completed related changes.
- Does not add CLI commands, dependencies, migrations, runtime state, or production-only acceptance hooks.
