---
name: plugin-materials-unimol-ops
description: Plan and review local Uni-Mol representation, inference, and training workflows with explicit mode and data evidence for one graph node.
metadata:
  capability_id: plugin-materials-unimol-ops
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: MIT
---


# Local Uni-Mol Workflows

## Purpose and scope

Select a compatible local Uni-Mol mode, review model/data requirements, execute
an approved local entrypoint, and interpret outputs without confusing prediction
with validation. Supported modes are representation extraction, property
inference, and user-managed training. The Skill does not install packages,
download weights or data, pull images, contact remote inference, or infer a
model's task and units from its filename.

## Inputs and prerequisites

Require the mode and decision question; local runtime/version; model path,
source, license, checksum and task metadata; molecular input path, schema,
identifiers, conformers, provenance and units; preprocessing; device and compute
budget; checkpoint and output policy; evaluation data and acceptance criteria.
Ask when model choice, conformer handling, units, GPU use, training, data
replacement, or output interpretation would materially change the result.

## Workflow

1. Choose representation extraction, property inference, or user-managed training and define the model, task, molecular inputs, units, provenance, device, output path, and acceptance criteria before execution.
2. Verify that every required runtime, model and data path exists locally and
   has adequate provenance. Do not search for or retrieve a missing resource.
3. Agent procedure: verify model-task compatibility, data schema, conformers, units, preprocessing, applicability, and evaluation design.
4. Read this reference after selecting representation, inference, or training mode and needing mode-specific local command and data detail: [references/local-workflow-modes.md](references/local-workflow-modes.md).
5. Inspect local help and render the exact version-matched command, inputs,
   device, cost, outputs, overwrite behavior, and expected evidence. The formal
   external tool is the user-configured Uni-Mol, unicore-train, or torchrun entrypoint.
6. Obtain confirmation for GPU use, training, checkpoint replacement, or
   overwriting output. Use the user-configured Uni-Mol, unicore-train, or torchrun entrypoint only for the selected reviewed local mode.
7. Preserve raw outputs with model/input identifiers before semantic analysis.
8. Agent procedure: assess prediction meaning, uncertainty, applicability domain, representation use, evaluation leakage, and downstream limitations.

## Hard constraints

- The user owns the runtime, model files, molecular data, GPU allocation, checkpoints, compute budget, and output directory.
- Do not install, download, pull images, configure credentials, contact an
  endpoint, or upload molecular data.
- Do not use a model without verified task, preprocessing, input schema, output
  meaning, units, and license/provenance.
- Do not overwrite source data, model weights, checkpoints, or unreviewed output.
- Keep raw predictions/embeddings separate from interpretation and downstream
  claims; record uncertainty and applicability limits.

## Responsibilities

The Agent owns mode selection, model/data compatibility, schema and units,
evaluation design, applicability, uncertainty, and conclusions. The local
entrypoint performs only the approved representation, inference, or training
operation.

Return a reviewed mode, resource inventory, command plan, output contract, and scientific checks.
Stop when model provenance, license, task metadata, input schema, units, or applicability cannot be established.
Return raw-output provenance and a separate scientific interpretation with limitations.
Do not treat an embedding or prediction as validated when task compatibility, units, uncertainty, or held-out evaluation is missing.

## Outputs and completion

Return mode, model/data/runtime provenance, reviewed command and confirmation,
raw output location and schema, evaluation, uncertainty, applicability limits,
and interpretation. Completion requires a preserved raw result linked to the
exact model and inputs plus evidence appropriate to the requested claim.

## Failure handling

If the entrypoint, model, or data is unavailable or incompatible, report the missing prerequisite without installing, downloading, pulling images, or contacting a remote endpoint. On runtime or GPU failure, preserve logs and ask
the user to choose an environment change. On schema/unit mismatch or invalid
evaluation, do not coerce outputs or weaken the claim.

## Examples

Happy path: verify a local property model's task, checksum, units and molecular
schema, confirm local GPU inference, retain raw predictions, and report held-out
performance plus applicability limits.

Near miss: use embeddings from an undocumented checkpoint as calibrated property
predictions. Preserve the embeddings as representations and reject the property
claim until a compatible supervised model and evaluation are provided.

## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge

- Load knowledge ID `local-workflow-modes-reference` from `references/local-workflow-modes.md`.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `data_ledger` `mode_plan` `command_ledger` `result_ledger` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_materials_brief.py --required scope, data_ledger, mode_plan, command_ledger, result_ledger, conclusions` validator rejects missing
or empty sections. The validator never invokes the external tool; ResearchSpec
never executes the user-managed scientific runtime.

## Completion

When the brief is written, submit the declared outputs through
`researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal
action. Do not choose, start, or advance another node, phase, mode, or run.
