
# src/adapters/companion/workflows/navigate.ts
所属分层：[宿主与投递适配层](../../../../../layers/adapters.md)  
所属目录：[src/adapters/companion/workflows](../../../../../modules/src/adapters/companion/workflows.md)
<!-- node: file:src/adapters/companion/workflows/navigate.ts -->

唯一用户可见入口 Navigate 的执行指引：定义何时需要正式图工作流、standalone 与 graph 两种模式的差异，以及文献来源策略的投影方式。
源码：[src/adapters/companion/workflows/navigate.ts](../../../../../../../src/adapters/companion/workflows/navigate.ts)

## 符号（1）
<!-- node: function:src/adapters/companion/workflows/navigate.ts:renderNavigateExecutionGuidance -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [renderNavigateExecutionGuidance](../../../../../symbols/src/adapters/companion/workflows/navigate.ts/renderNavigateExecutionGuidance.md) | 函数 | 19–246 | 复杂 | companion、navigate、rendering、policy、guidance | 1 | 按 Skill 或 command 宿主形态渲染 Navigate 的完整执行指引正文，内嵌图工作流触发条件、模式选择规则与文献来源策略投影。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [provider-policy.ts](../../../literature-adapters/provider-policy.ts.md) | src/literature-adapters/provider-policy.ts | 文献来源策略与受管库授权的判定层：把来源策略、就绪状态与覆盖缺口组合为执行计划，并对私有库访问逐条校验授权范围。 |
| [types.ts](../types.ts.md) | src/adapters/companion/types.ts | Companion 适配层的类型定义：四个工作流 ID 联合类型、由工作流 ID 派生的 Skill ID 模板类型，以及工作流源与渲染意图的接口。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [command-renderer.ts](../../command-renderer.ts.md) | src/adapters/command-renderer.ts | 把唯一的 Navigate 命令包装内容按各宿主要求的 command 格式渲染为可落地文件，同时给出旧版 CLI 命令 ID 供遗留清理识别。 |
| [manifest.ts](../manifest.ts.md) | src/adapters/companion/manifest.ts | 将 propose、decide、verify、navigate 四个工作流源合并为带 Skill ID 的意图清单，是 Companion Skill 注册的清单层。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [renderNavigateExecutionGuidance](../../../../../symbols/src/adapters/companion/workflows/navigate.ts/renderNavigateExecutionGuidance.md) | 函数 | 19–246 | 按 Skill 或 command 宿主形态渲染 Navigate 的完整执行指引正文，内嵌图工作流触发条件、模式选择规则与文献来源策略投影。 |
