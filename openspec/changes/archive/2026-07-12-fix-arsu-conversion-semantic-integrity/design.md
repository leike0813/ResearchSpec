## Context

The converter replaces audited ARS spans before dependency rewriting and emits the same source file into a public entrypoint plus any cross-skill dependency copies. Replacement validation currently proves marker placement, hashes, and declared targets, but cannot detect a stable behavioral exception omitted from a hand-authored replacement body. Link validation only parses Markdown links, so repository-relative paths in code spans can survive even when their targets are excluded from generated packages.

## Goals / Non-Goals

**Goals:**

- Restore the full-mode Phase 6→4 exception without weakening revision-mode patch guarantees.
- Express public phase boundaries through ResearchSpec workflow and run-state contracts.
- Fail generated-output validation when a public entrypoint contains an unresolved operational `docs/` or root `scripts/` code-span path.
- Lock the existing distinction between public entrypoints and cross-skill dependency copies.

**Non-Goals:**

- Copy upstream design history or the legacy phase-directory advisory script into generated packages.
- Remove historical paths throughout all ARSU-derived reference and agent files.
- Reintroduce ARS Bucket labels, project a second routing description, or inject another Contract Preflight into cross-skill copies.

## Decisions

1. Extend audited semantic anchors instead of adding post-generation string patches. `PATCH-001` and `PATCH-003` will own their adjacent obsolete design references, while three new IO anchors will own the remaining public phase-boundary spans. This keeps conversion deterministic and makes every rewrite visible in the anchor report.
2. Preserve behavior in current ResearchSpec terms. Replacement bodies retain single-stage write confinement, explicitly selected multi-stage work, reviewer read requirements, clarification before dispatch, and the full-mode patch exclusion, while workflow state and declared outputs replace phase directories, hooks, and the advisory script.
3. Validate only public entrypoint code spans as blocking. A code span beginning with `docs/` or `scripts/` is resolved relative to the generated skill root; a missing target blocks validation. Nested upstream-derived content remains outside this blocking rule to avoid broad current-state cleanup.
4. Keep cross-skill conversion behavior unchanged. Anchor replacement remains source-path based and therefore reaches dependency copies; only `outputPath === "SKILL.md"` receives routing projection and Contract Preflight.

## Risks / Trade-offs

- New upstream wording can break the added anchor scopes → use multiple semantic hints, blocking severity, and the existing clean-checkout anchor validation.
- A public entrypoint may intentionally mention an unbundled repository path → require it to be rewritten as non-operational prose or copied deliberately; no silent allowlist.
- Semantic tests can become brittle → assert only stable prohibitions, applicability boundaries, markers, and path absence rather than full replacement prose.
