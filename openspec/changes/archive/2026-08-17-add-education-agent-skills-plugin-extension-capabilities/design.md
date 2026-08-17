## Context

Education Agent Skills production trees are homogeneous static trees: 136 Skills with only `SKILL.md`, CC-BY-SA-4.0 `LICENSE`, and `NOTICE.md`. This makes the conversion a pure SKILL-body-preserving generator with no resource copying.

## Goals / Non-Goals

**Goals:**

- Convert all 136 reviewed production Skills into one-to-one extension capability packages with one-node graph profiles.
- Preserve each reviewed `SKILL.md` body byte-for-byte except the frontmatter replacement and the appended ResearchSpec node contract.
- Give every package a deterministic evidence validator without executing any resource.
- Establish the Education Agent Skills maintenance suite with reproducible records, baseline manifest, checks, and Agent semantic review.

**Non-Goals:**

- Re-auditing upstream Education Agent Skills or changing the immutable `snapshot-32fce5c` audit and evidence map.
- Replacing or removing the raw vendor-bundle Skills from domain resolution.
- Executing upstream installers, MCP servers, scripts, tests, or dependencies.
- Adding new capability manifest schema fields or public CLI commands.

## Decisions

### Generated one-to-one conversion

The generator reads the reviewed `skills/plugins/vendors/education-agent-skills/<skill-id>` trees and the domain catalog. It creates `plugin-education-agent-skills-<suffix>` packages, profiles, registry entries, and the maintenance catalog. The generator is idempotent and only writes its own extension projection.

### Static llm packages

All 136 packages are `execution_type: llm` with `knowledge_refs: []`. The reviewed tree has no bundled scripts or references, so the extension SKILL is the complete ordinary path and the validator only checks the six evidence fields.

### Shared registry version

All three bulk generators (ToolUniverse, Scientific Agent Skills, Education Agent Skills) emit registry version `0.7.0` so running any vendor's `baseline` does not regress another vendor's manifest.

### Maintenance anchor is the existing audit snapshot

The suite anchors at `audits/education-agent-skills/snapshot-32fce5c` and binds the immutable skill audit, evidence map, vendor-bundle tree, extension registry subset, package/profile trees, maintenance Skill, catalog, and records. `scripts/education-agent-skills-maintenance.mjs` implements `artifacts / records / baseline / check / diff`.

## Risks

- The generic evidence contract is intentionally coarse; education-domain schema specialization is deferred until plugin schemas are formalized.
- The 136 package registry load adds work to every extension check; this is accepted because the packages are static and hash-bound.
