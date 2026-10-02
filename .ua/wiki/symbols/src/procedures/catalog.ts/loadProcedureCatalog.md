
# loadProcedureCatalog
<!-- node: function:src/procedures/catalog.ts:loadProcedureCatalog -->

并行装载核心能力、图 profile 与插件扩展，再叠加 ARSU 路由与 Companion 工作流，构建 Procedure ID 到定义的映射。
类型：函数  
复杂度：复杂  
入边数：2  
标签：procedures、loading、registry、aggregation、async  
所属文件：[src/procedures/catalog.ts](../../../../files/src/procedures/catalog.ts.md)
源码：[src/procedures/catalog.ts:42](../../../../../../src/procedures/catalog.ts#L42)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadProcedures](../../../../files/harness/catalog.ts.md) | harness/catalog.ts:249–296 | 从 Procedure 目录读取所有隐藏 Procedure，区分 ARSU、Companion、核心能力与插件四类族并展开其包内文件清单。 |
| [handleGraphList](../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:28–69 | 列出 procedures、tools、profiles、runs、nodes、changes 或 diagnostics，支持词法查询与基于集合指纹的分页游标。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderCompanionSkill](../../adapters/companion/render.ts/renderCompanionSkill.md) | src/adapters/companion/render.ts:12–26 | 渲染单个 Companion Skill 的 SKILL.md 正文，拼接 YAML frontmatter、意图指令与所有 Companion 共用的 CLI 纪律指引。 |
