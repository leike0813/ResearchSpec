# Absorb revision-master as the review-response Core Skill

## Why

The current `review-response` package only describes a thin SQLite wrapper. It does not deliver the six-stage semantic workflow, references, templates, localization, schema, export tooling, or revision-audit behavior from `leike0813/revision_master`.

## What Changes

- Publish the complete `revision-master` Skill package under the canonical `review-response` Core Skill identity.
- Adapt all runtime paths to `subflows/<instance>/work/review-response/` and `subflows/<instance>/views/`.
- Preserve the six-stage semantic workflow, user confirmations, response-thread aggregation, manuscript export, localization, and recovery protocol.
- Make ResearchSpec `control.yaml` and `handoff.md` authoritative for lifecycle state while SQLite remains Skill-local semantic truth.
- Keep `review-response:full` standalone, outside `academic-pipeline`, with the fixed sixteen-Skill installation surface and existing command wrappers.

## Non-goals

- No new public CLI command.
- No automatic Python dependency installation.
- No inclusion of the upstream repository's tests, playbooks, examples, history, or caches in the published Skill.

## Impact

The Skill package, SQLite helpers, control projection, package verification, OpenSpec specs, and review-response regression tests are affected. Existing ARSU revision, rebuttal-audit, and re-review routes remain unchanged.
