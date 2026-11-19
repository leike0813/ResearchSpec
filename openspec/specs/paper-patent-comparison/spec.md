# Paper–Patent Comparison Specification

## Purpose

Enable researchers to compare a supplied paper and patent in both directions and inspect the evidence for each technical finding in a standalone report.

## Requirements

### Requirement: Standalone comparison is independently discoverable

Navigate SHALL expose `analysis-paper-patent-comparison` as a fixed standalone Procedure that accepts a paper and patent directly and produces an ordinary-file technical report.

#### Scenario: A user supplies two documents
- **WHEN** the user asks how a paper and patent differ and supplies their files
- **THEN** the comparison Procedure can be discovered and activated directly without a graph run, precomputed claim features or a disclosure bundle.

#### Scenario: One source is missing
- **WHEN** one document cannot be accessed
- **THEN** the Procedure identifies the missing source and limits any findings to material actually inspected.

### Requirement: The report covers each side and separates chronology

The report SHALL distinguish equivalent or renamed features, differences in technical breadth with an identified direction, and features located on only one side. Findings SHALL cite the available locations on each side and distinguish unavailable material from a searched passage with no counterpart. The report SHALL separate dated events from technical similarity.

#### Scenario: Each source contains additional material
- **WHEN** the patent adds a processing step and the paper alone describes a separate calibration
- **THEN** the report includes both findings with their respective source locations and identifies which document supports each finding.

#### Scenario: Dates and terminology differ
- **WHEN** two sources describe a similar mechanism with different terms and only the patent filing date is known
- **THEN** the report explains the match using both locations and records the filing date and missing paper date separately, without inferring priority or inventorship.
