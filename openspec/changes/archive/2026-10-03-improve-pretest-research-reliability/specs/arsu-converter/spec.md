## ADDED Requirements

### Requirement: ARSU Conversion Owns Its Complete Profile Projection

The ARSU converter SHALL own preset profile files, their shared registry and corresponding conversion-manifest entries as one generated output. Other vendor maintenance paths SHALL inspect these files rather than directly emit partial ARSU output.

#### Scenario: Fixed patent profiles are distributed
- **WHEN** ARSU conversion generates the preset profiles
- **THEN** all patent and academic profile entries and hashes agree with the complete conversion manifest

