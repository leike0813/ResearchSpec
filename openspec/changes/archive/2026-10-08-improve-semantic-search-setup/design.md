# Design

## Context

Bootstrap commits the graph workspace before optional semantic preparation. Runtime already stages and publishes identity-keyed resources in a user OS cache, and preserves published runtime/model resources after later-stage failure. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:** keep semantic preparation optional, visible and recoverable; add safe cache maintenance without project coupling.

**Non-Goals:** resumable byte-range downloads, mirrors, new models, dependency changes, project cache inventories and automatic query-time repair.

## Decisions

- Keep resource identities and cache selection unchanged. Progress is an optional runtime callback, so existing non-CLI callers stay silent.
- Use `SemanticPreparationProgress` with `stage: cache|runtime|model|index|self-test`, `status: started|progress|reused|completed`, optional `completed`, `total` and `file`. Model counters are real streamed bytes; index counters are document counts. `SemanticPreparation` additionally carries optional readable `detail` and failed `stage` alongside its existing reason.
- Keep terminal rendering in a CLI prompt module, using installed ora and throttled updates. Human progress goes to stderr. JSON/quiet suppress rendering; non-TTY output emits only stage summaries. Initial consent remains required; no retry prompts appear for non-interactive or JSON calls.
- Extend the existing prompt injection port for a two-choice retry selection. Retry has a fresh preparation budget and reuses published resources. Decline or interruption of the optional recovery prompt returns the original failure and temporary offline operation, retaining hybrid preference.
- Expose `inspectSemanticSearchCache({cacheRoot?})` and `clearSemanticSearchCache({cacheRoot?, dryRun?})` from the semantic cache owner. Inspection returns `cache_root`, `total_bytes`, `entries` (kind, absolute path, bytes) and `skipped_paths`. Clear returns this inventory plus `dry_run`, `cleared_paths` and `failed_paths` (path, reason). Parent CLI owns confirmation and maps busy/unsafe cache errors into stable diagnostics. Ordinary `doctor` still uses its graph handler.
- Recognize the existing identity/receipt and staging namespace rather than treating an environment-overridden cache root as disposable. Preserve unknown files and the root, and use lstat-based boundaries without following symlinks. Deletion errors remain explicit; disposable cache deletion does not roll back completed deletions.
- Preparation and clearing use one atomic cache mutation lock with owner PID. Competing live owners fail as `cache_busy`; exited owners can be recovered after ownership revalidation. Queries and inspection never create locks. Empty-cache inspection and dry-run never create directories or lock files.
- Register `doctor-search-cache` under doctor through the existing typed catalogs. Its effect is conditional-write and its workspace requirement is none. The parent envelope command remains doctor. Confirmation defaults to false; JSON/non-TTY clearing requires explicit `--yes`, and dry-run needs no confirmation.

## Risks / Trade-offs

- Shared cache deletion affects every project using it -> preview states the scope; configurations remain unchanged and queries retain offline fallback.
- An interrupted writer can leave a lock -> reclaim only when its owner process is confirmed absent, never on a guessed timeout.
- Retrying a failed model stage redownloads that stage -> keep successfully published resources and state this limit in user recovery documentation.
- Concurrent read-only inference can encounter cleared resources -> retain existing bounded inference failure and offline fallback; no new query-side writes.

## Migration Plan

No project or cache migration is needed. Update authored docs and project instructions, regenerate catalog-derived handbook/site pages, and leave the OpenSpec change active for later explicit archival.
