## 1. Workflow Contract And Profile

- [x] 1.1 Add typed workflow definition and work-item schemas with graph, stage, dependency, output-path, validation, and completion constraints.
- [x] 1.2 Add the explicit `arsu-research-slice` profile and derive its workflow, state, and candidate artifact directories during initialization.
- [x] 1.3 Preserve legacy `arsu-paper` workspaces as valid but dynamically unconfigured, and reject profile replacement through `init`.

## 2. Read-Only Workflow Runtime

- [x] 2.1 Implement shared artifact containment, existence, and SHA-256 inspection for workspace checks and workflow evaluation.
- [x] 2.2 Implement deterministic `done`, `ready`, and `blocked` evaluation, dependency reasons, candidate warnings, completion gates, unlocks, and transition boundaries.
- [x] 2.3 Implement ARS logical template resolution and separated work-item instruction packets without runtime writes.

## 3. CLI And Companion Integration

- [x] 3.1 Extend `status` with a single `workflow_control` view while preserving the existing envelope and status fields.
- [x] 3.2 Add `instructions work:<safe-id>` with stable success fields, domain errors, and `submit_available: false`.
- [x] 3.3 Propagate asynchronous status evaluation to handoff and pack consumers.
- [x] 3.4 Update `researchspec-next` to use ready selectors and dynamic instructions instead of static stage-to-Skill inference.

## 4. Documentation And Verification

- [x] 4.1 Update CLI, contract schema, and Skill/command design documentation for the read-only control plane.
- [x] 4.2 Add workflow, CLI, and companion tests for graph validation, legacy compatibility, hash/gate completion, transition boundaries, selector safety, profile initialization, and instruction packets.
- [x] 4.3 Run TypeScript checks, ESLint, all tests, whitespace validation, and a real `init → status → instructions` smoke flow.
