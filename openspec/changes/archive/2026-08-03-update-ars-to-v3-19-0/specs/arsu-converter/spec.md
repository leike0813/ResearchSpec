## MODIFIED Requirements

### Requirement: ResearchSpec Contract Integration Injection

ResearchSpec SHALL inject the current contract integration layer into generated ARSU skill
artifacts during conversion.

#### Scenario: Skill entrypoints contain contract preflight guidance

- **WHEN** conversion succeeds
- **THEN** each generated skill group's `SKILL.md` SHALL include a generated
  `Contract Preflight` guidance block
- **AND** the block SHALL instruct wrappers or agents to locate `researchspec/`,
  read workflow and run state, load required contracts, and use registries and
  ledgers for runtime writes

#### Scenario: Integration metadata is generated

- **WHEN** conversion succeeds
- **THEN** `skills/arsu/researchspec-contracts.json` SHALL be written
- **AND** it SHALL identify the generated skill groups and their first-slice
  ResearchSpec contract integration profile

#### Scenario: Semantic replacement profile is declared

- **WHEN** converter output is generated
- **THEN** `skills/arsu/researchspec-contracts.json` SHALL declare anchor
  replacement profile `researchspec-anchor-replacement-v4`
- **AND** it SHALL declare coverage policy `required_and_recommended`
- **AND** it SHALL treat Material Passport content as imported external evidence or
  payload projection sources rather than runtime sources of truth

#### Scenario: Material Passport is not runtime SSOT

- **WHEN** contract integration guidance is generated
- **THEN** it SHALL state that ARS Material Passport may be treated as a
  imported evidence artifact
- **AND** it SHALL NOT instruct generated skills to use Material Passport as the
  ResearchSpec runtime source of truth

#### Scenario: Full matrix injection is deferred

- **WHEN** conversion injects contract integration guidance
- **THEN** it SHALL use a shared preflight and integration metadata profile
- **AND** it SHALL NOT require every upstream stage or mode section to be
  rewritten with the full ResearchSpec workflow matrix

## ADDED Requirements

### Requirement: Runtime Model Policy Is Complete And Agent-Neutral

ResearchSpec SHALL classify every policy-sensitive ARS v3.19.0 source match and
adapt active instructions so generated Skills use only user-confirmed,
host-native subagents. Conversion SHALL reject unclassified matches and active
instructions that configure credentials or directly call model services.

#### Scenario: Alternate-model review is authorized

- **WHEN** an Agent proposes an alternate host model for the current subflow
- **THEN** the user SHALL confirm the model, content category, and cost before dispatch
- **AND** the Agent SHALL minimize and de-anchor the dispatched material
- **AND** the consent SHALL NOT be persisted as ResearchSpec authority

#### Scenario: Alternate-model review is unavailable

- **WHEN** dispatch fails or the returned review is structurally invalid
- **THEN** the Skill SHALL disclose the limitation and fall back to the current session model
- **AND** it SHALL NOT vote, average, or silently replace the main Agent's frozen judgment

#### Scenario: Policy source changes

- **WHEN** a policy match is unclassified or an adaptation is missing, ambiguous, or overlaps another rewrite
- **THEN** conversion SHALL fail before writing generated Skill output

### Requirement: Reviewer Panel Checker Closure Is Bounded

ResearchSpec SHALL package only `check_panel_synthesis.py` and
`check_sprint_contract.py` from the upstream root scripts, place them under the
reviewer Skill, and reuse the packaged shared sprint-contract schema.

#### Scenario: Checker prerequisites are missing

- **WHEN** Python 3.11+ or `jsonschema>=4.17` is unavailable at explicit Skill runtime
- **THEN** the panel flow SHALL pause with a prerequisite diagnostic
- **AND** conversion, installation, and checking SHALL NOT install dependencies or substitute Agent judgment

#### Scenario: Unapproved root script is present

- **WHEN** conversion considers any other upstream root script
- **THEN** it SHALL exclude that script from the generated tree and manifest
