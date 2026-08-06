## MODIFIED Requirements

### Requirement: Complete Companion Skill Delivery

Every selected Skill-capable tool SHALL receive five generated ResearchSpec Companion Skills together with the four ARSU and two Core Skills. The handbook content SHALL be delivered as the `SKILL.md` of `researchspec-cli-handbook`; no Navigate-local `references/cli-handbook.md` file SHALL be generated.

#### Scenario: Every tool receives the default ten-Skill surface

- **WHEN** any registered tool is selected without optional Adapter selection
- **THEN** it SHALL receive four ARSU, two Core and five Companion Skills
- **AND** desired projection counts and files SHALL be derived from their owning catalogs

#### Scenario: Selected Adapter reaches every tool

- **WHEN** `zotero-library` and one or more Agent tools are selected
- **THEN** all seven Adapter Skills SHALL be projected to every selected tool
- **AND** their complete trees SHALL use the normal managed ownership records

#### Scenario: Obsolete generated projections are cleaned safely

- **WHEN** a manifest-owned project-local file is no longer desired
- **THEN** init and update SHALL remove it only when its bytes match the recorded hash
- **AND** a modified file SHALL be preserved, reported as `generated_file_drift`, and retained in the manifest
- **AND** a missing stale file SHALL be removed from the manifest without error

### Requirement: Adapter Roles Control Projection Discovery

Delivery SHALL preserve Adapter role, visibility, capability and hard dependency metadata without creating command wrappers for any Adapter Skill.

#### Scenario: Command-capable tool and Adapter are selected

- **WHEN** one of the 28 command-capable tools and `zotero-library` are selected
- **THEN** the tool SHALL receive eighteen Skills and exactly sixteen ResearchSpec wrappers
- **AND** the CLI mechanism SHALL remain available as a Skill dependency rather than another wrapper

#### Scenario: Skills-only tool and Adapter are selected

- **WHEN** ForgeCode, Kimi, or Mistral Vibe and `zotero-library` are selected
- **THEN** the tool SHALL receive all eighteen selected Skills
- **AND** command absence SHALL remain a non-blocking diagnostic

## ADDED Requirements

### Requirement: Independent CLI Handbook Skill Delivery

ResearchSpec SHALL deliver the generated CLI handbook as the `SKILL.md` of `researchspec-cli-handbook` through normal Companion ownership and reconciliation.

#### Scenario: Selected tool receives the handbook Skill

- **WHEN** a tool is selected during init or update with Skill delivery
- **THEN** its managed Skill tree SHALL contain `researchspec-cli-handbook/SKILL.md`
- **AND** its Navigate tree SHALL not contain `references/cli-handbook.md`

#### Scenario: Handbook Skill has drifted

- **WHEN** the managed handbook Skill differs from its recorded bytes
- **THEN** update SHALL preserve and diagnose it under the common generated-file drift policy
- **AND** `--force` MAY refresh the desired generated Skill

## REMOVED Requirements

### Requirement: Navigate CLI Handbook Reference Delivery
**Reason**: The handbook is now an independent Companion Skill rather than an optional Navigate reference.
**Migration**: Reconcile the normal `researchspec-cli-handbook/SKILL.md` projection; clean an unchanged legacy reference under standard ownership rules.
