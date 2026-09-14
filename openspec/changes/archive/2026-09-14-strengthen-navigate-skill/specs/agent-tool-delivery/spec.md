## MODIFIED Requirements

### Requirement: Complete Companion Skill Delivery

Every selected Agent host SHALL receive only the Navigate Companion for Skill delivery. Propose, Decide, and Verify SHALL remain bundled on-demand procedures. The Navigate tree SHALL include its generated CLI-handbook and ARSU-route references.

#### Scenario: Every tool receives the base surface
- **WHEN** a registered Skill-capable tool is selected
- **THEN** its base Skill tree contains `researchspec-navigate` and no other Companion
- **AND** Navigate contains `SKILL.md`, `LICENSE`, `references/cli-handbook.md`, and `references/arsu-routes.md`

#### Scenario: Every tool receives the fixed base surface
- **WHEN** a registered tool receives Skill delivery
- **THEN** its fixed base surface is the single complete Navigate Skill tree

#### Scenario: Selected Adapter reaches every tool
- **WHEN** `zotero-library` and Agent tools are selected
- **THEN** all seven Adapter Skills are projected through normal managed ownership

#### Scenario: Obsolete generated projections are cleaned safely
- **WHEN** a previously managed ARSU, hidden Companion, core capability, plugin Skill, or obsolete wrapper is no longer desired
- **THEN** reconciliation removes it only when its bytes match the recorded hash
- **AND** preserves and diagnoses modified files under the existing drift policy

### Requirement: Installed Skill License Retention

ResearchSpec SHALL deliver applicable license and attribution files with every independently copied Companion and Literature Adapter Skill without weakening generated-file ownership or drift protection.

#### Scenario: ARSU Skill is installed

- **WHEN** a bundled ARSU procedure package is inspected or activated
- **THEN** its converter-owned CC BY-NC 4.0 license and upstream attribution notice SHALL remain in the packaged tree
- **AND** the package SHALL remain hidden from host Skill roots

#### Scenario: Companion Skill is installed

- **WHEN** a selected tool receives a generated Companion Skill
- **THEN** the Companion directory SHALL include canonical MIT license text attributed to `ResearchSpec contributors`
- **AND** every generated file in the tree SHALL follow the same manifest hash, drift-preservation, and safe-retirement rules as its `SKILL.md`

#### Scenario: Literature Adapter Skill is installed

- **WHEN** a selected tool receives a Zotero Adapter Skill
- **THEN** its approved AGPL-3.0 license, notice, and derivation evidence SHALL be delivered with the complete tree
- **AND** those files SHALL use the same managed ownership and drift rules

## REMOVED Requirements

### Requirement: Independent CLI Handbook Skill Delivery

**Reason**: Detailed CLI guidance is generated inside Navigate's managed tree and has no independent procedure identity.

**Migration**: Consumers read `researchspec-navigate/references/cli-handbook.md`; obsolete managed handbook trees remain subject to normal safe reconciliation.
