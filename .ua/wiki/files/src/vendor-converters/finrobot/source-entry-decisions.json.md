
# src/vendor-converters/finrobot/source-entry-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: config:src/vendor-converters/finrobot/source-entry-decisions.json -->

FinRobot 逐条目源决策目录：对上游全部 1049 个 Git 条目逐条记录 git object id、sha256、内容来源、许可声明、FinRobot 耦合度、外部依赖闭包、生产动作、凭据策略与敏感值扫描结论，其中 1030 条排除、19 条仅作证据。
源码：[src/vendor-converters/finrobot/source-entry-decisions.json](../../../../../../src/vendor-converters/finrobot/source-entry-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/source-entry-decisions.json:evidence-only-source-files -->

19 个源文件被标为 evidence-only（12 个 root-apache 的 autogen/equity 模块、7 个 native-desktop 计算与校验模块），它们的 output_assets 全为空，只提供审阅证据而不直接产出发布资产。
源码：[src/vendor-converters/finrobot/source-entry-decisions.json](../../../../../../src/vendor-converters/finrobot/source-entry-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/source-entry-decisions.json:excluded-source-entries -->

1030 个源条目被排除，原因码统一为 out-of-admitted-scope；全部条目的 converter_execution 均为 never、skill_execution 均为 not-distributed。
源码：[src/vendor-converters/finrobot/source-entry-decisions.json](../../../../../../src/vendor-converters/finrobot/source-entry-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/source-entry-decisions.json:hard-coupling-sources -->

8 个源文件被判定与 FinRobot 存在 hard 耦合（DCF、EV 桥接、TTM 期间、币种口径、估值综合、数据校验、数值声明模型），另有 2 个 light 耦合文件，因此这些能力由 ResearchSpec 重写而非直接复用。
源码：[src/vendor-converters/finrobot/source-entry-decisions.json](../../../../../../src/vendor-converters/finrobot/source-entry-decisions.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [surface-decisions.json](surface-decisions.json.md) | src/vendor-converters/finrobot/surface-decisions.json | FinRobot 能力面决策目录：129 条记录把上游 surface_id（源文件 + 符号）映射为 admitted-capability 或 excluded，并标明实现形式（bundled-script 22 条 / agent-procedure 17 条）与产出的 10 个发布资产。 |
