
# src/licensing.ts
所属分层：[核心契约与工作流运行时](../../layers/core.md)  
所属目录：[src](../../modules/src.md)
<!-- node: file:src/licensing.ts -->

提供项目版权声明与 MIT 许可证正文的单一来源，供各 Skill 包在渲染 LICENSE 文件时引用。
源码：[src/licensing.ts](../../../../src/licensing.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../harness/catalog.ts.md) | harness/catalog.ts | 维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。 |
| [render.ts](adapters/companion/render.ts.md) | src/adapters/companion/render.ts | 把 Companion 意图渲染成可安装的 Skill 包：生成带 frontmatter 的 SKILL.md、LICENSE，并在 Navigate 情形附加 ARSU 路由与 CLI 手册两份渐进式参考。 |
