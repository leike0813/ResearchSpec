
# src/arsu-converter/routing
> 目录聚合页：5 个文件、12 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/routing/catalog.ts](../../../files/src/arsu-converter/routing/catalog.ts.md) | 文件 | 2 | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |
| [src/arsu-converter/routing/contracts.ts](../../../files/src/arsu-converter/routing/contracts.ts.md) | 文件 | 1 | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |
| [src/arsu-converter/routing/navigation-projection.ts](../../../files/src/arsu-converter/routing/navigation-projection.ts.md) | 文件 | 1 | 把路由目录投影为 Navigate 可见的 Markdown「目录派生路由参考」章节，为每个 Skill 输出意图、near-miss 与一张路由语义表，并显式声明这些语义不等于运行时选择器或工作区可用性。 |
| [src/arsu-converter/routing/owners.ts](../../../files/src/arsu-converter/routing/owners.ts.md) | 文件 | 3 | ARSU 路由归属判定的极小实现：从 routeRef 取出 owner 并判断该路由是否由独立 profile 拥有，当前独立路由集合为空。 |
| [src/arsu-converter/routing/projection.ts](../../../files/src/arsu-converter/routing/projection.ts.md) | 文件 | 5 | 路由语义的文本投影层：把 Skill、路由、前置条件组渲染为 SKILL.md frontmatter description 与命令描述，并校验 frontmatter 中的 name 与 Skill ID 一致后改写 description。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/arsu-converter/workflow](workflow.md) | 1 |
