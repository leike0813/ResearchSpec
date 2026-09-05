# FinRobot Extension Anchor Analysis — snapshot-297a8d2

- upstream: https://github.com/AI4Finance-Foundation/FinRobot.git
- revision: `297a8d28d099be328c8a8eb658b4f782b93f3651`
- upstream content files: 145
- upstream tree SHA-256: `73f57674dfde778776aa89abda65c5254531a716228fe970bd1bd12f6de84b56`
- immutable audit SHA-256: `6b518a933f036333203276263b94cc5b4bd45a924f426972c4547165c5cbb9c3`
- advisory vendor bundle SHA-256: `a2824084ede6ff0a2e54e4c1d1066ede7286e221277f58f08ce2a1885363e66f`

## Upstream Inventory

| top-level area | files |
|---|---|
| .dockerignore | 1 |
| .gitignore | 1 |
| .gitmodules | 1 |
| .vscode | 1 |
| Dockerfile | 1 |
| LICENSE | 1 |
| NOTICE | 1 |
| OAI_CONFIG_LIST | 1 |
| README.md | 1 |
| TRADEMARK_POLICY.md | 1 |
| agent_builder_demo.py | 1 |
| config_api_keys | 1 |
| configs | 1 |
| deploy.gcloud.sh | 1 |
| deploy.sh | 1 |
| experiments | 4 |
| figs | 1 |
| finrobot | 43 |
| finrobot_equity | 61 |
| report | 3 |
| requirements-equity.txt | 1 |
| requirements.txt | 1 |
| run_web_app.py | 1 |
| setup.py | 1 |
| test_module.py | 1 |
| tutorials_advanced | 6 |
| tutorials_beginner | 7 |

| extension | files |
|---|---|
| (none) | 9 |
| .css | 1 |
| .example | 1 |
| .html | 8 |
| .ipynb | 14 |
| .jpg | 1 |
| .json | 3 |
| .md | 3 |
| .pdf | 3 |
| .png | 3 |
| .py | 94 |
| .sh | 2 |
| .txt | 3 |

## Extension Mapping

| raw Skill | extension capability | execution | script validator | brief fields |
|---|---|---|---|---|
| `financial-research-company-fundamentals` | `plugin-financial-company-fundamentals` | mixed | company-fundamentals-brief-validator | scope, source_ledger, business_model, historical_metrics, scenarios, forecast_tables, conclusions |
| `financial-research-competitive-position` | `plugin-financial-competitive-position` | llm | engine policy only | scope, source_ledger, peer_ledger, normalized_comparison, moat_assessment, valuation_interpretation, conclusions |
| `financial-research-corporate-risk` | `plugin-financial-corporate-risk` | llm | engine policy only | scope, source_ledger, risk_register, transmission_paths, mitigants, residual_exposure, monitoring_indicators, conclusions |
| `financial-research-event-evidence` | `plugin-financial-event-evidence` | mixed | event-evidence-brief-validator | scope, source_ledger, event_timeline, duplicate_decisions, assessments, ranking, conclusions |
| `financial-research-relative-valuation` | `plugin-financial-relative-valuation` | mixed | relative-valuation-brief-validator | scope, source_ledger, assumptions, method_results, sensitivity, fair_value_range, conclusions |
| `financial-research-statement-analysis` | `plugin-financial-statement-analysis` | mixed | statement-brief-validator | scope, source_ledger, normalized_statements, metrics, conclusions |

## Decisions

- [x] 上游身份固定为 `snapshot-297a8d2` @ `297a8d28d099be328c8a8eb658b4f782b93f3651`。
- [x] 六个 reviewed vendor-bundle Skills 一对一映射为六个 extension capability，raw Skills 继续保留为 advisory surface。
- [x] 四个 mixed capability 使用 Python 3.11 标准库工具与 evidence-bound brief validator；两个 llm capability 仅使用 output-role policy validator。
- [x] 上游 runtime/provider 内容不进入 extension package；流程权威由 graph profile 承接。
