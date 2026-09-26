## Purpose

Define how Navigate turns a natural research request into the right capability and how one capability's output reaches the next, using the existing offline catalog and declared procedure inputs and outputs rather than a new search engine, index, or orchestration layer, and how a completed standalone result is reported to the user.

## ADDED Requirements

### Requirement: Intent Discovery Over The Existing Catalog

Navigate SHALL translate a natural research request, including one written in Chinese, into short catalog search terms and use the existing procedure discovery command. It SHALL retry once with different terms when the first search yields no suitable candidate, and SHALL use host-native capabilities only after that retry finds nothing.

#### Scenario: Natural request finds a capability

- **WHEN** the user describes a research task without naming a procedure
- **THEN** Navigate searches the compact catalog with short terms and inspects at most a few candidate cards before selecting one

#### Scenario: First search misses

- **WHEN** the first term set returns no suitable candidate
- **THEN** Navigate retries once with different terms before deciding that no procedure fits

#### Scenario: Second search misses

- **WHEN** both searches return no suitable procedure
- **THEN** Navigate continues with host-native capabilities and states that the work is outside a governed ResearchSpec run

#### Scenario: Existing unfinished run takes precedence

- **WHEN** a relevant unfinished confirmed run already exists in the workspace
- **THEN** Navigate reads its current instructions instead of using a standalone chain to bypass its pending controls

#### Scenario: Completed run does not hijack a new request

- **WHEN** a relevant run is already complete and the user starts a new independent task
- **THEN** Navigate handles the new request on its own terms and does not resume or reopen the completed run

### Requirement: Capability Chaining Through Declared Contracts

When a request needs more than one capability, Navigate SHALL chain standalone procedures by passing the first procedure's declared output path as the next procedure's declared input path. It SHALL use only declared inputs and outputs, SHALL pass explicit ordinary project-relative paths outside `researchspec/`, and SHALL NOT create hidden activation state, a run, or a handoff for standalone chaining.

#### Scenario: Two capabilities compose

- **WHEN** the second capability needs the first capability's declared output
- **THEN** Navigate passes that path explicitly and activates the second procedure with it

#### Scenario: Links are not declared

- **WHEN** two candidate procedures have no declared output-to-input connection
- **THEN** Navigate does not imply one and instead reports the missing link or asks one focused question

#### Scenario: Required input is absent

- **WHEN** a selected procedure declares a required input the project does not provide
- **THEN** Navigate asks one focused question for it rather than inventing or substituting material

### Requirement: Unified Standalone Result Report

Completing standalone capability work SHALL return one result report naming the produced file paths, the evidence and its limits, anything unresolved, and the next step, with internal mode names, selectors, and procedure identifiers shown only when the user must act on them. ResearchSpec SHALL NOT present a standalone result as a completed run, node, Gate, or Decision.

#### Scenario: Capability completes

- **WHEN** a standalone procedure finishes
- **THEN** Navigate reports the produced paths, the evidence with its limitations, unresolved items, and the next step

#### Scenario: Result reaches a formal control

- **WHEN** the produced finding is relevant to a formal Gate
- **THEN** Navigate reports it as working evidence and does not claim that the Gate was completed or confirmed

#### Scenario: User must act on an internal detail

- **WHEN** the next step needs a selector, consent, or material from the user
- **THEN** the report names the exact selector or option required

### Requirement: Bounded Optional Plugin Assistance

When a selected capability could benefit from domain assistance, Navigate SHALL suggest at most three domains in one batch, preview the exact install, and request consent separate from run confirmation. Declining, failing, or leaving the domain unselected SHALL leave the selected capability, selector, and frontier unchanged.

#### Scenario: Assistance is suggested

- **WHEN** the selected capability has a matching optional domain
- **THEN** Navigate suggests a bounded set with an exact preview and keeps plugin consent separate

#### Scenario: Assistance is declined

- **WHEN** the user declines or the install fails
- **THEN** the original capability and route continue unchanged
