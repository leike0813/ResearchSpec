# Patent Fixed Capabilities Specification

## Purpose

Provide reusable patent research and document-production stages that preserve the nine upstream business capabilities and exchange ordinary, evidence-bound project files through ResearchSpec.

## Requirements

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

### Requirement: Paper-backed claims retain feature-level source support

When a paper is the principal disclosure, the case, disclosure and application files SHALL carry a record linking each substantive claim limitation to a retrievable source location. It SHALL distinguish observations, interpretations and unresolved questions. Formal claims SHALL include only supported limitations. Review SHALL report original support separately from application consistency.

#### Scenario: Experimental detail is generalized in drafting
- **WHEN** the paper reports one tested value and the proposed claim introduces a range
- **THEN** the review identifies the tested value and its location, flags the proposed range as unresolved and routes it for clarification before its inclusion in a formal claim.

#### Scenario: A revised claim uses supplementary evidence
- **WHEN** a revision adds a limitation supported by a supplied supplement
- **THEN** the revised record links the limitation to that supplement and its location and preserves the earlier delivery for review.

#### Scenario: Source is unavailable during review
- **WHEN** a reviewer can read the disclosure but cannot resolve a cited paper location
- **THEN** the review identifies the affected limitation and missing evidence, reports available consistency findings and leaves original support unverified.

#### Scenario: Existing disclosure is supplied independently
- **WHEN** an ordinary application task begins with an existing disclosure and no paper is identified as its principal source
- **THEN** the Procedure accepts the existing disclosure bundle without requiring a paper attachment.

#### Scenario: A disclosure cites a background paper
- **WHEN** the disclosure identifies its own technical solution and cites a paper only as background
- **THEN** drafting and review proceed without requesting a feature record for that paper or running a paper–patent comparison.
