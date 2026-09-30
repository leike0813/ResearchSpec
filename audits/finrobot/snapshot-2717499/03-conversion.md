# FinRobot Extension Anchor Conversion — snapshot-2717499

- extension registry version: `0.7.0`
- registry subset SHA-256: `9aafc9aa57b33bc5698ad3b46e4e53bd97edf1af616e803f1f0bb127bc5dce8a`
- packages tree SHA-256: `f04dc385144e520887717acfb5308e882c9907fad5fe4bd4754a15ab435b8c00`
- profiles tree SHA-256: `82ca68e84308925a269845cf5316f61b4acad4265329ebe31d2d8f8154996f49`
- capability count: 6 · mixed: 4 · llm: 2

## Extension Capabilities

| capability_id | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | script validator | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `plugin-financial-company-fundamentals` | analysis | producer | mixed | advisory | operational | 1/1 | 2 | 2 | company-fundamentals-brief-validator | 5 | `5497a0689440` |
| `plugin-financial-competitive-position` | analysis | producer | llm | advisory | operational | 1/1 | 0 | 1 | none | 2 | `afc30c39ab30` |
| `plugin-financial-corporate-risk` | analysis | producer | llm | advisory | operational | 1/1 | 0 | 1 | none | 2 | `7a84329c0324` |
| `plugin-financial-event-evidence` | analysis | producer | mixed | advisory | operational | 1/1 | 2 | 2 | event-evidence-brief-validator | 5 | `f5162089013a` |
| `plugin-financial-relative-valuation` | analysis | producer | mixed | advisory | operational | 1/1 | 2 | 2 | relative-valuation-brief-validator | 5 | `458af2af9c32` |
| `plugin-financial-statement-analysis` | analysis | producer | mixed | advisory | operational | 1/1 | 2 | 2 | statement-brief-validator | 5 | `f1e89dae4bc4` |

## Required Brief Fields

| capability_id | required fields |
|---|---|
| `plugin-financial-company-fundamentals` | `scope` `source_ledger` `business_model` `historical_metrics` `scenarios` `forecast_tables` `conclusions` `numeric_evidence` |
| `plugin-financial-competitive-position` | `scope` `source_ledger` `peer_ledger` `normalized_comparison` `moat_assessment` `valuation_interpretation` `conclusions` |
| `plugin-financial-corporate-risk` | `scope` `source_ledger` `risk_register` `transmission_paths` `mitigants` `residual_exposure` `monitoring_indicators` `conclusions` |
| `plugin-financial-event-evidence` | `scope` `source_ledger` `event_timeline` `duplicate_decisions` `assessments` `ranking` `conclusions` |
| `plugin-financial-relative-valuation` | `scope` `source_ledger` `assumptions` `method_results` `sensitivity` `fair_value_range` `conclusions` `comparability_checks` `equity_bridge` |
| `plugin-financial-statement-analysis` | `scope` `source_ledger` `normalized_statements` `metrics` `conclusions` `evidence_checks` |

## Verification

- [x] `plugin install banking-finance-and-investment` 投影 6 个 FinRobot extension。
- [x] 4 个 mixed package 的 `tools/` 与 reviewed vendor bundle 逐字节一致；required brief fields 全部绑定。
- [x] 共 8 个 tool file；4 个 profile 声明 script validator，其余使用 output-role policy。
- 实测记录：`audits/finrobot/snapshot-2717499/artifacts/verification.json`（verified_at 2026-09-30T11:55:17Z · review_status approved）
- build: passed
- typecheck: passed
- lint: passed
- openspec: valid
- candidate_check: passed
- targeted tests: 34 / 34 pass / 0 fail / 0 skip
- full tests: 423 / 423 pass / 0 fail / 0 skip
- production snapshot-2717499: check passed · idempotence passed · maintenance OK
- human approval: approved
