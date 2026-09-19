# Spec Delta

## ADDED Requirements

### Requirement: Supported Hosts Receive Managed Native Procedure Profiles

ResearchSpec SHALL install both native Procedure roles by default for the selected `antigravity`, `auggie`, `claude`, `codeartsagent`, `codebuddy`, `codex`, `devin`, `forgecode`, `costrict`, `cursor`, `factory`, `gemini`, `github-copilot`, `iflow`, `junie`, `kilocode`, `kiro`, `vibe`, `oh-my-pi`, `opencode`, `qoder`, `qwen`, `rovodev`, and `trae` adapters. Each profile SHALL use the host's project-local native format, SHALL omit a fixed model unless the host has a documented inherited-model value, and SHALL receive the strongest host-native restriction available against shell use, user questioning, and nested delegation.

#### Scenario: All supported adapters are selected
- **WHEN** installation reconciliation selects all 24 supported adapters
- **THEN** it plans two managed role definitions per adapter
- **AND** Vibe additionally receives one managed prompt body per role
- **AND** the resulting custom-agent installation set contains 50 files

#### Scenario: Unsupported adapter is selected
- **WHEN** a selected adapter is outside the supported set
- **THEN** ResearchSpec installs no custom-agent profile for that adapter
- **AND** its existing Skill or command delivery is unchanged

#### Scenario: A managed profile drifts or becomes obsolete
- **WHEN** update encounters a modified profile or a clean profile that is no longer desired
- **THEN** the existing generated-file drift and safe-retirement rules apply
- **AND** an unmanaged same-path file is preserved as a blocking conflict

