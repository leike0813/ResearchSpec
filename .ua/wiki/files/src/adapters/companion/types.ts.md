
# src/adapters/companion/types.ts
所属分层：[宿主与投递适配层](../../../../layers/adapters.md)  
所属目录：[src/adapters/companion](../../../../modules/src/adapters/companion.md)
<!-- node: file:src/adapters/companion/types.ts -->

Companion 适配层的类型定义：四个工作流 ID 联合类型、由工作流 ID 派生的 Skill ID 模板类型，以及工作流源与渲染意图的接口。
源码：[src/adapters/companion/types.ts](../../../../../../src/adapters/companion/types.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [decide.ts](workflows/decide.ts.md) | src/adapters/companion/workflows/decide.ts | Decide Companion 工作流指令源：引导人工审阅一个明确选择，并通过 `researchspec decide` 把确认结果记录进其唯一归属文件。 |
| [manifest.ts](manifest.ts.md) | src/adapters/companion/manifest.ts | 将 propose、decide、verify、navigate 四个工作流源合并为带 Skill ID 的意图清单，是 Companion Skill 注册的清单层。 |
| [navigate.ts](workflows/navigate.ts.md) | src/adapters/companion/workflows/navigate.ts | 唯一用户可见入口 Navigate 的执行指引：定义何时需要正式图工作流、standalone 与 graph 两种模式的差异，以及文献来源策略的投影方式。 |
| [propose.ts](workflows/propose.ts.md) | src/adapters/companion/workflows/propose.ts | Propose Companion 工作流指令源：把一次高影响的研究变更转成可评审、可直接编辑的项目 change 包，而不修改稳定 spec 字节。 |
| [render.ts](render.ts.md) | src/adapters/companion/render.ts | 把 Companion 意图渲染成可安装的 Skill 包：生成带 frontmatter 的 SKILL.md、LICENSE，并在 Navigate 情形附加 ARSU 路由与 CLI 手册两份渐进式参考。 |
| [verify.ts](workflows/verify.ts.md) | src/adapters/companion/workflows/verify.ts | Verify Companion 工作流指令源：独立检查当前工作状态并给出建议的 Gate 裁决，但正式裁决仍由人工经 Decide 记录。 |
