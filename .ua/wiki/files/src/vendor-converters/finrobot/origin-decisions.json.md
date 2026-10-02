
# src/vendor-converters/finrobot/origin-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: config:src/vendor-converters/finrobot/origin-decisions.json -->

FinRobot 内容来源处置目录：8 个来源中 root-apache 与 native-desktop 被判为 production-source，可在保留来源哈希、派生说明、LICENSE/NOTICE 与不背书边界的前提下复制或改写；AutoGen 归属内容、外部 FinNLP、外部数据集、filings 与 marker 树以及 Anthropic 派生内容全部 excluded。
源码：[src/vendor-converters/finrobot/origin-decisions.json](../../../../../../src/vendor-converters/finrobot/origin-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/origin-decisions.json:anthropic-derived -->

来源处置：排除。Anthropic 派生技能的 revision 未固定且许可声明冲突，不构成再分发授权。
源码：[src/vendor-converters/finrobot/origin-decisions.json](../../../../../../src/vendor-converters/finrobot/origin-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/origin-decisions.json:attributed-autogen -->

来源处置：排除。文件虽标注 Microsoft AutoGen notebook 归属，但未声明源内有效的内容许可。
源码：[src/vendor-converters/finrobot/origin-decisions.json](../../../../../../src/vendor-converters/finrobot/origin-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/origin-decisions.json:external-dataset-fixture -->

来源处置：排除。随包数据集与抓取的 fixture 仅作审计证据，树内没有再分发授权。
源码：[src/vendor-converters/finrobot/origin-decisions.json](../../../../../../src/vendor-converters/finrobot/origin-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/origin-decisions.json:external-finnlp -->

来源处置：排除。FinNLP 是未初始化的外部 gitlink，不作为树内 FinRobot 内容接受审计。
源码：[src/vendor-converters/finrobot/origin-decisions.json](../../../../../../src/vendor-converters/finrobot/origin-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/origin-decisions.json:native-desktop -->

来源处置：第一方 FinRobot Desktop 源码同属 Apache-2.0，经审阅的证据面可在保留派生与声明的前提下复制。
源码：[src/vendor-converters/finrobot/origin-decisions.json](../../../../../../src/vendor-converters/finrobot/origin-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/origin-decisions.json:root-apache -->

来源处置：根 Apache-2.0 文件属于生产来源，可在携带来源哈希、派生记录、LICENSE、NOTICE 与不背书归属的前提下复制或改写。
源码：[src/vendor-converters/finrobot/origin-decisions.json](../../../../../../src/vendor-converters/finrobot/origin-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/origin-decisions.json:unclear-filings -->

来源处置：排除。导入的 filings 实现缺乏足够的源内来源证据支持再分发。
源码：[src/vendor-converters/finrobot/origin-decisions.json](../../../../../../src/vendor-converters/finrobot/origin-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/origin-decisions.json:unclear-marker -->

来源处置：排除。由 marker 派生的 SEC 转换树同样缺少可再分发的来源内证据。
源码：[src/vendor-converters/finrobot/origin-decisions.json](../../../../../../src/vendor-converters/finrobot/origin-decisions.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [source-entry-decisions.json](source-entry-decisions.json.md) | src/vendor-converters/finrobot/source-entry-decisions.json | FinRobot 逐条目源决策目录：对上游全部 1049 个 Git 条目逐条记录 git object id、sha256、内容来源、许可声明、FinRobot 耦合度、外部依赖闭包、生产动作、凭据策略与敏感值扫描结论，其中 1030 条排除、19 条仅作证据。 |
