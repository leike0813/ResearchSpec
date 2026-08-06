## Why

The CLI handbook currently describes syntax and options but leaves payload shapes to agent inference. The same handbook is also coupled to `researchspec-navigate`, while `status --json` mixes a small runtime snapshot with unbounded history, diagnostics, and per-tool inspection details. This change makes CLI input contracts discoverable from one source and restores status to a bounded operational snapshot.

## What Changes

- Add typed payload metadata for every public CLI command, including file payload schemas, selector-specific unions, scalar/list/enum forms, and composition constraints.
- Render payload sections from the same catalog into `docs/cli_handbook.md`, command pages, and Commander `--help` output.
- Add the independent Companion Skill `researchspec-cli-handbook` with a broad ResearchSpec CLI/workspace trigger description.
- Remove the handbook reference from `researchspec-navigate` and remove its delivery special case.
- Replace the current status projection with a bounded DTO containing identity, counts, active state, frontier selectors, pending selectors, blockers, aggregate tool health, and compact Adapter health.
- Route detailed diagnostics, history, changes, tools, and Adapter inspection to existing `list`, `show`, `check`, and `doctor` commands.
- Update fixed-surface documentation, package verification, harness projections, and regression tests from 10/17 Skills to 11/18 Skills.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cli-interface`: document all CLI payload forms/help output and define the bounded status contract.
- `companion-skills`: add `researchspec-cli-handbook` and its broad trigger boundary.
- `agent-tool-delivery`: deliver the handbook as an independent Companion Skill and remove the Navigate reference.
- `agent-surface-model`: update the fixed Companion and total Skill counts.
- `arsu-user-routing`: keep Navigate focused on routing while making CLI reference material independently discoverable.
- `literature-system-adapters`: constrain status Adapter projections to aggregate static health.
- `mvp-release-readiness`: update release checks and fixed-surface expectations.
- `skill-browser-harness`: expose the fifth Companion Skill in the generated catalog.

## Impact

The typed CLI catalog, handbook/help renderers, Companion manifest/renderer/delivery, runtime query/status handlers, literature Adapter inspection projection, generated documentation, package verifier, harness catalog, OpenSpec specs, and CLI/delivery tests are affected. No public command, envelope schema version, dependency, or external service contract is added.
