# FinRobot 候选转换与验证

日期：2026-09-30。对象为 pending-human-review 的隔离候选，无生产发布。

## extension 和 profile

路径：`artifacts/candidate/extensions/`。每个 capability 有同 ID 的单节点 profile。
六 profile、领域成员关系、advisory gate policy、纯 LLM/脚本分工保持既有合同。

| capability | 类型 | package tree SHA-256（maintenance） | script validator required brief fields |
| --- | --- | --- | --- |
| `plugin-financial-company-fundamentals` | `mixed` | `69fbe0e0d44c751c8ecb3247c391a90e636450944facbbeeb757c0a399734559` | `scope`, `source_ledger`, `business_model`, `historical_metrics`, `scenarios`, `forecast_tables`, `conclusions`, `numeric_evidence` |
| `plugin-financial-competitive-position` | `llm` | `14d96607bd765728fcf332364451ff8e783f06f48d9323624441b9b77d7315fa` |  |
| `plugin-financial-corporate-risk` | `llm` | `1da4f8136e41f5e495afc0c73490ffb3010d0d1165146887dae42a652bec40cb` |  |
| `plugin-financial-event-evidence` | `mixed` | `5c667f68162bd4539802cb31a7966aba8a0788b78476713f72f78f31d8213007` | `scope`, `source_ledger`, `event_timeline`, `duplicate_decisions`, `assessments`, `ranking`, `conclusions` |
| `plugin-financial-relative-valuation` | `mixed` | `605008808b2de3398862324a4f50ad1ec7e14b30860b4f2702a954b5e51fa063` | `scope`, `source_ledger`, `assumptions`, `method_results`, `sensitivity`, `fair_value_range`, `conclusions`, `comparability_checks`, `equity_bridge` |
| `plugin-financial-statement-analysis` | `mixed` | `d0dab79e1251c23c114b67c6f9815e5c7e060e3cfb219fbc272f0d4107d9f841` | `scope`, `source_ledger`, `normalized_statements`, `metrics`, `conclusions`, `evidence_checks` |

两份 llm capability 只有 output-role policy，无 script validator；其输出语义见完整 SKILL。
四份 mixed manifest 显式声明 --required；validator 默认字段不构成各包合同。
`registry_subset_sha256`：`d7eacbac9fafc76733df88947e554df33960de766343d0fe05aa97ac6e75089e`。
逐 profile hash 见 [extension-review.json](artifacts/extension-review.json)。

## 实现范围

复用既有 policy loader、完整树 renderer、extension registry loader 与 maintenance hash 函数。
新增维护者 preview 不进入公共 CLI；候选路径与当前生产默认路径分离。
审计 schema 验证实际数量、来源/许可引用和真实 SKILL 库存；directory scope 与逐文件 evidence
分别验证。默认生产 loader 继续绑定旧身份、immutable audit hash 和批准树。

候选 definitions 复用六份生产定义，仅增加七项 surface。业务增量只改四份 SKILL 和
valuation/statements 两脚本；无 provider、依赖、外部 runtime 或新框架。源文件不分发。
受影响 extension 同步正文、knowledge hash、provenance 和 brief 字段，profile 字节保持不变。

## 最终验证

| 命令 | 结果 |
| --- | --- |
| pnpm build | 通过 |
| pnpm check | 通过 |
| pnpm lint | 通过 |
| node --test .test-dist/tests/finrobot-{audit,ingest-draft,converter,maintenance,preview,statements,valuation}.test.js .test-dist/tests/plugin-extensions.test.js | 34 tests / 34 pass / 0 fail / 0 skip |
| UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test | 423 tests / 423 pass / 0 fail / 0 skip |
| FinRobot maintainer preview --check | 完整 source 树及候选字节闭包通过 |
| FinRobot converter check / idempotence | 旧生产通过 |
| node scripts/finrobot-maintenance.mjs check snapshot-297a8d2 | OK |
| openspec validate update-finrobot-to-snapshot-2717499 --strict | 通过 |
| git diff --check | 通过 |

构建测试先 `pnpm exec tsc -p tsconfig.test.json`。preview 复现命令与固定源身份见
[维护文档](../../../docs/maintainer/vendors/finrobot.md)、[01 分析](01-analysis.md)。
Python 计算测试使用已存在的共享 uv 环境，未安装依赖或运行 FinRobot 上游代码。
测试重生成按顺序执行，未与读取相同 .test-dist 的测试并行。

## 待生产阶段

当前候选完整树 hash 为 `1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6`。
获该精确树的人类批准后，才将 reviewed authored 字节、policy/definitions、pin、raw/extension、
catalog、主规格和文档切换到新身份，并固化 production manifest 与 maintenance diff。
当前主生产 catalog 与其他 vendor 产物没有改动；不能把此次候选测试称为新生产发布完成。
