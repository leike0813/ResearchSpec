# FinRobot snapshot-2717499 生产锚点

本目录承载 `snapshot-2717499` 的来源审计、已获批完整树与生产维护记录。
用户批准的精确树已吸纳到生产；批准前候选及其审阅原文继续保留用于复核。

- `capability-audit.json`：1,049 Git entries、129 surfaces、八来源、七许可；字节 hash 为审计权威。
- `candidate-policies/`：八份批准前审核政策，保留当时的 published/candidate 身份。
- `candidate-authoring/`：完整候选 authored 输入，六个 ID 不变；四 script-assisted、两 Agent procedure。
- `artifacts/candidate/vendors/finrobot/`：六份完整候选树，包括 LICENSE、NOTICE 与 DERIVATION。
- `artifacts/candidate/extensions/`：六 capability、六 profile 与两领域的隔离候选投影。
- `artifacts/candidate/review.json`：完整候选树 hash 与投影逐文件 SHA-256。
- `artifacts/source-evidence/`：19 份选中来源及 LICENSE/NOTICE，仅为离线审计测试证据，不随 Skill 发布。
- `01-analysis.md`：来源比较和实施方案；`02`–`05`：本轮吸纳、转换、机器和 Agent 语义审阅。
- `artifacts/approval.json`：用户对本精确树的批准记录。
- `artifacts/preapproval-records/`：批准前 01–05、机器审阅与测试结果原文。
- `manifest.json`：当前生产维护锚点；旧新变化见 `artifacts/maintenance-diff.txt`。

维护者生成与检查命令见
[FinRobot 维护文档](../../../docs/maintainer/vendors/finrobot.md)。
`preview --check` 读取完整候选上游 tree；仓库测试以选中来源证据复现完整树。
候选源码和产物不执行上游代码，也不授予服务、模型或 ResearchSpec 流程权威。

## 完整候选入口

候选树集合 SHA-256：
`1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6`。

| 能力 | 完整主程序 | 来源与树内资产 |
| --- | --- | --- |
| 公司基本面 | [SKILL.md](artifacts/candidate/vendors/finrobot/financial-research-company-fundamentals/SKILL.md) | [DERIVATION.json](artifacts/candidate/vendors/finrobot/financial-research-company-fundamentals/DERIVATION.json) |
| 竞争地位 | [SKILL.md](artifacts/candidate/vendors/finrobot/financial-research-competitive-position/SKILL.md) | [DERIVATION.json](artifacts/candidate/vendors/finrobot/financial-research-competitive-position/DERIVATION.json) |
| 公司风险 | [SKILL.md](artifacts/candidate/vendors/finrobot/financial-research-corporate-risk/SKILL.md) | [DERIVATION.json](artifacts/candidate/vendors/finrobot/financial-research-corporate-risk/DERIVATION.json) |
| 事件证据 | [SKILL.md](artifacts/candidate/vendors/finrobot/financial-research-event-evidence/SKILL.md) | [DERIVATION.json](artifacts/candidate/vendors/finrobot/financial-research-event-evidence/DERIVATION.json) |
| 相对估值 | [SKILL.md](artifacts/candidate/vendors/finrobot/financial-research-relative-valuation/SKILL.md) | [DERIVATION.json](artifacts/candidate/vendors/finrobot/financial-research-relative-valuation/DERIVATION.json) |
| 报表分析 | [SKILL.md](artifacts/candidate/vendors/finrobot/financial-research-statement-analysis/SKILL.md) | [DERIVATION.json](artifacts/candidate/vendors/finrobot/financial-research-statement-analysis/DERIVATION.json) |

[机器审阅](04-review.md)、[Agent 语义审阅](05-semantic-review.md)、
[验证结果](03-conversion.md) 与 [逐文件 hash](artifacts/candidate/review.json) 共同绑定当前候选。
批准前定向测试 34/34、全量测试 423/423 的记录保留在 `artifacts/preapproval-records/`。
当前生产验证结果见 `artifacts/verification.json` 与 `03-conversion.md`。

本精确树已获人类批准，生产 pin、政策、包、catalog 和主规格已同步。
候选目录中的 pending 标记记录批准前状态；当前生产批准以 converter 的
`review-decision.json` 及本锚点 `artifacts/approval.json` 为准。
