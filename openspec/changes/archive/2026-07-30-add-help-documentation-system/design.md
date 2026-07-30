## Context

Before this change, ResearchSpec had no public-facing documentation website.
The only user-facing reference was the CLI `--help` output (Commander-generated)
and the auto-generated `docs/cli_handbook.md` (a single Markdown file packaged
with the npm distribution). Internal design documents, vendor adapter audits,
and developer guides lived in `docs/` but were not suitable for end users.

ResearchSpec targets both English-speaking and Chinese-speaking users (the
project README is bilingual). No i18n infrastructure existed.

The typed CLI catalog (`src/cli/command-catalog.ts`) already served as the
single source of truth for all command definitions, and `src/cli/handbook.ts`
already rendered a Markdown handbook from it.

## Goals / Non-Goals

**Goals:**
- Provide a bilingual (en + zh-Hans) documentation website with structured
  user-facing content
- Keep the CLI `--help` output as the primary in-terminal reference, augmented
  with links to the website
- Auto-generate CLI command reference pages from the existing typed catalog
  to avoid manual drift
- Deploy the site automatically to GitHub Pages on merge to main
- Keep Docusaurus dependencies isolated from the ResearchSpec core package

**Non-Goals:**
- Translate CLI command descriptions or option descriptions (high maintenance
  cost, low ROI)
- Migrate all `docs/` developer documentation into the website
- Add a `researchspec docs` command to open the browser
- Set up versioned documentation (multi-version Docusaurus)
- Add Algolia or local search plugin (can be added later)

## Decisions

### Docusaurus v3 with classic preset

**Why**: Docusaurus is the most mature React-based documentation SSG. It has
built-in i18n support through the `@docusaurus/plugin-content-docs` locale
system, a well-tested classic theme, and first-class GitHub Pages deployment
support. Alternatives considered: VitePress (weaker i18n, fewer plugins),
Nextra (tied to Next.js).

### Independent project under `website/`, not pnpm workspace

**Why**: The ResearchSpec core package targets Node.js 22 with strict
TypeScript 5.8 and no React dependency. Docusaurus pulls in React 18 and its
own TypeScript 5.6. Merging the two would create dependency conflicts and
unnecessary workspace complexity. The `website/` directory has its own
`package.json`, `node_modules`, and `tsconfig.json`.

### Command catalog as SSOT for CLI reference pages

**Why**: The typed catalog already owns all command syntax, descriptions,
options, and group metadata. Extending `handbook.ts` with `renderMdxCommandPages()`
and `renderMdxCliSidebar()` ensures the website CLI reference always matches
the actual CLI surface. The `--check` mode in `generate-docs.mjs` catches drift
in CI.

### Lightweight CLI help + comprehensive website

**Why**: Commander's built-in `--help` is sufficient for in-terminal discovery.
Adding a `researchspec docs` command or topic-based help system would increase
the public command surface beyond the declared 17 commands and add maintenance
burden. The website URL appended to `--help` output provides a clear path to
detailed documentation.

### Translations for hand-written content only

**Why**: The CLI command reference pages are auto-generated from TypeScript
code where descriptions are in English. Translating 23 command pages with
options would require either a translation mapping layer in the generator or
manually maintained translated copies. Hand-written guide pages (quick-start,
workflow, FAQ) are translated to Chinese; CLI reference stays English-only
with a note in the plan to revisit if needed.

### GitHub Actions for CI/CD

**Why**: `peaceiris/actions-gh-pages` is a well-maintained action for deploying
static sites to GitHub Pages. The workflow runs `docs:check` on PRs to ensure
generated content is in sync, and deploys on push to main. The `concurrency`
setting prevents overlapping deployments.

## Risks / Trade-offs

- [Docusaurus version upgrades may break the site build] → The website
  `package.json` pins exact Docusaurus v3.7.0. Version bumps require manual
  testing but are isolated from the core CLI build.
- [Chinese translations may go stale as English content evolves] → The
  `docusaurus write-translations` command detects new/changed English pages
  and surfaces them as untranslated. Manual translation workflow is documented.
- [GitHub Pages first deployment requires manual Settings change] → The repo
  owner must set Pages source to "GitHub Actions" once after the first
  successful deploy job runs. This is documented in the plan and README.
- [command-catalog.ts changes may break website generation] → CI `docs:check`
  step catches drift before merge. `generate-docs.mjs --check` is runnable
  locally.
