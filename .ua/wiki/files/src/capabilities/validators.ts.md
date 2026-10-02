
# src/capabilities/validators.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/capabilities](../../../modules/src/capabilities.md)
<!-- node: file:src/capabilities/validators.ts -->

能力校验器执行层：按 manifest 声明依次运行 policy 与 script 校验器；script 校验器在临时目录写入 submission.json 后按 argv 模板执行，网络型校验器失败降级为 degraded 而非 pass。
源码：[src/capabilities/validators.ts](../../../../../src/capabilities/validators.ts)

## 符号（3）
<!-- node: function:src/capabilities/validators.ts:runCapabilityValidators -->
<!-- node: function:src/capabilities/validators.ts:runPolicyValidator -->
<!-- node: function:src/capabilities/validators.ts:runScriptValidator -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| runCapabilityValidators | 函数 | 39–57 | 中等 | validators、dispatch、capabilities | 1 | 按 manifest 声明顺序分派校验器：policy 走内置策略，schema 直接判为未解析失败，script 交由脚本执行器。 |
| runPolicyValidator | 函数 | 59–72 | 中等 | validators、policy、fail-closed | 0 | 内置 output_roles 策略校验：比对提交输出与 manifest 声明的必需/可选角色，未知策略校验器 fail-closed。 |
| runScriptValidator | 函数 | 74–114 | 中等 | validators、process-spawn、network-boundary、fail-closed | 0 | 在临时目录写入 submission.json，按 argv 模板替换占位符后执行校验脚本，带 30 秒超时；网络型校验器失败返回 degraded。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [capability-manifest.ts](../core/contracts/capability-manifest.ts.md) | src/core/contracts/capability-manifest.ts | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-validators.test.ts](../../tests/capability-validators.test.ts.md) | tests/capability-validators.test.ts | 校验器执行测试：覆盖 script 校验器通过与失败、网络校验器降级为 degraded 而非 pass、未知 policy 与未解析 schema 校验器 fail-closed，以及 submitGraphNode 触发注册表声明的校验器。 |
| [graph-run.ts](../core/runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| runCapabilityValidators | 函数 | 39–57 | 按 manifest 声明顺序分派校验器：policy 走内置策略，schema 直接判为未解析失败，script 交由脚本执行器。 |
| runPolicyValidator | 函数 | 59–72 | 内置 output_roles 策略校验：比对提交输出与 manifest 声明的必需/可选角色，未知策略校验器 fail-closed。 |
| runScriptValidator | 函数 | 74–114 | 在临时目录写入 submission.json，按 argv 模板替换占位符后执行校验脚本，带 30 秒超时；网络型校验器失败返回 degraded。 |
