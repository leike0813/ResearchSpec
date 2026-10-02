
# loadPluginRegistry
<!-- node: function:src/plugins/registry.ts:loadPluginRegistry -->

从插件根目录读取并校验注册表，包装为 PluginRegistryError 后向上抛出。
类型：函数  
复杂度：简单  
入边数：6  
标签：plugin、registry、loading  
所属文件：[src/plugins/registry.ts](../../../../files/src/plugins/registry.ts.md)
源码：[src/plugins/registry.ts:132](../../../../../../src/plugins/registry.ts#L132)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphPluginInstall](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:82–114 | 要求显式领域 ID 与非交互下的 --yes，把选定领域投影进当前工作区。 |
| [handleGraphPluginUninstall](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:116–144 | 从工作区选择中移除领域并重新投影，未安装的 ID 直接报错。 |
| [handleGraphPluginUpdate](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:146–174 | 刷新已安装领域，缺省时刷新全部，并先校验所选领域当前可用。 |
| [pluginWorkspaceDiagnostics](../../../../files/src/plugins/graph-check.ts.md) | src/plugins/graph-check.ts:12–160 | 汇总插件检查诊断：注册表可加载性、已选域可用性、投影文件存在性与哈希、能力与 profile 绑定完整性。 |
| [loadGraphPluginStatusView](../../../../files/src/plugins/graph-status.ts.md) | src/plugins/graph-status.ts:20–72 | 读取工作区配置与安装清单，加载插件与扩展注册表，产出 status 使用的插件视图。 |
| [checkToolUniverseOutput](../../../../files/src/vendor-converters/tooluniverse/converter.ts.md) | src/vendor-converters/tooluniverse/converter.ts:96–109 | 加载已生成注册表，断言 ToolUniverse 拥有 130 个 Skill、六个生产 vendor 齐备且域总数为 218。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validatePluginRegistry](validatePluginRegistry.md) | src/plugins/registry.ts:142–210 | 校验域分类、vendor 定义、Skill 清单与保留 ID 冲突，组装领域映射并收集诊断。 |
