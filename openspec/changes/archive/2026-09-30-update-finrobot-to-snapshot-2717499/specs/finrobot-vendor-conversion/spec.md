## ADDED Requirements

### Requirement: Incremental previews SHALL remain isolated from production
Maintainer preview SHALL produce six complete candidate trees, a tree-set hash and a review report marked pending-human-review. Candidate source, policies and authored bytes SHALL be validated independently. Default production checks SHALL continue validating the exact published source and tree until human approval of the displayed current candidate hash. Preview SHALL not update production pin, catalogs, packages, registries or workflow state.

#### Scenario: A pending candidate differs from published trees
- **WHEN** preview assembles a changed candidate
- **THEN** all candidate bytes and hashes are available for review
- **AND** the existing production output remains independently verifiable

### Requirement: Financial increments SHALL preserve evidential limits
Candidate procedures SHALL distinguish actual, computed and assumed values; preserve provenance, conflicts and limitations; and keep diagnostics advisory. EV bridges SHALL avoid duplicate debt deduction, identify unverified claims and reject invalid DCF publication. Weighted estimates SHALL require comparable currency, date and share basis, explicit applicability and weights. Period checks SHALL expose gaps and overlaps without certifying TTM from labels alone. Currency conversion SHALL require explicit sourced dated rates; source labels alone SHALL not prove independent validation.

#### Scenario: A composite lacks comparability
- **WHEN** method bases differ or necessary assumptions are unverified
- **THEN** individual method results remain visible and the composite point estimate is withheld

#### Scenario: A statement check has incomplete dates or dependent evidence
- **WHEN** interval boundaries or independent input provenance are absent
- **THEN** the result reports the evidential limitation rather than certifying completeness or independence
