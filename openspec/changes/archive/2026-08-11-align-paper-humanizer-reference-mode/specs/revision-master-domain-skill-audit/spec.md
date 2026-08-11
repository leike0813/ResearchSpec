## MODIFIED Requirements

### Requirement: Audit records eight adaptations

The audit SHALL declare the eight adaptations applied to produce
`skills/review-response/` from upstream `skills/revision-master/`. Each
adaptation SHALL declare its kind (`renamed` | `added` | `softened`), summary,
applied-to paths, evidence, and `approved = true`. The adaptations SHALL
include `paper-humanizer-reference-mode`, which makes writing work load
`paper-humanizer/SKILL.md` rather than the retired `prose-guidance.md` path.

#### Scenario: Adaptations are auditable

- **WHEN** the `adaptations` array is parsed
- **THEN** it contains exactly eight approved adaptations, including
  `paper-humanizer-reference-mode` with non-empty summary, applied-to paths,
  and evidence
