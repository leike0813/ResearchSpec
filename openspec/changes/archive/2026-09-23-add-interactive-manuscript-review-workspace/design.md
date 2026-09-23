# Design

## Context

ResearchSpec already owns three complementary contracts: annotation intake and Annotation Set candidates, paper-humanizer plans and graph Gates/Decisions, and revision-master's SQLite-backed review-response workspace. The existing browser harness supplies safe local rendering patterns, while `references/ppt-master` demonstrates the interaction pattern to reuse: a left review queue, focused source/proposal view, right-side annotations, explicit apply/export, and stale-source visibility.

The fixed sixteen-command CLI, graph-only workflow state, generated capability registries, and package-local revision-master runtime remain controlling constraints.

## Goals / Non-Goals

**Goals:**

- Give all three workflows one small, versioned interaction document and result format.
- Make the browser useful from a local file with no server, dependency, or remote resource.
- Preserve evidence, recommendation, and user intent as separate values.
- Make hash staleness and authority boundaries visible to both users and Agents.

**Non-Goals:**

- WYSIWYG editing, collaborative editing, comments synchronized across machines, LaTeX compilation, or remote hosting.
- Direct manuscript, SQLite, Gate, Decision, node, handoff, or `researchspec/` writes from the browser.
- A new public command, selector family, Skill, capability package, or workflow node.

## Decisions

### Use a portable JSON projection rather than a new runtime

One strict descriptor schema and one strict result schema are exported from a new `review-workspace` module. Thin adapters map the three existing facts into that projection. This preserves each workflow's native source of truth and avoids a universal review database.

The descriptor includes the complete manuscript entry text because a file-opened browser page cannot safely fetch arbitrary local paths. The path and SHA-256 remain present for identity; the adapter verifies bytes before projection.

### Ship one self-contained static HTML asset

The UI is a single HTML file using native DOM, file picker, local storage, and download APIs. Manuscript and review content reach the DOM only through text nodes. Markdown/QMD receives a deliberately small inert renderer; unsupported syntax remains text. LaTeX and plain text use a source view. No dependency or build pipeline is added.

Paper-humanizer review/revision and review-response workboard/round packages receive the same authored asset through their existing deterministic authoring path. The asset is not a new capability and does not change graph topology or output roles.

### Keep browser results advisory

The browser exports only a `ReviewWorkspaceResult`. Navigate or the active procedure must validate the result, compare `source_sha256`, translate it into the workflow's native files, and then use current `instructions` plus existing CLI commands for formal actions. The page never constructs authority by itself.

### Add optional instruction metadata, not a command

`instructions` adds a small `review_workspace` hint only for the two relevant profiles and their run selectors. It names the adapter and current selector and repeats the mutation boundary. This is additive JSON and does not create a selector, route, command, state file, or pack entry.

### Persist drafts only in browser-local state

Pending browser edits are keyed by workspace ID and exact source hash. Explicit export produces the only portable file. A stale hash keeps drafts visible but requires the Agent to re-project/rebase; the browser never silently applies them to a newer source.

## Risks / Trade-offs

- [Browser local storage is device-local and may be cleared] → Export is explicit and the UI labels local drafts as non-authoritative.
- [A small Markdown renderer cannot cover all extensions] → Unsupported constructs remain inert source; exact manuscript content is always available in source view.
- [Adapters may receive incomplete vendor-native structures] → Adapter inputs are narrow typed projections prepared by the owning Agent, and validation fails before a workspace is emitted.
- [Generated vendor packages and audit hashes change] → Regenerate through both owner-vendor authoring paths, refresh parity/audit records, and run the maintenance checks.
- [Concurrent source changes make review stale] → Bind descriptors/results to the exact manuscript SHA-256 and retain the user's exported intent for explicit rebase.

## Migration Plan

This is additive. Regenerate the affected paper-humanizer and revision-master capability packages and their current owner-vendor audit baselines. Rollback removes the optional instruction hints, module/export, static asset references, regenerated package changes, and documentation; no workspace migration is needed because the browser result is ordinary external material.
