# Proposal

## Why

The shipped review page loses every card when an Agent item is expanded, while its preview is too sparse to reveal the intended review interactions. Paper humanization also needs a candidate comparison surface distinct from manuscript annotation, and review response needs its own future design.

## What Changes

- Fix Agent card identity and disposition rendering in the shipped v2 page.
- Add explicit display locations for Agent items without changing their original evidence targets.
- Add an optional frozen before/after comparison for a verified paper-humanization candidate, with comments on either side and advisory plan decisions.
- Rebuild the development preview from the current page and seven representative workspaces covering manuscript annotation, humanization plan and candidate review, each with rendered and no-toolchain fallback variants, plus an empty Markdown workspace.
- Stop offering this page for new review-response work; retain its adapter and existing delivered assets for old workspaces.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `interactive-manuscript-review-workspace`: Stable Agent-card interaction, verified display locations, and two-sided frozen candidate comparison.
- `review-workspace-preview-harness`: Representative source-derived scenarios and both rendering outcomes.
- `paper-humanization`: Plan and verified-candidate review use distinct interactions within the shared browser surface.
- `cli-interface`: Review-workspace guidance is offered for paper-humanizer, not new review-response work.
- `manuscript-annotation-intake-adapters`: Explicit display placement preserves original annotation target evidence.

## Impact

The v2 review contract gains optional display metadata; old v2 documents remain valid. The browser, preparation adapters, preview, instructions, user guidance, generated capability pages, and their maintenance anchors change. No public command, model service, browser workflow mutation, or dependency is added.
