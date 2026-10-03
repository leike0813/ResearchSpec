## Purpose

Provide explicitly selected local multilingual semantic assistance for Procedure discovery while retaining a usable offline baseline and read-only query behavior.

## ADDED Requirements

### Requirement: Optional Runtime Installation Requires Explicit Selection

Init and update SHALL accept `--procedure-search offline|hybrid`. Interactive fresh init SHALL recommend hybrid and disclose download size and user-cache location before confirmation. Non-interactive omission and `--yes` alone SHALL NOT authorize installation. Existing selection SHALL be preserved on ordinary update. Only confirmed or explicit hybrid selection SHALL prepare runtime resources.

#### Scenario: User selects hybrid
- **WHEN** a user confirms hybrid during init or supplies an explicit hybrid option
- **THEN** bootstrap prepares locked CPU dependencies, pinned multilingual model files and catalog vectors in a shared user cache
- **AND** project configuration stores only the chosen retrieval mode

#### Scenario: Installation fails
- **WHEN** optional installation, download or self-test fails within the ten-minute preparation deadline
- **THEN** workspace initialization succeeds with the selection retained and an explicit offline fallback diagnostic

#### Scenario: Non-interactive installation is omitted
- **WHEN** fresh init omits the retrieval option, including with `--yes`
- **THEN** it selects offline without network requests or runtime installation

#### Scenario: Existing selection is refreshed
- **WHEN** ordinary update omits the retrieval option
- **THEN** it preserves selection without preparing runtime resources

### Requirement: Semantic Queries Are Bounded And Local

Hybrid search SHALL fuse offline and local semantic candidates from public catalog metadata. Queries SHALL NOT persist requests, contact services, install dependencies, modify workspace files or repair caches. Runtime failure, missing or stale resources, and a ten-second semantic deadline SHALL produce offline results with a structured fallback reason.

#### Scenario: Local resources are ready
- **WHEN** a hybrid query finds prepared resources matching the current catalog and model
- **THEN** it uses local embeddings and lexical rank fusion
- **AND** no semantic score is represented as a probability of applicability

#### Scenario: Query cannot use local inference
- **WHEN** local inference fails, resources are unavailable or stale, or the semantic deadline expires
- **THEN** the process is terminated if needed and offline candidates return with the reason

### Requirement: Diagnostics And Dry Runs Remain Non-Executing

Status, check and doctor SHALL inspect optional search resources statically without inference, network access or writes. Dry-run bootstrap SHALL disclose planned preparation without installing, downloading or running a model. Missing optional resources SHALL be non-blocking diagnostics.

#### Scenario: Hybrid resources are missing
- **WHEN** doctor inspects a hybrid workspace without usable resources
- **THEN** it reports the unavailable local retrieval state without loading or repairing the model

#### Scenario: Bootstrap is a dry run
- **WHEN** hybrid bootstrap uses `--dry-run`
- **THEN** it reports the selection and planned preparation while leaving workspace and cache unchanged
