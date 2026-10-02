
# validateCapabilityRegistry
<!-- node: function:src/capabilities/registry.ts:validateCapabilityRegistry -->

逐条校验注册表：schema、ID 唯一性、manifest 哈希与 schema、SKILL.md 存在且非空、knowledge 资源哈希、schema 引用与 ARS 溯源制品。
类型：函数  
复杂度：复杂  
入边数：1  
标签：registry、validation、integrity、hashing  
所属文件：[src/capabilities/registry.ts](../../../../files/src/capabilities/registry.ts.md)
源码：[src/capabilities/registry.ts:99](../../../../../../src/capabilities/registry.ts#L99)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadCapabilityRegistry](loadCapabilityRegistry.md) | src/capabilities/registry.ts:85–97 | 读取能力根目录下的 registry.json 并转交校验；读取失败时抛出 unreadable 诊断。 |

## 调用

该符号没有记录对外调用。
