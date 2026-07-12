# ResearchSpec 0.1.0 Release Authorization Checklist

**Current authorization:** `BLOCKED`

Unchecked items are factual missing evidence. Do not convert them to completed status based on plans, local inference, or automated acceptance tests.

## Technical Readiness

- [x] Full local release command set passed on the release candidate worktree.
- [x] `release:verify` inspected and installed the real npm tarball.
- [x] OpenSpec change and all main specs passed strict validation.
- [x] Final tarball and worktree scope audit found no forbidden or unrelated files.

## Hosted CI

- [ ] Ubuntu / Node 22 passed on the release commit.
- [ ] Ubuntu / Node 24 passed on the release commit.
- [ ] Windows / Node 22 passed on the release commit.
- [ ] Windows / Node 24 passed on the release commit.

## Manual Dogfooding

Follow [the repository-only dogfooding playbook](../playbooks/dogfooding/README.md) and attach reproducible evidence directories outside the research workspace. Scenario definitions and release mappings are authoritative in `playbooks/dogfooding/scenarios.yaml`.

- [ ] `DF-T1-STANDALONE` — Quick standalone completed without authoritative-state edits. Evidence directory: _pending_
- [ ] `DF-T1-RESUME` — New-session Resume used only persisted workspace/frontier facts. Evidence directory: _pending_
- [ ] `DF-T1-EXPORT` — Handoff/pack export completed without workflow-state advancement. Evidence directory: _pending_
- [ ] `DF-T1-GATE` — Gate challenge produced reverification and an explicit latest-event-bound override. Evidence directory: _pending_
- [ ] `DF-T1-PIPELINE` — End-to-end pipeline completed after at least revision rounds 1 and 2. Evidence directory: _pending_

## Administrative And Legal

- [ ] Canonical Git remote and package repository/homepage/bugs metadata configured.
- [ ] Private vulnerability reporting channel configured and recorded in `SECURITY.md`.
- [ ] npm package name rechecked immediately before publication.
- [ ] npm account protection and provenance-capable publishing configured.
- [ ] Mixed-license distribution and any commercial-use statement reviewed by the responsible rights holder or adviser.
- [ ] Exact release commit identified; hosted CI and dogfood evidence bind to it.

## Authorization

- [ ] Maintainer explicitly authorized commit/tag/push/GitHub Release/npm publication.

Until every item above is complete, `BLOCKED` is the only valid authorization state.
