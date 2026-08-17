## Context

HistAgent production trees are independently reimplemented eight-file Skill trees: complete `SKILL.md`, one deterministic entrypoint, shared `lib/historical_support.py`, two conditionally read references, license, notice, and derivation. The new-mode conversion must preserve that closure while making each Skill graph-runnable.

## Goals / Non-Goals

**Goals:**

- Convert all three reviewed HistAgent production Skills into one-to-one extension capability packages with one-node graph profiles.
- Package scripts, support library, and references as hash-bound knowledge refs so projection copies the complete closure into Agent tool trees.
- Add deterministic evidence validators without executing any HistAgent tool during install, update, status, or check.
- Establish the HistAgent maintenance suite with reproducible records, baseline manifest, checks, and Agent semantic review.

**Non-Goals:**

- Re-auditing upstream HistAgent or changing the immutable `snapshot-47bbe21` capability audit.
- Replacing or removing the raw vendor-bundle Skills from domain resolution.
- Executing bundled tools, OCR/translation adapters, browser logic, or network calls during ResearchSpec maintenance or static commands.
- Adding new capability manifest schema fields or public CLI commands.

## Decisions

### One raw Skill -> one extension package

Each reviewed HistAgent Skill maps to exactly one `plugin-historical-*` capability and one same-named profile. Provenance remains one-to-one, and raw and extension surfaces stay independently selectable.

### The full eight-file closure is knowledge

Each package copies the raw entrypoint into `tools/`, the shared support file into `tools/historical_support.py`, and both references into `references/`. All copied files are `knowledge_refs` with content hashes and Apache-2.0 licensing. The extension `SKILL.md` keeps the ordinary path and all hard constraints inline; references remain conditionally read detail, exactly as reviewed.

### Evidence-bound validators

Each package declares `validators/validate_historical_brief.py --required <fields>`. The validator reads the runner-produced submission JSON, resolves the `research_brief` output path, and requires the package-declared evidence-bearing sections. It never executes the package tool.

### Maintenance anchor is the existing audit snapshot

The suite anchors at `audits/histagent/snapshot-47bbe21` and binds the immutable capability audit, vendor-bundle tree, extension registry subset, extension package/profile trees, maintenance Skill, catalog, and records. `scripts/histagent-maintenance.mjs` implements `artifacts / records / baseline / check / diff`.

## Risks

- The `research_brief` contract is intentionally minimal; later changes can bind package-specific schemas when plugin schemas are formalized.
- HistAgent extension packages may run user-managed external adapters when invoked by the target Agent; ResearchSpec itself never executes or configures them.
