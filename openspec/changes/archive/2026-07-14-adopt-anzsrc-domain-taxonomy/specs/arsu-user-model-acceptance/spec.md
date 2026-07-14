## MODIFIED Requirements

### Requirement: Domain Plugin User Journey Acceptance
ResearchSpec SHALL maintain black-box acceptance for package-only non-empty discovery, workspace selection, projection, refresh, empty or retired recovery, drift-safe uninstall, and advisory recommendation.

#### Scenario: Plugin lifecycle uses public CLI only
- **WHEN** an acceptance journey selects, updates, or removes fixture domains
- **THEN** it SHALL invoke independent public CLI processes
- **AND** it SHALL verify config selection, projected resources, and manifest evidence without hand-editing authority files

#### Scenario: Empty domain remains comfortable for users
- **WHEN** the internal registry contains empty discipline or tool domains
- **THEN** normal public discovery SHALL hide them and direct show or install SHALL reject them
- **AND** a previously selected empty domain SHALL remain visible only as unavailable recovery state until uninstalled or repopulated

#### Scenario: Plugin execution boundary remains external
- **WHEN** a fixture Skill contains a Python script
- **THEN** acceptance SHALL verify byte-for-byte projection
- **AND** ResearchSpec SHALL NOT execute the script or install its dependencies
