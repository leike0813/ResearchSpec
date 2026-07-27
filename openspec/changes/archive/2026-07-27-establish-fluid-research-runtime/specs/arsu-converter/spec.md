## MODIFIED Requirements

### Requirement: Generated Zotero Literature Protocol

ResearchSpec SHALL inject one converter-owned Adapter-native literature protocol
into Deep Research and compatible generated ARSU producers through the shared
contract preflight. The protocol SHALL use the fixed Zotero task Skills as
provider operations and SHALL keep ARSU responsible for academic selection,
verification, coverage and durable artifacts.

#### Scenario: Producer handles ordinary literature work

- **WHEN** a generated producer needs literature and the Adapter is ready
- **THEN** it SHALL query the current Zotero corpus before external gap
  supplementation
- **AND** it SHALL use Acquisition for gap-aware external discovery and live
  duplicate checks

#### Scenario: Deeper source evidence is required

- **WHEN** accepted sources need full text, locators, notes, annotations or
  bounded cross-source context
- **THEN** the producer SHALL preferentially invoke the Analysis or Synthesis
  task Skill that matches the evidence goal
- **AND** it SHALL NOT invoke every Adapter task mechanically

#### Scenario: Query returns no items

- **WHEN** a bounded Zotero query returns an empty result
- **THEN** the generated guidance SHALL prohibit treating that result as proof
  that relevant literature does not exist

#### Scenario: Ordinary adapter use fails

- **WHEN** an ordinary literature task cannot use the Adapter
- **THEN** the producer SHALL use a bounded external or user-supplied fallback
  and disclose the coverage limitation

#### Scenario: Task depends on private Zotero state

- **WHEN** a task explicitly requires a current selection, private collection,
  private metadata, private attachments, library-only or offline behavior and
  the Adapter is unavailable
- **THEN** the producer SHALL pause for readiness or alternative user input
- **AND** it SHALL NOT substitute public search as if it were the private
  library

#### Scenario: Adapter output reaches workflow boundaries

- **WHEN** Adapter-derived material is ready for ResearchSpec use
- **THEN** the producer SHALL consume a provider-neutral handoff as working
  evidence
- **AND** only the active producer and CLI SHALL create accepted artifacts or
  perform workflow authority writes

#### Scenario: Managed-library acquisition is authorized

- **WHEN** the user has granted the current run a bounded collection and
  acquisition-effect authorization
- **THEN** the producer MAY import only screened and accepted items and prepare
  permitted attachments
- **AND** Curation, metadata maintenance, tagging, merging and deletion SHALL
  require a separate request

## ADDED Requirements

### Requirement: Generated Adaptive Runtime Preflight

Generated ARSU and Companion entrypoints SHALL consume bounded status and action
descriptors, treat CLI obligations and formal policies as hard authority, and
keep their internal phase ordering as a soft playbook unless the selected
strict profile declares otherwise.

#### Scenario: Generated producer resumes adaptive work

- **WHEN** a producer resumes an adaptive run
- **THEN** it SHALL inspect unsatisfied obligations and allowed actions
- **AND** it SHALL NOT reconstruct a unique workflow frontier from prose or
  maintain an independent stage truth

### Requirement: Generated Revision Emits Canonical Patch

Academic Paper revision guidance SHALL emit the canonical pending patch input
expected by `submit patch:<selector>`.

#### Scenario: Revision reaches a durable boundary

- **WHEN** a generated revision producer has a base-bound text modification
- **THEN** it SHALL submit one canonical patch
- **AND** it SHALL NOT also register an ordinary `revision_patch` artifact for
  the same modification

