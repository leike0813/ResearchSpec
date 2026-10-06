## ADDED Requirements

### Requirement: Owned-vendor delivery assets are frozen and reviewed
An owned vendor MAY declare project delivery assets in its maintenance catalog. When declared, baseline SHALL freeze their path and byte identities, check SHALL reject drift, and semantic review SHALL document their derivation and runtime authority independently of capability package parity.

#### Scenario: Publisher asset changes
- **WHEN** a declared delivery asset differs from the baseline
- **THEN** the vendor check fails even if all capability package hashes remain unchanged
