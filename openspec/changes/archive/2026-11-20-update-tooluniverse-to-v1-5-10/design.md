# Design

## Context

The maintenance catalog selects the active audit. The converter owns the vendor tree, and the extension generator projects that tree into the existing capabilities and profiles.

## Decisions

- Compare pinned Git trees for the canonical `skills/` inventory. Join changed tool declarations, implementations, and defaults to callers in the full admitted tree to catch indirect changes.
- Reuse the approved admission set, source-neutral domain catalog, and dependency decision model. Preserve earlier per-Skill identities when reviewed content and contract remain stable. Keep added business candidates in audit evidence.
- Generate packages from the reviewed vendor bundle and verify byte equality for retained resources. Read changing resource and execution totals from the active projection.
- Record source findings and generated output review separately. Validate the active snapshot with `check` and compare it with historical manifests using `diff`.

## Risks

- Upstream changes to tool errors and pagination can invalidate evidence in a Skill whose files stayed stable. Review callers of changed contracts and record any compatibility edits in the converter policy.
- Changes to resource membership can leave files in the extension tree. Compare the complete package inventory with the current projection during review.
