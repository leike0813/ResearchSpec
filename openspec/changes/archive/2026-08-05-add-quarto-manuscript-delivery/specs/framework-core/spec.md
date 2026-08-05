## MODIFIED Requirements

### Requirement: Manuscript specs are structured and independently valid
The system SHALL parse `specs/manuscript.yaml` as schema `1` with stable manuscript metadata, venue/layout `format_requirements`, outline sections, and a delivery contract containing `working_format: markdown | qmd | null` and `final_output_format: safe Quarto format ID | null`. `format_requirements` SHALL remain independent from format selection. A QMD selection SHALL require a `.qmd` source in manuscript handoffs and a safe non-empty Quarto format ID before final delivery.

#### Scenario: Empty format selection is valid during intake
- **WHEN** both delivery fields are null
- **THEN** the manuscript spec parses successfully and writing intake may ask the user to choose a source format

#### Scenario: Markdown selection is valid
- **WHEN** `working_format` is `markdown` and `final_output_format` is null or a safe target ID
- **THEN** the manuscript spec parses successfully without requiring Quarto metadata

#### Scenario: QMD selection requires a safe target
- **WHEN** `working_format` is `qmd` and `final_output_format` is missing, empty, or contains unsafe path/shell characters
- **THEN** validation fails with a structured format-contract diagnostic
