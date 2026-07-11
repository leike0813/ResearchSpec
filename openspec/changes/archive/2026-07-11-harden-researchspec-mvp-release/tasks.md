## 1. Licensing And Attribution

- [x] 1.1 Add the mixed-license root documents and package metadata with explicit MIT and CC BY-NC 4.0 boundaries.
- [x] 1.2 Make the converter generate, register, validate, and regenerate ARSU Skill license and attribution files.
- [x] 1.3 Make Companion delivery install manifest-owned MIT license files and extend stable delivery/converter tests.

## 2. Clean Build And Package Verification

- [x] 2.1 Split shared, production, and test TypeScript configurations and add allowlisted cross-platform output cleanup.
- [x] 2.2 Update package scripts for clean build, isolated tests, self-contained ARSU maintenance, prepack, Node 22+, and npmjs public packaging.
- [x] 2.3 Implement cross-platform tarball inspection and installed CLI/Codex delivery smoke verification.

## 3. Release Documentation

- [x] 3.1 Add root README, CHANGELOG, SECURITY, and release-process documentation for v0.1.
- [x] 3.2 Add an unsigned release checklist that links the dogfooding guide and keeps hosted CI and manual journeys blocked.
- [x] 3.3 Reconcile active canonical/design/PRD documents with the completed v0.1 implementation without rewriting historical archives.

## 4. Continuous Integration

- [x] 4.1 Add a read-only Ubuntu/Windows × Node 22/24 GitHub Actions matrix with all release gates and pinned ephemeral OpenSpec 1.5.0.

## 5. Verification

- [x] 5.1 Run tests, lint, typecheck, converter check, converter idempotence, release verification, strict change/main-spec validation, and diff checks.
- [x] 5.2 Audit the final tarball and worktree for forbidden package paths, unexpected generated drift, external release actions, and unrelated files.

## 6. Completion

- [x] 6.1 Verify completeness, correctness, and coherence and sync delta specs to main specs.
- [x] 6.2 Archive the technical change while leaving release authorization blocked.
