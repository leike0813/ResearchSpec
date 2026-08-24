## Why

The capability-graph refactor established the new execution model, but the reviewed branch still contains authority leaks, fail-open validation, an unimplemented subgraph contract, unsafe file paths, delivery drift, incorrect generated licenses, and legacy subflow guidance. These gaps must be closed before the graph runtime and packaged agent surface can be treated as the current release contract.

## What Changes

- **BREAKING**: make schema `"2"` graph runs the only runtime contract and remove remaining route/subflow/control-file selectors and guidance.
- Separate Gate and Decision records from execution-node completion so only a validated `advance` completes an execution node.
- Bind subgraph nodes to deterministic child runs that inherit the confirmed parent authorization and derive the parent node state from the child run.
- Make capability validation fail closed and apply one safe project-relative path contract to handoffs, inputs, outputs, and validator files.
- Return structured blockers for ineligible node instructions and report drift between frozen runs and the currently projected profile.
- Move preset graph authority to converter-owned generated data and reconcile capability/profile projections through the existing ownership-aware transactional writer.
- Correct Scientific Agent Skills and Education Agent Skills extension licenses and regenerate their reviewed packages and registries.
- Derive package verification from current registries and reconcile the release whitespace gate with explicitly hash-bound byte-preserved resources.
- Regenerate the four ARSU and five Companion Skills, update current-state documentation, and remove obsolete subflow contracts and tests.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `capability-graph-engine`: define action-record authority, fail-closed validation, child-run subgraphs, bounded blockers, safe paths, and frozen/current profile drift reporting.
- `framework-core`: make converter-owned graph profiles and ownership-aware projection the workspace authority.
- `cli-interface`: define child-run start selectors, structured node blockers, safe path inputs, and the removal of legacy subflow selectors.
- `companion-skills`: require all five Companion workflows to use only the graph runtime protocol.
- `arsu-run-usage`: replace the remaining independent-subflow protocol with confirmed graph entry, child-run, Gate, and Decision behavior.
- `arsu-converter`: require generated ARSU guidance and preset graph data to contain only current graph selectors.
- `agent-tool-delivery`: reconcile core capability/profile projections through manifest ownership and drift protection.
- `agent-surface-model`: align fixed-surface verification with the four ARSU Skills, five Companion Skills, and capability registry.
- `arsu-user-model-acceptance`: exercise child-run entry and current graph-only journeys.
- `mvp-release-readiness`: derive release verification from current registries and define an authored-whitespace gate that preserves verified source bytes.

## Impact

The change affects graph schemas and runtime state, CLI selectors and JSON payloads, bootstrap projection, ARSU and Companion generation, extension-package metadata, release verification, stable specs, tests, and current-state documentation. It adds no dependency, public top-level command, model integration, or schema `"1"` migration path.
