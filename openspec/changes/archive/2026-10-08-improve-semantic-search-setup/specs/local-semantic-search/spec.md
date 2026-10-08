## MODIFIED Requirements

### Requirement: Diagnostics And Dry Runs Remain Non-Executing

Status, check, ordinary doctor and search-cache inspection SHALL inspect optional search resources statically without inference, network access or writes. Only explicitly confirmed `doctor search-cache --clear` SHALL delete managed user-cache resources. Dry-run bootstrap and cache clearing SHALL disclose planned operations without writes or model execution. Missing optional resources SHALL be non-blocking diagnostics.

#### Scenario: Hybrid resources are missing
- **WHEN** doctor inspects a hybrid workspace without usable resources
- **THEN** it reports the unavailable local retrieval state without loading or repairing the model

#### Scenario: Bootstrap is a dry run
- **WHEN** hybrid bootstrap uses `--dry-run`
- **THEN** it reports the selection and planned preparation while leaving workspace and cache unchanged

#### Scenario: Cache clearing is a dry run
- **WHEN** search-cache clearing uses `--dry-run`
- **THEN** it reports deletion candidates without confirmation, deletion, lock creation or directory creation

## ADDED Requirements

### Requirement: Setup Disclosures And Progress Are Readable

Interactive fresh init SHALL separate a short confirmation from multiline disclosures of local discovery, model download size, extra runtime space and shared cache location. Preparation SHALL expose real download progress, index progress, preparation stages and resource reuse. Machine and quiet output SHALL suppress progress rendering.

#### Scenario: Setup is offered
- **WHEN** fresh interactive init reaches search selection
- **THEN** it displays readable disclosures before one short affirmative confirmation
- **AND** it explains that valid resources are shared across projects and queries stay local

#### Scenario: Resources are prepared
- **WHEN** selected semantic resources require installation, download or index preparation
- **THEN** human output identifies the current phase and reports actual download bytes and index work completed
- **AND** reuse, completion and failure terminate the progress display correctly

#### Scenario: Resources are reused
- **WHEN** another project prepares matching runtime, model and catalog resources
- **THEN** it reports reuse without installing or downloading again
- **AND** a changed catalog can rebuild its index while reusing the runtime and model

### Requirement: Interactive Setup Failures Offer Recovery

Interactive preparation failure SHALL show a stable reason and readable detail, then offer explicit retry or temporary offline continuation, defaulting to offline. Each retry SHALL receive a fresh ten-minute budget and reuse successfully published resources. Offline continuation SHALL retain hybrid preference and successful workspace initialization. Non-interactive failures SHALL NOT prompt or automatically retry.

#### Scenario: User retries setup
- **WHEN** interactive preparation fails and the user chooses retry
- **THEN** preparation runs again with a new budget and reports its outcome

#### Scenario: User continues offline
- **WHEN** a user chooses temporary offline continuation after one or more failures
- **THEN** initialization or update succeeds with hybrid preference retained and an explicit offline fallback
- **AND** output provides the explicit update command for later preparation

#### Scenario: Automated setup fails
- **WHEN** preparation fails without interactive input or with machine output
- **THEN** one preparation attempt returns structured failure information and usable offline discovery

### Requirement: Shared Cache Deletion Is Bounded

Clearing SHALL remove all recognized managed runtime, model, index and staging entries across versions, retaining the cache root and unknown files. It SHALL NOT follow deletion paths through symlinks or mutate project files. Preparation and clearing SHALL serialize cache mutations across processes. A live owner SHALL block competing mutation; an exited owner SHALL permit recovery. Deletion failures SHALL identify unfinished paths.

#### Scenario: Managed cache is cleared
- **WHEN** the user confirms clearing a cache containing current and older managed entries
- **THEN** all recognized entries are deleted and unknown files remain
- **AND** every sharing project retains its configuration and can fall back to offline retrieval

#### Scenario: Preparation is active
- **WHEN** another process owns active cache preparation
- **THEN** clearing reports a busy cache without deleting any resource

#### Scenario: A cache writer exited
- **WHEN** a mutation lock belongs to a process that has exited
- **THEN** a later explicit mutation can recover ownership safely

#### Scenario: A deletion path is unsafe
- **WHEN** a deletion candidate crosses a symlink or escapes the cache root
- **THEN** clearing refuses that operation without deleting the linked or external data

#### Scenario: Deletion cannot finish
- **WHEN** a managed path cannot be removed
- **THEN** the result identifies failed and completed paths and does not claim complete success
