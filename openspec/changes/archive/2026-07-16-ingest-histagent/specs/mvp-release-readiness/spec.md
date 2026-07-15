## ADDED Requirements

### Requirement: Fifth-Vendor Skills SHALL Publish Only Approved Complete Trees
The npm release SHALL contain the three approved HistAgent Skill trees with `SKILL.md`, one formal entrypoint, copied `lib/historical_support.py`, two reviewed references, `DERIVATION.json`, `LICENSE`, and `NOTICE`, plus the vendor bundle, manifest, report, registry, and adapter documentation. It SHALL exclude the vendor checkout, audit, production decisions, authored converter sources, previews, tests, source evidence, review inputs, private runner files, generic schemas, doctors, result validators, dependency manifests, and unused requirements.

#### Scenario: Installed fifth vendor is verified
- **WHEN** the approved fifth vendor is packed and installed
- **THEN** every published tree matches the approved closure and passes static validation
- **AND** maintainer-only and unsupported protocol files are absent
- **AND** the public CLI and fixed base/Companion Skill surface remain unchanged
