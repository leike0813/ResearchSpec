## Context

ResearchSpec currently ships one audited and converted vendor, ToolUniverse, through a vendor/domain Registry Schema 1. The registry already supports global Skill IDs, hard dependency closure, overlapping domains, offline delivery, and vendor provenance. The ToolUniverse converter is intentionally source-specific, but it currently writes the whole registry and owns a single-vendor domain catalog.

Scientific Agent Skills v2.53.0 is materially different: it has 147 top-level Skills, mixed content and dependency-license declarations, extensive executable resources and installation instructions, an upstream security report, platform extensions, and content spanning well beyond the three current biomedical domains. Its audit must preserve these differences without treating upstream metadata or scanner labels as production approval.

## Goals / Non-Goals

**Goals:**

- Pin and completely account for the v2.53.0 source tree.
- Separate business relevance, structural adaptation, security review, content licensing, authority review, and domain fit.
- Capture reviewed cross-Skill relationship evidence for a later converter.
- Define how a second vendor will eventually coexist with ToolUniverse without registry overwrite or vendor-facing install units.
- Restore the ToolUniverse audit capability to valid current-state OpenSpec form.

**Non-Goals:**

- Generate, register, distribute, install, or execute scientific-agent-skills content.
- Add domains, public commands, workspace state, runtime dependencies, or a generic converter ABI.
- Re-run an external security scanner, install upstream dependencies, or certify scientific correctness.
- Resolve every blocked license or security finding during this audit.

## Decisions

### Pin the latest stable release as a maintainer-only submodule

`vendor/scientific-agent-skills` uses the official repository and is pinned to tag `v2.53.0` commit `9c9bd2e92af12311ecd0c1a643e0931643f9ea04`. The later `main` additions are excluded. The checkout is audit input only and remains outside npm distribution and user runtime.

### Keep one complete vendor-specific audit SSOT

`audits/scientific-agent-skills/v2.53.0/skill-audit.json` records every top-level directory containing `SKILL.md` exactly once. A thin internal contract shares source, resource, finding, path, and relationship shapes with other audits, while vendor-specific classifications and summaries remain local.

Each Skill records scope disposition, ingest readiness, upstream categories, fit to the three existing production domains, resource counts, structured relationships, content-license review, upstream-security evidence, and findings. The audit uses `blocked-review` for relevant Skills that cannot yet be admitted; this preserves the difference between business relevance and approval.

### Treat upstream categories as evidence, not production domains

The audit retains upstream categories and records `direct`, `supporting`, or no fit to each existing ResearchSpec domain. It creates no new domain IDs or installable objects. Scientific communication and workflow-like Skills receive explicit ARSU/core-overlap findings rather than forming a second workflow surface.

### Make security and license review conservative and explainable

The pinned upstream `SECURITY.md` is reconciled as source evidence. Critical or High Skill results block later admission until reviewed; upstream `safe` never means ResearchSpec-approved. Explicit redistribution or derivative prohibitions cause exclusion. Missing, Unknown, proprietary, non-commercial, copyleft, or otherwise ambiguous content licenses remain blocked until a maintainer records an applicable content-license conclusion.

Frontmatter `license` is not automatically treated as the Skill content license because it frequently describes a package, service, or dataset. Every conclusion cites an in-tree evidence path.

### Classify relationships before using dependency closure

Cross-Skill references are recorded as `required`, `related`, or `routing`, with evidence. Only a later reviewed `required` decision may enter the existing registry `dependencies` field. Package-name coincidences and advisory examples do not enlarge installation.

### Freeze the later adapter as vendor-specific and non-executing

The future converter will consume the audit as an allowlist and policy input, normalize supported frontmatter, move environment and runtime requirements into `compatibility` and prose, apply explicit resource dispositions, and generate accurate `LICENSE` and `NOTICE.md` files. It will not execute scripts, install dependencies, configure credentials, contact upstream services, or grant workflow authority.

Production Skill IDs will preserve non-conflicting source-neutral upstream IDs. A collision will receive a semantic qualifier chosen by the domain catalog rather than a vendor-name prefix.

### Assemble multiple vendors centrally

Future vendor converters will emit isolated vendor bundle manifests and Skill trees. A source-neutral domain catalog will own cross-vendor membership, and one central assembler will validate all bundles and atomically emit `skills/plugins/registry.json`. This replaces converter-order-dependent whole-registry writes without making a public converter ABI.

Registry Schema 1 will later require a Skill-level content-license value while retaining the vendor root license; existing ToolUniverse Skills will be populated with `Apache-2.0`. Because the schema is unreleased, that later change will not increment `schema_version`. No registry implementation changes occur in this audit.

### Repair the ToolUniverse current-state specification in place

The main ToolUniverse spec is rewritten with `Purpose` and `Requirements`. Its obsolete empty-registry scenario becomes a provenance rule: audit evidence alone does not grant admission, while the separately implemented converter remains responsible for the existing production bundle.

## Risks / Trade-offs

- **Upstream submodule is absent in a checkout** → focused tests fail with an initialization command and never invent audit data.
- **Security counts are mistaken for affected-Skill counts** → the audit stores both separately and recomputes the per-Skill distribution.
- **License declarations mix content and dependency licenses** → ambiguous records remain blocked and cite evidence rather than guessing.
- **Static cross-Skill extraction produces false dependencies** → every edge requires a reviewed relationship class before runtime use.
- **No new domains are proposed** → broad non-biomedical content remains unshippable until a later product decision, which is preferable to freezing premature install units.
- **Shared audit helpers grow into a framework** → reuse is limited to deterministic repository evidence; policies remain vendor-specific.

## Migration Plan

1. Normalize the existing ToolUniverse main spec and prove all current specs validate.
2. Add the pinned submodule and the complete scientific-agent-skills audit.
3. Add focused tests and npm negative assertions without touching production assets.
4. In a later change, implement Skill-level licensing, isolated vendor bundles, the domain catalog, central assembler, and the source-specific converter together.

Rollback removes the new submodule, audit artifacts, helpers, tests, and audit capability; no workspace or published registry migration is required.

## Open Questions

None. Production domain additions and individual blocked-review resolutions are deliberately deferred to the later ingest change.
