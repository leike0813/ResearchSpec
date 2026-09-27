# Design

## Context

See proposal.md. `scenarios.yaml` supplies prompts and fixture paths, while `worker.mjs` currently stages only named notes and graph cases. Assessment and human review reread the live catalog, so editing a scenario invalidates pending review of old campaigns.

## Goals / Non-Goals

**Goals:** Make these two attempts start from real, inspectable inputs; keep old campaigns tied to their original assertions.

**Non-Goals:** Change product search, Procedure manifests, review-response workflow, other scenarios, or previous attempt results. No model call is needed to validate fixture setup.

## Decisions

1. Add a scenario-owned first query term. After init, the worker runs `list procedures --query <term> --json`, verifies zero results, and saves the actual response inside the disposable project and attempt evidence before the host starts. The prompt asks the Agent to continue from that observed miss with one alternate query. Use an ASCII coined term because the current lexical search normalizes a Chinese-only query to an empty query and returns the whole catalog. If the term starts matching later, setup stops before the host call. This exercises recovery from a real miss without changing product search behavior.
2. Use `transform-revision-roadmap-parsing` → `check-pre-submission-self-check` for the two-capability case. The existing Markdown review-cycle fixture supplies reviewer comments and the partial draft; the first declares `revision_roadmap`, which the second accepts as an input alongside the draft. The second report may say the draft is incomplete and author choices remain pending. Scenario metadata names the two selectors, shared role and fixture input paths; the worker checks the current packets and files before calling the host. Matching roles are necessary, while the checked-in Procedure text remains the semantic authority.
3. Store the exact `scenarios.yaml` bytes as `catalog.yaml` next to each new `campaign.json`, bound to `catalog_hash`. Assessment, report, review and the HTML scenario API read this snapshot. Existing campaigns can use the live catalog only while its hash still matches; the two pending campaigns receive a matching catalog copy before this change edits the source. Resume/retry and release publication keep their existing build-hash controls.
4. Keep old report recommendations and human review separate. The new scenario wording applies only to new campaigns. Old reports remain evidence of the flawed setup and are not silently regraded.
5. For run precedence, seed a confirmed project intent about the same synthetic source-and-draft task before starting the root run. Derive the entry node's required output roles from its current profile instructions and include them in the root start handoff. After start, render a scenario-specific ordinary note with the exact `run:` selector and the same goal, inputs and next step. Preflight the note, project intent, live run and planned handoff roles before invoking the host. Keep the user prompt natural; the Agent must establish the relationship from project files. The ordinary note without a run stays the fixture for standalone continuation cases.

## Risks / Trade-offs

- A directed first-query fixture is less spontaneous than the general natural-routing cases. It isolates the retry behavior; other scenarios continue to test free-form discovery.
- A Procedure may later add a hidden material or human-confirmation prerequisite. The local role/file preflight catches declared contract drift; maintainers must review Procedure instructions when changing the pair.
- Existing campaigns without a matching catalog snapshot cannot be safely adjudicated after catalog drift. Keep the hash check and backfill only copies verified against the old hash.
- Explicitly linking the note to the run makes run precedence less ambiguous. It tests whether the Agent follows an observable relationship; stale or contradictory notes require a separate ambiguity scenario rather than a forced resume verdict.

## Migration Plan

Verify the two pending campaign hashes against the current catalog and add their catalog copies. Then update source scenarios and harness code. Reopen each historical review page and verify its prompts/assertions still reflect the old catalog. New campaigns create their own snapshots.
