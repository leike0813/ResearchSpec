# Changelog

## 0.1.0 (release candidate)

- Added the schema `"2"` file-contract workspace and the sixteen-command public CLI.
- Added reusable graph profiles, child runs, file-based handoffs, human-confirmed Gates and Decisions, and revision rounds.
- Added ARSU workflows for deep research, paper authoring, peer review, academic pipelines and systematic-review screening.
- Added original-query bilingual Procedure discovery with Unicode segmentation, weighted BM25, declared roles and match evidence. Optional explicitly prepared local multilingual embeddings provide hybrid ranking with bounded offline fallback.
- Reoriented the usage specifications and documentation around natural research tasks and usable deliverables. Sustained ordinary work and its recovery use plain task notes without requiring a graph run; formal controls still use graph runs. Exploratory drafts stay in ordinary working files and stable specs hold confirmed research commitments.
- Consolidated the Agent surface to the single `researchspec-navigate` entry point. The five ARSU workflows, the other three Companion workflows, the bundled core capabilities, and the reviewed domain plugins are hidden Procedures discovered on demand through `list procedures`, `show procedure:<id>`, and `instructions procedure:<id>`.
- Added optional domain Skill plugins with a source-neutral domain catalog, reviewed vendor converters, isolated vendor bundles, and a graph-native extension registry.
- Added the optional `zotero-library` literature Adapter, the patent disclosure and software copyright filing workflows, and the interactive manuscript review workspace.
- Added the project-level writing guard that `init` and `update` project by default, with an explicit `on|off` preference.
- Added public-CLI acceptance journeys and requirement traceability for the canonical ARSU user model.
- Added clean npm packaging, installed-tarball verification, mixed-license attribution, and a Node 22/24 release verification matrix across supported operating systems.

The first npm release uses the verified tarball and maintainer publication.
Later versions can use npm Trusted Publishing. See the
[maintainer release process](docs/maintainer/release-process.md).
