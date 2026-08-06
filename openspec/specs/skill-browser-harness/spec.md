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

The harness SHALL derive ARSU, all five Companion Skills, Literature Adapter Skills, and plugin Skills from their production catalogs and renderers without running converters or Adapter assets.

#### Scenario: Complete base surface is loaded

- **WHEN** the harness builds its catalog
- **THEN** it SHALL expose exactly four ARSU, five dynamically rendered Companion and seven fixed Literature Adapter Skills
- **AND** `researchspec-cli-handbook` content SHALL come from the production Companion renderer

#### Scenario: Plugin catalog is loaded

- **WHEN** the harness builds its plugin view
- **THEN** it SHALL validate the in-memory assembled registry and expose every available reviewed domain and Skill without writing generated files

#### Scenario: Checked-in registry has drift

- **WHEN** in-memory plugin assembly differs from `skills/plugins/registry.json`
- **THEN** the harness SHALL report drift without writing either source

#### Scenario: Adapter runner is browsed

- **WHEN** a user selects an Adapter runtime metadata asset
- **THEN** the harness MAY render its content read-only
- **AND** it SHALL NOT execute or interpret the asset

### Requirement: Interactive Skill browsing
The harness SHALL present Skills through three expandable top-level branches named ARSU, Companion, and Plugin. ARSU and Companion SHALL contain their Skills directly. Plugin SHALL contain domain branches that separate direct members from dependency-only members. Search MUST preserve and filter this hierarchy, and the UI MUST include an explicit option to reveal empty domains.

#### Scenario: Browse the top-level hierarchy
- **WHEN** a developer opens the Skill navigation
- **THEN** ARSU, Companion, and Plugin are the only top-level branches and Skills are not flattened into one cross-family list

#### Scenario: Browse an available domain
- **WHEN** a developer selects an available domain
- **THEN** the domain contains separate Direct Skills and Dependencies groups whose non-overlapping members combine to the resolved Skill closure

#### Scenario: Search the hierarchy
- **WHEN** a developer searches for a Skill or domain
- **THEN** only matching branches remain visible and their ancestor family and domain nodes are automatically expanded

#### Scenario: Open a Skill workspace
- **WHEN** a developer selects a Skill entry
- **THEN** the UI loads a file-tree and file-preview workspace and selects `SKILL.md` by default

#### Scenario: Inspect a Skill file
- **WHEN** a developer selects an enumerated Skill file
- **THEN** the file tree retains its real directory hierarchy and the preview shows Markdown and source, plain text, a safe raster image, or non-executable binary metadata according to the file type

#### Scenario: Reload changed sources
- **WHEN** a developer reloads the catalog after changing a Skill tree or registry input
- **THEN** the file tree and catalog are rebuilt from the current repository files without restarting converters

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

### Requirement: Subflow And Run Completion Are Independent

The harness SHALL treat subflow instance completion and run completion as
separate lifecycle events. A subflow instance reaching a terminal state SHALL
NOT imply run completion, and run completion SHALL require all active subflow
instances to have reached terminal states.

#### Scenario: Subflow completes before run

- **WHEN** a subflow instance reaches its terminal state while other instances
  remain active
- **THEN** the harness SHALL report the instance as complete without marking
  the run as complete

#### Scenario: Run completes only when all subflows finish

- **WHEN** the last active subflow instance reaches its terminal state
- **THEN** the harness SHALL mark the run as complete

### Requirement: Subflow Attempts Are Scoped

Each subflow instance attempt SHALL be scoped to its parent run and SHALL NOT
share mutable state with prior attempts of the same subflow template within
the same run.

#### Scenario: Retry creates a new scoped attempt

- **WHEN** a subflow instance is retried within the same run
- **THEN** the new attempt SHALL start from the template's initial state
  without inheriting mutable artifacts from the prior attempt
- **AND** the prior attempt's records SHALL remain accessible for audit
