## Purpose

ResearchSpec provides a deterministic contract-change proposal mechanism that
turns an evidence-backed semantic change into a reviewed pending change without
altering stable specs, runtime state, registries, or ledgers until a human
accepts it. The `propose` command is the single create path; `decide accept`
applies only after revalidation.

## Requirements

### Requirement: Strict Semantic Proposal Input

ResearchSpec SHALL accept contract-change proposal intent only as a strict JSON
payload containing title, rationale, risk level, impact statements, and one or
more typed patch requests.

#### Scenario: Runtime derives authoritative proposal fields

- **WHEN** a valid semantic payload, change ID, and actor are supplied
- **THEN** the runtime SHALL derive schema version, change ID, timestamp, actor,
  `status: proposed`, `requires_human_decision: true`, sequential patch IDs, and
  validation metadata
- **AND** unknown payload fields or invalid operation shapes SHALL be usage errors

### Requirement: Safe Change Identity And Create-Only Output

Proposal creation SHALL use a safe unique change ID and SHALL never overwrite an
active or archived change.

#### Scenario: New proposal has a deterministic three-file plan

- **WHEN** the change ID and payload validate
- **THEN** the write plan SHALL create `proposal.md`, `tasks.md`, and
  `contract-patch.yaml` under `researchspec/changes/<change-id>/`
- **AND** all three files SHALL be user-owned create-only outputs
- **AND** `contract-patch.yaml` SHALL be the final write
- **AND** no stable spec, runtime state, registry, or ledger SHALL change

#### Scenario: Reused or unsafe ID is blocked

- **WHEN** the ID is unsafe, already active, already archived, or resolves to an
  existing target
- **THEN** proposal creation SHALL perform no writes
- **AND** `--force` SHALL NOT authorize replacement

### Requirement: Stable Contract Target Grammar

Every proposal patch SHALL target exactly one location in one of
`specs/project.md`, `specs/sources.yaml`, `specs/claims.yaml`,
`specs/manuscript.yaml`, or `specs/workflow.yaml`.

#### Scenario: YAML selector resolves uniquely

- **WHEN** a YAML target uses dot segments and `collection[id]` selectors
- **THEN** every selector SHALL resolve to exactly one current location
- **AND** ambiguous, absent, malformed, escaping, or unsupported targets SHALL be
  blocked before planning writes

#### Scenario: Markdown change replaces one named section

- **WHEN** a patch targets `specs/project.md`
- **THEN** its operation SHALL be `replace`
- **AND** its target path SHALL be `section[Heading]` resolving to exactly one
  section body
- **AND** any other Markdown operation or target grammar SHALL be blocked

### Requirement: Operation And Evidence Validation

Proposal patches SHALL satisfy operation-specific value rules and reference only
existing authoritative evidence.

#### Scenario: Operation preconditions are enforced

- **WHEN** a patch uses `add`, `replace`, `remove`, `append`, or `merge`
- **THEN** target existence, target type, current value, and proposed value SHALL
  match that operation's contract
- **AND** values SHALL be compared structurally rather than by serialization

#### Scenario: Evidence references resolve

- **WHEN** a patch declares source artifact or decision IDs
- **THEN** each artifact SHALL exist in the current registry
- **AND** each decision SHALL exist in the decision ledger
- **AND** missing references SHALL block proposal creation

### Requirement: Revalidation Before Accepted Application

The same target and operation validator used for proposal creation SHALL run
again immediately before an accepted contract change is applied.

#### Scenario: Workspace drift blocks acceptance

- **WHEN** a target, selector match, current YAML value, Markdown section body,
  or evidence reference changed after proposal creation
- **THEN** `decide accept` SHALL apply no patch
- **AND** it SHALL report a domain conflict requiring proposal revision

### Requirement: Contract Changes Are Case Actions

A pending contract change SHALL be a discoverable case action with target
contracts, semantic delta, evidence, lifecycle state and affected obligation
scope.

#### Scenario: High-impact semantic delta is detected

- **WHEN** a producer or verifier finds that scope, claims, structure, source
  policy or workflow semantics must change
- **THEN** it SHALL create or link a contract-change proposal intent
- **AND** obligations that depend on the old contract SHALL become scoped
  blockers until the change is decided

#### Scenario: Ordinary artifact refinement occurs

- **WHEN** work changes wording or evidence organization without changing a
  stable contract
- **THEN** ResearchSpec SHALL NOT require a contract change

### Requirement: Contract Change Lifecycle Is Explicit

Proposal, decision, revalidation and application SHALL be distinct
receipt-backed states. Application SHALL revalidate current targets and
evidence before modifying current contracts.

#### Scenario: Accepted change target has drifted

- **WHEN** an accepted change no longer matches its target hashes
- **THEN** application SHALL stop with a stale or revalidation-required state
- **AND** it SHALL NOT partially apply the change

### Requirement: Patch And Contract Change Lifecycles Remain Distinct

A draft patch SHALL modify a base artifact, while a contract change SHALL
modify stable research contracts. A patch that carries a high-impact semantic
delta SHALL link the required contract change rather than bypassing it.

#### Scenario: Patch depends on unresolved contract change

- **WHEN** an accepted patch would assert semantics not yet accepted in current
  contracts
- **THEN** patch application SHALL remain blocked on the linked change
- **AND** unrelated patch or artifact work MAY continue
