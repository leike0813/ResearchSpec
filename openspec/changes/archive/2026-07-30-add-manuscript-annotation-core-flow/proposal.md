## Why

ResearchSpec can register drafts, apply controlled Draft Patches, and gate
revision progress, but it has no authoritative path for human manuscript
annotations. Review comments therefore remain outside the file contracts and
cannot be traced deterministically from a reviewed draft through revision,
resolution evidence, and re-review.

## What Changes

- Add a versioned Annotation Set contract and receipt-backed submission
  transaction for deterministic JSON annotation candidates against registered
  Markdown drafts.
- Add `annotation:<id>` selectors plus bounded instructions, submit, list, show,
  and status discovery without adding a top-level command or Companion Skill.
- Upgrade the current Draft Patch format to v3 with stable operation IDs,
  annotation-to-operation references, and complete annotation resolution
  entries while retaining older formats for read-only normalization.
- Derive and register an immutable Annotation Resolution Report after successful
  patch application.
- Require shared mechanical annotation coverage validation before
  `revision_completeness` can pass or pass with conditions, and reuse the same
  validator in artifact checks.
- Add strict annotated-revision mid-entry and adaptive prerequisite binding
  while preserving existing workflow authority, revision rounds, Gates, and
  fixed public surfaces.
- Update ARSU routing, workflow profiles, Companion guidance, generated ARSU
  artifacts, runtime documentation, and black-box packaged-CLI acceptance.
- Exclude free-form Markdown or CriticMarkup parsing, editor extensions,
  non-Markdown manuscripts, model calls, generic imports, and new public
  commands.

## Capabilities

### New Capabilities

- `manuscript-annotation-system`: Versioned annotation targets, confirmation,
  immutable registration, resolution mapping, reports, and mechanical coverage.

### Modified Capabilities

- `cli-interface`: Discover and operate `annotation:<id>` through existing
  commands while retaining the seventeen-command surface.
- `artifact-submit`: Add the human-confirmed annotation submission transaction,
  retry, and partial-recovery guarantees.
- `arsu-routing-catalog`: Admit registered Annotation Sets as review feedback
  for revision and re-review routes.
- `arsu-workflow-profiles`: Support strict annotated-revision mid-entry and
  adaptive prerequisite binding without adding hidden workflow stages.
- `gate-transition-control-plane`: Bind `revision_completeness` verdict
  acceptance to verified annotation coverage evidence.
- `contract-change-proposal`: Require high-impact implemented annotations to
  remain linked to accepted contract changes.
- `arsu-user-model-acceptance`: Exercise the complete annotation journey only
  through packaged public CLI authority.

## Impact

The change affects core contracts, workspace layout and snapshots, runtime
selectors and transactions, Draft Patch application, Gate verification,
artifact checking, CLI handlers and handbook metadata, ARSU converter routing
and workflow catalogs, Companion guidance, generated ARSU trees, runtime
documentation, and user-journey tests. It adds no runtime dependency and keeps
the CLI and fixed Skill surfaces unchanged.
