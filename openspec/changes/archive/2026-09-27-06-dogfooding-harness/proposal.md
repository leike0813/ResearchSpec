# Proposal

## Why

The change 05 four-host campaign proved that natural Agent sessions can be automated, but its temporary scripts, short-lived raw traces, heuristic verdicts and missing live review surface make the result hard to repeat or audit. A maintainer harness is needed to run future campaigns and preserve the distinction between machine observations and human acceptance.

## What Changes

- Add a repository-only, model-free init matrix covering every registered target in all three delivery modes, with per-case evidence and resumable campaign state.
- Run natural Agent behavior on one selected runnable host through Orca terminals and isolated project fixtures, with an explicit host model and durable raw evidence.
- Add a report-first local HTML review surface that updates during runs, links exact evidence and saves validated human decisions directly.
- Draft an evidence-bound assessment after each attempt using a separate configurable host Agent; retain the distinction between its recommendation and human acceptance.
- Add a maintainer project Skill that confirms the static matrix, optional behavior host, scenarios and models before starting a campaign and opening the review page.
- Keep the initial four behavior adapters extensible through the existing tool registry, and declare the natural-18 suite in the existing scenario catalog.
- Bring the 144 legacy records into a read-only historical review surface with evidence gaps and provisional verdicts explicit.

## Capabilities

### New Capabilities

- `dogfooding-harness`: Repeatable real-host campaign execution, live evidence review and human verdict import for maintainers.

### Modified Capabilities

- `arsu-user-model-acceptance`: distinguish all-target init checks from project-level single-host behavior acceptance.
- `mvp-release-readiness`: require complete static coverage and one complete human-reviewed natural behavior suite for the dogfooding release gate.

## Impact

Maintainer scripts, `playbooks/dogfooding/`, a separate loopback-only review server and browser assets, focused tests, and package scripts. No product CLI command, published npm asset, model API integration or dependency is added.
