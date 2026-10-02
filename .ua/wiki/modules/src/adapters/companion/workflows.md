
# src/adapters/companion/workflows
> 目录聚合页：4 个文件、1 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/adapters/companion/workflows/decide.ts](../../../../files/src/adapters/companion/workflows/decide.ts.md) | 文件 | 0 | Decide Companion 工作流指令源：引导人工审阅一个明确选择，并通过 `researchspec decide` 把确认结果记录进其唯一归属文件。 |
| [src/adapters/companion/workflows/navigate.ts](../../../../files/src/adapters/companion/workflows/navigate.ts.md) | 文件 | 1 | 唯一用户可见入口 Navigate 的执行指引：定义何时需要正式图工作流、standalone 与 graph 两种模式的差异，以及文献来源策略的投影方式。 |
| [src/adapters/companion/workflows/propose.ts](../../../../files/src/adapters/companion/workflows/propose.ts.md) | 文件 | 0 | Propose Companion 工作流指令源：把一次高影响的研究变更转成可评审、可直接编辑的项目 change 包，而不修改稳定 spec 字节。 |
| [src/adapters/companion/workflows/verify.ts](../../../../files/src/adapters/companion/workflows/verify.ts.md) | 文件 | 0 | Verify Companion 工作流指令源：独立检查当前工作状态并给出建议的 Gate 裁决，但正式裁决仍由人工经 Decide 记录。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/adapters/companion](../companion.md) | 4 |
| [src/literature-adapters](../../literature-adapters.md) | 1 |
