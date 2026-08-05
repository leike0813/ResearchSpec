### ResearchSpec Current Owner

Replacement scope: `REVIEW-001` for `academic-paper-reviewer`.

Dedicated mode for Pipeline Stage 3'. Re-review verifies each first-round
concern against the current revised manuscript and the response to reviewers.
The manuscript may be Markdown or QMD. Review QMD as Markdown-compatible source
without stripping or normalizing YAML frontmatter, fenced code, cell options,
cross-references, citations, or other Quarto metadata.
When the revision producer exposed an ARSU patch, annotation set, or helper
summary, resolve those files by role and safe project-relative path from the
producer subflow's `handoff.md`; do not infer them from directory names or
another authority file.

**Input:** the original Revision Roadmap, revised manuscript, response to
reviewers when present, prior review material, and any explicitly handed-off
patch or annotation evidence relevant to the concern.

**Output:** a Verification Review Report at an ordinary project path outside
`researchspec/`, recorded as an output in this subflow's `handoff.md`. The
reviewer assesses semantic fulfillment independently. Mechanical application or
annotation disposition never proves that a concern was answered. A human
records the formal re-review Gate verdict in the owning subflow `control.yaml`.

> See `references/re_review_mode_protocol.md` for the verification rules,
> output format, and Socratic guidance.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
