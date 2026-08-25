## Purpose

Define the strict, converter-owned routing catalog that describes the four ARSU
Skills, their supported operational modes and pipeline entry routes, and the
derived Skill and command-wrapper descriptions.

## Requirements

### Requirement: Typed ARSU Routing Catalog
ResearchSpec SHALL define one strict converter-owned routing catalog for the four ARSU Skills and their supported routes.

#### Scenario: Catalog covers the locked route set
- **WHEN** the canonical catalog is validated
- **THEN** it SHALL contain `deep-research`, `academic-paper`, `academic-paper-reviewer`, and `academic-pipeline` exactly once
- **AND** it SHALL contain 25 operational mode routes and two pipeline entry routes

#### Scenario: Pipeline entries remain distinct from modes
- **WHEN** `academic-pipeline:end-to-end` or `academic-pipeline:mid-entry` is read
- **THEN** its route kind SHALL be `entry` and its mode ID SHALL be null
- **AND** every operational mode route SHALL have route kind `mode` and a matching non-null mode ID

### Requirement: Structured Route Facts
Every route SHALL provide intents, primary artifact types, prerequisite groups, risk, route-level Gate policy, and coarse cost metadata.

#### Scenario: Prerequisites express alternatives and fallback
- **WHEN** a route accepts alternative material forms
- **THEN** its prerequisites SHALL represent them through typed `all_of` or `any_of` groups
- **AND** missing-material recovery MAY reference a known fallback route

#### Scenario: Gate policy does not invent runtime Gates
- **WHEN** a route declares conditional, required, or profile-defined Gate policy
- **THEN** it SHALL use semantic Gate kinds for routing and profile design
- **AND** it SHALL NOT create a runtime Gate ID, verdict, or completion record

### Requirement: Catalog Reference Integrity
ResearchSpec SHALL reject structurally invalid or internally inconsistent routing catalogs.

#### Scenario: Invalid catalog is blocked
- **WHEN** the catalog contains extra fields, missing or duplicate Skills, duplicate routes, inconsistent route prefixes or modes, empty prerequisite groups, unsafe IDs, unknown refs, fallback cycles, or invalid Gate policy
- **THEN** validation SHALL fail with stable issue codes

### Requirement: Catalog-Owned Description Projection
ResearchSpec SHALL derive ARSU Skill and command wrapper descriptions from the canonical routing catalog.

#### Scenario: Skill frontmatter uses the catalog
- **WHEN** ARSU output is converted
- **THEN** each generated `SKILL.md` description SHALL be derived from its catalog summary, routes, intents, near-misses, and route-confirmation discipline
- **AND** non-description frontmatter metadata and Skill body semantics SHALL be preserved

#### Scenario: Command wrapper uses the same facts
- **WHEN** an ARSU command wrapper is rendered
- **THEN** its concise description SHALL be derived from the same catalog Skill summary and route set
- **AND** wrapper body, family, tags, path, and tool-specific format SHALL remain unchanged

### Requirement: Catalog-Owned Navigate Projection

ResearchSpec SHALL derive Navigate route guidance from the canonical routing catalog without creating another route registry.

#### Scenario: Navigate presents catalog facts

- **WHEN** `researchspec-navigate` is rendered
- **THEN** its Route branch SHALL contain deterministic projections of route IDs, intents, near misses, primary artifacts, prerequisite groups, risk, Gate policy, and coarse cost
- **AND** current availability SHALL remain sourced from CLI status and scoped graph selectors

#### Scenario: Catalog changes update Navigate deterministically

- **WHEN** a canonical routing fact changes
- **THEN** the rendered Navigate content and adapter validation SHALL reflect that change from the same catalog source
- **AND** no handwritten Companion route table SHALL require a parallel edit

### Requirement: Annotation Feedback Routing

The ARSU routing catalog SHALL recognize a registered `annotation_set` as review
feedback for revision-coach, revision, re-review, and pipeline mid-entry
selection.

#### Scenario: User arrives with manuscript annotations

- **WHEN** a user requests work on registered annotations against a registered
  draft
- **THEN** Navigate SHALL present the existing revision or pipeline route with
  the Annotation Set as a prerequisite
- **AND** it SHALL not invent a new ARSU Skill, mode, or Companion

#### Scenario: Re-review has a resolution report

- **WHEN** an `annotation_resolution_report` exists after revision
- **THEN** re-review MAY consume it as supplementary feedback evidence
- **AND** a full peer review SHALL remain independent unless the selected route
  explicitly requires it
