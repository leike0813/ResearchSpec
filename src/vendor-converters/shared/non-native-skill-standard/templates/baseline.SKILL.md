---
name: <<skill-id>>
description: <<State the capability and when users should invoke it, including near-synonyms and the boundary from adjacent Skills.>>
license: <<SPDX identifier or evidenced license expression>>
metadata:
  vendor: <<vendor-id>>
  vendor-release: <<immutable release or snapshot>>
  researchspec-role: semantic-helper
---

# <<User-facing Skill title>>

## Purpose and scope

<<State the concrete outcomes this Skill can produce. Name the tasks it does not
own and the near-miss requests that should route elsewhere. Do not describe the
upstream project as though invoking the Skill executes that project.>>

## Inputs and prerequisites

<<List the task materials, configuration, local files, user-managed tools, and
prior decisions required to begin. State how to discover them and exactly when
missing or contradictory information requires a user question.>>

First, <<give the first observable action: inspect named inputs, establish a
working directory, confirm scope, or select a mode.>>

## Workflow

1. **<<Step name>>** — <<Identify the input, the semantic or deterministic
   action, the evidence or artifact produced, and the exit condition.>>
2. **<<Step name>>** — <<Explain the decision rule and what changes the next
   action. Include exact resource or command use at the step where it occurs.>>
3. **<<Step name>>** — <<Validate the result against the user's request,
   provenance requirements, and domain-specific quality checks.>>
4. **Deliver** — <<Describe final artifacts or response, how partial results are
   labelled, and the completion definition.>>

### Modes and routing

<<If the Skill has multiple modes, list the observable selection rule, mode
workflow, and join point. Remove this subsection when the workflow has only one
path. Never use “as appropriate” without a decision rule.>>

## Hard constraints

- <<State each non-negotiable evidence, safety, provenance, overwrite, access,
  citation, or domain rule here. A reference may elaborate but cannot be the
  only location of a hard constraint.>>
- <<State provider, credential, network, filesystem, subprocess, cost, and user
  confirmation boundaries that apply. Remove categories that cannot occur.>>
- <<State how uncertainty, inferred content, unsupported claims, and partial
  failure must be labelled.>>

## Responsibilities

### Agent responsibilities

- <<List semantic interpretation, judgment, synthesis, interaction, and final
  quality-control work that cannot be delegated to deterministic scripts.>>

### Deterministic tool responsibilities

- <<List validation, parsing, hashing, rendering, file transformation, state, or
  other deterministic work. Name the bundled command at its workflow step. If
  no deterministic tool is used, state that execution is instruction-led and
  remove any script-related text.>>

### Forbidden substitutions

- Do not write a temporary script to replace <<domain semantic judgment>>.
- Do not ask the Agent to hand-build <<authoritative deterministic artifact>>
  when a bundled renderer or validator owns it.

## Outputs and completion

<<List the content and artifacts the user receives, required provenance and
validation, and how each output maps back to the inputs. State the exact
conditions that mean the Skill is complete. Human-facing outputs do not need a
machine schema unless a real consumer requires one.>>

## Failure handling

| Failure class | Detection | Required response | Preserved work |
| --- | --- | --- | --- |
| <<Missing input>> | <<Observable signal>> | <<Ask, stop, or narrow scope>> | <<What remains valid>> |
| <<Unavailable dependency>> | <<Observable signal>> | <<Diagnose without installing or guessing>> | <<What remains valid>> |
| <<Invalid or unsupported result>> | <<Observable signal>> | <<Retry reviewed step, use documented alternative, or return partial result>> | <<What remains valid>> |

<<State which failures must stop execution and which may produce a clearly
labelled partial result.>>

## Examples

### Representative success

**Request:** <<Realistic request that should trigger this Skill.>>

**Execution:** <<Show the selected route, material or command use, and important
decision points without replacing the workflow above.>>

**Completion:** <<Show the expected artifact or response characteristics.>>

### Near-miss or failure

**Request or condition:** <<A related request that should route elsewhere, or a
realistic missing-input/dependency failure.>>

**Response:** <<Show how the Agent declines, asks for the required input,
preserves partial work, or reports the failure.>>

## Reference loading

<<Include this section only when substantial optional references exist. Link
every reference directly and state its exact read condition. The main file must
already contain all hard constraints and the ordinary workflow.>>
