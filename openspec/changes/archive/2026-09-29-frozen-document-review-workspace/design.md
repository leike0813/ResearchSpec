# Design

## Context

See [proposal.md](proposal.md) and the three delta specs. The current public schemas in `src/review-workspace/contracts.ts` accept only v1, embed one manuscript's text, require at least one Agent item, and export one decision per item. `src/review-workspace/adapters.ts` supplies the three projections; `instructions.ts` advertises v1. `review-workspace/index.html` is the shipped v1 page. The development preview feeds it v1 fixtures. The root page is packaged in npm and copied into four ARSU capability packages by two authoring source catalogs.

The approved [prototype and lifecycle](https://github.com/leike0813/ResearchSpec/issues/10) are the interaction reference. The prototype's sample JSON is illustrative and does not define the production schema. Issue #4's rerender/reattachment plan is superseded. `docs/user/usage-model.md` remains the governing workflow model: browser exports are working material, and only the owning Agent and existing ResearchSpec CLI may perform their respective mutations.

## Goals / Non-Goals

**Goals:** One review round has a fixed, inspectable body and source set; the receiving Agent can verify the same source set before acting. The browser supports direct annotation, safe local operation, and a complete v2 handoff. Both v1 and v2 remain recoverable through their own contracts.

**Non-Goals:** WYSIWYG manuscript editing, PDF coordinates, exact rendered-to-LaTeX source offsets, automatic or manual anchor relocation, multi-user sync, a new public CLI, or browser-side workflow mutation.

## Decisions

### 1. Make the frozen source set an Agent-owned artifact

On workspace preparation, the Agent copies the entry source and every locally resolved included source or image that contributes to the review into a private ordinary work directory outside `researchspec/`. It records a sorted relative-path and SHA-256 manifest, the entry path, and the workspace ID. If a dependency cannot be resolved or captured, the Agent records that limitation and does not claim complete source equivalence for the affected region. The v2 JSON carries the manifest and frozen render identity; it contains the visible static review content and needed local images, but not project scripts or an executable copy of the source tree. The Agent retains the source copy independently of the browser. Neither browser storage nor the review JSON is workflow authority.

At handoff, the Agent validates the v2 result against the corresponding retained workspace and source copy, then compares current files to the frozen manifest and bytes. Unchanged source permits source location by quote and context; ambiguous mapping still needs a user question. Changed source triggers a shown diff and affected-feedback question before any manuscript or workflow mutation. If the user elects a fresh round, the Agent prepares a new workspace ID and rendered snapshot. It never mutates the old canvas.

**Alternative considered:** reload the latest manuscript in the browser and rematch anchors. That creates the exact relocation ambiguity the frozen lifecycle removes and would make a prior export change meaning.

### 2. Use one strict v2 JSON for display and a complete v2 result for handoff

Keep the v1 schemas and result constructor usable under explicit v1 names or a v1 module. Add v2 schemas with strict version dispatch at import and Agent handoff; their `schema_version` literal is `"2"`, while the advertised schema names are `review-workspace.v2` and `review-workspace-result.v2`. The browser's v2 input is one JSON object with `workspace_id`, `snapshot_id`, `adapter`, `title`, `source` (format, entry path, file manifest, capture limitations), `document` (ordered blocks and heading hierarchy), `assets` (local MIME-typed image data and stable IDs), `items` (zero or more original Agent items), and `workflow` guidance. `snapshot_id` identifies the prepared static body and source manifest, rather than only the entry-file hash. A v2 result embeds the unchanged workspace, `snapshot_id`, export revision and time, one decision for every Agent item, user comments, and an overall note. Embedding the workspace follows the existing v1 handoff and permits validation without browser state; the receiving Agent still compares it to the separately retained authoritative copy. Since this is advisory material, hashes detect mismatch and accidental drift, not malicious tampering.

Every block has a stable ID, semantic kind, canonical visible text, and bounded presentation content. Inline formatting is represented by safe typed spans, never imported executable HTML. Text anchors store block ID, UTF-16 start/end offsets in canonical visible text, exact selected text, and nearby visible prefix/suffix. Whole-object anchors store block ID, object kind, and asset or citation identity where relevant. Validation checks the selected slice, identity references, uniqueness, decision coverage, and result/workspace consistency. Offsets describe the frozen rendered block only; the Agent uses the quote and context to locate source. Unknown or broad Agent targets remain items in the comment pane without fabricated precise anchors.

User comments have stable IDs, body, anchor, and origin `user`; Agent items retain their evidence/recommendation and separate decision. Deleting a comment removes it from the current draft; the next result is a new full export. A revision increments on every successful export of that local draft. Importing the same workspace restores its draft by workspace and snapshot identity; a new workspace starts with empty user comments and decisions initialized from its own items.

**Alternative considered:** export only a patch or bare comment list. That would require replaying browser state and complicate repeated exports, empty-item workspaces, and handoff validation.

### 3. Normalize rendering before browser import

One preparation path turns the manuscript into the typed document blocks above. The project-bundled Markdown renderer handles Markdown, including common table, footnote, citation, code, and math forms. Quarto and LaTeX use available tools on the user's host to produce selectable HTML; the preparation step converts only an allowlisted static subset into typed blocks and local image assets. The page never runs Quarto, TeX, project hooks, filters, or computation. Where conversion cannot preserve a region confidently, it emits an inert `raw-source` block with the original text and a conversion note. Content checks compare the visible block text against source sections so unknown macros cannot silently erase material; where an exact automated comparison is impossible, the Agent inspects or falls back to raw source for that region.

For Quarto projects with scripts, filters, `pre-render`, or executable cells, the Agent seeks explicit approval for each full render. An approved render uses a temporary copy; host tools still run with host privileges, so this copy is not a security sandbox. If project-relative dependencies fail in the copy, the Agent reports the blocker and obtains a separate direction. For plain or non-executing conversion, the Agent uses the lowest execution mode available and checks that project hooks will not run without approval. No render is triggered by browser import, draft edit, or export.

The page constructs DOM from typed data using text nodes and fixed markup. It restricts assets to local, validated image MIME/data and blocks remote URL resolution; a restrictive Content Security Policy covers the standalone file. Math is either safe structured MathML or rendered by bundled local code. Source content remains inert even in fallback blocks. The shipped page is a self-contained file; any build tool is internal and all browser assets are embedded. The same normalized block model handles all formats, avoiding separate annotation logic for each renderer.

**Alternatives considered:** a PDF overlay needs source backtracking; arbitrary rendered HTML in JSON risks active content and unstable text offsets; browser-side project rendering would cross the execution consent boundary.

### 4. Keep selection and navigation inside bounded blocks

The document owns the only selection map. Pointer and keyboard selections resolve against one block's canonical text; a range crossing block IDs or an object boundary is rejected with a short hint. The explicit “Add comment” action appears near a valid selection. Whole-block controls cover paragraphs, formulas, images, citations, and other atomic objects. A table cell, footnote, bibliography entry, code block, or raw fallback is its own block. Image anchors include an asset ID and adjacent block context even without caption or alt text.

The right pane orders items by document position and marks Agent/user origin; unresolved items remain in a clearly reachable group. Each card has a visible expand/collapse button. Selecting a highlight with multiple attached items opens a chooser. The contents pane derives up to three levels from the same document structure; filtering and folding affect visibility, not data or anchor identity. Two-way navigation and focus return are explicit. The high-frequency path updates only the affected block highlights/card state, not the whole document or all stored drafts.

**Alternative considered:** rely on generic `window.getSelection()` text and global substring searches. Repeated text, nested inline markup, and long manuscripts would make anchors ambiguous and DOM work unbounded.

### 5. Isolate v1 and keep the existing delivery path

Before replacing `review-workspace/index.html`, preserve its current implementation at `review-workspace/v1.html` and package the matching v1 page alongside each v2 page. v2 import rejects v1 with a clear route to that file; v1 draft keys and v1 schemas are unchanged. A previously exported v1 result remains handled by the v1 Agent contract. There is no v1-to-v2 migration or hidden conversion. `instructions --json` advertises v2 for newly prepared workspaces and names the v1 route for recovery. The root and four capability package pages are generated from one authored asset; do not hand-edit the four copies.

Update the Navigate guidance and the four review procedure sources to describe frozen preparation, per-render consent, result validation, and source comparison. Preserve each procedure's existing semantic write path (annotation intake, paper-humanizer, or revision-master). Refresh the two owner-vendor maintenance anchors and any affected ARSU audit anchor using their existing maintenance process. The preview remains a development-only wrapper around the production page and produces v2 samples through the real adapters. Its samples cover three procedures, three document formats, zero Agent items, a fallback block, and import/export.

**Alternative considered:** keep v1 and v2 in one page with shared draft handling. It increases version branches in the highest-risk state path and makes legacy recovery harder to explain.

## Risks / Trade-offs

- **Rendered text can diverge from source, especially custom LaTeX** → Reject silent omissions, show raw-source blocks, retain exact frozen source, and ask on ambiguous source mapping.
- **Project rendering can execute user code** → Ask for separate approval each time, render in a temporary copy, and disclose that host privileges still apply.
- **Embedded images and workspace-in-result enlarge JSON** → Bound asset types and sizes during preparation; prefer the existing standalone transfer until a measured size limit warrants a different carrier.
- **Browser storage can fail or be cleared** → Keep explicit export available and label unsaved draft state; exported files remain independent snapshots.
- **Source manifest can miss a dynamic or remote dependency** → Mark capture limitations and ask at handoff instead of asserting source equivalence.
- **Changing generated package assets affects reviewed anchors** → Regenerate from the owner source and run the existing owner-vendor and ARSU audit checks before release.

## Migration Plan

1. Freeze the existing v1 page into a separately named shipped asset and keep its schemas/processing path.
2. Add v2 contract and renderer preparation, then switch newly generated workspace instructions and adapters to v2.
3. Ship the v2 page and updated development preview, regenerate the four package assets and audit anchors, and update user guidance.
4. Verify old v1 draft recovery, v1 result processing, v2 browser handoff, source-change questions, and package consistency before release. A release rollback restores v1 as the default without rewriting either version's saved artifacts.
