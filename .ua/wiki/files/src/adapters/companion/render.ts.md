
# src/adapters/companion/render.ts
所属分层：[宿主与投递适配层](../../../../layers/adapters.md)  
所属目录：[src/adapters/companion](../../../../modules/src/adapters/companion.md)
<!-- node: file:src/adapters/companion/render.ts -->

把 Companion 意图渲染成可安装的 Skill 包：生成带 frontmatter 的 SKILL.md、LICENSE，并在 Navigate 情形附加 ARSU 路由与 CLI 手册两份渐进式参考。
源码：[src/adapters/companion/render.ts](../../../../../../src/adapters/companion/render.ts)

## 符号（2）
<!-- node: function:src/adapters/companion/render.ts:renderCompanionSkill -->
<!-- node: function:src/adapters/companion/render.ts:renderCompanionSkillFiles -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [renderCompanionSkill](../../../../symbols/src/adapters/companion/render.ts/renderCompanionSkill.md) | 函数 | 12–26 | 简单 | companion、rendering、markdown、shared-guidance | 2 | 渲染单个 Companion Skill 的 SKILL.md 正文，拼接 YAML frontmatter、意图指令与所有 Companion 共用的 CLI 纪律指引。 |
| renderCompanionSkillFiles | 函数 | 28–37 | 简单 | companion、rendering、file-manifest、progressive-disclosure | 1 | 返回 Companion Skill 包的完整文件列表，只有 Navigate 额外携带 ARSU 路由投影与 CLI 手册两份 references。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [handbook.ts](../../cli/handbook.ts.md) | src/cli/handbook.ts | 从 CLI 命令目录与控制选择器家族派生出 CLI 手册的 Markdown、MDX 命令页与侧边栏，是 CLI 参考文档的 canonical renderer。 |
| [licensing.ts](../../licensing.ts.md) | src/licensing.ts | 提供项目版权声明与 MIT 许可证正文的单一来源，供各 Skill 包在渲染 LICENSE 文件时引用。 |
| [navigation-projection.ts](../../arsu-converter/routing/navigation-projection.ts.md) | src/arsu-converter/routing/navigation-projection.ts | 把路由目录投影为 Navigate 可见的 Markdown「目录派生路由参考」章节，为每个 Skill 输出意图、near-miss 与一张路由语义表，并显式声明这些语义不等于运行时选择器或工作区可用性。 |
| [shared-guidance.ts](shared-guidance.ts.md) | src/adapters/companion/shared-guidance.ts | 所有 Companion Skill 共享的 CLI 纪律正文，覆盖文件归属、行动前阅读、人权确认边界、命令行为与失败处理表格。 |
| [types.ts](types.ts.md) | src/adapters/companion/types.ts | Companion 适配层的类型定义：四个工作流 ID 联合类型、由工作流 ID 派生的 Skill ID 模板类型，以及工作流源与渲染意图的接口。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [renderCompanionSkill](../../../../symbols/src/adapters/companion/render.ts/renderCompanionSkill.md) | 函数 | 12–26 | 渲染单个 Companion Skill 的 SKILL.md 正文，拼接 YAML frontmatter、意图指令与所有 Companion 共用的 CLI 纪律指引。 |
| renderCompanionSkillFiles | 函数 | 28–37 | 返回 Companion Skill 包的完整文件列表，只有 Navigate 额外携带 ARSU 路由投影与 CLI 手册两份 references。 |
