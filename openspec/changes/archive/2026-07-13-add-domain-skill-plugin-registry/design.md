## Context

ResearchSpec already owns a fixed delivery model: four packaged ARSU Skills,
four generated Companion Skills, tool-specific projections, a workspace config,
and a hash-bearing installation manifest. Domain Skills need the same safe file
delivery without becoming a second workflow runtime or permitting arbitrary
third-party registration. The registry and plugin trees therefore ship as static
npm package content, while workspaces store only their selected plugin IDs.

The design must preserve existing workspace schema compatibility, the fixed
eight-wrapper surface, manifest-last writes, drift protection, and Agent-neutral
file contracts. Test fixtures must exercise real resource copying, including a
Python script, while production remains an empty registry.

## Goals / Non-Goals

**Goals:**

- Define one typed, validated registry and derive all plugin paths from safe IDs.
- Project selected plugin Skill trees to every configured tool through the
  existing delivery/write-plan/manifest machinery.
- Provide deterministic list/show/install/update/uninstall/status/check behavior.
- Preserve provenance, licenses, notices, user edits, and retired-plugin cleanup.
- Keep plugin recommendations advisory and outside workflow authority.

**Non-Goals:**

- Remote registry access, third-party self-registration, or runtime upstream reads.
- Script execution, dependency installation, sandboxing, or a plugin runtime ABI.
- Production domain plugins, plugin command wrappers, or workflow-profile nodes.
- Per-tool plugin selection or a workspace schema-version increase.

## Decisions

### Package registry and derived paths are the only catalog authority

`skills/plugins/registry.json` uses schema version 1 and contains normalized
sources, plugins, Skills, and immutable upstream revisions. Plugin Skill roots are
always derived as `skills/plugins/<plugin-id>/<skill-id>/`; registry records cannot
provide an arbitrary destination or source root. A global Skill-ID index rejects
duplicates and collisions with the eight base Skill IDs.

Alternative considered: per-plugin manifests. Rejected because it duplicates
source and uniqueness validation and makes catalog-wide collisions harder to
detect.

### Open Agent Skills validation is content-facing, not a runtime

Each registered Skill must have a conforming `SKILL.md` whose `name` equals both
its registry ID and directory. All files below the Skill root are copied byte for
byte. Third-party-derived Skills must include `LICENSE` and `NOTICE.md`; registry
provenance stops at Skill-level source paths. `compatibility` and body guidance
describe dependencies, but ResearchSpec never executes or installs them.

Alternative considered: restrict resource directories and script languages.
Rejected because the upstream specification deliberately permits extensible
resources and execution belongs to the target Agent.

### Workspace selection is intent; manifest entries are ownership evidence

`config.yaml` gains optional `plugins.selected`, parsed as an empty list when
absent. Manifest entries gain optional `plugin_id`, `plugin_version`, and
`skill_id`, leaving their current version and path/hash/source/scope model intact.
The registry is bundled product state, not copied into the workspace.

Alternative considered: store selection per tool. Rejected because plugin intent
is workspace-wide and newly added tools must automatically receive all selections.

### Plugin lifecycle reuses one reconciliation engine

Delivery computes desired files from the fixed base surface plus all available
selected plugins. Init/update and plugin install/update use the same planner;
manifest writes remain last. Desired-file drift is preserved unless `--force`
refreshes it. Uninstall preflights every manifest-owned plugin file and aborts the
whole transaction on any hash drift. Missing files are safe removals. A selected
plugin absent from the current registry is unavailable and cannot update, but its
manifest evidence remains sufficient for clean uninstall.

`--force` does not weaken uninstall protection: it cannot delete a modified file
from a plugin no longer selected.

### Plugins add Skills, never wrappers or authority

All 31 tool adapters can receive plugin Skill trees. The 28 command-capable tools
continue to render exactly the eight base wrappers. Plugins cannot mutate
ResearchSpec state, artifact registry, Gates, Decisions, or receipts. Navigate may
query `plugin list --installed --json` and recommend installed Skills whose
metadata matches the user's domain intent, but it cannot create a formal route,
subflow, work item, or alternate frontier from that match.

### Public command is a grouped sixteenth top-level command

`researchspec plugin` owns `list`, `show`, `install`, `uninstall`, and `update`.
Read-only list/show load the packaged registry without workspace discovery;
installation status is optional. Writing subcommands use the global output and
write-policy flags and the existing result envelope/exit classes.

## Risks / Trade-offs

- [Open Agent Skills specification evolves] → Pin Registry Schema 1 behavior to
  the supported contract and keep validation isolated behind one module.
- [Large plugin trees increase projection cost] → Enumerate once, reuse the
  existing deterministic planner, and avoid runtime upstream/network work.
- [Registry retirement strands selections] → Report `unavailable`, block update,
  and retain manifest-driven safe uninstall.
- [Plugin instructions attempt authority mutation] → Validate/document the
  boundary and keep every authoritative write behind existing CLI contracts.
- [Transactional filesystem writes cannot be fully rolled back] → Preflight
  uninstall drift as a whole and commit ownership metadata last, matching current
  delivery discipline.

## Migration Plan

Publish the empty Registry Schema 1 and code support in the same npm version.
Existing workspaces parse missing `plugins` as no selection and need no migration.
New init output may include an empty selection block only when the canonical
renderer writes current configuration. Rollback is safe while no plugin is
selected; a workspace with selections retains unknown YAML fields for older tools
only if their parser permits them, so release verification covers the exact parser
and renderer pair.

## Open Questions

None. The first production domain plugin and any future registry schema revision
require separate changes.
