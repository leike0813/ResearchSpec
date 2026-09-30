# Design

## Context

See proposal.md. The v1.3.1 anchor, converter and generated extension packages
describe a 150-Skill source with the old FAERS parameter names, the EBI eQTL
route and a CLUE cell-line path. Upstream v1.5.4 has 185 Skills, changed tool
declarations and three new business candidates.

## Goals / Non-Goals

Keep a reviewed, source-bound static projection whose unaffected bytes survive an
incremental update. No upstream script execution, dependency installation or
external service access is part of maintenance.

## Decisions

The maintenance catalog owns the active release, revision, audit path and
anchor, so the converter and generator no longer repeat those literals. The
immutable audit records every current source entry with the release and revision
that produced its reviewed content.

Structural checks derive admitted and excluded totals from the audited records
instead of comparing against historical list lengths, and conversion refuses a
dirty or mismatched checkout before touching output.

Reviewed tool-contract adaptations live in a dedicated converter module scoped
by tool family, file and Skill. They are applied to reviewed Markdown and Python
content before conversion, are idempotent, and are recorded as adaptations
rather than verbatim copies in the file disposition.

Content-only writes replace unconditional writes in the converter, generator
and shared sync path, so unaffected packages, profiles, resources and vendored
files keep both their bytes and their modification state. The anchor diff is the
evidence that the update stayed bounded.

## Risks / Trade-offs

Adaptation is string-based against reviewed upstream text, so an upstream edit
that changes the surrounding syntax can silently stop matching. The adaptation
tests cover each rule, and the semantic review re-reads the generated output.

Keeping three plausible business candidates out of production preserves the
reviewed admission discipline at the cost of deferring their value; each one
still needs its own license, resource, overlap and domain review.

Per-Skill source identity means one checkout intentionally carries more than one
reviewed identity. Conversion input stays the single new pin, and identity is
only a byte-stability signal.
