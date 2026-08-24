## ADDED Requirements

### Requirement: Core Capability IDs Omit The Cap Prefix

Bundled core capability packages under `skills/capabilities/` SHALL use prefix-free kebab-case
capability IDs (`<class>-<name>`). Plugin extension capability IDs SHALL retain their
`plugin-<vendor>-*` prefix and SHALL NOT be renamed by the core naming rule.

#### Scenario: Bundled core identity has no cap prefix

- **WHEN** the bundled core capability registry loads
- **THEN** no core `capability_id` starts with `cap-`
- **AND** every package directory, registry `source_path`, manifest ID, and `SKILL.md` name match
  that prefix-free ID

#### Scenario: Plugin prefix is retained

- **WHEN** a plugin extension capability is registered
- **THEN** its `capability_id` starts with its `plugin-<vendor>-` prefix and remains kebab-case
