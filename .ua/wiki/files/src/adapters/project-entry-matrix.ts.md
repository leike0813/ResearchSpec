
# src/adapters/project-entry-matrix.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/adapters](../../../modules/src/adapters.md)
<!-- node: file:src/adapters/project-entry-matrix.ts -->

从工具目录渲染《Agent 项目入口矩阵》Markdown 表格，逐宿主列出入口机制、路径、官方文档依据与限制。
源码：[src/adapters/project-entry-matrix.ts](../../../../../src/adapters/project-entry-matrix.ts)

## 符号（1）
<!-- node: function:src/adapters/project-entry-matrix.ts:renderProjectEntryMatrix -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| renderProjectEntryMatrix | 函数 | 3–19 | 简单 | renderer、markdown、documentation、host-matrix | 0 | 把工具目录中的入口机制、路径、文档依据与限制渲染为中文 Markdown 表格。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [tools.ts](tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| renderProjectEntryMatrix | 函数 | 3–19 | 把工具目录中的入口机制、路径、文档依据与限制渲染为中文 Markdown 表格。 |
