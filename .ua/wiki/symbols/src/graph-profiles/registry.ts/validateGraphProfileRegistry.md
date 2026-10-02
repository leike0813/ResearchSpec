
# validateGraphProfileRegistry
<!-- node: function:src/graph-profiles/registry.ts:validateGraphProfileRegistry -->

校验图谱注册表：条目 schema、profile 文件可读性与 SHA-256 匹配、图谱 schema 解析，并调用能力注册表校验引用的能力。
类型：函数  
复杂度：复杂  
入边数：1  
标签：registry、validation、integrity、graph-profiles  
所属文件：[src/graph-profiles/registry.ts](../../../../files/src/graph-profiles/registry.ts.md)
源码：[src/graph-profiles/registry.ts:86](../../../../../../src/graph-profiles/registry.ts#L86)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [buildPresetGraphProfileRegistry](../../../../files/src/arsu-converter/workflow/generate.ts.md) | src/arsu-converter/workflow/generate.ts:15–26 | 由 AUTHORED_GRAPH_PROFILES 构造并 schema 校验预设图谱注册表，逐条写入 profile 哈希。 |

## 调用

该符号没有记录对外调用。
