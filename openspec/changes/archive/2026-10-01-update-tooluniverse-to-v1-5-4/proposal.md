# Proposal

## Why

The ToolUniverse pin is v1.3.1 while the latest tagged release is v1.5.4. The
upstream inventory grew from 150 to 185 Skills, the FAERS, eQTL, Reactome and
CLUE tool contracts changed, and three new business candidates appeared that
have not completed admission review. The pinned v1.3.1 audit, generated bundle
and extension packages no longer describe the reviewed source.

## What Changes

- Pin v1.5.4 and re-audit all 185 upstream Skills, keeping the v1.3.1 anchor as
  historical evidence.
- Keep the admitted set at 130; the 35 new upstream entries are recorded as
  excluded, and the three business candidates stay outside production until a
  separate admission change.
- Add reviewed tool-contract adaptations so generated content matches the
  v1.5.4 FAERS parameters and envelopes, the retired eQTL routes and the
  Reactome coverage field, instead of executing or requiring upstream code.
- Record a per-Skill audited source identity so an incremental regeneration
  rewrites only affected capabilities and leaves unaffected bytes stable.
- Replace fixed inventory counts in the converter with evidence-driven checks
  and generate the new anchor, records and semantic review.

## Capabilities

### New Capabilities

None; the reviewed vendor projection uses the existing domain, extension and
Procedure contracts.

### Modified Capabilities

- `tooluniverse-domain-skill-audit`: cover the complete 185-Skill v1.5.4
  inventory and per-Skill source identity.
- `vendor-skill-conversion`: admit from catalog-selected evidence rather than
  fixed historical counts, and record reviewed tool-contract adaptations.
- `domain-skill-plugin-registry`: keep the 130 admitted ToolUniverse Skills and
  their domain membership stable across the update.

## Impact

The vendor gitlink, maintenance catalog, converter policies, generated vendor
and extension packages, audit anchor, tests and maintainer documentation
change. Admission, domain membership, graph profiles, workflow authority and
static-resource execution boundaries remain unchanged.
