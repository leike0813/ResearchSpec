## Why

`academic-pipeline:mid-entry` currently starts its parent at the synthetic `entry` checkpoint, but no child or transition is executable from that checkpoint. A newly confirmed mid-entry therefore exposes an empty frontier and cannot start its intended first child.

## What Changes

- Require every mid-entry Start to name one user-confirmed, profile-declared executable child entry point.
- Start the parent at that child checkpoint and preserve the selected entry point in the immutable Start confirmation.
- Let only the selected first child bypass profile-internal upstream child and branch prerequisites; retain route prerequisites, inputs, Gates, cost, manuscript snapshot and file checks.
- Treat revision and re-review entry as ResearchSpec-local round 1, then restore ordinary dependency, Gate, branch and dynamic-round rules after the first transition.
- Expose structured mid-entry choices and Start payload shape through runtime instructions and generated CLI documentation.
- Reject invalid mid-entry declarations and Starts before workspace writes, and diagnose legacy parents whose checkpoint is not in the current profile.
- Keep workspace/profile schema version `1`, preserve ordinary optional-child semantics, and do not migrate existing synthetic-entry controls.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `arsu-workflow-profiles`: Mid-entry profile entries declare executable child entry points and runtime evaluation applies a one-time selected-entry exemption.
- `subflow-instance-control-plane`: Mid-entry Starts bind and persist the selected entry point while retaining independent first-child confirmation.
- `cli-interface`: Instructions and Start payload documentation expose and validate mid-entry choices, and workspace checks report invalid profile checkpoints.
- `arsu-user-model-acceptance`: Packaged CLI journeys prove that a selected mid-entry child is exposed and can start.

## Impact

This changes the pipeline-profile and Start-command contracts, the ARSU academic-pipeline projection, subflow/workflow runtime evaluation, workspace checking, instruction packets, payload documentation, user guidance and the existing profile/control/CLI journey tests. It adds no dependency, public command, migration path or runtime model integration.
