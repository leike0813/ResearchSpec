# Spec Delta

## ADDED Requirements

### Requirement: Agent items use verified display locations
A v2 workspace MAY carry a display location for an Agent item separately from its original evidence target. The system SHALL validate the display block and range against the frozen document and SHALL leave an item visibly unlocated when no reliable display location exists. Display placement SHALL NOT replace source evidence or authorize source edits.

#### Scenario: Display block differs from source block
- **WHEN** an annotation's source target uses an identity that differs from its rendered block identity
- **THEN** the page uses a separately validated display location and retains the original source target unchanged

#### Scenario: Display location is invalid
- **WHEN** a placement names a missing block or an out-of-range selection
- **THEN** workspace validation rejects the placement before review

### Requirement: Verified candidate comparison remains one frozen review
A paper-humanizer v2 workspace MAY contain a paired, frozen direct base and verified candidate. The comparison SHALL identify both source files, cover every displayed block exactly once per side, and preserve all visible text. The page SHALL show paired blocks side by side with bounded phrase-level change highlights and allow independent user comments on either side. Each comment SHALL retain its side through the block identity in the complete v2 result. Plan item dispositions SHALL remain advisory and SHALL NOT edit either manuscript or confirm a Gate or Decision.

#### Scenario: Reviewer comments on removed and added text
- **WHEN** the reviewer selects text in the base and in the candidate
- **THEN** both comments export with distinct frozen block identities and valid text anchors

#### Scenario: Pairing is incomplete
- **WHEN** comparison rows omit or repeat a block or the base source is missing from the frozen manifest
- **THEN** the workspace is rejected instead of displaying a misleading comparison

#### Scenario: Direct base differs from original run input
- **WHEN** the candidate belongs to a later revision round
- **THEN** the left side shows that round's direct base and the owning verification process retains its separate original-source drift check

#### Scenario: Existing single-document v2 review opens
- **WHEN** a v2 workspace has no comparison
- **THEN** the existing one-document review and export path remains available

