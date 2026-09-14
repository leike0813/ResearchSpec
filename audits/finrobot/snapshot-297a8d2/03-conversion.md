# FinRobot Extension Anchor Conversion — snapshot-297a8d2

- extension registry version: `0.7.0`
- registry subset SHA-256: `e0865eb18e7d66f19e2108e804eaa7bf82bca66ea264459d4d79ca0fe1514aa2`
- packages tree SHA-256: `99804412f84c2848e2093dafb6c537b006a5bb12a641fa713d4cf3a09520fc9c`
- profiles tree SHA-256: `82ca68e84308925a269845cf5316f61b4acad4265329ebe31d2d8f8154996f49`
- capability count: 6 · mixed: 4 · llm: 2

## Extension Capabilities

| capability_id | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | script validator | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `plugin-financial-company-fundamentals` | analysis | producer | mixed | advisory | operational | 1/1 | 2 | 2 | company-fundamentals-brief-validator | 5 | `e13501e997c3` |
| `plugin-financial-competitive-position` | analysis | producer | llm | advisory | operational | 1/1 | 0 | 1 | none | 2 | `b9b7ff14df4b` |
| `plugin-financial-corporate-risk` | analysis | producer | llm | advisory | operational | 1/1 | 0 | 1 | none | 2 | `807daa180eac` |
| `plugin-financial-event-evidence` | analysis | producer | mixed | advisory | operational | 1/1 | 2 | 2 | event-evidence-brief-validator | 5 | `d6262292ed35` |
| `plugin-financial-relative-valuation` | analysis | producer | mixed | advisory | operational | 1/1 | 2 | 2 | relative-valuation-brief-validator | 5 | `28479c2feab9` |
| `plugin-financial-statement-analysis` | analysis | producer | mixed | advisory | operational | 1/1 | 2 | 2 | statement-brief-validator | 5 | `f10f3da7b870` |

## Required Brief Fields

| capability_id | required fields |
|---|---|
| `plugin-financial-company-fundamentals` | `scope` `source_ledger` `business_model` `historical_metrics` `scenarios` `forecast_tables` `conclusions` |
| `plugin-financial-competitive-position` | `scope` `source_ledger` `peer_ledger` `normalized_comparison` `moat_assessment` `valuation_interpretation` `conclusions` |
| `plugin-financial-corporate-risk` | `scope` `source_ledger` `risk_register` `transmission_paths` `mitigants` `residual_exposure` `monitoring_indicators` `conclusions` |
| `plugin-financial-event-evidence` | `scope` `source_ledger` `event_timeline` `duplicate_decisions` `assessments` `ranking` `conclusions` |
| `plugin-financial-relative-valuation` | `scope` `source_ledger` `assumptions` `method_results` `sensitivity` `fair_value_range` `conclusions` |
| `plugin-financial-statement-analysis` | `scope` `source_ledger` `normalized_statements` `metrics` `conclusions` |

## Verification

- [x] `plugin install banking-finance-and-investment` 投影六个 FinRobot extension。
- [x] 每个 profile 通过 `start -> instructions -> advance` 全流程。
- [x] 四个 mixed profile 覆盖 invalid-then-valid script validator 路径。
- [x] `pnpm check` / `pnpm lint` / 全量 `pnpm test` 通过。
