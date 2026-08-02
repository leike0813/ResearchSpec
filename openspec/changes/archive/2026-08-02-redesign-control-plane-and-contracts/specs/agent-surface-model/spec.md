## MODIFIED Requirements

### Requirement: Minimal User-Visible Skill Surface
The fixed user-visible surface SHALL contain exactly four ARSU Skills, four Companion Skills and seven
Zotero literature Adapter Skills; optional reviewed domain Skills SHALL remain additive helpers.

#### Scenario: Fixed surface is projected
- **WHEN** a registered Agent host receives ResearchSpec Skills
- **THEN** exactly fifteen fixed Skills are projected before optional domain selections

### Requirement: Minimal CLI Surface
The product SHALL expose exactly sixteen top-level CLI capabilities and SHALL NOT create another
command for a low-level control transaction.

#### Scenario: Command-capable tool is projected
- **WHEN** ResearchSpec installs command wrappers
- **THEN** the wrapper set reflects the sixteen-command catalog and excludes `submit`

