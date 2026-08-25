---

## Purpose

ResearchSpec provides a bilingual Docusaurus documentation website with
auto-generated CLI command reference pages, hand-written guides, and automated
GitHub Pages deployment. This capability covers the documentation infrastructure
layer that makes the CLI and workflow model discoverable to new and existing
users.

## Requirements

### Requirement: Bilingual Documentation Website

The project SHALL provide a Docusaurus v3 documentation website with English
(en) as the default locale and Simplified Chinese (zh-Hans) as a translated
locale.

#### Scenario: English site is the default

- **WHEN** a user visits the documentation site at the root URL
- **THEN** the site SHALL display English content
- **AND** the locale dropdown SHALL show "English" as the current selection

#### Scenario: Chinese site is reachable

- **WHEN** a user visits the documentation site at `/zh-Hans/`
- **THEN** the site SHALL display Chinese (zh-Hans) content
- **AND** the locale dropdown SHALL show the Chinese locale label

### Requirement: Auto-Generated CLI Command Reference
The documentation generator SHALL derive a bilingual reference for exactly sixteen current top-level
commands and their current selector and option contracts.

#### Scenario: Documentation drift is checked
- **WHEN** generated CLI documentation differs from the command catalog
- **THEN** documentation checking fails without rewriting the checked-in file

### Requirement: User-Facing Documentation Content
Current documentation SHALL describe the hard-cut workspace, stable specs, project profile,
frozen graph runs, node instances, run handoffs and project changes without presenting retired
runtime behavior as supported.

#### Scenario: User reads lifecycle guidance
- **WHEN** documentation describes init, update, resume, verification or export
- **THEN** it uses the same current contract and sixteen-command surface as the packaged CLI

### Requirement: GitHub Pages Deployment

The documentation website SHALL be automatically built and deployed to GitHub
Pages when changes are merged to the main branch.

#### Scenario: PR validation

- **WHEN** a pull request modifies files under `src/cli/command-catalog.ts`,
  `src/cli/handbook.ts`, `website/`, `scripts/generate-docs.mjs`, or
  `.github/workflows/docs.yml`
- **THEN** the CI workflow SHALL run `pnpm docs:check` to verify generated
  content is in sync
- **AND** the CI workflow SHALL build the Docusaurus site to verify it compiles
  without errors

#### Scenario: Main branch deployment

- **WHEN** a push to main includes changes to the documentation paths
- **THEN** the CI workflow SHALL generate docs content, build the site, and
  deploy to GitHub Pages
- **AND** the deployment SHALL use the `peaceiris/actions-gh-pages` action
- **AND** the deployed site SHALL be served from the `gh-pages` branch

### Requirement: Durable Documentation Is Organized By Reader

Long-lived project knowledge SHALL live under `docs/user`, `docs/developer`, or
`docs/maintainer`. Each category SHALL expose an index, and `docs/README.md`
SHALL explain authority and route readers to the canonical source.

#### Scenario: A reader enters the docs tree

- **WHEN** the reader opens `docs/README.md`
- **THEN** they can identify the user, developer, and maintainer paths
- **AND** they can distinguish durable documentation from artifacts, specs,
  audits, and authoring inputs

### Requirement: Temporary Work Does Not Compete With Current Documentation

Generated reports, release evidence, superseded proposals, acceptance rehearsals,
and historical decision logs SHALL live under categorized `artifacts/`
directories. Archived material SHALL NOT be presented as current product
authority.

#### Scenario: A historical rehearsal is retained

- **WHEN** a prior user-journey rehearsal remains useful as evidence
- **THEN** it is stored under `artifacts/archive/`
- **AND** current docs link to it only when historical context is needed
