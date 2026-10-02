
# src/vendor-converters/finrobot/resource-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: config:src/vendor-converters/finrobot/resource-decisions.json -->

FinRobot 外部资源处置目录：8 类资源被分为 reference-only（公开披露、已发布报告）、user-configured（用户自备数据、目标 Agent 的浏览器/申报/行情工具）、bundled（4 个 Python 3.11 标准库确定性计算入口）与 excluded（FinRobot 上游运行时）四档。
源码：[src/vendor-converters/finrobot/resource-decisions.json](../../../../../../src/vendor-converters/finrobot/resource-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/resource-decisions.json:bundled-deterministic-financial-tools -->

资源处置：4 个已文档化的 Python 3.11 标准库入口随包分发，只做确定性校验、计算、归一化、排序与渲染，适用于四个脚本类 Skill。
源码：[src/vendor-converters/finrobot/resource-decisions.json](../../../../../../src/vendor-converters/finrobot/resource-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/resource-decisions.json:finrobot-runtime -->

资源处置：排除 FinRobot 上游运行时，没有任何已发布树导入或依赖该包。
源码：[src/vendor-converters/finrobot/resource-decisions.json](../../../../../../src/vendor-converters/finrobot/resource-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/resource-decisions.json:public-company-disclosures -->

资源处置：公开公司披露按 reference-only 处理，只能通过用户已授权的目标 Agent 工具检索，不随发布树分发。
源码：[src/vendor-converters/finrobot/resource-decisions.json](../../../../../../src/vendor-converters/finrobot/resource-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/resource-decisions.json:published-financial-reports -->

资源处置：已发布财务报告按 reference-only 处理，引用时必须保留发行人、期间、发布日期与来源位置。
源码：[src/vendor-converters/finrobot/resource-decisions.json](../../../../../../src/vendor-converters/finrobot/resource-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/resource-decisions.json:target-agent-browser-tool -->

资源处置：浏览器能力为 user-configured，可在目标 Agent 与宿主策略下检索授权证据，Skill 本身不含任何浏览器客户端。
源码：[src/vendor-converters/finrobot/resource-decisions.json](../../../../../../src/vendor-converters/finrobot/resource-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/resource-decisions.json:target-agent-filing-tool -->

资源处置：申报检索工具为 user-configured，可取回授权披露信息，Skill 不解析凭据也不实现 provider adapter。
源码：[src/vendor-converters/finrobot/resource-decisions.json](../../../../../../src/vendor-converters/finrobot/resource-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/resource-decisions.json:target-agent-market-data-tool -->

资源处置：行情数据工具为 user-configured，可提供授权观测值，Skill 不含 provider 客户端或凭据契约。
源码：[src/vendor-converters/finrobot/resource-decisions.json](../../../../../../src/vendor-converters/finrobot/resource-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/resource-decisions.json:user-provided-research-data -->

资源处置：用户私有或授权数据为 user-configured，始终留在发布树之外，只在调用时由用户提供。
源码：[src/vendor-converters/finrobot/resource-decisions.json](../../../../../../src/vendor-converters/finrobot/resource-decisions.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |
