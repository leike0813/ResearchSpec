## Why

ARS v3.24.4 introduces protocol-driven screening between evidence retrieval and manuscript writing. The current annotated-bibliography contract cannot represent independent ballots, adjudication, or report-level exclusion evidence.

## What Changes

- Absorb the upstream delta from v3.22.2 through v3.24.4 and preserve provenance for changed extracts.
- Expose eight sr-screener modes through the existing Navigate route catalog and hidden Procedures.
- Provide graph-owned confirmation and independent review, with task-local screening data and reproducible exports.

## Capabilities

### New Capabilities

- `systematic-review-screening` covers protocol confirmation, independent ballots, pilot calibration, exclusion checks and traceable selection outputs.

### Modified Capabilities

- `arsu-routing-catalog` adds the fifth ARSU Skill and its eight operational modes to the converter-owned route set.

## Impact

Routing catalog, ARS converter and extraction sources, capability packages, preset graph profiles and maintainer audits.
