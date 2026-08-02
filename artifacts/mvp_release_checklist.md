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

## Manual dogfooding

- [ ] Quick standalone completed without direct control edits.
- [ ] New-session resume used status, exact selectors, controls, and handoffs.
- [ ] Pack export excluded private work and external deliverable bytes.
- [ ] Gate challenge, reverification, and explicit override completed.
- [ ] End-to-end pipeline completed with at least two independently confirmed revision rounds.

## Administrative and legal

- [ ] Canonical Git and package metadata configured.
- [ ] Private vulnerability reporting channel configured.
- [ ] npm name and protected publishing path rechecked.
- [ ] Mixed-license distribution reviewed by the responsible rights holder or adviser.
- [ ] Exact release commit identified and bound to hosted evidence.

## Authorization

- [ ] Maintainer explicitly authorized commit, tag, push, GitHub Release, and npm publication.

Until every item is complete, `BLOCKED` is the only valid authorization state.
