## Context

Each per-vendor change generated and audited its own extension projection. This finalization change owns only the shared closure properties that span vendors: registry version, generator version alignment, byte-level knowledge hashing, and the combined acceptance evidence.

## Goals / Non-Goals

**Goals:**

- Record the final six-vendor registry state and the shared generator contract.
- Make the capability-manifest knowledge-hash rule explicit at byte level.
- Prove that every vendor maintenance anchor still passes against the final registry.

**Non-Goals:**

- Re-auditing any upstream vendor or changing any immutable audit decision.
- Replacing or removing the raw vendor-bundle Skills.
- Executing bundled scripts or validators outside the reviewed `advance` path.

## Decisions

### Byte-level knowledge hashes

`content_hash` already bound knowledge files; the implementation previously decoded files as UTF-8 text before hashing, which corrupted binary assets. The loader now hashes raw bytes. UTF-8 text produces identical hashes, so existing packages are unchanged; binary knowledge files such as TimesFM png/gif assets now verify and project.

### Generator version alignment

The three bulk generators emit the same registry version. Each generator preserves every non-owned extension entry, so running one vendor's `artifacts` or `baseline` cannot delete or regress another vendor's projection.

### Anchor closure

The six anchors under `audits/<vendor>/<anchor>/` bind upstream trees, immutable audits, vendor bundles, extension registry subsets, package/profile trees, maintenance Skills, catalogs, and 01–05 records. `check` compares every bound value against the current workspace.

## Risks

- Future vendors must bump the shared registry version and update all bulk generators together.
- The generic six-field `research_brief` contract remains intentionally coarse; per-domain schemas are deferred to plugin schema formalization.
