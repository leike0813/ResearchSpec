
# src/core/contracts/workspace-format.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/contracts](../../../../modules/src/core/contracts.md)
<!-- node: file:src/core/contracts/workspace-format.ts -->

工作区格式版本常量与 config.yaml schema 定义，锁定当前 schema 版本号与 WorkspaceFormatKind 判定类型。
源码：[src/core/contracts/workspace-format.ts](../../../../../../src/core/contracts/workspace-format.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [project-change.ts](project-change.ts.md) | src/core/contracts/project-change.ts | 项目变更契约：变更 frontmatter 状态机（draft → accepted/rejected/deferred/superseded → applied）与 sources/claims 增量操作记录的 Zod 定义。 |
| [stable-specs.ts](stable-specs.ts.md) | src/core/contracts/stable-specs.ts | 稳定 spec 契约：project / sources / claims / manuscript 四类 spec 的 Zod schema、StableId 命名规则与 YAML frontmatter 解析入口。 |
