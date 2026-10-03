## Purpose

Provide bounded, optional material facts for standalone Procedure inputs and deliverables while preserving ordinary research as stateless, open-world Agent work.

## ADDED Requirements

### Requirement: Explicit Optional Material Bindings

Standalone instructions SHALL accept an optional YAML/JSON payload with optional inputs and outputs arrays. Inputs SHALL contain a role with either a project-relative ordinary file path or an inline value; outputs SHALL contain a role and ordinary file path. Omitted arrays SHALL remain uninspected, and explicit empty arrays SHALL be inspected for declared missing roles.

#### Scenario: Inline material is supplied
- **WHEN** instructions receive an inline input and a planned output path
- **THEN** the packet carries that explicit context without requiring a material file or checking that a planned output already exists

#### Scenario: No material payload is supplied
- **WHEN** a caller requests standalone instructions without a payload
- **THEN** activation remains available without a material-check prerequisite

### Requirement: Material Inspection Reports Facts Without Permission

Material inspection SHALL report declared missing, duplicate and undeclared roles, path safety, file kind and readability. Findings SHALL be non-blocking by default, and strict checking SHALL affect only the requested check's exit result. Inspection SHALL NOT certify semantic adequacy, authorize execution or create standalone workflow state.

#### Scenario: Required material is absent
- **WHEN** explicit inputs omit a declared required role
- **THEN** inspection identifies that role and preserves the ability to load standalone instructions

#### Scenario: No manifest declares roles
- **WHEN** the Procedure has no input/output manifest
- **THEN** inspection reports that the declaration scope is unknown and still inspects explicitly supplied paths

### Requirement: Inspection Is Bounded And Static

Inspection SHALL inspect only explicit bindings and reuse existing project path protections. It SHALL NOT traverse directory contents, hash or lifecycle-manage deliverables, execute validators or tools, contact services, or write project files. Output inspection SHALL verify actual returned files; activation SHALL treat output bindings as planned locations.

#### Scenario: Unsafe or missing output is returned
- **WHEN** an explicit output escapes the project, contains a symlink, or is absent
- **THEN** inspection reports the affected role/path without reading outside the safe project scope or writing state

