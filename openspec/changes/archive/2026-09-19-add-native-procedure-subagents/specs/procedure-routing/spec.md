# Spec Delta

## ADDED Requirements

### Requirement: Activation Packets Recommend At Most One Native Role

Schema `"1"` standalone and graph activation packets SHALL include an advisory `delegation` object with `recommended_agent` and `reason`. A Procedure with no manifest SHALL use `coordinator`; a non-`llm` Procedure SHALL use `non-llm`; a Procedure with no declared outputs SHALL use `reference-only`; an eligible producer SHALL recommend `researchspec-executor` with `llm-producer`; and an eligible checker or observer SHALL recommend `researchspec-reviewer` with `llm-independent-review`. Reasons that do not recommend a role SHALL set `recommended_agent` to null.

#### Scenario: Pure-LLM producer packet is built
- **WHEN** either activation mode builds a packet for an `llm` producer with declared outputs
- **THEN** it recommends `researchspec-executor` for `llm-producer`

#### Scenario: Pure-LLM review packet is built
- **WHEN** either activation mode builds a packet for an `llm` checker or observer with declared outputs
- **THEN** it recommends `researchspec-reviewer` for `llm-independent-review`

#### Scenario: Procedure is not safely delegable
- **WHEN** a Procedure is `mixed`, `script`, outputless, or has no capability manifest
- **THEN** the packet recommends no native role
- **AND** its reason identifies `non-llm`, `reference-only`, or `coordinator` respectively

