
# src/procedures/packet.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/procedures](../../../modules/src/procedures.md)
<!-- node: file:src/procedures/packet.ts -->

构造 schema `"1"` 的 Procedure 激活包：携带正文摘要、包内知识资源、输入输出、权限边界与推荐执行 Agent 画像。
源码：[src/procedures/packet.ts](../../../../../src/procedures/packet.ts)

## 符号（2）
<!-- node: function:src/procedures/packet.ts:buildProcedurePacket -->
<!-- node: function:src/procedures/packet.ts:procedureDelegation -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| buildProcedurePacket | 函数 | 19–62 | 中等 | procedures、packet、validation、hashing、delegation | 0 | 按激活模式校验并组装 Procedure 包，附上正文 SHA-256、知识资源哈希、默认禁止工作流写入的权限边界与 review-workspace 指引。 |
| procedureDelegation | 函数 | 64–72 | 简单 | delegation、procedures、policy、classification | 1 | 依据 manifest 的 execution_type、输出数量与节点角色推荐 executor 或 reviewer 画像，非 LLM、仅参考与协调者一律不推荐。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [instructions.ts](../review-workspace/instructions.ts.md) | src/review-workspace/instructions.ts | 按 profile 或 capability 决定是否提供本地静态评审面：返回描述符/结果契约名、包内页面与 workbench 路径、评审阶段映射和给 Agent 的操作指引。 |
| [write-plan.ts](../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph.ts](../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [procedures.test.ts](../../tests/procedures.test.ts.md) | tests/procedures.test.ts | Procedure 目录的行为测试：验证目录规模由各注册表派生、Companion 仅暴露三个隐藏 Procedure、排序检索与激活包内容符合契约。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| buildProcedurePacket | 函数 | 19–62 | 按激活模式校验并组装 Procedure 包，附上正文 SHA-256、知识资源哈希、默认禁止工作流写入的权限边界与 review-workspace 指引。 |
| procedureDelegation | 函数 | 64–72 | 依据 manifest 的 execution_type、输出数量与节点角色推荐 executor 或 reviewer 画像，非 LLM、仅参考与协调者一律不推荐。 |
