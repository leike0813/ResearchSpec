
# src/vendor-converters/finrobot
> 目录聚合页：14 个文件、20 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/vendor-converters/finrobot/admission-decisions.json](../../../files/src/vendor-converters/finrobot/admission-decisions.json.md) | 配置 | 0 | FinRobot 能力准入 SSOT：在 snapshot-2717499 审计基线上批准 6 个 capability 映射为中立的 financial-research-* Skill，规定各自的来源 surface、领域归属、Apache-2.0 许可表达、空硬依赖与统一 5 条安全约束。 |
| [src/vendor-converters/finrobot/cli.ts](../../../files/src/vendor-converters/finrobot/cli.ts.md) | 文件 | 2 | FinRobot vendor converter 的命令行入口，把 convert/check/idempotence/preview 四个子命令分派到 converter 与 preview 模块。 |
| [src/vendor-converters/finrobot/complete-tree.ts](../../../files/src/vendor-converters/finrobot/complete-tree.ts.md) | 文件 | 4 | 把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。 |
| [src/vendor-converters/finrobot/converter.ts](../../../files/src/vendor-converters/finrobot/converter.ts.md) | 文件 | 6 | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [src/vendor-converters/finrobot/license-decisions.json](../../../files/src/vendor-converters/finrobot/license-decisions.json.md) | 配置 | 0 | FinRobot 许可声明处置目录：7 条上游许可声明中仅 root-apache 与 trademark-attribution 被 preserve 为 Apache-2.0 义务，其余五条（借用内容、FinNLP 外部、历史导入树、Anthropic 技能声明、第三方数据集与 fixture）因缺少可核实的生产内容许可而全部 excluded。 |
| [src/vendor-converters/finrobot/origin-decisions.json](../../../files/src/vendor-converters/finrobot/origin-decisions.json.md) | 配置 | 0 | FinRobot 内容来源处置目录：8 个来源中 root-apache 与 native-desktop 被判为 production-source，可在保留来源哈希、派生说明、LICENSE/NOTICE 与不背书边界的前提下复制或改写；AutoGen 归属内容、外部 FinNLP、外部数据集、filings 与 marker 树以及 Anthropic 派生内容全部 excluded。 |
| [src/vendor-converters/finrobot/policy.ts](../../../files/src/vendor-converters/finrobot/policy.ts.md) | 文件 | 4 | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |
| [src/vendor-converters/finrobot/preview.ts](../../../files/src/vendor-converters/finrobot/preview.ts.md) | 文件 | 3 | FinRobot 候选预览路径：限定预览根必须位于 audits/finrobot 之下，只渲染 pending-human-review 的候选树，并输出候选清单供人工语义复核。 |
| [src/vendor-converters/finrobot/relationship-decisions.json](../../../files/src/vendor-converters/finrobot/relationship-decisions.json.md) | 配置 | 0 | FinRobot Skill 关系目录：6 条 Skill 之间的关系一律标为 advisory `related`，仅说明在双方都进入范围时可互相参照，不构成硬依赖，也不自动产生依赖关系。 |
| [src/vendor-converters/finrobot/resource-decisions.json](../../../files/src/vendor-converters/finrobot/resource-decisions.json.md) | 配置 | 0 | FinRobot 外部资源处置目录：8 类资源被分为 reference-only（公开披露、已发布报告）、user-configured（用户自备数据、目标 Agent 的浏览器/申报/行情工具）、bundled（4 个 Python 3.11 标准库确定性计算入口）与 excluded（FinRobot 上游运行时）四档。 |
| [src/vendor-converters/finrobot/review-decision.json](../../../files/src/vendor-converters/finrobot/review-decision.json.md) | 配置 | 0 | FinRobot 人工评审决定：记录 snapshot-2717499 的审计哈希、converter 版本 2 与被批准的发布树集合哈希，作为发布字节与生产准入的最终绑定点。 |
| [src/vendor-converters/finrobot/skill-definitions.ts](../../../files/src/vendor-converters/finrobot/skill-definitions.ts.md) | 文件 | 1 | 六个 financial-research-* Skill 的定义表：Tier 1/3 分级、领域归属、agent-procedure 与 bundled-script 能力实现、共享支持库与 LICENSE/NOTICE/DERIVATION 分发约定。 |
| [src/vendor-converters/finrobot/source-entry-decisions.json](../../../files/src/vendor-converters/finrobot/source-entry-decisions.json.md) | 配置 | 0 | FinRobot 逐条目源决策目录：对上游全部 1049 个 Git 条目逐条记录 git object id、sha256、内容来源、许可声明、FinRobot 耦合度、外部依赖闭包、生产动作、凭据策略与敏感值扫描结论，其中 1030 条排除、19 条仅作证据。 |
| [src/vendor-converters/finrobot/surface-decisions.json](../../../files/src/vendor-converters/finrobot/surface-decisions.json.md) | 配置 | 0 | FinRobot 能力面决策目录：129 条记录把上游 surface_id（源文件 + 符号）映射为 admitted-capability 或 excluded，并标明实现形式（bundled-script 22 条 / agent-procedure 17 条）与产出的 10 个发布资产。 |

## 子目录
- [lib](finrobot/lib.md)、[skills/financial-research-company-fundamentals/scripts](finrobot/skills/financial-research-company-fundamentals/scripts.md)、[skills/financial-research-competitive-position](finrobot/skills/financial-research-competitive-position.md)、[skills/financial-research-corporate-risk](finrobot/skills/financial-research-corporate-risk.md)、[skills/financial-research-event-evidence/scripts](finrobot/skills/financial-research-event-evidence/scripts.md)、[skills/financial-research-relative-valuation/scripts](finrobot/skills/financial-research-relative-valuation/scripts.md)、[skills/financial-research-statement-analysis/scripts](finrobot/skills/financial-research-statement-analysis/scripts.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/workspace](../core/workspace.md) | 4 |
| [src/vendor-converters/shared](shared.md) | 4 |
| [src/plugins](../plugins.md) | 3 |
| [src/vendor-converters/shared/non-native-skill-standard](shared/non-native-skill-standard.md) | 2 |
| [src/vendor-audits](../vendor-audits.md) | 1 |
