# Patent Fixed Capabilities

## Purpose

Provide reusable patent research and document-production stages that preserve the nine upstream business capabilities and exchange ordinary, evidence-bound project files through ResearchSpec.

## ADDED Requirements

### Requirement: Nine Patent Businesses Are Fixed Procedures

ResearchSpec SHALL distribute reviewed vendor-derived fixed stages for disclosure, application, docket collaboration, search, reading, claim charts, maps, office-action response and examination policy. Disclosure SHALL include invention, utility-model, design and protection-layout work. Discovery SHALL use the existing Procedure catalog and Navigate entry.

#### Scenario: Natural patent work is discovered
- **WHEN** a user requests a disclosure or patent interpretation
- **THEN** suitable fixed Procedures are discoverable without plugin installation or a separate host Skill

### Requirement: Patent Deliverables Use Ordinary File Indexes

Case materials, corpus collections and multi-file deliverables SHALL be exchanged as ordinary-file indexes with actual resource paths and evidence limitations. Files SHALL live outside researchspec/. Versioned revisions SHALL preserve supplied documents. Indexes SHALL NOT own run, node, Gate or Decision state.

#### Scenario: Application consumes a disclosure suite
- **WHEN** an application stage receives a disclosure bundle index
- **THEN** it resolves the disclosure, figures and applicable schemas and reports missing materials before generating claims

### Requirement: Reviewed Tools Preserve Rich Delivery

The packages SHALL preserve reviewed Word, Excel, figure/CAD, extraction, library and map mechanisms, with explicit commands, dependencies and read conditions. Interpreters, models, services and optional Obsidian SHALL be user-configured. Static ResearchSpec commands SHALL NOT execute tools, install dependencies or discover credentials.

#### Scenario: Rendering dependency is unavailable
- **WHEN** document or figure generation cannot use its configured dependency
- **THEN** the stage retains usable drafts and identifies the unavailable delivery without claiming a rendered result

### Requirement: Patent Evidence Retains Its Category

Reading, comparison, novelty assessment and research integration SHALL retain identifiers, source locations, technical observations, interpretations and evidence limits. Patent disclosure SHALL NOT be represented as empirical validation or a formal legal verdict. Stable research commitments SHALL continue to use the existing change lifecycle.

#### Scenario: Patent evidence feeds a manuscript
- **WHEN** the research bridge builds a bibliography and synthesis from patent notes and academic materials
- **THEN** patent-derived statements remain distinguishable from empirical findings and preserve their citation locations
