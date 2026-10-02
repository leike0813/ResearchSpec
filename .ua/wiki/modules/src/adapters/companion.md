
# src/adapters/companion
> 目录聚合页：5 个文件、2 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/adapters/companion/index.ts](../../../files/src/adapters/companion/index.ts.md) | 文件 | 0 | Companion 适配层的 barrel 入口，汇总四个 Companion 工作流意图与两个 Skill 渲染函数供上层直接引用。 |
| [src/adapters/companion/manifest.ts](../../../files/src/adapters/companion/manifest.ts.md) | 文件 | 0 | 将 propose、decide、verify、navigate 四个工作流源合并为带 Skill ID 的意图清单，是 Companion Skill 注册的清单层。 |
| [src/adapters/companion/render.ts](../../../files/src/adapters/companion/render.ts.md) | 文件 | 2 | 把 Companion 意图渲染成可安装的 Skill 包：生成带 frontmatter 的 SKILL.md、LICENSE，并在 Navigate 情形附加 ARSU 路由与 CLI 手册两份渐进式参考。 |
| [src/adapters/companion/shared-guidance.ts](../../../files/src/adapters/companion/shared-guidance.ts.md) | 文件 | 0 | 所有 Companion Skill 共享的 CLI 纪律正文，覆盖文件归属、行动前阅读、人权确认边界、命令行为与失败处理表格。 |
| [src/adapters/companion/types.ts](../../../files/src/adapters/companion/types.ts.md) | 文件 | 0 | Companion 适配层的类型定义：四个工作流 ID 联合类型、由工作流 ID 派生的 Skill ID 模板类型，以及工作流源与渲染意图的接口。 |

## 子目录
- [workflows](companion/workflows.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/adapters/companion/workflows](companion/workflows.md) | 4 |
| [src](../../src.md) | 1 |
| [src/arsu-converter/routing](../arsu-converter/routing.md) | 1 |
| [src/cli](../cli.md) | 1 |
