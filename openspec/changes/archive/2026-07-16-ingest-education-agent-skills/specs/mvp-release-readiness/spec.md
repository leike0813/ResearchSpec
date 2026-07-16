## ADDED Requirements

### Requirement: Sixth-Vendor Assets SHALL Publish Without Maintainer Inputs
The npm release SHALL contain the 136 approved Education Agent Skills complete
trees with `SKILL.md`, CC BY-SA 4.0 `LICENSE`, and `NOTICE.md`, plus the vendor
bundle, manifest, conversion report, assembled registry, and canonical adapter
documentation. It SHALL exclude the upstream checkout, immutable audit,
evidence map and report, production policy, review decision, preview tree,
converter source, upstream MCP, installer, tests, scripts, project docs, and
generated caches.

#### Scenario: Installed sixth vendor is verified
- **WHEN** the approved package is packed and installed
- **THEN** representative teacher-facing and student-facing Education Skills are present and registry-valid
- **AND** unresolved markers and attribution files are retained
- **AND** default initialization still installs only the fixed eight base Skills and wrappers
