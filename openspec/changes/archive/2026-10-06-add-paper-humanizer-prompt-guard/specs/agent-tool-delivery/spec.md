## ADDED Requirements

### Requirement: Selected hosts receive a persistent writing guard
ResearchSpec SHALL install the complete reviewed Paper Humanizer guard by default for selected reviewed hosts independently of delivery mode. `init/update --paper-humanizer-guard on|off` SHALL persist the preference; omission SHALL preserve it, defaulting to on when absent from a current schema 2 configuration.

#### Scenario: Every prompt receives the guard
- **WHEN** a configured and enabled host processes successive user prompts
- **THEN** its native prompt context or pre-model system channel receives the complete guard on each turn without invoking a Procedure

#### Scenario: A host has no verified protocol
- **WHEN** a selected host has no reviewed guard protocol
- **THEN** no guessed hook is installed and inspection reports the unsupported coverage

### Requirement: Hook ownership preserves user settings
Shared host configuration SHALL retain user settings and hooks. Ownership SHALL cover only ResearchSpec hook entries; the whole-file snapshot SHALL protect writes. Off and deselection SHALL remove only unchanged owned entries. Drifted entries SHALL retain their publisher resources and SHALL be reported as incomplete retirement.

#### Scenario: Unrelated settings change
- **WHEN** user settings change outside an unchanged owned hook entry
- **THEN** update reconciles the entry while preserving those settings

#### Scenario: A managed entry is modified
- **WHEN** off or deselection encounters a modified managed hook
- **THEN** it retains the hook and dependencies with a nonblocking diagnostic and does not report completed removal

### Requirement: Guard delivery is advisory and read-only at runtime
The publisher SHALL read only the shipped guard and the protocol input needed to return context. It SHALL make no model calls, log no prompts, change no workflow state, and continue the request with an empty successful response on failure. Inspection SHALL distinguish installation from host loading and SHALL expose activation prerequisites.

#### Scenario: Guard cannot be read
- **WHEN** the publisher cannot read its guard
- **THEN** it returns the native empty response and exits successfully

#### Scenario: Native subagent context is available
- **WHEN** a reviewed host emits a supported subagent-start event
- **THEN** that subagent receives the same guard without changing model consent or workflow authority
