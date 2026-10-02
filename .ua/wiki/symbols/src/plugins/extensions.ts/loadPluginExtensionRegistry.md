
# loadPluginExtensionRegistry
<!-- node: function:src/plugins/extensions.ts:loadPluginExtensionRegistry -->

读取扩展注册表 YAML 并交由校验器解析，失败时转换为 PluginExtensionRegistryError。
类型：函数  
复杂度：简单  
入边数：4  
标签：plugin、extension、loading  
所属文件：[src/plugins/extensions.ts](../../../../files/src/plugins/extensions.ts.md)
源码：[src/plugins/extensions.ts:99](../../../../../../src/plugins/extensions.ts#L99)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphPluginInstall](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:82–114 | 要求显式领域 ID 与非交互下的 --yes，把选定领域投影进当前工作区。 |
| [handleGraphPluginUninstall](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:116–144 | 从工作区选择中移除领域并重新投影，未安装的 ID 直接报错。 |
| [handleGraphPluginUpdate](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:146–174 | 刷新已安装领域，缺省时刷新全部，并先校验所选领域当前可用。 |
| [pluginWorkspaceDiagnostics](../../../../files/src/plugins/graph-check.ts.md) | src/plugins/graph-check.ts:12–160 | 汇总插件检查诊断：注册表可加载性、已选域可用性、投影文件存在性与哈希、能力与 profile 绑定完整性。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validatePluginExtensionRegistry](validatePluginExtensionRegistry.md) | src/plugins/extensions.ts:110–262 | 全面校验扩展注册表：schema 版本、包目录与源路径边界、能力与 profile 条目哈希、域分配唯一性，以及与能力注册表的一致性。 |
