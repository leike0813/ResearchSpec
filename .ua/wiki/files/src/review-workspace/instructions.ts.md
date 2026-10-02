
# src/review-workspace/instructions.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/review-workspace](../../../modules/src/review-workspace.md)
<!-- node: file:src/review-workspace/instructions.ts -->

按 profile 或 capability 决定是否提供本地静态评审面：返回描述符/结果契约名、包内页面与 workbench 路径、评审阶段映射和给 Agent 的操作指引。
源码：[src/review-workspace/instructions.ts](../../../../../src/review-workspace/instructions.ts)

## 符号（1）
<!-- node: function:src/review-workspace/instructions.ts:reviewWorkspaceInstruction -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| reviewWorkspaceInstruction | 函数 | 43–87 | 中等 | routing、review-workspace、workflow-policy | 0 | 先按 profile 再按 capability 解析适配器，命中 revision-master 时返回阶段化的 workbench 交接说明，命中 paper-humanizer 时返回 v2 页面指引，均固定声明 CLI 独占的变更权威。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/review-workspace/contracts.ts | review-workspace v1 契约的 Zod 定义：适配器枚举、稿件、目标锚点、条目、描述与导出结果，并要求结果覆盖每个条目且源哈希一致。 |
| [revision-master.ts](revision-master.ts.md) | src/review-workspace/revision-master.ts | revision-master 评审工作区 v1 契约：显式业务表快照、阶段作用域与其基线、文档与定位、反馈结构，以及带严格确认规则的导出结果 Schema。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph.ts](../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [packet.ts](../procedures/packet.ts.md) | src/procedures/packet.ts | 构造 schema `"1"` 的 Procedure 激活包：携带正文摘要、包内知识资源、输入输出、权限边界与推荐执行 Agent 画像。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| reviewWorkspaceInstruction | 函数 | 43–87 | 先按 profile 再按 capability 解析适配器，命中 revision-master 时返回阶段化的 workbench 交接说明，命中 paper-humanizer 时返回 v2 页面指引，均固定声明 CLI 独占的变更权威。 |
