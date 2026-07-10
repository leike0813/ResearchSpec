## Why

ResearchSpec has deterministic commands for inspecting, validating, deciding,
packaging, and archiving a research workspace, but agents still lack a complete
workflow layer for using those commands safely. The first companion draft was
too thin: four wrappers delegated almost all judgment to a shared reference,
left orientation, semantic verification, context export, and change authoring
uncovered, and could not complete the propose-to-archive lifecycle.

ResearchSpec needs a default, agent-neutral companion suite whose workflows are
substantial enough to guide an agent through state branches and stop conditions
while keeping deterministic validation and writes in the CLI.

## What Changes

- Replace the four thin companion wrappers with eight self-contained workflow
  skills: `researchspec-explore`, `researchspec-propose`,
  `researchspec-check`, `researchspec-verify`, `researchspec-next`,
  `researchspec-context`, `researchspec-decide`, and
  `researchspec-archive`.
- Add public `researchspec propose` for deterministic creation and validation of
  pending contract changes from a strict semantic JSON payload.
- Extract one contract-patch target resolver used both when a proposal is
  created and when an accepted change is applied, so target and current-value
  drift cannot bypass validation.
- Replace the monolithic companion source with one typed manifest, shared
  build-time guidance, a renderer, and one canonical TypeScript module per
  workflow. Shared rules are inlined into every generated `SKILL.md`; no runtime
  companion reference is installed.
- Deliver all eight skills to every registered agent tool and matching thin
  command wrappers to every command-capable tool through the existing manifest,
  drift, force, and stale-cleanup pipeline.
- Preserve the four ARSU skills and wrappers as an independent family responsible
  for research, writing, review, and manuscript draft-patch authoring.
- Synchronize the CLI, contract schema, skill-command, product, and architecture
  design documents with the implemented lifecycle.

## Capabilities

### New Capabilities

- `companion-skills`: Defines the eight self-contained ResearchSpec workflow
  skills, their routing boundaries, state branches, safety gates, recovery, and
  output contracts.
- `contract-change-proposal`: Defines strict proposal input, deterministic
  validation, create-only outputs, and shared revalidation before application.

### Modified Capabilities

- `cli-interface`: Adds `propose` to the public CLI and freezes its arguments,
  JSON behavior, confirmation semantics, and exit classes.
- `agent-tool-delivery`: Delivers eight companion skills for all 31 tools and
  eight companion wrappers for the 28 command-capable tools without changing
  ownership rules or ARSU delivery.

## Impact

- Affects CLI registration and handlers, contract-change runtime services,
  lifecycle patch application, workspace schemas, companion adapters, command
  projection, delivery planning, documentation, and integration tests.
- Adds no runtime LLM API, database, setup profile, platform-specific branch,
  companion script, asset, or agent metadata file.
- Existing installed companion files are refreshed only through current
  manifest ownership rules. Obsolete unmodified CLI references are removed as
  stale generated files; modified copies are preserved and reported as drift.
