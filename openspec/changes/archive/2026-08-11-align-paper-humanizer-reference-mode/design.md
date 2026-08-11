## Context

Paper Humanizer 2.9.1 embeds Reference mode in `SKILL.md`. The older
`prose-guidance.md` was removed when the Python runtime was restored, while the
ARSU preflight injection and an adapted Review Response instruction retained a
hard-coded path to it.

## Decisions

- Keep the current Paper Humanizer entrypoint as the one path authority in a
  small core module shared by consumers and converter checks.
- Update generated ARSU prose instructions through its converter; never edit
  its generated output by hand.
- Treat the Revision Master source inventory as fixed while recording the
  published Review Response correction as an eighth reviewed adaptation.
- Make the Revision Master checker validate both the approved audit entry and
  the published cross-Skill path, so future package changes fail offline before
  release.

## Risks

The Review Response adaptation changes published instructions but does not
execute code, alter lifecycle authority, or add a public command. Its audit,
current spec, and checker are updated together to keep the release contract
coherent.
