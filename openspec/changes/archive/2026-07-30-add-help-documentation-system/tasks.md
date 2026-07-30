## 1. CLI Help Enhancement

- [x] 1.1 Add `renderMdxCommandPages()` and `renderMdxCliSidebar()` to `src/cli/handbook.ts`
- [x] 1.2 Add documentation website links to CLI `--help` output via `program.addHelpText('after', ...)` in `src/cli/main.ts`
- [x] 1.3 Update `package.json` scripts: rename handbook scripts to use new generator, add `docs:generate`, `docs:check`

## 2. Documentation Generator

- [x] 2.1 Rewrite `scripts/generate-cli-handbook.mjs` as `scripts/generate-docs.mjs` with `--check`, `--handbook-only`, `--site-only` modes
- [x] 2.2 Generate 23 CLI command MDX pages under `website/docs/cli/`
- [x] 2.3 Generate `website/sidebars.cli.ts` from catalog groups
- [x] 2.4 Regenerate `docs/cli_handbook.md` to match the new renderer

## 3. Docusaurus Site Skeleton

- [x] 3.1 Create `website/package.json` with Docusaurus v3.7.0, React 18, and TypeScript 5.6 dependencies
- [x] 3.2 Create `website/docusaurus.config.ts` with i18n (en + zh-Hans), GitHub Pages baseUrl, and classic preset
- [x] 3.3 Create `website/sidebars.ts` importing auto-generated CLI sidebar
- [x] 3.4 Create `website/tsconfig.json`, `website/src/css/custom.css`, `website/.gitignore`, `website/static/.nojekyll`, and logo SVG

## 4. English Documentation Content

- [x] 4.1 Write `website/docs/index.md` (project introduction)
- [x] 4.2 Write `website/docs/quick-start.md` (installation + first workflow)
- [x] 4.3 Write `website/docs/installation.md` (detailed install instructions)
- [x] 4.4 Write `website/docs/guides/workflow.md` (workflow model and protocol)
- [x] 4.5 Write `website/docs/guides/skills.md` (ARSU Skills overview)
- [x] 4.6 Write `website/docs/guides/plugins.md` (domain plugin management)
- [x] 4.7 Write `website/docs/guides/literature.md` (literature adapters)
- [x] 4.8 Write `website/docs/guides/selector-protocol.md` (selector system)
- [x] 4.9 Write `website/docs/reference/glossary.md` (key terms)
- [x] 4.10 Write `website/docs/reference/user-model.md` (canonical usage model)
- [x] 4.11 Write `website/docs/faq.md` (frequently asked questions)

## 5. Chinese Translation

- [x] 5.1 Translate introduction, quick-start, and installation pages
- [x] 5.2 Translate workflow, skills, and selector-protocol guides
- [x] 5.3 Translate FAQ page
- [x] 5.4 Create `website/i18n/zh-Hans/` directory structure matching `website/docs/`

## 6. CI/CD Pipeline

- [x] 6.1 Create `.github/workflows/docs.yml` with check job (PR validation) and deploy job (main branch)
- [x] 6.2 Configure `peaceiris/actions-gh-pages` for GitHub Pages deployment
- [x] 6.3 Add trigger paths for CLI catalog, handbook, website, and generator changes

## 7. README Update

- [x] 7.1 Add documentation website URLs to the README documentation section
- [x] 7.2 Add development docs build instructions (`pnpm docs:generate`, `pnpm docs:check`, `pnpm docs:build`)

## 8. Verification

- [x] 8.1 Run `pnpm check` (TypeScript typecheck) — passes
- [x] 8.2 Run `pnpm lint` (ESLint) — passes
- [x] 8.3 Run `pnpm docs:check` — generated content in sync
- [x] 8.4 Run `pnpm test` — all 240 passing tests unchanged
