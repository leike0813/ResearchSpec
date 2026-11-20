# Proposal

## Why

Scientific Agent Skills v2.72.0 changes the source of all 56 admitted Skills, adds 14 candidates and removes four previously excluded Skills. Its security report retains older observations, so the release needs a source-bound review before the production projection can advance.

## What Changes

- Audit all 177 Skills at the new immutable pin and evaluate each new candidate for production admission.
- Reconcile security, content, license, overlap, resource, dependency and domain evidence before publishing the reviewed vendor and extension projections.
- Remove resources that the previous Scientific Agent Skills projection owned and the new projection drops.
- Record semantic review and verification in the new audit anchor.

## Capabilities

### Modified Capabilities

- `scientific-agent-skills-domain-skill-audit` covers the current source pin and complete inventory.
- `scientific-agent-skills-vendor-conversion` requires the reviewed current input and removal of retired projection resources.
- `scientific-agent-skills-manual-security-review` binds maintainer decisions to the current source while distinguishing carried upstream scanner evidence from current inspection.

## Impact

The vendor pin, audit records, converter policy inputs, Scientific Agent Skills generated packages and domain memberships change together after review. The existing CLI, registry schemas and extension I/O contracts continue to apply.
