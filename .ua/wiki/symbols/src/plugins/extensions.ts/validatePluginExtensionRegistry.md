
# validatePluginExtensionRegistry
<!-- node: function:src/plugins/extensions.ts:validatePluginExtensionRegistry -->

全面校验扩展注册表：schema 版本、包目录与源路径边界、能力与 profile 条目哈希、域分配唯一性，以及与能力注册表的一致性。
类型：函数  
复杂度：复杂  
入边数：1  
标签：plugin、extension、validation、hash-verification、schema  
所属文件：[src/plugins/extensions.ts](../../../../files/src/plugins/extensions.ts.md)
源码：[src/plugins/extensions.ts:110](../../../../../../src/plugins/extensions.ts#L110)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadPluginExtensionRegistry](loadPluginExtensionRegistry.md) | src/plugins/extensions.ts:99–108 | 读取扩展注册表 YAML 并交由校验器解析，失败时转换为 PluginExtensionRegistryError。 |

## 调用

该符号没有记录对外调用。
