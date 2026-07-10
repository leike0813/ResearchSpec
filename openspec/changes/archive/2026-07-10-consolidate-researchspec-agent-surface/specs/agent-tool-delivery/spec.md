## MODIFIED Requirements

### Requirement: Complete Companion Skill Delivery

Every selected tool SHALL receive generated copies of all four canonical ResearchSpec companion skills at its registered project-local skill root.

#### Scenario: Every tool receives the target eight-Skill surface

- **WHEN** any of the 31 registered tools is selected
- **THEN** it SHALL receive four ARSU Skills plus `researchspec-navigate`, `researchspec-propose`, `researchspec-decide`, and `researchspec-verify`
- **AND** each installed companion SHALL contain one self-contained `SKILL.md`
- **AND** desired projection counts SHALL be derived from the ARSU and Companion registries rather than a second member list

#### Scenario: Obsolete generated projections are cleaned safely

- **WHEN** a manifest-owned project-local file is no longer desired
- **THEN** init and update SHALL remove it only when its bytes match the recorded hash
- **AND** a modified file SHALL be preserved, reported as `generated_file_drift`, and retained in the manifest
- **AND** a missing stale file SHALL be removed from the manifest without error

### Requirement: Capability-Aware Command Delivery

ResearchSpec SHALL render typed ARSU and companion wrapper intents through the registered tool-specific command format without conflating their metadata or installed skill IDs.

#### Scenario: Command-capable tools receive the target eight-wrapper surface

- **WHEN** one of the 28 command-capable tools is selected
- **THEN** it SHALL receive wrappers for four ARSU Skills and four Companion Skills
- **AND** each companion wrapper SHALL route to its installed skill instead of duplicating the workflow
- **AND** companion metadata SHALL not inherit ARSU categories or tags

#### Scenario: Skills-only tools remain non-blocking

- **WHEN** ForgeCode, Kimi, or Mistral Vibe is selected
- **THEN** its four ARSU and four Companion Skills SHALL be installed
- **AND** the CLI SHALL report a non-blocking `commands_not_supported` diagnostic instead of inventing a command format

### Requirement: Generated File Drift Protection

`init` and `update` SHALL preserve user-owned and modified generated files, including retired projections, regardless of `--force`.

#### Scenario: Unknown existing file is preserved

- **WHEN** an expected or obsolete target exists but is not manifest-owned
- **THEN** the operation SHALL leave it unchanged

#### Scenario: Drifted desired file may be refreshed explicitly

- **WHEN** a desired manifest-owned generated file no longer matches its recorded hash
- **THEN** the operation SHALL preserve it and report `generated_file_drift` unless `--force` authorizes replacement

#### Scenario: Drifted retired file is never deleted by force

- **WHEN** a no-longer-desired manifest-owned file differs from its recorded hash
- **THEN** init and update SHALL preserve it, retain its manifest record, and report drift even when `--force` is supplied

### Requirement: Shared Global Codex Prompts

Codex command prompts SHALL be managed as shared-global workspace-neutral files under `$CODEX_HOME/prompts` or `~/.codex/prompts`.

#### Scenario: Global write is explicit outside a TTY

- **WHEN** a non-interactive invocation would write Codex prompts
- **THEN** Codex SHALL have been explicitly included in `--tools`
- **AND** the write plan SHALL identify the out-of-workspace scope

#### Scenario: Project deselection does not delete shared prompts

- **WHEN** one project removes Codex from its selected tools
- **THEN** shared-global Codex prompts SHALL NOT be deleted

#### Scenario: Product-retired global prompt is removed safely

- **WHEN** Codex remains selected and a manifest-owned shared-global prompt belongs to an explicitly retired Companion
- **THEN** init and update SHALL remove it only when its bytes match the recorded hash
- **AND** a drifted retired prompt SHALL be preserved, diagnosed, and retained in the manifest
