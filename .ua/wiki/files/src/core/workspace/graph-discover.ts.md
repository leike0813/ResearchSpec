
# src/core/workspace/graph-discover.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/workspace](../../../../modules/src/core/workspace.md)
<!-- node: file:src/core/workspace/graph-discover.ts -->

图工作区发现：在向上查找基础上提供 require 变体，把缺失、旧格式与非法路径直接转为异常。
源码：[src/core/workspace/graph-discover.ts](../../../../../../src/core/workspace/graph-discover.ts)

## 符号（2）
<!-- node: function:src/core/workspace/graph-discover.ts:requireGraphWorkspace -->
<!-- node: function:src/core/workspace/graph-discover.ts:resolveGraphWorkspace -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [requireGraphWorkspace](../../../../symbols/src/core/workspace/graph-discover.ts/requireGraphWorkspace.md) | 函数 | 37–43 | 简单 | discovery、error-handling、workspace、async | 7 | 在解析结果上强制要求找到当前格式工作区，否则按原因抛出不同异常。 |
| resolveGraphWorkspace | 函数 | 12–35 | 中等 | discovery、path-resolution、workspace、read-only | 1 | 图工作区解析：显式路径或逐级向上查找，区分 missing/invalid/unsupported 三种非成功态。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [fs.ts](../../utils/fs.ts.md) | src/utils/fs.ts | 三个薄文件系统辅助：存在性判断、目录判断与可选文本读取，只把 ENOENT 视为正常缺失，其余错误照常抛出。 |
| [graph-workspace-index.ts](../runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-context.ts](../../cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [graph-plugins.ts](../../cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts | plugin 子命令组处理器：列出、查看、安装、卸载与刷新领域 Skill 插件，安装要求显式领域 ID 与非交互下的 --yes 确认。 |
| [graph.ts](../../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [requireGraphWorkspace](../../../../symbols/src/core/workspace/graph-discover.ts/requireGraphWorkspace.md) | 函数 | 37–43 | 在解析结果上强制要求找到当前格式工作区，否则按原因抛出不同异常。 |
| resolveGraphWorkspace | 函数 | 12–35 | 图工作区解析：显式路径或逐级向上查找，区分 missing/invalid/unsupported 三种非成功态。 |
