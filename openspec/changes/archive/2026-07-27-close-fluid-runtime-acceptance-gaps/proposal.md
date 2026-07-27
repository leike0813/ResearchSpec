## Why

The fluid runtime architecture is present, but its public action contract still
requires callers to reconstruct CLI-owned fields and repeat plan-bound ceremony
for mechanical work. Final acceptance is also incomplete because static Adapter
health, Doctor crash ordering, routing traceability, and repository validation
do not match the current specifications.

## What Changes

- **BREAKING** Replace Agent-authored action payloads with semantic-only v2
  inputs. The CLI derives version, basis, identity, dependency, and receipt
  fields from the selected action and current authority state.
- Replace the duplicated dry-run/confirmation booleans with one execution-policy
  contract: direct, human-confirmed, or plan-bound.
- Execute low-risk mechanical actions in one invocation while retaining optional
  dry-run and internal hash/read-precondition guarantees.
- Add a bounded static literature-Adapter health projection to default status.
- Commit Doctor recovery evidence before repaired authority so interrupted
  repair remains observable and retryable.
- Close ARSU/Zotero routing traceability, strict OpenSpec validation, and
  current-documentation gaps.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cli-interface`: Define semantic-only action v2, execution policies, and
  bounded Adapter health in status.
- `subflow-instance-control-plane`: Make confirmed external and delegated starts
  executable without mandatory external plan replay.
- `artifact-submit`: Distinguish direct automatic submission from
  human-confirmed manual submission using CLI-derived canonical inputs.
- `gate-transition-control-plane`: Keep Gate writes plan-bound while allowing a
  unique non-semantic transition to execute directly.
- `case-obligation-control-plane`: Make scoped attempt and evidence operations
  direct within confirmed authority boundaries.
- `runtime-recovery`: Make repair receipt durable before authority replacement.
- `literature-system-adapters`: Define the compact static status projection and
  preserve the no-live-probe boundary.
- `arsu-run-usage`: Describe the risk-tiered durable-action protocol.
- `arsu-user-model-acceptance`: Require traceability and black-box acceptance for
  the recovered protocol.
- `mvp-release-readiness`: Require the complete repository validation gate to
  pass before this convergence work is complete.

## Impact

The change affects public action descriptors and JSON input schemas, CLI write
handlers, adaptive and strict transaction preparation, status projection,
Doctor recovery planning, ARSU journey fixtures, and current documentation.
It changes no top-level command, fixed Skill surface, wrapper count, runtime
authority file, dependency, or workspace-state schema.
