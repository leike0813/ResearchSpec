## ADDED Requirements

### Requirement: Curated Procedure Authoring Binds One Procedure Per Capability

An authoring source SHALL support an optional `procedure_path` that points to a curated procedure
markdown file. When the path is present, the authoring converter SHALL inline that file as the body
of the generated Skill `## Procedure` section and SHALL append a `## Completion` block that directs
the Agent to submit declared outputs and return control to ResearchSpec. When the path is absent,
the converter SHALL author the package as `maturity: skeleton` and SHALL emit the fallback
procedure text.

#### Scenario: Operational package is authored

- **WHEN** an authoring source binds a curated `procedure_path`
- **THEN** the generated manifest records `maturity: operational`
- **AND** the generated `SKILL.md` contains the curated procedure text under `## Procedure`
- **AND** the Skill ends with the `## Completion` return-control instruction

#### Scenario: Skeleton package is authored

- **WHEN** an authoring source has no `procedure_path`
- **THEN** the generated manifest records `maturity: skeleton`
- **AND** the generated `SKILL.md` contains the fallback procedure text

#### Scenario: Authoring remains deterministic

- **WHEN** the authoring converter runs twice with unchanged procedure files and extraction index
- **THEN** every generated package byte is identical across runs

### Requirement: Capability Semantic Parity Is Audited Against Extraction Artifacts

The converter toolchain SHALL provide a deterministic capability parity audit that joins each
capability manifest provenance to `docs/ars_extraction/extraction-index.json` and compares the
generated `SKILL.md` against the verified non-knowledge capability artifacts. The audit SHALL emit a
schema-`"1"` report and SHALL exit non-zero when any threshold fails:

- semantic section coverage is at least `0.7`
- upstream MUST/never/always rule coverage is at least `0.6`
- an upstream output-format section is preserved in the Skill
- every provenance knowledge-pack artifact is covered by a manifest knowledge ref
- every manifest knowledge-ref path is referenced by `SKILL.md`
- no flow, mode, trigger or orchestration heading family is retained in `SKILL.md`

#### Scenario: Every package is above threshold

- **WHEN** the parity audit runs against the bundled 38 capability packages
- **THEN** the report records all 38 as operational with no below-threshold IDs
- **AND** the process exits `0`

#### Scenario: A package falls below a coverage threshold

- **WHEN** any capability Skill falls below section coverage `0.7` or rule coverage `0.6`
- **THEN** the audit exits non-zero and lists the capability ID in the failing threshold set

#### Scenario: Flow guidance reappears in a Skill

- **WHEN** a generated Skill contains a heading matching the flow/mode/orchestration heading families
- **THEN** the audit reports the capability ID and retained heading and exits non-zero

#### Scenario: A knowledge pack is not referenced

- **WHEN** a provenance knowledge-pack artifact has no manifest knowledge ref, or a manifest
  knowledge-ref path is absent from `SKILL.md`
- **THEN** the audit lists the package below the knowledge threshold and exits non-zero

### Requirement: Semantic Deepening Preserves Single-Node Authority

Curated procedure content derived from upstream extraction artifacts SHALL preserve semantic guidance
for the current node while excluding upstream phase flow, mode registry and agent-team orchestration
text. Generated capability Skills SHALL NOT name a next node, phase, mode or run as an instruction.

#### Scenario: Deepened package is authored

- **WHEN** a procedure is deepened from an upstream capability artifact
- **THEN** the generated Skill contains the upstream semantic sections and rules adapted to the
  current node
- **AND** the Skill contains no next-node, next-phase or agent-team invocation instruction
