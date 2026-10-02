
# src/core/workspace/templates.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/workspace](../../../../modules/src/core/workspace.md)
<!-- node: file:src/core/workspace/templates.ts -->

工作区布局常量的 barrel 出口，把 getWorkspaceEntries 与各类文件名、必需目录清单统一再导出。
源码：[src/core/workspace/templates.ts](../../../../../../src/core/workspace/templates.ts)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [layout.ts](layout.ts.md) | src/core/workspace/layout.ts | 定义 schema "2" 工作区的目录骨架与模板文件（config.yaml、工具安装清单、specs 下的 project/sources/claims/manuscript），并把模板转换为可创建的目录与文件条目。 |
