# Proposal

## Why

The Education Agent Skills pin was `snapshot-32fce5c` while the pinned checkout
had advanced to `snapshot-6bbbce4`. The upstream added a root CC BY-SA 4.0 notice,
corrected the Bastani evidence attribution in one learner Skill, and secured the
hosted MCP server. The converter, extension generator, audit, evidence map and
maintenance catalog all still described the previous revision, and the global
release value was written into every generated Skill and notice, so a naive
rebuild would have rewritten all 136 published trees.

## What Changes

- Pin `snapshot-6bbbce4`, re-audit the 241 tracked files and 165 Skills, and keep
  the `snapshot-32fce5c` anchor as immutable history.
- Record per-Skill source release and revision so an unchanged Skill keeps the
  identity of the review that produced it instead of adopting the new pin.
- Rebind only the ten evidence declarations of the two changed Skills, inherit
  the remaining 862 declarations and all 719 works, and keep
  `claim_support_reviewed` false everywhere.
- Derive extension catalog identity from the vendor bundle and write generated
  content only when bytes change, so the 134 unaffected trees, all 136 profiles
  and all validators stay stable.
- Require a fresh user approval of the exact preview aggregate for every
  incremental update, and gate production conversion on it.

## Capabilities

### New Capabilities

None; the reviewed vendor projection keeps the existing domain, extension and
Procedure contracts.

### Modified Capabilities

- `education-agent-skills-domain-skill-audit`: bind the complete
  `snapshot-6bbbce4` inventory and record the reviewed root license scope.
- `education-agent-skills-evidence-verification`: rebind the evidence map to
  the new audit and inherit unchanged declarations and works.
- `education-agent-skills-vendor-conversion`: preserve per-Skill source
  identity, regenerate only affected trees, and require a fresh exact-aggregate
  approval before production conversion.

## Impact

The vendor gitlink, maintenance catalog, converter and generator sources,
production policy and review decision, generated vendor and extension files,
registries, audit anchor, tests and documentation change. Admission, domain
membership, graph profiles, workflow authority and static-resource execution
boundaries are unchanged.
