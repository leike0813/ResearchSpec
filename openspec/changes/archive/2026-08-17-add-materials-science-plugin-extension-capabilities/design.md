## Context

Materials-Science-Skills-For-LLM production trees are instruction-led: seven complete `SKILL.md` trees, six with exactly one conditionally read reference, and one Tier 1 tree with no reference. The new-mode conversion must preserve the complete external-tool workflows without bundling any executable or provisioning any scientific runtime.

## Goals / Non-Goals

**Goals:**

- Convert all seven reviewed production Skills into one-to-one extension capability packages with one-node graph profiles.
- Package the six reviewed references as hash-bound knowledge refs so projection copies them into Agent tool trees.
- Add deterministic evidence validators without bundling or executing upstream commands.
- Establish the Materials-Science maintenance suite with reproducible records, baseline manifest, checks, and Agent semantic review.

**Non-Goals:**

- Re-auditing upstream Materials-Science-Skills-For-LLM or changing the immutable `snapshot-fafd3ab` audit.
- Replacing or removing the raw vendor-bundle Skills from domain resolution.
- Installing, invoking, or configuring APEX, Atomsk, DeePTB, DP-GEN, GPUMD, Phonopy, Uni-Mol, GPU/remote services, schedulers, or HPC resources.
- Adding new capability manifest schema fields or public CLI commands.

## Decisions

### One raw Skill -> one extension package

Each reviewed Skill maps to exactly one `plugin-materials-*` capability and one same-named profile. Provenance remains one-to-one, and raw and extension surfaces stay independently selectable.

### Instruction-led packages with script validators

All seven packages are `execution_type: llm` because the workflow is Agent procedure plus user-managed external tools. Each still declares a deterministic `validate_materials_brief.py` script validator, which runs only during `advance` and never invokes the external tool.

### References stay knowledge refs

Six packages copy their reviewed reference into `references/` and record it as a hash-bound knowledge ref under the MIT license. Atomsk has no reference by review decision and gets `knowledge_refs: []`.

### Maintenance anchor is the existing audit snapshot

The suite anchors at `audits/materials-science-skills-for-llm/snapshot-fafd3ab` and binds the immutable capability audit, vendor-bundle tree, extension registry subset, extension package/profile trees, maintenance Skill, catalog, and records. `scripts/materials-science-maintenance.mjs` implements `artifacts / records / baseline / check / diff`.

## Risks

- The `research_brief` contract is intentionally minimal; later changes can bind package-specific schemas when plugin schemas are formalized.
- External-tool availability and compute authority remain user-owned and are documented in each `SKILL.md`; the extension package never changes that boundary.
