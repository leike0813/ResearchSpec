# Proposal

## Why

ResearchSpec's ToolUniverse projection is pinned to v1.5.4. Upstream v1.5.10 changes the Skill inventory and tool contracts that the existing research Procedures cite.

## What Changes

- Pin v1.5.10 at `6b50abef032a702554e2b34a4f592ee674f12f8f` and audit all 229 canonical upstream Skills.
- Retain the 130 admitted IDs and their domain memberships. Record each other Skill's exclusion or deferred admission in the audit.
- Reconcile changed tool contracts and regenerate the reviewed vendor and extension projection, preserving unaffected bytes and per-Skill provenance.
- Record the generated artifact review and the new maintenance baseline alongside the historical baseline.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tooluniverse-domain-skill-audit` uses the complete inventory at the pinned release as the validation scope.

## Impact

The upstream gitlink, maintenance catalog, audit, converter policies, generated packages, tests, and maintainer documentation change. Existing Procedure selectors, graph profiles, and workflow authority remain stable.
