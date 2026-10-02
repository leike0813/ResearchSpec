
# src/core/workspace/discover.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/workspace](../../../../modules/src/core/workspace.md)
<!-- node: file:src/core/workspace/discover.ts -->

从显式路径或逐级向上查找最近的 schema 2 researchspec 工作区，返回可辨识的解析结果。
源码：[src/core/workspace/discover.ts](../../../../../../src/core/workspace/discover.ts)

## 符号（2）
<!-- node: function:src/core/workspace/discover.ts:discoverWorkspace -->
<!-- node: function:src/core/workspace/discover.ts:resolveWorkspace -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| discoverWorkspace | 函数 | 37–40 | 简单 | discovery、utility、read-only、wrapper | 0 | resolveWorkspace 的宽松包装，仅在找到时返回路径。 |
| resolveWorkspace | 函数 | 12–35 | 中等 | discovery、path-resolution、workspace、read-only | 1 | 优先使用显式工作区，否则逐级向上寻找 researchspec 目录并按格式返回 found/unsupported。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [fs.ts](../../utils/fs.ts.md) | src/utils/fs.ts | 三个薄文件系统辅助：存在性判断、目录判断与可选文本读取，只把 ENOENT 视为正常缺失，其余错误照常抛出。 |
| [graph-workspace-index.ts](../runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| discoverWorkspace | 函数 | 37–40 | resolveWorkspace 的宽松包装，仅在找到时返回路径。 |
| resolveWorkspace | 函数 | 12–35 | 优先使用显式工作区，否则逐级向上寻找 researchspec 目录并按格式返回 found/unsupported。 |
