## MODIFIED Requirements

### Requirement: Production Skill projection

The harness SHALL distinguish the host-visible production surface from the hidden procedure inventory. It SHALL derive the complete Navigate Skill tree, unchanged Literature Adapter Skills, and all hidden ARSU, Companion, core, and plugin procedure packages from production catalogs and renderers without running converters or assets.

#### Scenario: Visible surface is loaded
- **WHEN** the harness builds its delivery view
- **THEN** it exposes one base Navigate Skill with its two generated references and seven fixed Literature Adapter Skills

#### Scenario: Complete base surface is loaded
- **WHEN** the harness builds its catalog
- **THEN** it distinguishes the one-Skill base surface from hidden procedures and fixed Adapter Skills

#### Scenario: Hidden procedure inventory is loaded
- **WHEN** the harness builds its procedure view
- **THEN** it exposes every runtime-derived procedure grouped by family and domain without implying host projection

#### Scenario: Plugin catalog is loaded
- **WHEN** the harness builds its plugin view
- **THEN** it validates and exposes every reviewed domain and plugin procedure without writing files

#### Scenario: Checked-in registry has drift
- **WHEN** in-memory registry assembly differs from a checked-in source registry
- **THEN** the harness reports drift without writing either source

#### Scenario: Adapter runner is browsed
- **WHEN** a user selects Adapter runtime metadata
- **THEN** the harness renders it read-only without execution

### Requirement: Interactive Skill browsing

The harness SHALL present a visible-entry view and a hidden-procedure view. Hidden procedures SHALL be grouped by ARSU, Companion, Core, and Plugin families; Plugin SHALL preserve domain branches and direct/dependency distinctions. Search SHALL preserve hierarchy and the UI SHALL offer an explicit empty-domain option.

#### Scenario: Browse the top-level hierarchy
- **WHEN** a developer opens procedure navigation
- **THEN** visible entries are separated from hidden procedure families

#### Scenario: Browse an available domain
- **WHEN** a developer selects an available plugin domain
- **THEN** direct and dependency-only procedures remain separate groups

#### Scenario: Search the hierarchy
- **WHEN** a developer searches for a procedure or domain
- **THEN** matching branches remain visible with ancestors expanded

#### Scenario: Open a procedure workspace
- **WHEN** a developer selects a procedure
- **THEN** the UI loads its validated package file tree and selects its procedure body by default

#### Scenario: Open a Skill workspace
- **WHEN** a developer selects the visible Navigate Skill
- **THEN** the UI loads the same generated file tree used by Agent delivery and selects `SKILL.md` by default

#### Scenario: Inspect a Skill file
- **WHEN** a developer selects an enumerated file
- **THEN** the preview uses the existing safe rendering rules for its file type

#### Scenario: Reload changed sources
- **WHEN** a developer reloads after changing catalog inputs
- **THEN** the visible and hidden views rebuild from current repository files

