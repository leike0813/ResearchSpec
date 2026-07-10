## MODIFIED Requirements

### Requirement: Canonical Nine-Workflow Manifest

ResearchSpec SHALL define exactly nine companion workflows named `researchspec-explore`, `researchspec-propose`, `researchspec-check`, `researchspec-verify`, `researchspec-next`, `researchspec-context`, `researchspec-decide`, `researchspec-submit`, and `researchspec-archive` in one typed manifest.

#### Scenario: Manifest is the only companion registry

- **WHEN** companion skills or command wrappers are projected
- **THEN** all nine unique IDs SHALL come from the same typed manifest
- **AND** every entry SHALL provide companion-specific description, category, tags, installed skill ID, and canonical workflow content
- **AND** the four ARSU intents SHALL remain a separate family

## RENAMED Requirements

- FROM: `### Requirement: Canonical Eight-Workflow Manifest`
- TO: `### Requirement: Canonical Nine-Workflow Manifest`

## ADDED Requirements

### Requirement: Submit Workflow

`researchspec-submit` SHALL preview, confirm, execute, and verify one workflow-owned artifact submission without modifying the candidate or expanding runtime authority.

#### Scenario: Submit uses preview-confirm-execute

- **GIVEN** status and instructions identify a ready work item with an unregistered candidate
- **WHEN** the user asks to submit it
- **THEN** the skill SHALL run dry-run, present candidate hash, validation, receipt/registry writes, and excluded state/Gate/Decision effects
- **AND** it SHALL obtain explicit confirmation before executing the identical input with expected hash and `--yes`
- **AND** it SHALL finish with status and artifact checks

#### Scenario: Validation failure returns to producer

- **WHEN** candidate validation, dependency coverage, or workflow readiness fails
- **THEN** the skill SHALL report the structured reason and route content repair to the producer Skill
- **AND** it SHALL NOT edit candidate, registry, receipt, state, or ledgers directly

### Requirement: Next Routes Candidate Submission

`researchspec-next` SHALL distinguish work that needs semantic production from a produced candidate that needs deterministic submission.

#### Scenario: Unregistered candidate routes to Submit

- **WHEN** a ready work item reports `candidate_unregistered`
- **THEN** Next SHALL recommend `researchspec-submit work:<id>` before recommending downstream semantic work
- **AND** a ready item without a candidate SHALL continue to route to its producer Skill
