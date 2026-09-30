# Proposal

## Why

The Scientific Agent Skills pin is v2.53.0 while the latest tagged release is v2.70.0. All 49 admitted entries changed, the source now has 167 Skills, and security evidence moved into a separate JSON report.

## What Changes

- Pin v2.70.0 and preserve the v2.53.0 audit as historical evidence.
- Review the complete current inventory, including 21 additions and one upstream removal, before reconciling admission, resources, relationships and domains.
- Generate the reviewed vendor and extension projections and complete per-capability semantic evidence.
- Resolve source identity and inventory from the maintenance catalog rather than duplicated release literals and counts.
- Present upstream citation metadata as optional attribution guidance, without automatically inserting citations into user work.

## Capabilities

### New Capabilities

None; reviewed vendor additions use existing domain and Procedure contracts.

### Modified Capabilities

- `scientific-agent-skills-domain-skill-audit`: anchor the complete v2.70.0 inventory and current report evidence.
- `scientific-agent-skills-vendor-conversion`: reconcile the current reviewed inventory with source-bound policies.
- `scientific-agent-skills-manual-security-review`: retain approved curation and review current findings against the actual source rather than a fixed historical batch count.

## Impact

The vendor gitlink, maintenance catalog, converter policies, generated vendor and extension files, existing domain memberships, audit records, related tests and maintainer documentation change. ResearchSpec workflow authority and static-resource execution boundaries remain intact.
