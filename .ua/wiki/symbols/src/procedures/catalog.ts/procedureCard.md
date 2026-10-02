
# procedureCard
<!-- node: function:src/procedures/catalog.ts:procedureCard -->

把完整 Procedure 定义压缩为紧凑卡片，仅保留选择器、类别、模式、领域与 profile 归属等发现期所需字段。
类型：函数  
复杂度：简单  
入边数：2  
标签：procedures、compact、progressive-disclosure、serialization  
所属文件：[src/procedures/catalog.ts](../../../../files/src/procedures/catalog.ts.md)
源码：[src/procedures/catalog.ts:134](../../../../../../src/procedures/catalog.ts#L134)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphShow](../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:71–108 | 按 procedure/profile/run/node/change 选择器输出单个精确对象的完整内容。 |
| [searchProcedures](../../../../files/src/procedures/catalog.ts.md) | src/procedures/catalog.ts:148–155 | 按查询词对 Procedure 目录做排序检索，返回匹配的卡片列表，支持按领域与 profile 归属加权。 |

## 调用

该符号没有记录对外调用。
