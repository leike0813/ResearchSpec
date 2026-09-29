# Design

## Context

See proposal.md. The current v2 browser bundles a strict validator and renders one ordered block list. Adapters retain source targets, but source block IDs and rendered IDs have different origins. Humanizer candidate artifacts preserve prose segment order and protected content across rounds. The preview copies the root HTML and injects a development-only file import.

## Goals / Non-Goals

**Goals:** Preserve one browser import/export contract, add trustworthy display placement and a bounded comparison mode, and keep all previews available without host tools.

**Non-Goals:** Automatic source relocation, browser application of edits, per-change approvals, a review-response design, or browser-side rendering.

## Decisions

1. Extend v2 additively. `document.item_locations` is an optional list of `{item_id, block_id, start, end}`. Each item ID occurs at most once, every block exists, and its range lies within that block. Original `item.target` remains authoritative evidence. Source quote and section placements receive additional consistency checks. Older v2 documents keep their prior target-based display behavior. The page has one location resolver that prefers explicit placement. This avoids pretending source and rendered block IDs are the same.

2. `document.comparison` optionally carries `{base_path, rows:[{before_block_id, after_block_id}]}`. The flattened `document.blocks` list contains both sides under distinct IDs. Rows cover each block once on each side, in document order, with compatible kinds and heading levels. The base path and candidate entry path are distinct members of the frozen source manifest. The snapshot hash already binds the whole document, so export anchors need no new field: their block IDs identify the side. The owning Agent compares both source files on handoff. A new comparison constructor checks hashes, identity and pairing before assembly; callers provide a verified candidate rather than having the browser infer verification.

3. Render comparison rows in the document canvas while keeping existing block-local selection and comment controls. Compute token differences once per imported row using `Intl.Segmenter` when available and a code-point fallback. A bounded longest-common-subsequence calculation highlights changed phrases; beyond the bound, show an honest changed-block indicator and full text. Re-rendering cards or highlights never recalculates diffs or replaces the document. The outline derives from candidate headings only. Plan review shows the existing item metadata: risk, constraints, recommendation and action.

4. Previews use seven cases: three scenarios (article revision, humanization plan, humanization candidate) crossed with pre-rendered/fallback display, plus empty Markdown. Fixed manuscript sources and tool-produced normalized fixtures are checked in. Both variants pass through the same production adapters and v2 assembly, using raw-source blocks for regions unavailable without tools. The runner never invokes a model, Quarto, Pandoc, project hook, or network service; it reads the current root HTML for every generated page. Preview and production code remain separate.

5. New review-response instructions omit `review_workspace`; its adapters and packaged assets stay available for recovery. The two review-response authoring procedures switch to dialogue for new work. Regenerate the four page copies through owner-vendor authoring and refresh required anchors rather than editing copies directly.

## Risks / Trade-offs

- [A comparison render changes block structure] → Reject the pairing and use source fallback or Agent dialogue; never align unlike blocks by text similarity.
- [A long paragraph is expensive to diff] → Bound token comparison and retain complete visible text with a block-level change marker.
- [Display placement could be mistaken for source authority] → Keep source target and display location separate in the contract and handoff instructions.
- [Old v2 clients reject the additive strict field] → Deliver contracts, browser and package assets together; new readers continue to accept old v2 documents.

## Migration Plan

1. Add contract validation and preparation APIs, then fix card handling and render both browser modes.
2. Replace preview fixtures and strengthen the existing real-browser check.
3. Update instructions and docs, project capability pages from the root source, refresh owner-vendor and ARSU anchors, and run their checks.
