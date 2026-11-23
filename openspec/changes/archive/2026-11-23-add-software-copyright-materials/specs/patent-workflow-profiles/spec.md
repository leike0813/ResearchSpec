# Patent Workflow Profiles

## ADDED Requirements

### Requirement: Optional Preparation and Built-in Patent Evidence

The Intellectual property materials domain SHALL deliver patent disclosure, patent application, patent docket, and research-to-patent with their exclusive Procedures. Patent search, patent intelligence, and patent-informed paper SHALL remain available without the domain. Patent disclosure and patent intelligence SHALL reuse the same search Procedure.

#### Scenario: Patent preparation is requested before installation

- **WHEN** a user requests patent materials or the research-to-patent workflow in a workspace without the domain
- **THEN** Navigate SHALL discover its Procedure metadata and offer an explicit domain installation preview
- **AND** standalone activation and graph start SHALL require domain selection before procedure or profile activation

#### Scenario: A paper needs patent evidence

- **WHEN** the workspace has no Intellectual property materials installation
- **THEN** patent-informed paper SHALL still be able to compose patent intelligence and academic evidence into its existing writing child

#### Scenario: An existing patent run resumes after the delivery change

- **WHEN** a user installs the domain in a workspace with a supported frozen patent preparation run
- **THEN** the same run and its existing outputs SHALL remain available and child starts SHALL resolve the same profile IDs and versions
