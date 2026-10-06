# Proposal

## Why

Writing guidance loses influence over long sessions. Users need the reviewed Paper Humanizer guard present before each prompt is processed, without invoking a Procedure for every message.

## What Changes

- Install a project-local writing guard by default for selected, reviewed hook-capable hosts, independent of delivery mode.
- Add `--paper-humanizer-guard on|off` and persist the selection.
- Preserve shared host settings and user hooks during installation, update and retirement.
- Freeze the adapted guard and dependency-free publisher in owned-vendor maintenance.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-tool-delivery`: prompt guard delivery, protocol metadata, ownership and static diagnostics.
- `own-vendor-maintenance`: optional delivery assets in semantic review and anchor identity.

## Impact

Tool adapters, config contract, bootstrap CLI, status/check/doctor, package contents and generated handbook. No dependency, public command, Procedure or workflow authority is added.
