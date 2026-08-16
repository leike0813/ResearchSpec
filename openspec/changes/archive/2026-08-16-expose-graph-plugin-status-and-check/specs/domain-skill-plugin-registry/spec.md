## ADDED Requirements

### Requirement: Graph Workspace Plugin Status And Check

Graph `status --json` SHALL expose selected, available, unavailable, projected, and resolved-Skill
plugin state derived from the current config, installation manifest, and bundled registry. `check
plugins` SHALL statically validate the selected-domain registry entries, resolution snapshots,
manifest ownership, and projected file hashes without executing plugin resources.

#### Scenario: Status distinguishes intent from projection

- **WHEN** graph status reads a workspace with selected domains and configured skill-capable tools
- **THEN** its `plugins` object SHALL distinguish selected domains, available domains, unavailable selections, resolved Skill IDs, and projected domains
- **AND** plugin status failure SHALL be reported as a non-blocking diagnostic

#### Scenario: Check plugins verifies complete projection

- **WHEN** `check plugins` runs on a workspace whose selected-domain closure is fully manifest-owned and hash-clean
- **THEN** the command SHALL pass without plugin diagnostics

#### Scenario: Check plugins reports missing or drifted files

- **WHEN** a projected plugin file is missing from a configured tool or is not manifest-owned
- **THEN** `check plugins` SHALL return a blocking diagnostic
- **AND** when a manifest-owned projected file has user modifications
- **THEN** `check plugins` SHALL return a non-blocking drift diagnostic that becomes blocking with `--strict`
