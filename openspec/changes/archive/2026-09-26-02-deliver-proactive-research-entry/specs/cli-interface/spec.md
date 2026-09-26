## ADDED Requirements

### Requirement: Research Entry Mechanisms Are Inspectable

list tools SHALL expose each registered target's project-entry mechanism, applicable destination and documented limitations. doctor SHALL report missing, drifted, malformed or statically shadowed entry instructions without executing the host, contacting a service or modifying files. Static installation health SHALL NOT imply successful natural-language activation.

#### Scenario: Root instructions are shadowed
- **WHEN** a documented higher-priority local instruction file prevents the installed research agreement from loading
- **THEN** doctor reports the shadowing condition and leaves both files unchanged

#### Scenario: Entry content is damaged
- **WHEN** doctor encounters a safe regular entry file whose managed content is missing or modified
- **THEN** it returns a nonblocking entry diagnostic visible in structured and human output

#### Scenario: Discovery-only target is listed
- **WHEN** list tools includes a target without reviewed native-rule support
- **THEN** its entry metadata identifies the discovery fallback and does not claim verified automatic activation
