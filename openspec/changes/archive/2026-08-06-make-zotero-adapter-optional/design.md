## Context

The current workspace planner always iterates the entire literature Adapter
catalog. Config has no Adapter selector, manifest resolutions exist for every
catalog entry, inspection treats a missing resolution as blocking, and several
surface checks count all seven Zotero Skills as fixed. The CLI already has a
searchable Agent-tool selector and owner-aware retirement, so optional delivery
can reuse those boundaries without adding a command or runtime probe.

## Goals / Non-Goals

**Goals:**

- Make `zotero-library` a persisted, explicit opt-in during init and update.
- Keep one config selection SSOT and manifest resolutions as installation evidence only.
- Preserve offline delivery, drift protection, package admission and Adapter authority boundaries.
- Explain the Zotero plus `zotero-agents` prerequisite where the user makes the choice.

**Non-Goals:**

- Detecting, installing, starting or configuring Zotero or `zotero-agents`.
- Adding an Adapter command group, migration reader, credentials, live health probe or network access.
- Changing the seven-Skill bundle, release-set, provider contracts or ARSU authorization rules.

## Decisions

### Config selection is the desired-state authority

Add required `literature_adapters.selected: string[]` to current config. The
catalog accepts `fixed | optional`; fixed entries are always desired and
optional entries are desired only when selected. Manifest resolutions continue
to describe successful delivery and never infer user intent.

The alternative of inferring selection from existing manifest records was
rejected because it creates two authorities and cannot distinguish an explicit
deselection from incomplete installation.

### Bootstrap uses one plural expression and one catalog-backed prompt

Both `init` and `update` accept `--literature-adapters` with the same
`none | all | comma-separated IDs` grammar as tool selection. Interactive init
shows a second searchable selector immediately after tools, defaults the single
Zotero choice to unselected, and renders a description containing the seven
Skills, prerequisite and `https://github.com/leike0813/zotero-agents`.
Non-interactive init defaults to no Adapter when the option is absent; update
preserves the stored selection.

A single yes/no prompt was rejected because the plural catalog and config are
already designed for future entries.

### Delivery receives selected Adapter IDs explicitly

`planWorkspaceDelivery` receives selected Adapter IDs from every caller,
including plugin reconciliation. Adapter delivery resolves only desired catalog
entries; reconciliation then retires clean files for deselected entries and
preserves drifted files with their ownership evidence. Optional Adapter Skill
IDs remain reserved against plugin collisions but are excluded from fixed
surface counts.

The alternative of allowing plugin operations to infer or ignore Adapter state
was rejected because those operations already rebuild the shared manifest and
could otherwise re-add or remove Adapter files accidentally.

### Inspection distinguishes absence from damage

Inspection reads configured selection before checking files. An unselected
optional entry is returned as `not-selected`, with no expected runtime or Skill
projection and no missing diagnostics. Selected entries retain the current
state precedence and `connection_state: unchecked`. Retained drift from a
deselection remains diagnosable without turning deliberate absence into a
failure.

## Risks / Trade-offs

- [Required config field makes prior schema-1 workspaces unsupported] -> Follow the repository's current hard-cut policy and provide no implicit migration.
- [Long prompt guidance can make selection noisy] -> Keep the choice label compact and put the prerequisite and link in a short description.
- [Optional IDs could be reused by plugins] -> Keep Adapter IDs in the reserved-ID set while separating that set from installed base counts.
- [Deselecting drifted files leaves remnants] -> Preserve user changes, retain ownership evidence and report a bounded diagnostic.

## Migration Plan

Update the current schema, templates, CLI, delivery, inspection, acceptance
journeys, release verifier and documentation in one change. Existing workspaces
without the new field remain unsupported and unchanged. Rollback restores the
prior config template and unconditional delivery behavior; no external Zotero
state needs repair because ResearchSpec never mutates it during setup.

## Open Questions

None.
