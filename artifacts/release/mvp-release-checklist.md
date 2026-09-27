# ResearchSpec 0.1.0 Release Authorization Checklist

**Current authorization:** `BLOCKED`

Unchecked items require current evidence from the final release candidate. Earlier control-plane test
results do not satisfy this checklist.

## Technical readiness

- [ ] Full current release command set passed on the release candidate worktree.
- [ ] `release:verify` inspected and installed the real npm tarball.
- [ ] Active OpenSpec change and main specs passed strict validation.
- [ ] Current user journeys passed through fresh packaged CLI processes.
- [ ] Final tarball and worktree scope audit found no forbidden or unrelated files.

## Hosted CI

- [ ] Ubuntu / Node 22 and Node 24 passed on the release commit.
- [ ] macOS / Node 22 and Node 24 passed on the release commit.
- [ ] Windows / Node 22 and Node 24 passed on the release commit.

## Dogfooding campaign gate

- [ ] Current release candidate passed the all-target init projection matrix in `skills`, `commands`, and `both` modes, including shared `agents`.
- [ ] One selected runnable host passed the complete `natural-18` suite with two independently reviewed sessions per scenario. The other hosts' Agent behavior is not inferred from this result.

## Manual dogfooding

- [ ] [quick-standalone] Natural standalone Procedure produced an ordinary file without run, node, Gate, Decision or handoff state.
- [ ] [new-session-resume] New-session graph resume used status, exact selectors, run/graph/node records, and handoffs.
- [ ] [context-export] Pack export excluded private work and external deliverable bytes.
- [ ] [gate-challenge-override] Gate challenge, reverification, and explicit override completed.
- [ ] [end-to-end-pipeline] End-to-end pipeline completed with at least two revision rounds authorized by the frozen root graph, with each formal Gate and Decision confirmed separately.
- [ ] [natural-literature] A natural literature request discovered a capability and produced a source-bounded synthesis.
- [ ] [natural-writing] A natural writing request discovered a capability and produced a revised manuscript file.
- [ ] [natural-evidence] A natural evidence request discovered a capability and reported claim-level limits.
- [ ] [natural-review] A natural review request discovered a capability and produced a response draft.
- [ ] [ordinary-note-resume] A new session continued ordinary work from current materials and a task note without graph state.

Attach human correction counts, resume attempts/successes and the playbook's evidence-quality and
deliverable-usability scores. Declared `operational` maturity, parity coverage and fixture-based
technical journeys do not satisfy these manual items.

The [four-host change 05 campaign](../../playbooks/dogfooding/host-verification.md) records 144 historical sessions. Each exercised host has failing scenarios; no new static matrix or complete single-host behavior suite has been signed, so release authorization remains `BLOCKED`.

## Administrative and legal

- [ ] Canonical Git and package metadata configured.
- [ ] Private vulnerability reporting channel configured.
- [ ] npm name and protected publishing path rechecked.
- [ ] Mixed-license distribution reviewed by the responsible rights holder or adviser.
- [ ] Exact release commit identified and bound to hosted evidence.

## Authorization

- [ ] Maintainer explicitly authorized commit, tag, push, GitHub Release, and npm publication.

Until every item is complete, `BLOCKED` is the only valid authorization state.
