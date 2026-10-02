
# resolveDomainExtensions
<!-- node: function:src/plugins/extensions.ts:resolveDomainExtensions -->

把给定的域 ID 列表解析为对应的扩展 capability 与 profile 条目，缺失或不可用域直接跳过。
类型：函数  
复杂度：中等  
入边数：5  
标签：plugin、extension、resolution  
所属文件：[src/plugins/extensions.ts](../../../../files/src/plugins/extensions.ts.md)
源码：[src/plugins/extensions.ts:264](../../../../../../src/plugins/extensions.ts#L264)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphPluginShow](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:68–80 | 输出单个领域插件的元数据、来源与解析结果，支持紧凑摘要模式。 |
| [pluginWorkspaceDiagnostics](../../../../files/src/plugins/graph-check.ts.md) | src/plugins/graph-check.ts:12–160 | 汇总插件检查诊断：注册表可加载性、已选域可用性、投影文件存在性与哈希、能力与 profile 绑定完整性。 |
| [planWorkspacePluginProjection](../../../../files/src/plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts:265–289 | 面向工作区配置与安装清单组织完整投影计划，负责解析域选择、加载注册表并汇总诊断。 |
| [loadGraphPluginStatusView](../../../../files/src/plugins/graph-status.ts.md) | src/plugins/graph-status.ts:20–72 | 读取工作区配置与安装清单，加载插件与扩展注册表，产出 status 使用的插件视图。 |
| [loadWorkspaceCapabilityRegistry](../../../../files/src/plugins/runtime-capabilities.ts.md) | src/plugins/runtime-capabilities.ts:5–44 | 以基础能力注册表为底，按工作区已选域解析插件扩展能力并合并为有序的运行时注册表视图。 |

## 调用

该符号没有记录对外调用。
