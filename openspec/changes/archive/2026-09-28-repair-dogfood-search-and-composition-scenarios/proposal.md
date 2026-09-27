# Proposal

## Why

Three natural-journey scenarios produce unreliable verdicts. The first-search-miss case declares a missed query without staging one; the two-capability case pairs a Markdown fixture with a LaTeX-only entry procedure and skips a required intermediate step. The run-precedence case claims that an unfinished run belongs to the task while its note says no run is related, its project intent is blank, and its handoff omits required child outputs. Editing the catalog would also prevent awaiting-review campaigns from being adjudicated against their original assertions.

## What Changes

- Make the first-search-miss case start from a recorded, real zero-result Procedure query, then assess the Agent's single alternate search and candidate choice.
- Replace the two-capability pair with a declared, runnable standalone link from revision roadmap parsing to manuscript self-check using the existing Markdown review-cycle fixture.
- Freeze each campaign's scenario catalog for later assessment, report viewing, and human review. Preserve the original catalog for the two existing awaiting-review campaigns.
- Check these two scenario preconditions locally before spending a behavior-model call. Keep old attempts and their reports unchanged.
- Give the run-precedence scenario a confirmed project intent, a note linked to the exact unfinished run, and a runnable parent handoff. Verify the staged relationship before the host call and rerun this case with Codex and `gpt-6-sol`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dogfooding-harness`: require executable scenario preconditions and campaign-bound scenario contracts through later assessment and human review.

## Impact

- `playbooks/dogfooding/scenarios.yaml`, its README and fixtures, the dogfood worker/catalog and assessment/review paths, and focused harness/playbook tests.
- Campaign evidence storage gains one immutable catalog snapshot; historical attempt files, user reviews, product CLI, and ResearchSpec workflow contracts do not change.
