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

- [ ] Quick standalone completed through public CLI authority mutations.
- [ ] New-session resume used status, exact selectors, run/graph/node records, and handoffs.
- [ ] Pack export excluded private work and external deliverable bytes.
- [ ] Gate challenge, reverification, and explicit override completed.
- [ ] End-to-end pipeline completed with at least two revision rounds authorized by the frozen root graph, with each formal Gate and Decision confirmed separately.

Attach human correction counts, resume attempts/successes and the playbook's evidence-quality and
deliverable-usability scores. Declared `operational` maturity, parity coverage and fixture-based
technical journeys do not satisfy these manual items.

## Administrative and legal

- [ ] Canonical Git and package metadata configured.
- [ ] Private vulnerability reporting channel configured.
- [ ] npm name and protected publishing path rechecked.
- [ ] Mixed-license distribution reviewed by the responsible rights holder or adviser.
- [ ] Exact release commit identified and bound to hosted evidence.

## Authorization

- [ ] Maintainer explicitly authorized commit, tag, push, GitHub Release, and npm publication.

Until every item is complete, `BLOCKED` is the only valid authorization state.
