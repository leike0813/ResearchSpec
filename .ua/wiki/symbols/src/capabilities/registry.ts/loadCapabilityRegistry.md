
# loadCapabilityRegistry
<!-- node: function:src/capabilities/registry.ts:loadCapabilityRegistry -->

读取能力根目录下的 registry.json 并转交校验；读取失败时抛出 unreadable 诊断。
类型：函数  
复杂度：中等  
入边数：3  
标签：registry、loader、capabilities  
所属文件：[src/capabilities/registry.ts](../../../../files/src/capabilities/registry.ts.md)
源码：[src/capabilities/registry.ts:85](../../../../../../src/capabilities/registry.ts#L85)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadGraphProfileRegistry](../../../../files/src/graph-profiles/registry.ts.md) | src/graph-profiles/registry.ts:70–84 | 读取图谱 profile 注册表并默认加载能力注册表用于交叉校验。 |
| [loadWorkspaceCapabilityRegistry](../../../../files/src/plugins/runtime-capabilities.ts.md) | src/plugins/runtime-capabilities.ts:5–44 | 以基础能力注册表为底，按工作区已选域解析插件扩展能力并合并为有序的运行时注册表视图。 |
| [graphTestCapabilityRegistryForGraphs](../../../../files/tests/helpers/graph-workspace.ts.md) | tests/helpers/graph-workspace.ts:139–172 | 按给定图谱合成测试用能力 manifest，使图谱声明的输入输出角色与 output_roles 策略校验器一致。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validateCapabilityRegistry](validateCapabilityRegistry.md) | src/capabilities/registry.ts:99–208 | 逐条校验注册表：schema、ID 唯一性、manifest 哈希与 schema、SKILL.md 存在且非空、knowledge 资源哈希、schema 引用与 ARS 溯源制品。 |
