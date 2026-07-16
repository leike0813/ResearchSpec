## Purpose

Define durable public-CLI journey acceptance and machine-checkable traceability for ARSU user model v0.1.

## Requirements

### Requirement: Public CLI User Journey Acceptance

ResearchSpec SHALL maintain black-box acceptance journeys for bootstrap, vague routing, expert direct routing, standalone execution, pipeline execution, parallel join, Gate challenge and override, dynamic revision rounds, resume, context export, and terminal completion.

#### Scenario: Journey mutates authority only through public CLI

- **WHEN** an acceptance journey starts, submits, decides, advances, or exports workflow state
- **THEN** it SHALL use an independent public CLI process with the exact previewed payload and returned hash or plan hash
- **AND** it SHALL NOT import a core runtime planner or hand-edit state, registries, receipts, or ledgers

#### Scenario: Semantic work is simulated at the allowed boundary

- **WHEN** dynamic instructions request an ARSU-produced candidate or validator verdict
- **THEN** the harness MAY create the minimal candidate at the instruction-declared path or construct the evidence-linked verdict payload
- **AND** the CLI SHALL remain responsible for validation, registration, confirmation, Decisions, receipts, and advancement

#### Scenario: Journey follows dynamic frontier

- **WHEN** a standalone or pipeline journey advances
- **THEN** it SHALL obtain scoped selectors and next actions from status and instructions
- **AND** it SHALL NOT reconstruct the workflow's internal stage order in the harness

### Requirement: Canonical Capability Traceability

ResearchSpec SHALL maintain one machine-readable traceability manifest covering every requirement and scenario in `arsu-user-routing`, `arsu-run-usage`, and `agent-surface-model`.

#### Scenario: Main specs are covered exactly

- **WHEN** the acceptance suite reads the three main capability specs
- **THEN** every requirement and scenario SHALL have at least one responsible technical change, journey ID, and stable test ID
- **AND** the manifest SHALL NOT contain unknown capability, requirement, scenario, journey, test, or technical-change references

#### Scenario: Archived implementation evidence remains resolvable

- **WHEN** technical changes and the umbrella change are archived
- **THEN** traceability SHALL resolve implementation ownership through archived change IDs and stable repository test paths
- **AND** it SHALL NOT depend on the active umbrella change directory

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

### Requirement: Agent-Assisted Plugin Journey Acceptance
ResearchSpec SHALL maintain black-box acceptance for optional plugin discovery,
batch consent, Agent installation, immediate instruction access, advisory
dispatch, rejection, and graceful fallback.

#### Scenario: User accepts relevant augmentation
- **WHEN** a route or ready work item has a matching uninstalled Skill and the
  user confirms the previewed batch
- **THEN** independent CLI processes SHALL execute the matching plan hash and
  return hash-clean Skill instructions
- **AND** the canonical workflow selector and ARSU producer SHALL remain
  unchanged

#### Scenario: User rejects or installation fails
- **WHEN** consent is declined or installation cannot complete
- **THEN** the journey SHALL continue through the same public core runtime
  protocol
- **AND** no new top-level command, wrapper, workflow node, or authority record
  SHALL appear
