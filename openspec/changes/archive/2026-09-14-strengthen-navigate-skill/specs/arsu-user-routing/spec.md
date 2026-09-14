## MODIFIED Requirements

### Requirement: Dialogue Starts Academic Work

User-Agent dialogue SHALL choose between standalone and graph activation by required lifecycle guarantees. Bounded one-shot work SHALL prefer standalone procedures; persistence, resume, formal Gates or Decisions, parallel joins, or audit state SHALL require a graph route. Navigate SHALL use its generated ARSU route reference when intent is vague or crosses capabilities.

#### Scenario: User asks for bounded work
- **WHEN** the request can be completed through ordinary files without workflow state
- **THEN** Navigate searches procedures and may activate one directly

#### Scenario: Bootstrap does not start work
- **WHEN** `researchspec init` completes
- **THEN** it prepares the workspace without activating a procedure or starting a run

#### Scenario: Vague goal enters Navigate
- **WHEN** the user provides a vague academic goal
- **THEN** Navigate loads its ARSU route reference, discovers candidate procedures, and chooses standalone or graph mode from lifecycle needs

#### Scenario: Expert request names a capability
- **WHEN** the user explicitly names a procedure or capability
- **THEN** Navigate validates its activation eligibility before returning instructions

#### Scenario: User asks for governed work
- **WHEN** the request needs a graph-owned lifecycle feature
- **THEN** Navigate reads status and graph instructions before requesting any mutation

### Requirement: Natural-Language CLI Discovery Loads Navigate References

Natural-language routing SHALL start with compact procedure and command discovery. Navigate SHALL load its local CLI handbook only when detailed command or payload guidance is needed and its local ARSU route catalog when semantic route comparison is needed.

#### Scenario: Compact discovery is sufficient
- **WHEN** candidate cards and selected procedure metadata resolve the user's intent
- **THEN** Navigate proceeds without loading either reference body

#### Scenario: Payload detail is needed
- **WHEN** a graph or governance payload cannot be constructed from compact metadata
- **THEN** Navigate reads `references/cli-handbook.md` before acting

#### Scenario: User asks for a CLI operation manual
- **WHEN** the user explicitly requests full CLI usage guidance
- **THEN** Navigate answers from its generated CLI handbook reference

#### Scenario: CLI discovery becomes a runtime action question
- **WHEN** static help leads to a requested workflow mutation
- **THEN** Navigate returns to status and graph instructions before acting

## RENAMED Requirements

- FROM: `### Requirement: Natural-Language CLI Discovery Loads The Handbook Companion`
- TO: `### Requirement: Natural-Language CLI Discovery Loads Navigate References`
