## MODIFIED Requirements

### Requirement: Owned Vendors Resolve Canonical Authoring Roots

The owned-vendor maintenance catalog SHALL resolve extraction indexes from `authoring/paper-humanizer` and `authoring/revision-master`. Current anchors SHALL be refreshed when these canonical paths change, without treating path relocation as upstream semantic drift.

#### Scenario: An owned-vendor index is relocated

- **WHEN** its reviewed extraction index moves under `authoring/`
- **THEN** authoring, maintenance, and idempotence checks resolve the new path
- **AND** the refreshed current anchor records the new canonical location
