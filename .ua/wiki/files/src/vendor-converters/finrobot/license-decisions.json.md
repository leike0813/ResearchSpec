
# src/vendor-converters/finrobot/license-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: config:src/vendor-converters/finrobot/license-decisions.json -->

FinRobot 许可声明处置目录：7 条上游许可声明中仅 root-apache 与 trademark-attribution 被 preserve 为 Apache-2.0 义务，其余五条（借用内容、FinNLP 外部、历史导入树、Anthropic 技能声明、第三方数据集与 fixture）因缺少可核实的生产内容许可而全部 excluded。
源码：[src/vendor-converters/finrobot/license-decisions.json](../../../../../../src/vendor-converters/finrobot/license-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/license-decisions.json:anthropic-skills-attribution -->

许可声明处置：排除。上游声明的 MIT 与根 Apache-2.0 冲突，且精确来源 revision 未固定，无法作为可核实的许可授权。
源码：[src/vendor-converters/finrobot/license-decisions.json](../../../../../../src/vendor-converters/finrobot/license-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/license-decisions.json:borrowed-content -->

许可声明处置：排除。仅凭署名无法确立可复制内容的有效许可。
源码：[src/vendor-converters/finrobot/license-decisions.json](../../../../../../src/vendor-converters/finrobot/license-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/license-decisions.json:finnlp-external -->

许可声明处置：排除。嵌套的 FinNLP 仓库需要独立的内容与许可审计。
源码：[src/vendor-converters/finrobot/license-decisions.json](../../../../../../src/vendor-converters/finrobot/license-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/license-decisions.json:imported-source-trees -->

许可声明处置：排除。历史导入的源码树在复用前必须完成来源与许可复核。
源码：[src/vendor-converters/finrobot/license-decisions.json](../../../../../../src/vendor-converters/finrobot/license-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/license-decisions.json:root-apache -->

许可声明处置：保留上游根 Apache-2.0，必须完整保留许可证文本、NOTICE 义务与不背书边界，是所有生成 Skill 的许可表达基础。
源码：[src/vendor-converters/finrobot/license-decisions.json](../../../../../../src/vendor-converters/finrobot/license-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/license-decisions.json:third-party-datasets-and-fixtures -->

许可声明处置：排除。仓库内没有任何许可声明覆盖随包附带的数据集与 fixture，因此不构成生产内容许可。
源码：[src/vendor-converters/finrobot/license-decisions.json](../../../../../../src/vendor-converters/finrobot/license-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/license-decisions.json:trademark-attribution -->

许可声明处置：商标归属同样按 Apache-2.0 保留，附带完整的许可证、NOTICE 与不背书边界要求。
源码：[src/vendor-converters/finrobot/license-decisions.json](../../../../../../src/vendor-converters/finrobot/license-decisions.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [origin-decisions.json](origin-decisions.json.md) | src/vendor-converters/finrobot/origin-decisions.json | FinRobot 内容来源处置目录：8 个来源中 root-apache 与 native-desktop 被判为 production-source，可在保留来源哈希、派生说明、LICENSE/NOTICE 与不背书边界的前提下复制或改写；AutoGen 归属内容、外部 FinNLP、外部数据集、filings 与 marker 树以及 Anthropic 派生内容全部 excluded。 |
