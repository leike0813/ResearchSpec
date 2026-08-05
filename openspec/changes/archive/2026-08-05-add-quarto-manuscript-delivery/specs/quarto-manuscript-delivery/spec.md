## ADDED Requirements

### Requirement: The host exposes a read-only Quarto probe
The host adapter SHALL execute only `quarto --version` when an explicit writing or formatting operation requests a probe, and SHALL return exactly one of `available`, `unavailable`, or `unknown` with structured version, error, and timeout details as applicable.

#### Scenario: Quarto is available
- **WHEN** the probe exits successfully with a version line
- **THEN** the result status is `available` and includes the reported version without writing workspace files

#### Scenario: Quarto is missing
- **WHEN** the executable cannot be found
- **THEN** the result status is `unavailable` and no installation or fallback renderer is attempted

#### Scenario: Probe times out or errors
- **WHEN** the command exceeds its bounded timeout or exits with an unexpected error
- **THEN** the result status is `unknown` with a diagnostic and no workspace mutation

### Requirement: A QMD formatting child renders one external source atomically
The converter-owned helper SHALL accept one project-external `.qmd` source and one target Quarto format ID, default to no code execution, stage output before delivery, reject an existing destination by default, and publish the destination only after the expected output and all checks succeed.

#### Scenario: No-execute render succeeds
- **WHEN** Quarto is available and the helper receives a valid QMD source, target format ID, and absent destination
- **THEN** Quarto renders in a staging directory with no-execute enabled and the completed output is atomically moved to the confirmed destination

#### Scenario: Execution requires independent consent
- **WHEN** the caller requests code execution without a render consent naming a confirmer and timestamp for the current formatting subflow
- **THEN** rendering fails before invoking Quarto

#### Scenario: Failure preserves existing files
- **WHEN** Quarto is unavailable, times out, fails, omits the expected output, or a target check fails
- **THEN** no existing destination is overwritten and the formatting handoff is not updated as successful

#### Scenario: Existing destination is protected
- **WHEN** the confirmed destination already exists and no explicit overwrite option is supplied
- **THEN** the helper fails with a structured destination-conflict result and leaves the file unchanged

### Requirement: Formatting metadata is boundary data
The formatting child SHALL describe the QMD source and rendered output as ordinary external handoff deliverables, including source/target format metadata, `renderer: quarto`, and the target format ID; `pack` SHALL continue to exclude both files.

#### Scenario: Final integrity receives both deliverables
- **WHEN** a formatting child completes
- **THEN** its handoff contains the QMD source role and rendered output role, and the downstream final-integrity instructions identify both paths
