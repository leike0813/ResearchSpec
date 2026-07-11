## Why

ResearchSpec v0.1 has completed its functional user model, but its npm tarball is not release-safe: the build retains deleted modules and compiled tests, required package documentation and licensing are absent, installed Skill copies do not carry explicit license notices, and no reproducible cross-platform release gate exists. The MVP needs a clean, attributable, install-tested distribution before any tag or publication is authorized.

## What Changes

- Add a release-readiness contract covering clean production builds, deterministic tarball inspection, installed-package smoke tests, supported Node/OS combinations, and explicit manual release authorization.
- **BREAKING**: raise the supported Node.js runtime from `>=20.19.0` to `>=22` because Node 20 is end-of-life.
- Define a mixed-license distribution: ResearchSpec-authored framework and Companion content under MIT, and ARSU-derived content under CC BY-NC 4.0 with retained upstream attribution.
- Propagate license and attribution files into independently installed ARSU and Companion Skill directories through their existing owners rather than hand-editing generated output.
- Separate production and test compilation, clean only allowlisted build outputs, and reject tarballs containing tests, declarations, source maps, or retired Companion modules.
- Add root onboarding, security, changelog, release-process, dogfood-signoff, and read-only Linux/Windows CI assets without adding dependencies or a publish workflow.
- Reconcile current-state design documents that still describe completed v0.1 technical layers as pending.

## Capabilities

### New Capabilities

- `mvp-release-readiness`: Defines the distributable package, clean-build and install-smoke gates, licensing disclosure, supported runtime matrix, and manual release authorization boundary.

### Modified Capabilities

- `agent-tool-delivery`: Requires every independently installed Skill copy to retain its applicable license and attribution alongside the existing manifest-owned content.
- `arsu-converter`: Requires converter-owned ARSU output to deterministically carry upstream CC BY-NC license and attribution files.

## Impact

The change affects package metadata and scripts, TypeScript build configuration, converter emission and validation, tool delivery, generated ARSU trees, root release documentation, current-state design documents, and GitHub Actions. It keeps the CLI command set, Schema 0.2, workspace compatibility, workflow profiles, Agent surface, runtime dependencies, and package version unchanged. No Git remote, commit, tag, GitHub Release, or npm publication is created.
