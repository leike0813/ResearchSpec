
# src/plugins/runtime-capabilities.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/plugins](../../../modules/src/plugins.md)
<!-- node: file:src/plugins/runtime-capabilities.ts -->

按工作区已选插件域把扩展能力合并进基础能力注册表，产出运行时统一视图并保持能力 ID 有序。
源码：[src/plugins/runtime-capabilities.ts](../../../../../src/plugins/runtime-capabilities.ts)

## 符号（1）
<!-- node: function:src/plugins/runtime-capabilities.ts:loadWorkspaceCapabilityRegistry -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| loadWorkspaceCapabilityRegistry | 函数 | 5–44 | 中等 | plugin、capabilities、runtime、aggregation | 1 | 以基础能力注册表为底，按工作区已选域解析插件扩展能力并合并为有序的运行时注册表视图。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [extensions.ts](extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [graph-workspace-index.ts](../core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [registry.ts](../capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph.ts](../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| loadWorkspaceCapabilityRegistry | 函数 | 5–44 | 以基础能力注册表为底，按工作区已选域解析插件扩展能力并合并为有序的运行时注册表视图。 |
