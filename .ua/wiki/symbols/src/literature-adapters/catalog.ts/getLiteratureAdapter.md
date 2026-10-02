
# getLiteratureAdapter
<!-- node: function:src/literature-adapters/catalog.ts:getLiteratureAdapter -->

按 Adapter ID 从目录中取出单个文献 Adapter 定义，ID 不存在时抛出明确错误。
类型：函数  
复杂度：简单  
入边数：3  
标签：literature-adapter、lookup、error-handling  
所属文件：[src/literature-adapters/catalog.ts](../../../../files/src/literature-adapters/catalog.ts.md)
源码：[src/literature-adapters/catalog.ts:136](../../../../../../src/literature-adapters/catalog.ts#L136)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [agentNamespaceId](../../../../files/src/adapters/managed-target.ts.md) | src/adapters/managed-target.ts:186–214 | 从各来源类型中取出并校验 Skill 命名空间 ID，Adapter Skill 还需在目录中已登记。 |
| [resolveLiteratureTarget](../../../../files/src/adapters/managed-target.ts.md) | src/adapters/managed-target.ts:155–184 | 推导文献 Adapter 的 runtime、profile 模板与 Windows shim 目标，运行时资产须匹配目录中登记的平台。 |
| [desiredLiteratureAdapters](../../../../files/src/literature-adapters/catalog.ts.md) | src/literature-adapters/catalog.ts:157–161 | 返回工作区期望的 Adapter 定义列表，先校验选择表达式再从目录解析出完整定义。 |

## 调用

该符号没有记录对外调用。
