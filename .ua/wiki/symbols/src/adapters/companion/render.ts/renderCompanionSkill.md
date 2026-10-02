
# renderCompanionSkill
<!-- node: function:src/adapters/companion/render.ts:renderCompanionSkill -->

渲染单个 Companion Skill 的 SKILL.md 正文，拼接 YAML frontmatter、意图指令与所有 Companion 共用的 CLI 纪律指引。
类型：函数  
复杂度：简单  
入边数：2  
标签：companion、rendering、markdown、shared-guidance  
所属文件：[src/adapters/companion/render.ts](../../../../../files/src/adapters/companion/render.ts.md)
源码：[src/adapters/companion/render.ts:12](../../../../../../../src/adapters/companion/render.ts#L12)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderCompanionSkillFiles](../../../../../files/src/adapters/companion/render.ts.md) | src/adapters/companion/render.ts:28–37 | 返回 Companion Skill 包的完整文件列表，只有 Navigate 额外携带 ARSU 路由投影与 CLI 手册两份 references。 |
| [loadProcedureCatalog](../../../procedures/catalog.ts/loadProcedureCatalog.md) | src/procedures/catalog.ts:42–132 | 并行装载核心能力、图 profile 与插件扩展，再叠加 ARSU 路由与 Companion 工作流，构建 Procedure ID 到定义的映射。 |

## 调用

该符号没有记录对外调用。
