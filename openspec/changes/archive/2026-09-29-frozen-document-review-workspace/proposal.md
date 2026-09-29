# Proposal

## Why

The current review page centers on Agent recommendations, requires at least one such item, and shows LaTeX source instead of a selectable document. The approved [frozen-review prototype](https://github.com/leike0813/ResearchSpec/issues/10) establishes a document-centered annotation workflow; it needs a precise contract and handoff before production work begins.

## What Changes

- **BREAKING** Introduce `review-workspace.v2` and `review-workspace-result.v2` for one immutable review snapshot, independent user annotations, Agent-item decisions, and complete revisioned exports. Keep v1 inputs, drafts, and results on their existing v1 path; reject cross-version imports.
- Let an Agent prepare one static JSON review document from Markdown, Quarto, or LaTeX using the approved rendering and execution boundaries. The browser displays selectable text, formulas, images, and source fallbacks without executing document content.
- Replace the review page with the approved three-column document, contents, and comment interface. Comments stay tied to the frozen snapshot; the browser does not rerender changed source or relocate anchors.
- Require the receiving Agent to compare current source with the retained frozen source snapshot before applying feedback. After processing, prepare a new workspace with a new identity and no processed comments.
- Update the three existing adapters, development preview, package copies, documentation, and affected vendor audit anchors.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `interactive-manuscript-review-workspace`: v2 snapshot/result contract, safe rendered canvas, direct annotation, draft/export lifecycle, source-change handoff, and version separation.
- `manuscript-annotation-intake-adapters`: project an exact Annotation Set candidate into the v2 frozen workspace while preserving evidence and source bytes.
- `review-workspace-preview-harness`: provide valid v2 examples, including zero Agent items and representative document formats, against the production page.

## Impact

`src/review-workspace/`, `review-workspace/index.html`, `harness/review-workspace-preview.ts`, `src/adapters/companion/workflows/navigate.ts`, the four capability package copies, the corresponding converter authoring sources and audit anchors, `docs/user/review-workspace.md`, and focused tests. No new public CLI command, hosted service, browser authority, or browser-side host-tool installation is required.
