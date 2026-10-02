
# src/adapters/companion/shared-guidance.ts
所属分层：[宿主与投递适配层](../../../../layers/adapters.md)  
所属目录：[src/adapters/companion](../../../../modules/src/adapters/companion.md)
<!-- node: file:src/adapters/companion/shared-guidance.ts -->

所有 Companion Skill 共享的 CLI 纪律正文，覆盖文件归属、行动前阅读、人权确认边界、命令行为与失败处理表格。
源码：[src/adapters/companion/shared-guidance.ts](../../../../../../src/adapters/companion/shared-guidance.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [command-renderer.ts](../command-renderer.ts.md) | src/adapters/command-renderer.ts | 把唯一的 Navigate 命令包装内容按各宿主要求的 command 格式渲染为可落地文件，同时给出旧版 CLI 命令 ID 供遗留清理识别。 |
| [render.ts](render.ts.md) | src/adapters/companion/render.ts | 把 Companion 意图渲染成可安装的 Skill 包：生成带 frontmatter 的 SKILL.md、LICENSE，并在 Navigate 情形附加 ARSU 路由与 CLI 手册两份渐进式参考。 |
