
# validatePluginRegistry
<!-- node: function:src/plugins/registry.ts:validatePluginRegistry -->

校验域分类、vendor 定义、Skill 清单与保留 ID 冲突，组装领域映射并收集诊断。
类型：函数  
复杂度：复杂  
入边数：2  
标签：plugin、registry、validation、schema  
所属文件：[src/plugins/registry.ts](../../../../files/src/plugins/registry.ts.md)
源码：[src/plugins/registry.ts:142](../../../../../../src/plugins/registry.ts#L142)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [assemblePluginRegistry](../assembler.ts/assemblePluginRegistry.md) | src/plugins/assembler.ts:40–66 | 加载领域目录与分类快照、逐个解析 vendor bundle 并合并为 PluginRegistry，校验通过后原子写入 registry.json。 |
| [loadPluginRegistry](loadPluginRegistry.md) | src/plugins/registry.ts:132–140 | 从插件根目录读取并校验注册表，包装为 PluginRegistryError 后向上抛出。 |

## 调用

该符号没有记录对外调用。
