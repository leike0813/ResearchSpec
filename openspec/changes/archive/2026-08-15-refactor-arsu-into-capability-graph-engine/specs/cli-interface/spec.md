## MODIFIED Requirements

### Requirement: Read Commands Use Current Workspace State
Status, list, show, instructions, check and doctor SHALL derive their results from current stable
specs, graph profiles, run files, node files, handoffs and changes without writing project files.

#### Scenario: Read command succeeds or reports a blocker
- **WHEN** any read command executes against a current or unsupported workspace
- **THEN** it produces no workspace mutation

### Requirement: Status Is A Bounded Current Snapshot

`status --json` SHALL return a bounded static snapshot containing workspace/schema identity,
stable-spec counts, projected profile identities, run and node counts, the deterministic frontier with
run/node selectors, pending Gate/Decision selectors, blockers, aggregate Agent-tool health, compact
literature-Adapter health, and diagnostic counts. Growing collections SHALL expose `total` and
`truncated` with a fixed item cap.

#### Scenario: Status is requested in a large workspace

- **WHEN** the workspace contains many tools, history events, diagnostics, changes, runs or frontier items
- **THEN** status SHALL omit full history, full run/node/change/control/tool/Adapter objects, per-tool
  projection arrays, file hashes/paths, and diagnostic details
- **AND** detailed records SHALL remain available through `list`, `show`, `check`, or `doctor`

#### Scenario: Status reports a degraded static surface

- **WHEN** load-time or static Adapter inspection finds blocking or warning conditions
- **THEN** status SHALL report aggregate diagnostic counts and preserve the corresponding non-zero
  status result
- **AND** the JSON envelope SHALL not include the unbounded diagnostic list

## ADDED Requirements

### Requirement: Run And Node Selectors Use Existing Commands

The CLI SHALL expose `profile:`, `run:`, `node:`, `gate:` and `decision:` selector families through
the existing `start`, `instructions`, `advance` and `decide` commands without adding a top-level
command. The sixteen-command public surface SHALL remain unchanged.

#### Scenario: Run is started

- **WHEN** a user runs `start profile:<profile-id>` after confirming the entry summary
- **THEN** the CLI creates one run and returns its run selector

#### Scenario: Node selector is requested outside a run

- **WHEN** a caller requests `instructions node:<run-id>/<node-id>` for a non-current run
- **THEN** the CLI returns a stable current-run diagnostic and performs no write

### Requirement: Node Instructions Expose A Bounded Card

`instructions node:<run>/<node>` SHALL return one structured, versioned node card with node identity,
capability ID or subgraph reference, bound input roles and paths, expected output roles, validator IDs,
required Gate/Decision selectors, human-confirmation requirements and the next required read.

#### Scenario: Eligible node card is requested

- **WHEN** a caller requests instructions for a currently eligible node
- **THEN** the card contains only that node's executable contract
- **AND** it does not embed a successor plan or upstream workflow prose

#### Scenario: Node card is generated from the typed catalog

- **WHEN** help or the handbook renders the node-instructions payload
- **THEN** it SHALL document the same field shapes and constraints used by the runtime schema

### Requirement: Advance Node Validates Before Writing

`advance node:<run>/<node>` SHALL validate the submitted output roles, evidence paths and all declared
validators before writing node state. A validation failure SHALL return stable diagnostics and SHALL
NOT modify run, node or external files. `--dry-run` SHALL perform the same validation without writing.

#### Scenario: Invalid node submission

- **WHEN** an Agent advances a node with missing output roles or a failing validator
- **THEN** the CLI returns exit class 1 or 2 with the owning validator/role diagnostic
- **AND** workspace bytes remain unchanged

#### Scenario: Valid node submission

- **WHEN** all declared validators pass
- **THEN** exactly the owning node file is atomically updated to `complete`

### Requirement: Decision Confirmation Never Implicitly Advances

`decide gate:<run>/<node>` and `decide decision:<run>/<node>` SHALL record only the confirmed human
choice in the owning run/node file. The command SHALL NOT advance the run or mark any node complete.

#### Scenario: Gate verdict is confirmed

- **WHEN** a human confirms a Gate verdict
- **THEN** the returned data identifies the updated Gate and the current frontier remains derivable
  only from a subsequent status read
