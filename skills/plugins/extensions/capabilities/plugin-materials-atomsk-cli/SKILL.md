---
name: plugin-materials-atomsk-cli
description: Design, execute, and validate local Atomsk structure creation, transformation, defect, selection, merge, and format-conversion operations for one graph node.
metadata:
  capability_id: plugin-materials-atomsk-cli
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: MIT
---


# Atomsk Structure Operations

## Purpose and scope

Turn a defined crystallographic operation into a reviewable Atomsk command and
validate the resulting structure. Supported modes are creation, conversion,
transformation, merge, defect/selection operations, nanotubes, and
polycrystals. Do not use this Skill to choose a physical model, simulate a
material, install Atomsk, or infer missing crystallographic conventions.

## Inputs and prerequisites

Require the intended operation, input path when applicable, coordinate and unit
conventions, species mapping, cell/orientation expectations, transformation
order, output format, and new output path. Confirm the local executable and its
version with `atomsk --version` or local help. Ask the user when different
orientation, selection, periodicity, or overwrite choices would change the
structure.

## Workflow

1. Define the input structure, coordinate convention, units, target structure, transformation order, and output path before constructing a command.
2. Inspect the input metadata without changing it. Establish atom count,
   species, cell vectors, periodicity, coordinate convention, and current format.
3. Choose one mode and build the command incrementally:

```bash
atomsk input.ext output.ext
atomsk --create fcc 4.02 Al orient 0-11 100 011 output.cfg
atomsk input.cfg -duplicate 4 3 3 -orthogonal-cell output.cfg
atomsk --merge 2 first.cfg second.cfg merged.cfg
```

4. Explain each option and its ordering. Show every read/write path and prefer a
   new output. Obtain explicit confirmation before replacing a path or creating
   a computationally significant structure.
5. Use the user-preinstalled atomsk executable only after the exact command and file effects have been reviewed.
6. Reopen the result and compare atom count, species, cell, orientation,
   periodicity, coordinates, overlaps, selections, and format with the plan.

## Hard constraints

- Never overwrite the source structure.
- Do not guess Miller indices, handedness, lattice parameters, coordinate type,
  boundary conditions, species order, or output-unit conventions.
- Do not silently reorder transformations; Atomsk option order can change the
  result.
- Do not install binaries, retrieve examples, edit global configuration, or
  execute commands outside the reviewed local paths.
- The user owns the Atomsk installation and local files; an existing path may be replaced only after explicit confirmation.

## Responsibilities

Agent procedure: translate the requested structure change into an ordered, reviewable Atomsk operation.
Return the exact command, read/write paths, assumptions, and structural validation checklist.
Stop when crystallographic conventions, species mapping, units, or transformation order are ambiguous.

The external tool is `atomsk`. It performs only the reviewed deterministic
structure operation. Agent procedure: validate atom count, species, cell vectors, orientation, periodicity, coordinates, and target format after execution.
Return the validation evidence and identify every intentional structural change.
Treat unexplained atom loss, cell change, overlap, or format mismatch as failure.

## Outputs and completion

Return the operation goal, exact command, input/output inventory, option
explanation, confirmation record, and structural validation results. Completion
requires an unchanged source, a distinct expected output, and evidence that all
intended changes—and no unexplained changes—occurred.

## Failure handling

If atomsk is unavailable or rejects an option, inspect local version help and revise the command without installing software or guessing syntax. If an input
format is unsupported, ask for a user-approved conversion route. If validation
detects unexplained differences, preserve both files and report failure instead
of chaining more transformations.

## Examples

Happy path: create an oriented aluminium supercell into a new CFG file, explain
orientation and duplication, then confirm atom count, orthogonal cell, species,
and periodicity.

Near miss: “convert this file and overwrite it” without identifying its
coordinate convention. Preserve the input and request the missing convention
and a distinct output path before constructing a command.

## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge

- No packaged knowledge files; all execution rules are in this SKILL.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `operation_plan` `command_ledger` `confirmation_ledger` `validation_evidence` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_materials_brief.py --required scope, operation_plan, command_ledger, confirmation_ledger, validation_evidence, conclusions` validator rejects missing
or empty sections. The validator never invokes the external tool; ResearchSpec
never executes the user-managed scientific runtime.

## Completion

When the brief is written, submit the declared outputs through
`researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal
action. Do not choose, start, or advance another node, phase, mode, or run.
