# Materials-Science-Skills-For-LLM Extension Anchor Analysis — snapshot-fafd3ab

- upstream: https://github.com/IntelligentMat/Materials-Science-Skills-For-LLM.git
- revision: `fafd3ab011e4c363658a39c4bb62fc739839d58c`
- upstream content files: 46
- upstream tree SHA-256: `c10639a9d77602e3dfe2f6c5fb48a11ba2a3bdad8c7aae17060c88d7a898b162`
- immutable audit SHA-256: `03a12b5547b140c68458b5bf988f8df7056178a56c8fe41be2a3ffd29cf16589`
- advisory vendor bundle SHA-256: `fcbeede16efa5c7129af56a4fbf1ebe39f84076e0f8069db22f9f703a99877f2`

## Upstream Inventory

| top-level area | files |
|---|---|
| .gitignore | 1 |
| LICENSE | 1 |
| README.md | 1 |
| apex-alloy-workflows | 3 |
| ase | 5 |
| atomsk-cli | 1 |
| cms-scripts | 3 |
| deepmd-kit | 2 |
| deeptb-helper | 4 |
| dpgen-workflow | 2 |
| gpumd-workflow | 6 |
| phonopy-workflows | 5 |
| pymatgen-usage | 5 |
| slurm-workload-manager | 4 |
| unimol-ops | 3 |

| extension | files |
|---|---|
| (none) | 2 |
| .md | 44 |

## Extension Mapping

| raw Skill | extension capability | execution | script validator | brief fields |
|---|---|---|---|---|
| `materials-science-skills-apex-alloy-workflows` | `plugin-materials-apex-alloy-workflows` | llm | apex-alloy-brief-validator | scope, input_inventory, validation_criteria, authority_ledger, task_results, convergence_checks, conclusions |
| `materials-science-skills-atomsk-cli` | `plugin-materials-atomsk-cli` | llm | atomsk-cli-brief-validator | scope, operation_plan, command_ledger, confirmation_ledger, validation_evidence, conclusions |
| `materials-science-skills-deeptb-helper` | `plugin-materials-deeptb-helper` | llm | deeptb-helper-brief-validator | scope, dataset_ledger, configuration_review, command_ledger, evaluation_metrics, conclusions |
| `materials-science-skills-dpgen-workflow` | `plugin-materials-dpgen-workflow` | llm | dpgen-workflow-brief-validator | scope, stage_ledger, parameter_review, authority_ledger, convergence_evidence, conclusions |
| `materials-science-skills-gpumd-workflow` | `plugin-materials-gpumd-workflow` | llm | gpumd-workflow-brief-validator | scope, run_ledger, command_ledger, output_inventory, validation_results, conclusions |
| `materials-science-skills-phonopy-workflows` | `plugin-materials-phonopy-workflows` | llm | phonopy-workflows-brief-validator | scope, configuration_review, force_ledger, run_ledger, validation_results, conclusions |
| `materials-science-skills-unimol-ops` | `plugin-materials-unimol-ops` | llm | unimol-ops-brief-validator | scope, data_ledger, mode_plan, command_ledger, result_ledger, conclusions |

## Decisions

- [x] 上游身份固定为 `snapshot-fafd3ab` @ `fafd3ab011e4c363658a39c4bb62fc739839d58c`。
- [x] 七个 reviewed vendor-bundle Skills 一对一映射为七个 extension capability，raw Skills 继续保留为 advisory surface。
- [x] 七个 llm capability 使用 evidence-bound brief validator；六个 package 保留 reviewed references，Atomsk 无 reference。
- [x] 上游 runtime/provider 内容不进入 extension package；流程权威由 graph profile 承接。
