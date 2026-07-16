## Why

The immutable Education Agent Skills audit and evidence map now cover all 165
upstream Skills, 872 evidence declarations, and 813 declared relationships, but
they deliberately grant no production admission. ResearchSpec needs a separate
source-hash-bound ingestion layer that resolves Skill-level redistribution,
evidence disclosure, learner safety, relationship semantics, domain membership,
and deterministic conversion without importing the upstream MCP, installer,
tests, scripts, or platform runtime.

## What Changes

- Add an Education Agent Skills production policy that resolves all 165 Skills:
  19 original-framework-risk Skills and 10 Sean Hu-attributed Skills remain
  excluded, while 136 Gareth Manning-authored non-original Skills proceed to
  complete-tree review.
- Build complete in-memory admission, evidence-adaptation, relationship, safety,
  license, and domain catalogs bound to the immutable audit and evidence map.
- Convert only reviewed upstream `SKILL.md` files to
  `education-agent-skills-<upstream-name>`, preserving the complete semantic
  body while normalizing frontmatter and adding evidence, authority, privacy,
  learner-safety, wellbeing, and human-oversight boundaries.
- Mark unresolved evidence in `evidence_sources` and in source-bound body units
  with paired `⟦UNRESOLVED⟧` markers; verified-only content remains unmarked.
- Add CC BY-SA 4.0 `LICENSE` and complete `NOTICE.md` files to every generated
  Skill, with author, source hash, attribution, and modification disclosure.
- Add preview, convert, check, and idempotence maintainer commands. Preview
  computes per-file, per-Skill, and aggregate hashes plus a Chinese review
  report. Production conversion fails closed until a human approves the exact
  aggregate hash.
- After approval only, add the sixth isolated vendor and its 136 Skills to the
  three reviewed existing education domains through the source-neutral catalog.

## Capabilities

### New Capabilities

- `education-agent-skills-vendor-conversion`: Defines exhaustive source-bound
  admission, evidence and safety adaptation, deterministic complete-tree
  generation, hash approval, isolated conversion, and package publication.

### Modified Capabilities

- `education-agent-skills-domain-skill-audit`: Connects the immutable audit to
  separately reviewed production dispositions without changing audit bytes.
- `education-agent-skills-evidence-verification`: Defines how existence-only
  evidence conclusions are disclosed in generated Skills.
- `vendor-skill-conversion`: Extends complete multi-vendor staging to a sixth
  isolated vendor.
- `domain-skill-plugin-registry`: Adds the approved sixth vendor with empty hard
  dependencies and advisory-only relationships.
- `domain-taxonomy`: Adds explicit membership only in the three reviewed
  education domains.
- `mvp-release-readiness`: Publishes approved generated assets while excluding
  source checkout, audit/evidence SSOTs, policy sources, and preview material.

## Impact

This change adds OpenSpec artifacts, a native Skill converter, source-bound
policy and review files, focused tests, generated preview and review artifacts,
maintainer scripts, licensing disclosures, and—only after hash approval—the
sixth vendor registry/domain/package assets. It does not add dependencies,
public CLI commands, wrappers, hard Skill dependencies, workflow authority, or
runtime execution of upstream code.
