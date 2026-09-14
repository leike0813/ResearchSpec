# HistAgent Extension Anchor Conversion — snapshot-47bbe21

- extension registry version: `0.7.0`
- registry subset SHA-256: `65331b9f4ec39c971e33380ea095525f6789f6c8f2150aaeb5b869336fb7f527`
- packages tree SHA-256: `20c1e3ce5cf4045ee9a23db06aff24b94822f6f2b1668fed80a388f68b4049eb`
- profiles tree SHA-256: `67ff211f89c53f67ac273af1a47a125108a2584e53b750258b23b13514815a31`
- capability count: 3 · mixed: 3 · llm: 0

## Extension Capabilities

| capability_id | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | script validator | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `plugin-historical-research` | analysis | producer | mixed | advisory | operational | 1/1 | 4 | 2 | historical-research-brief-validator | 7 | `5200bb7ac8b4` |
| `plugin-historical-source-analysis` | analysis | producer | mixed | advisory | operational | 1/1 | 4 | 2 | historical-source-analysis-brief-validator | 7 | `b0224e3b28a5` |
| `plugin-historical-source-identification` | analysis | producer | mixed | advisory | operational | 1/1 | 4 | 2 | historical-source-identification-brief-validator | 7 | `021a7422a781` |

## Required Brief Fields

| capability_id | required fields |
|---|---|
| `plugin-historical-research` | `scope` `source_ledger` `gate_trace` `evidence_ledger` `conflicts` `limitations` `synthesis` |
| `plugin-historical-source-analysis` | `scope` `source_ledger` `layer_inventory` `operation_receipts` `validation_results` `conclusions` |
| `plugin-historical-source-identification` | `scope` `query_ledger` `candidate_ledger` `retrieval_ledger` `verification_decisions` `conclusions` |

## Verification

- [x] `plugin install historical-studies` 投影三个 HistAgent extension；`heritage-archive-and-museum-studies` 投影两个。
- [x] 每个 profile 通过 `start -> instructions -> advance` 全流程。
- [x] 三个 mixed profile 覆盖 invalid-then-valid script validator 路径。
- [x] `pnpm check` / `pnpm lint` / 全量 `pnpm test` 通过。
