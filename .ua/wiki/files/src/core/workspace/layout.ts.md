
# src/core/workspace/layout.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/workspace](../../../../modules/src/core/workspace.md)
<!-- node: file:src/core/workspace/layout.ts -->

定义 schema "2" 工作区的目录骨架与模板文件（config.yaml、工具安装清单、specs 下的 project/sources/claims/manuscript），并把模板转换为可创建的目录与文件条目。
源码：[src/core/workspace/layout.ts](../../../../../../src/core/workspace/layout.ts)

## 符号（2）
<!-- node: function:src/core/workspace/layout.ts:getWorkspaceEntries -->
<!-- node: function:src/core/workspace/layout.ts:resolveInitTarget -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| getWorkspaceEntries | 函数 | 99–109 | 简单 | workspace-contract、template、factory | 0 | 把必需目录与模板转换为带绝对路径、初始内容和覆盖策略的工作区条目列表。 |
| resolveInitTarget | 函数 | 94–97 | 简单 | workspace-contract、path-resolution、initialization | 0 | 把 init 的输入路径解析为工作区根目录，目录名已是 researchspec 时直接复用，否则追加该子目录。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-bootstrap.ts](../../cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| getWorkspaceEntries | 函数 | 99–109 | 把必需目录与模板转换为带绝对路径、初始内容和覆盖策略的工作区条目列表。 |
| resolveInitTarget | 函数 | 94–97 | 把 init 的输入路径解析为工作区根目录，目录名已是 researchspec 时直接复用，否则追加该子目录。 |
