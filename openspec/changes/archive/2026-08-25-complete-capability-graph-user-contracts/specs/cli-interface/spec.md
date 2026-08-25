## MODIFIED Requirements

### Requirement: Profile instructions expose executable entries
Instructions for a graph profile SHALL expose each legal entry as structured data with its entry ID, entry node, route reference, prerequisites, required input roles, expected output roles, formal Gates, risks, and cost. Routing meaning SHALL be resolved from the converter-owned routing catalog, while executable availability SHALL be resolved from the profile. The schema 2 Start template SHALL include the selected `entry_id` and `entry_node_id`.

#### Scenario: Mid-entry instructions are requested
- **WHEN** a caller requests instructions for `profile:academic-pipeline`
- **THEN** the packet lists every profile-declared executable entry point with its confirmation context
- **AND** its Start template identifies `entry_id` and `entry_node_id` as required

#### Scenario: End-to-end instructions are requested
- **WHEN** a caller selects the end-to-end entry
- **THEN** the Start payload binds that entry and its declared entry node

#### Scenario: Entry route binding is unavailable
- **WHEN** a converter-owned profile entry cannot resolve its route reference
- **THEN** instructions return a stable invalid-binding diagnostic and do not present a start payload

## ADDED Requirements

### Requirement: Runtime Inspection And Packing Match The Typed Catalog

`instructions` SHALL accept graph selectors and change selectors. `show` SHALL accept only profile, run, node, and change selectors. `pack` SHALL accept `all`, `specs`, `profiles`, `runs`, `changes`, `run:<id>`, and `change:<id>` scopes and SHALL exclude ordinary external deliverables.

#### Scenario: Change instructions are requested
- **WHEN** a caller requests `instructions change:<id>`
- **THEN** the CLI returns one bounded, read-only change action packet

#### Scenario: Unsupported show selector is supplied
- **WHEN** a caller supplies a Gate, Decision, handoff, tool, or stable-spec selector to `show`
- **THEN** the CLI returns catalog-backed usage guidance and performs no write

#### Scenario: One owner is packed
- **WHEN** a caller packs `run:<id>` or `change:<id>`
- **THEN** the archive contains only ResearchSpec-owned files for that owner
- **AND** missing owners return a stable not-found error

### Requirement: List Pagination Uses A Stable Opaque Cursor

Bounded `list` collections SHALL use deterministic ordering and SHALL return an opaque `next_cursor` when more items remain. A cursor SHALL be bound to the collection kind and current workspace snapshot and SHALL never authorize a mutation.

#### Scenario: Collection spans multiple pages
- **WHEN** a caller follows `next_cursor` through a bounded collection
- **THEN** pages contain no duplicate or skipped items and the final page returns no cursor

#### Scenario: Cursor is invalid or stale
- **WHEN** a cursor is malformed, belongs to another collection, or no longer matches the workspace snapshot
- **THEN** the CLI returns a stable cursor diagnostic and leaves all workspace bytes unchanged

### Requirement: Static Health Commands Are Bounded And Non-Executing

`status` SHALL include bounded stable-spec, Agent-tool, literature-Adapter, profile, run, node, frontier, Gate/Decision, plugin, and diagnostic summaries. `check` SHALL dispatch the selected public target, and `doctor` SHALL aggregate owner-file and managed-projection diagnostics. These commands SHALL NOT execute projected tools, validators, Quarto, Zotero, vendor code, or network operations.

#### Scenario: Static health is requested
- **WHEN** status, check, or doctor inspects a current workspace
- **THEN** it derives bounded summaries from files and typed catalogs only
- **AND** repeated reads over identical bytes return identical structured results

#### Scenario: A check target is selected
- **WHEN** the caller selects specs, profiles, runs, changes, handoffs, tools, plugins, literature-adapters, or all
- **THEN** check reports diagnostics for that target and `all` returns their bounded union

### Requirement: Non-Interactive Plugin Installation Requires Explicit Confirmation

A non-interactive plugin installation SHALL require explicit domain IDs and global `--yes` before any projection or configuration write.

#### Scenario: Confirmation is absent
- **WHEN** plugin installation runs without a TTY and without `--yes`
- **THEN** the command returns a stable confirmation-required error and leaves all workspace bytes unchanged

#### Scenario: Confirmation is present
- **WHEN** explicit domain IDs and `--yes` are supplied in a valid current workspace
- **THEN** installation proceeds through the existing preview, validation, and projection contract
