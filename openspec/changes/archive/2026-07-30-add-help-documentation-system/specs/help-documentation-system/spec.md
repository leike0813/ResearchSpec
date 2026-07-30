## ADDED Requirements

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

The website SHALL include a CLI Reference section with one page per public
command, auto-generated from the typed CLI catalog at
`src/cli/command-catalog.ts`.

#### Scenario: Command pages match the catalog

- **WHEN** `pnpm docs:generate` is run
- **THEN** exactly 23 command MDX pages SHALL be written to `website/docs/cli/`
- **AND** each page SHALL contain the command syntax, description, options
  table, workspace requirement, effect type, and related commands
- **AND** `pnpm docs:check` SHALL exit zero when the generated pages match
  the catalog

#### Scenario: Sidebar groups commands by catalog group

- **WHEN** the CLI sidebar is generated
- **THEN** commands SHALL be grouped by their catalog group (Bootstrap, Control
  Plane, Inspection, Recovery, Context, Governance, Domain Skills)
- **AND** the sidebar SHALL be importable by the Docusaurus `sidebars.ts`

### Requirement: User-Facing Documentation Content

The website SHALL include hand-written documentation covering installation,
quick-start, workflow concepts, skills usage, plugin management, literature
adapters, selector protocol, glossary, user model, and frequently asked
questions.

#### Scenario: Quick-start guide is self-contained

- **WHEN** a new user follows the quick-start guide
- **THEN** they SHALL be able to install, initialize, and run their first
  workflow without consulting other documentation pages

#### Scenario: All guide pages are reachable from the sidebar

- **WHEN** the documentation site is built
- **THEN** all guide pages (workflow, skills, plugins, literature,
  selector-protocol) SHALL appear in the "Guides" sidebar category
- **AND** the glossary, user-model reference, and FAQ SHALL appear in their
  respective sidebar categories

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
