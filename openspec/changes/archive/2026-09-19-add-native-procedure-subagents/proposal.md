# Proposal

## Why

ResearchSpec already produces bounded Procedure activation packets, but eligible work still runs in the Navigate agent's context even when a host supports isolated native subagents. Project-local Executor and Reviewer profiles can improve context isolation and independent review without adding a model runtime or changing CLI workflow authority.

## What Changes

- Add two host-native, non-entry custom-agent roles: `researchspec-executor` for eligible pure-LLM producers and `researchspec-reviewer` for eligible pure-LLM checker or observer Procedures.
- Add an advisory delegation recommendation to schema `"1"` activation packets while keeping `mixed`, `script`, reference-only, and coordinator work inline.
- Install both managed profiles by default for the 24 existing class-A tool adapters, using each host's project-local native format and existing ownership/drift reconciliation.
- Teach Navigate to delegate only when isolation, parallelism, or independent review helps; workers never mutate ResearchSpec workflow state or make human/model consent decisions.
- Preserve the existing run/node-bound consent requirement whenever delegation would use a non-inherited or otherwise alternate model.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-surface-model`: Define the two non-entry native subagent roles without expanding the fixed user-visible Skill surface.
- `agent-tool-delivery`: Deliver host-native role profiles through managed project ownership for the supported class-A adapters.
- `procedure-routing`: Add deterministic, advisory role recommendations to activation packets.
- `arsu-user-routing`: Define Navigate's conditional delegation and parent-owned workflow mutation behavior.
- `arsu-user-model-acceptance`: Cover the installed native-profile surface and delegation boundaries in acceptance.

## Impact

The change affects the Agent tool registry and delivery renderer, managed installation provenance and target validation, Procedure packet construction, Navigate instructions, focused adapter/procedure tests, and the canonical usage and maintainer documentation. It adds no dependency, public CLI command, model integration, MCP configuration, or compatibility path.
