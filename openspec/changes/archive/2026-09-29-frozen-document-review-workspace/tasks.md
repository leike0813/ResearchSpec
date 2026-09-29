# Tasks

## 1. Frozen v2 contract and adapters

- [x] 1.1 Preserve the current v1 schemas and result handling, then add strict v2 workspace/result schemas in `src/review-workspace/` for the source manifest, typed document blocks/assets, optional Agent items, user comments, anchors, and full revisioned exports; verify focused contract tests reject duplicate IDs, broken references, mismatched quotes/snapshots, and mixed versions while accepting zero Agent items.
- [x] 1.2 Update the three projections in `src/review-workspace/adapters.ts` and exported API in `src/review-workspace.ts` to attach existing evidence and typed targets to a prepared v2 snapshot without rewriting source bytes; verify adapter tests preserve Annotation Set evidence, Unicode/newlines, and stale-manuscript rejection.
## 2. Frozen source and static rendering preparation

- [x] 2.1 Implement an Agent-callable preparation API in `src/review-workspace/` that captures the relevant source files/assets outside `researchspec/`, records path/hash and capture limitations, and assigns a fresh workspace/snapshot identity; verify a fixture with included files and an image detects changed, missing, and unchanged source sets without modifying originals.
- [x] 2.2 Prepare typed review blocks from Markdown with bundled common extensions and formulas, and normalize host-produced Quarto/LaTeX HTML into safe selectable blocks with local images and raw-source fallbacks; verify format fixtures retain readable text, tables, formulas, images, and unsupported LaTeX instead of silently dropping them.
- [x] 2.3 Update the Agent preparation guidance in `src/adapters/companion/workflows/navigate.ts` and the four procedure authoring sources so every potentially executing Quarto render requires separate approval and an approved render uses a temporary copy; verify generated instructions state the approval boundary, source retention, and fallback behavior.

## 3. Document-centered browser review

- [x] 3.1 Preserve the existing page as a shipped v1 recovery asset and build the self-contained v2 `review-workspace/index.html` from the approved prototype; verify a real browser can import a v2 workspace, reject v1 with a recovery route, and reopen a v1 browser draft on the retained page.
- [x] 3.2 Implement the bounded document selection and anchor flow: one text block per selection, explicit add-comment action, whole-object controls, image/citation identities, and cross-block feedback; verify browser interactions for paragraphs, table cells, footnotes, code, raw LaTeX, formulas, images, and mixed selections.
- [x] 3.3 Implement contents/navigation and the mixed right pane with explicit expand controls, overlap chooser, filters, keyboard whole-block creation, and focus return; verify both-direction navigation and dense overlapping comments in a long sample without whole-document rerenders on each edit.
- [x] 3.4 Implement local draft persistence, comment edit/delete, independent Agent decisions, and full revisioned export while holding the canvas fixed; verify browser reload, storage failure, zero-item export, repeated export, and a separate new-workspace draft.

## 4. Agent handoff and user guidance

- [x] 4.1 Update `src/review-workspace/instructions.ts`, Navigate, and the owning procedure guidance to validate v2 results against the retained workspace/source set before applying feedback; verify an unchanged source proceeds by quote/context, ambiguous source location asks the user, changed source shows differences and asks, and a processed round prepares a new identity without old comments.
- [x] 4.2 Keep v1 result processing on its existing path and reject v1/v2 pairing in the Agent handoff; verify focused tests exercise valid v1 processing and mixed-version rejection.
- [x] 4.3 Replace the v1-only text in `docs/user/review-workspace.md` with the frozen v2 review, export, source-change, approval, and v1 recovery flow while preserving `docs/user/usage-model.md` authority; verify documented steps match `instructions --json` and the shipped pages.

## 5. Preview, package projection, and audit integration

- [x] 5.1 Update `harness/review-workspace-preview.ts` and its existing development command to generate valid v2 examples for all three adapters, three manuscript formats, zero Agent items, and a raw fallback; verify no-open preview generation and a real-browser import/export on the production page without published sample controls.
- [x] 5.2 Regenerate the four capability package pages and v1 recovery assets from the single authored source using the existing paper-humanizer and revision-master authoring paths; verify byte equality to root assets and package inclusion for only the four intended capabilities.
- [x] 5.3 Refresh the paper-humanizer and revision-master owner-vendor anchors and the affected ARSU audit anchor through their maintenance processes; verify their check/diff commands, `pnpm arsu:check`, and package verification pass without weakening audit expectations.
- [x] 5.4 Run the focused workspace tests, type check, and lint, plus a real-browser handoff of a frozen Markdown, Quarto, and LaTeX workspace/result; verify source-change and v1 recovery cases, then record any host-tool limitations in the implementation report.
