## Why

ResearchSpec currently has no user-facing documentation website. The CLI's
`--help` output and the auto-generated `docs/cli_handbook.md` are the only
discoverable reference surfaces, and neither supports multi-language content.
Users and agents need a bilingual (en + zh-Hans) documentation site with
structured content to discover, learn, and troubleshoot ResearchSpec without
reading source code or navigating internal design documents.

## What Changes

- Extend `--help` output in main.ts with links to the documentation website
- Add `renderMdxCommandPages()` and `renderMdxCliSidebar()` to handbook.ts for
  Docusaurus-compatible command reference generation
- Upgrade `scripts/generate-cli-handbook.mjs` to `scripts/generate-docs.mjs`
  supporting handbook and site output modes with `--check` verification
- Add `docs:generate`, `docs:check`, `docs:build` npm scripts
- Create a Docusaurus v3 documentation website under `website/` with classic
  preset, i18n (en default, zh-Hans), and GitHub Pages deployment config
- Write eleven English content pages: introduction, quick-start, installation,
  workflow guide, skills guide, plugins guide, literature guide,
  selector-protocol guide, glossary, user-model reference, and FAQ
- Write seven Chinese (zh-Hans) translations of the hand-written content pages
- Auto-generate 23 CLI command reference MDX pages and sidebar from the typed
  CLI catalog
- Add GitHub Actions workflow (`.github/workflows/docs.yml`) for PR validation
  and main-branch deployment to GitHub Pages
- Update README.md with documentation site links and build instructions

## Capabilities

### New Capabilities

- `help-documentation-system`: Bilingual documentation website with auto-generated
  CLI reference, user guides, and automated CI/CD deployment to GitHub Pages

### Modified Capabilities

- `cli-interface`: `--help` output now includes documentation website URLs at the
  end of each help display

## Impact

Affected files: `src/cli/handbook.ts`, `src/cli/main.ts`, `package.json`,
`README.md`, `scripts/generate-docs.mjs` (new), `website/` directory (new, 34+
files), `.github/workflows/docs.yml` (new). Test suite: all 240 passing tests
unchanged; no new dependencies in the ResearchSpec core package; Docusaurus
dependencies are isolated in `website/package.json`.
