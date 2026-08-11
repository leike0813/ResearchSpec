## Why

ARSU academic-paper and the published review-response Skill reference
`paper-humanizer/references/prose-guidance.md`, but the current Paper Humanizer
publishes a self-contained Reference mode in `paper-humanizer/SKILL.md` and no
longer contains that file. This leaves required prose-writing paths broken.

## What Changes

- Define the Paper Humanizer Reference mode entrypoint as a shared contract.
- Update ARSU and Review Response to load that entrypoint rather than the
  retired reference path.
- Record and validate the Review Response change as an eighth approved
  adaptation of the pinned Revision Master source.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `paper-humanizer-python-runtime`: Reference mode consumers use the
  self-contained packaged Skill entrypoint.
- `revision-master-domain-skill-audit`: the published Review Response audit
  records and validates the Reference mode alignment as an approved adaptation.

## Impact

The ARSU converter, Revision Master converter, their generated Skill artifacts,
their offline checks, and the current OpenSpec contracts are affected. No public
CLI command, model integration, or external service behavior changes.
