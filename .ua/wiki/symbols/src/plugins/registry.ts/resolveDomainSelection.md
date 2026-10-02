
# resolveDomainSelection
<!-- node: function:src/plugins/registry.ts:resolveDomainSelection -->

把已选域解析为可用域、不可用域与去重后的 Skill ID 集合。
类型：函数  
复杂度：中等  
入边数：4  
标签：plugin、resolution、selection  
所属文件：[src/plugins/registry.ts](../../../../files/src/plugins/registry.ts.md)
源码：[src/plugins/registry.ts:212](../../../../../../src/plugins/registry.ts#L212)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphPluginList](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:42–66 | 列出可用领域插件及解析出的 Skill 与扩展数量，可按工作区已选过滤。 |
| [pluginWorkspaceDiagnostics](../../../../files/src/plugins/graph-check.ts.md) | src/plugins/graph-check.ts:12–160 | 汇总插件检查诊断：注册表可加载性、已选域可用性、投影文件存在性与哈希、能力与 profile 绑定完整性。 |
| [buildResolutionSnapshots](../../../../files/src/plugins/status.ts.md) | src/plugins/status.ts:25–31 | 为给定域集合构建域解析快照，包含域版本与去重后的已解析 Skill ID。 |
| [pluginStatusSummary](../../../../files/src/plugins/status.ts.md) | src/plugins/status.ts:33–45 | 生成 status 使用的插件摘要：已选、可用、不可用、已投影域与已解析 Skill。 |

## 调用

该符号没有记录对外调用。
