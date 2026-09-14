# Skill Browser Harness

## Purpose

Provide a repository-local, read-only browser for inspecting the current
production Skill surface and its source files without expanding the public CLI
or executing bundled Skill content.

## Requirements

### Requirement: Repository-local harness startup
The project SHALL provide a development command that compiles the current production TypeScript sources and harness sources into an ignored development output before starting a web server bound to all IPv4 interfaces. The harness MUST remain outside the public ResearchSpec CLI and published runtime output, and its documentation MUST identify the unauthenticated trusted-development-network boundary.

#### Scenario: Developer starts the harness
- **WHEN** a developer runs `pnpm dev:harness` from the repository
- **THEN** the current sources are compiled into `.harness-dist/` and the server listens on `0.0.0.0` using the configured or default port

#### Scenario: Production build remains separate
- **WHEN** the normal ResearchSpec production build runs
- **THEN** harness sources and static assets are not added to the production `dist` output or public command surface

### Requirement: Production Skill projection

The harness SHALL distinguish the host-visible production surface from the hidden procedure inventory. It SHALL derive the Navigate Skill, unchanged Literature Adapter Skills, and all hidden ARSU, Companion, core, and plugin procedure packages from production catalogs and renderers without running converters or assets.

#### Scenario: Visible surface is loaded
- **WHEN** the harness builds its delivery view
- **THEN** it exposes one base Navigate Skill and seven fixed Literature Adapter Skills

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
- **WHEN** a developer selects a visible Skill entry
- **THEN** the UI loads its file tree and selects `SKILL.md` by default

#### Scenario: Inspect a Skill file
- **WHEN** a developer selects an enumerated file
- **THEN** the preview uses the existing safe rendering rules for its file type

#### Scenario: Reload changed sources
- **WHEN** a developer reloads after changing catalog inputs
- **THEN** the visible and hidden views rebuild from current repository files

### Requirement: Read-only file boundary
The harness MUST accept only read requests and MUST serve only files that belong to a cataloged Skill's enumerated root. It MUST reject path traversal, unknown files, symbolic links, and resolved paths outside that root.

#### Scenario: Mutation request is attempted
- **WHEN** a client sends a non-GET request
- **THEN** the server returns method-not-allowed without changing repository state

#### Scenario: Unsafe file path is requested
- **WHEN** a request contains traversal segments, references an unknown file, or targets a symbolic link
- **THEN** the server refuses the file without reading content outside the enumerated Skill tree

### Requirement: Safe content rendering
The harness MUST disable raw HTML in Markdown, rewrite relative Skill links to harness routes, restrict inline images to safe raster formats, and return executable or unknown formats only as source or attachment. Responses MUST include a restrictive content security policy and MIME-sniffing protection.

#### Scenario: Markdown contains raw HTML
- **WHEN** a Skill Markdown file contains an HTML or script element
- **THEN** the preview renders it as non-executable text rather than active markup

#### Scenario: Bundled executable resource is opened
- **WHEN** a developer selects HTML, JavaScript, SVG, or another non-raster resource
- **THEN** the harness does not embed or execute it and offers only a source view or raw attachment

#### Scenario: Large text file is opened
- **WHEN** a text resource exceeds the configured 1 MiB preview limit
- **THEN** the harness returns file metadata and a raw-file link without placing the full text in the preview payload
