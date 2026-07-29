## Why

Adaptive evidence submission stores Artifact paths relative to the
`researchspec/` workspace, while shared Artifact consumers still resolve those
paths from the project root. A successful submission can therefore appear
missing to checks, workflow and Gate evaluation, Doctor, lifecycle operations,
and packs; a fallback resolver can also select the wrong bytes when both
locations exist.

## What Changes

- Define one runtime-aware basis for every registered Artifact path.
- Store and resolve adaptive paths relative to `researchspec/`, while preserving
  project-relative paths for unmigrated strict workspaces.
- Reuse the same basis and containment checks across submission, checks,
  workflow and Gate evaluation, Doctor, pack, patch lifecycle, contract
  lifecycle, and runtime migration.
- Remove file-existence-based fallback between project and workspace roots.
- Keep strict-to-adaptive path conversion inside the explicit runtime migration;
  do not rewrite existing registries automatically.
- Document the adaptive rule and the strict compatibility exception.
- Add no CLI command and make no implicit workspace migration.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `framework-core`: Require all registered Artifact consumers to use the
  runtime-selected path basis and containment boundary.
- `artifact-submit`: Require adaptive submission to persist workspace-relative
  Artifact paths that every shared consumer resolves to the submitted bytes,
  while preserving strict registry representation.

## Impact

The change affects the shared runtime path layer and Artifact submission,
workflow inspection, pack creation, Doctor recovery analysis, patch and contract
lifecycle operations, and strict-to-adaptive migration. It also updates focused
runtime and CLI tests plus the contract schema design documentation. Public CLI
commands, schemas, dependencies, and existing registry bytes remain unchanged
outside explicit transactions.
