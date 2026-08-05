# Restore the Native Python Runtime

The Paper Humanizer absorption currently publishes a ResearchSpec-authored
Node/TypeScript runtime even though the pinned upstream Skill already provides
deterministic Python 3.11 standard-library scripts. Restore that operational
surface from the pinned source and retain the existing JavaScript/TypeScript
implementation only as the tagged historical commit
`reference/paper-humanizer-js-runtime`.

This change publishes the complete operational Skill tree (`SKILL.md`, review
and full playbooks, shared references, and Python scripts), while excluding the
platform-specific `agents/openai.yaml`, upstream tests, OpenSpec artifacts, and
research material. Routes, profile ownership, ResearchSpec lifecycle state,
reference-mode injection, and the fixed 17-Skill surface remain unchanged.

## Non-goals

- Do not rewrite or remove the tagged historical commit.
- Do not add a top-level CLI command or a new workflow authority.
- Do not execute the vendor Python runtime during conversion, checking,
  packaging, installation, or release verification.
