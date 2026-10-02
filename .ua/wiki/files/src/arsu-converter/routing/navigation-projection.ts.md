
# src/arsu-converter/routing/navigation-projection.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/routing](../../../../modules/src/arsu-converter/routing.md)
<!-- node: file:src/arsu-converter/routing/navigation-projection.ts -->

把路由目录投影为 Navigate 可见的 Markdown「目录派生路由参考」章节，为每个 Skill 输出意图、near-miss 与一张路由语义表，并显式声明这些语义不等于运行时选择器或工作区可用性。
源码：[src/arsu-converter/routing/navigation-projection.ts](../../../../../../src/arsu-converter/routing/navigation-projection.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/routing/navigation-projection.ts:renderNavigateRoutingProjection -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| renderNavigateRoutingProjection | 函数 | 5–25 | 简单 | 投影、markdown-渲染、navigate | 1 | 把整个路由目录渲染为 Navigate 的 Markdown 路由参考章节，含每个 Skill 的摘要、意图、near-miss 以及逐路由的七列语义表。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](catalog.ts.md) | src/arsu-converter/routing/catalog.ts | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |
| [contracts.ts](contracts.ts.md) | src/arsu-converter/routing/contracts.ts | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |
| [projection.ts](projection.ts.md) | src/arsu-converter/routing/projection.ts | 路由语义的文本投影层：把 Skill、路由、前置条件组渲染为 SKILL.md frontmatter description 与命令描述，并校验 frontmatter 中的 name 与 Skill ID 一致后改写 description。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.test.ts](../../../tests/adapters.test.ts.md) | tests/adapters.test.ts | 验证 36 个工具与 28 个命令包装器的注册表完整性、每工具路径约定、Companion 四个自包含 Skill 的渲染，以及 Navigate 单一入口在各交付模式下的投影。 |
| [render.ts](../../adapters/companion/render.ts.md) | src/adapters/companion/render.ts | 把 Companion 意图渲染成可安装的 Skill 包：生成带 frontmatter 的 SKILL.md、LICENSE，并在 Navigate 情形附加 ARSU 路由与 CLI 手册两份渐进式参考。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| renderNavigateRoutingProjection | 函数 | 5–25 | 把整个路由目录渲染为 Navigate 的 Markdown 路由参考章节，含每个 Skill 的摘要、意图、near-miss 以及逐路由的七列语义表。 |
