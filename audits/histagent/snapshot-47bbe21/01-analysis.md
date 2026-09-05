# HistAgent Extension Anchor Analysis — snapshot-47bbe21

- upstream: https://github.com/CharlesQ9/HistAgent
- revision: `47bbe21dc81618489f5d5929358032883a3fe448`
- upstream content files: 120
- upstream tree SHA-256: `41ecb4c211df7322d33084941a33ba834a0eb61129abe9e5701a957e507d7ffe`
- immutable audit SHA-256: `0f0de44a13204fbbc139ec78b6f9320c4078a786e700f1f5bdcda1688cf36269`
- advisory vendor bundle SHA-256: `67a2333b593dc1317c84a768b9f33fa381e065783f7918dfeece32f4990d0829`

## Upstream Inventory

| top-level area | files |
|---|---|
| .gitignore | 1 |
| CODE_OF_CONDUCT.md | 1 |
| CONTRIBUTING.md | 1 |
| Figures | 6 |
| LICENSE | 1 |
| README.md | 1 |
| browser_use | 63 |
| combine_results.py | 1 |
| dataset_loader.py | 1 |
| judgment.py | 1 |
| openai_baseline.py | 1 |
| requirements.txt | 1 |
| run_gaia.py | 1 |
| run_hist.py | 1 |
| run_hlejson.py | 1 |
| scripts | 38 |

| extension | files |
|---|---|
| (none) | 2 |
| .js | 1 |
| .md | 5 |
| .png | 6 |
| .py | 57 |
| .pyc | 48 |
| .txt | 1 |

## Extension Mapping

| raw Skill | extension capability | execution | script validator | brief fields |
|---|---|---|---|---|
| `histagent-historical-research` | `plugin-historical-research` | mixed | historical-research-brief-validator | scope, source_ledger, gate_trace, evidence_ledger, conflicts, limitations, synthesis |
| `histagent-historical-source-analysis` | `plugin-historical-source-analysis` | mixed | historical-source-analysis-brief-validator | scope, source_ledger, layer_inventory, operation_receipts, validation_results, conclusions |
| `histagent-historical-source-identification` | `plugin-historical-source-identification` | mixed | historical-source-identification-brief-validator | scope, query_ledger, candidate_ledger, retrieval_ledger, verification_decisions, conclusions |

## Decisions

- [x] 上游身份固定为 `snapshot-47bbe21` @ `47bbe21dc81618489f5d5929358032883a3fe448`。
- [x] 三个 reviewed vendor-bundle Skills 一对一映射为三个 extension capability，raw Skills 继续保留为 advisory surface。
- [x] 三个 mixed capability 使用 Python 3.11 标准库工具与 evidence-bound brief validator，并保留 reviewed references 作为渐进式披露知识。
- [x] 上游 runtime/provider 内容不进入 extension package；流程权威由 graph profile 承接。
