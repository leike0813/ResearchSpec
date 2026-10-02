
# src/adapters/companion/workflows/decide.ts
所属分层：[宿主与投递适配层](../../../../../layers/adapters.md)  
所属目录：[src/adapters/companion/workflows](../../../../../modules/src/adapters/companion/workflows.md)
<!-- node: file:src/adapters/companion/workflows/decide.ts -->

Decide Companion 工作流指令源：引导人工审阅一个明确选择，并通过 `researchspec decide` 把确认结果记录进其唯一归属文件。
源码：[src/adapters/companion/workflows/decide.ts](../../../../../../../src/adapters/companion/workflows/decide.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [types.ts](../types.ts.md) | src/adapters/companion/types.ts | Companion 适配层的类型定义：四个工作流 ID 联合类型、由工作流 ID 派生的 Skill ID 模板类型，以及工作流源与渲染意图的接口。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [manifest.ts](../manifest.ts.md) | src/adapters/companion/manifest.ts | 将 propose、decide、verify、navigate 四个工作流源合并为带 Skill ID 的意图清单，是 Companion Skill 注册的清单层。 |
