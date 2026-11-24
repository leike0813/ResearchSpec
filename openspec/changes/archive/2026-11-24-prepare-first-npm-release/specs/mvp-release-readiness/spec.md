# Release Readiness Delta

## MODIFIED Requirements

### Requirement: Supported Release Runtime Matrix

ResearchSpec v0.1 SHALL require Node.js 22 or newer and SHALL certify Node 22 and
Node 24 on Linux, macOS and Windows. The release verifier SHALL statically verify
every supported Zotero runtime mapping.

#### Scenario: Read-only CI validates a supported matrix cell

- **WHEN** CI runs for a supported operating-system and Node-version cell
- **THEN** it SHALL check out pinned test inputs, install locked dependencies and run tests, lint, type checking, converter checks, idempotence, package verification and strict main-spec validation
- **AND** it SHALL require only read access and SHALL NOT publish, tag, mutate an external release, or run the Zotero adapter

#### Scenario: Platform assets are verified

- **WHEN** release verification inspects the package
- **THEN** it SHALL require the approved Windows x64, macOS x64 and arm64, and Linux x86, x64, arm, and arm64 assets and checksums
- **AND** unsupported platform resolution SHALL remain deterministic and offline

### Requirement: Clean Production Package

ResearchSpec SHALL build its npm distribution from a clean production-only
TypeScript output and SHALL reject development or retired output in the tarball.

#### Scenario: Package is built after deleted source output exists

- **GIVEN** a prior build output contains files no longer produced by current source
- **WHEN** the production package is built
- **THEN** only current production JavaScript and its type declarations SHALL remain under `dist`
- **AND** the tarball SHALL NOT contain compiled tests, source maps, or non-current workflow modules

#### Scenario: Cleanup target is not a known build output

- **WHEN** the cleanup helper receives a path outside its fixed output allowlist
- **THEN** it SHALL fail without deleting that path

## ADDED Requirements

### Requirement: Release Artifact And Protected Publication

The manual release workflow SHALL require successful hosted CI and Docs checks
for the selected `main` commit. It SHALL retain the exact installed and verified
npm tarball with its package version, commit SHA, size and integrity.
The first release SHALL use maintainer-initiated manual publication. Later
versions MAY use npm Trusted Publishing through the protected release environment.

#### Scenario: Maintainer prepares a package

- **WHEN** the maintainer requests preparation for an eligible `main` commit
- **THEN** the workflow SHALL expose a downloadable verified tarball and metadata without publishing it

#### Scenario: Release candidate is ineligible

- **WHEN** the workflow runs off `main`, lacks passing hosted checks for its SHA, or has a mismatched or already published version
- **THEN** it SHALL fail before publication

#### Scenario: Maintainer publishes a later version through GitHub Actions

- **WHEN** the maintainer selects publication for a version after `0.1.0` and the protected environment approves the job
- **THEN** the job SHALL verify the artifact metadata and publish that tarball using npm Trusted Publishing
- **AND** the preparation job SHALL have no publishing permissions
