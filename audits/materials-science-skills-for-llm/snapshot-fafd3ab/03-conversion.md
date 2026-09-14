# Materials-Science-Skills-For-LLM Extension Anchor Conversion — snapshot-fafd3ab

- extension registry version: `0.7.0`
- registry subset SHA-256: `00241f500c6ffa6804faab8ff062f86563a14f72052926de51497ed905923672`
- packages tree SHA-256: `77ded7ad197e9fe075e2abf9cbb8d17b5d6f9bd27885526f5f1ee6d16ae322c5`
- profiles tree SHA-256: `0370d5e8bba6ac4c03cb2327272c3f9e313b39d1ee00bb525d18f9bc9e44af90`
- capability count: 7 · mixed: 0 · llm: 7

## Extension Capabilities

| capability_id | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | script validator | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `plugin-materials-apex-alloy-workflows` | analysis | producer | llm | advisory | operational | 1/1 | 1 | 2 | apex-alloy-brief-validator | 4 | `c7a02fac5544` |
| `plugin-materials-atomsk-cli` | analysis | producer | llm | advisory | operational | 1/1 | 0 | 2 | atomsk-cli-brief-validator | 3 | `6e88de853751` |
| `plugin-materials-deeptb-helper` | analysis | producer | llm | advisory | operational | 1/1 | 1 | 2 | deeptb-helper-brief-validator | 4 | `7902a60e4a3e` |
| `plugin-materials-dpgen-workflow` | analysis | producer | llm | advisory | operational | 1/1 | 1 | 2 | dpgen-workflow-brief-validator | 4 | `298220965f29` |
| `plugin-materials-gpumd-workflow` | analysis | producer | llm | advisory | operational | 1/1 | 1 | 2 | gpumd-workflow-brief-validator | 4 | `d4465c416a11` |
| `plugin-materials-phonopy-workflows` | analysis | producer | llm | advisory | operational | 1/1 | 1 | 2 | phonopy-workflows-brief-validator | 4 | `d3e240e11036` |
| `plugin-materials-unimol-ops` | analysis | producer | llm | advisory | operational | 1/1 | 1 | 2 | unimol-ops-brief-validator | 4 | `040bb9668d16` |

## Required Brief Fields

| capability_id | required fields |
|---|---|
| `plugin-materials-apex-alloy-workflows` | `scope` `input_inventory` `validation_criteria` `authority_ledger` `task_results` `convergence_checks` `conclusions` |
| `plugin-materials-atomsk-cli` | `scope` `operation_plan` `command_ledger` `confirmation_ledger` `validation_evidence` `conclusions` |
| `plugin-materials-deeptb-helper` | `scope` `dataset_ledger` `configuration_review` `command_ledger` `evaluation_metrics` `conclusions` |
| `plugin-materials-dpgen-workflow` | `scope` `stage_ledger` `parameter_review` `authority_ledger` `convergence_evidence` `conclusions` |
| `plugin-materials-gpumd-workflow` | `scope` `run_ledger` `command_ledger` `output_inventory` `validation_results` `conclusions` |
| `plugin-materials-phonopy-workflows` | `scope` `configuration_review` `force_ledger` `run_ledger` `validation_results` `conclusions` |
| `plugin-materials-unimol-ops` | `scope` `data_ledger` `mode_plan` `command_ledger` `result_ledger` `conclusions` |

## Verification

- [x] `plugin install materials-engineering` 投影六、`macromolecular-and-materials-chemistry` 投影二、`computational-modeling-and-simulation` 投影全部七个 extension。
- [x] 每个 profile 通过 `start -> instructions -> advance` 全流程。
- [x] 七个 profile 覆盖 invalid-then-valid script validator 路径。
- [x] `pnpm check` / `pnpm lint` / 全量 `pnpm test` 通过。
