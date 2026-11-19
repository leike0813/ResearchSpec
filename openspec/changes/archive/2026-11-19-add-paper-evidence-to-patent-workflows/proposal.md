# Proposal

## Why

A claim can agree with its specification even when both generalize beyond the original paper. Reviewers need to trace each limitation back to the supplied disclosure. When comparing a paper with an existing patent, they also need to see features found only in the paper.

## What Changes

- Carry feature-level paper evidence through patent intake, disclosure, application and revision. Expose unresolved support in the review materials.
- Add one standalone fixed capability, `analysis-paper-patent-comparison`, for a paper and a patent supplied by the user. Its technical report covers both directions and records chronology separately.
- Independently author these methods in ResearchSpec. The reviewed snapshot provides no identified redistribution grant for its code, prompts or corpus materials. [Method reference](https://github.com/snipp-zha/Paper-to-patent-Skill/tree/9837e9b8d74bb3c1f73a84ac0aaff9c3c6604dc7)

## Capabilities

### New Capabilities

- `paper-patent-comparison` specifies the independently discoverable comparison Procedure and its ordinary-file report.

### Modified Capabilities

- `patent-fixed-capabilities` gains paper-source traceability within existing drafting and review Procedures.

## Impact

Changes affect patent Procedure authoring, the fixed capability registry and its discovery catalog, generated fixed packages, maintenance evidence and the patent workflow guide. Existing file indexes carry the evidence attachment. The change requires no additional profile, CLI command, host Skill or dependency.
