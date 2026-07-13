## MODIFIED Requirements

### Requirement: Acceptance Preserves Product Boundaries

The acceptance capability SHALL validate the canonical user model while allowing
the optional package-owned domain Skill extension without expanding workflow
authority or base wrappers.

#### Scenario: Public contracts remain fixed

- **WHEN** acceptance assets are installed and executed
- **THEN** CLI help SHALL expose exactly sixteen top-level commands, Agent delivery
  SHALL retain four ARSU plus four Companion base Skills, and command-capable
  tools SHALL retain exactly eight base wrappers
- **AND** optional plugin Skills SHALL be projected only when selected
- **AND** no production dependency, migration, hidden state, acceptance-only
  runtime command, or plugin-owned workflow authority SHALL be introduced

#### Scenario: Export and resume do not invent authority

- **WHEN** acceptance resumes in a new process or produces handoff and pack outputs
- **THEN** it SHALL derive them from persisted workspace contracts and runtime evidence
- **AND** those derived views SHALL NOT advance workflow state or become runtime sources of truth

## ADDED Requirements

### Requirement: Domain Plugin User Journey Acceptance
ResearchSpec SHALL maintain black-box acceptance for package-only discovery, workspace selection, projection, refresh, retirement, drift-safe uninstall, and advisory recommendation.

#### Scenario: Plugin lifecycle uses public CLI only
- **WHEN** an acceptance journey selects, updates, or removes fixture plugins
- **THEN** it SHALL invoke independent public CLI processes
- **AND** it SHALL verify config selection, projected resources, and manifest evidence without hand-editing authority files

#### Scenario: Plugin execution boundary remains external
- **WHEN** a fixture Skill contains a Python script
- **THEN** acceptance SHALL verify byte-for-byte projection
- **AND** ResearchSpec SHALL NOT execute the script or install its dependencies
