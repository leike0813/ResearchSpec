
# src/vendor-converters/finrobot/review-decision.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: config:src/vendor-converters/finrobot/review-decision.json -->

FinRobot 人工评审决定：记录 snapshot-2717499 的审计哈希、converter 版本 2 与被批准的发布树集合哈希，作为发布字节与生产准入的最终绑定点。
源码：[src/vendor-converters/finrobot/review-decision.json](../../../../../../src/vendor-converters/finrobot/review-decision.json)
<!-- node: resource:src/vendor-converters/finrobot/review-decision.json:tree-set-approval -->

评审结论：review_status 为 approved，绑定 snapshot-2717499 的树集合哈希 1a101495…3a4c6 与 converter 版本 2，注明用户已于 2026-09-30 明确批准六个完整候选树，候选槽位为 null 表示没有待审候选。
源码：[src/vendor-converters/finrobot/review-decision.json](../../../../../../src/vendor-converters/finrobot/review-decision.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [admission-decisions.json](admission-decisions.json.md) | src/vendor-converters/finrobot/admission-decisions.json | FinRobot 能力准入 SSOT：在 snapshot-2717499 审计基线上批准 6 个 capability 映射为中立的 financial-research-* Skill，规定各自的来源 surface、领域归属、Apache-2.0 许可表达、空硬依赖与统一 5 条安全约束。 |
| [resource-decisions.json](resource-decisions.json.md) | src/vendor-converters/finrobot/resource-decisions.json | FinRobot 外部资源处置目录：8 类资源被分为 reference-only（公开披露、已发布报告）、user-configured（用户自备数据、目标 Agent 的浏览器/申报/行情工具）、bundled（4 个 Python 3.11 标准库确定性计算入口）与 excluded（FinRobot 上游运行时）四档。 |
| [source-entry-decisions.json](source-entry-decisions.json.md) | src/vendor-converters/finrobot/source-entry-decisions.json | FinRobot 逐条目源决策目录：对上游全部 1049 个 Git 条目逐条记录 git object id、sha256、内容来源、许可声明、FinRobot 耦合度、外部依赖闭包、生产动作、凭据策略与敏感值扫描结论，其中 1030 条排除、19 条仅作证据。 |
| [surface-decisions.json](surface-decisions.json.md) | src/vendor-converters/finrobot/surface-decisions.json | FinRobot 能力面决策目录：129 条记录把上游 surface_id（源文件 + 符号）映射为 admitted-capability 或 excluded，并标明实现形式（bundled-script 22 条 / agent-procedure 17 条）与产出的 10 个发布资产。 |
