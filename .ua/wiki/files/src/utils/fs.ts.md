
# src/utils/fs.ts
所属分层：[核心契约与工作流运行时](../../../layers/core.md)  
所属目录：[src/utils](../../../modules/src/utils.md)
<!-- node: file:src/utils/fs.ts -->

三个薄文件系统辅助：存在性判断、目录判断与可选文本读取，只把 ENOENT 视为正常缺失，其余错误照常抛出。
源码：[src/utils/fs.ts](../../../../../src/utils/fs.ts)

## 符号（3）
<!-- node: function:src/utils/fs.ts:fileExists -->
<!-- node: function:src/utils/fs.ts:isDirectory -->
<!-- node: function:src/utils/fs.ts:readOptionalText -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| fileExists | 函数 | 3–10 | 简单 | utility、filesystem、core-domain | 0 | 用 access 判断路径是否存在，任何失败都视为不存在。 |
| isDirectory | 函数 | 12–18 | 简单 | utility、filesystem、core-domain | 0 | 判断路径是否为目录，失败时返回 false。 |
| readOptionalText | 函数 | 20–28 | 简单 | utility、filesystem、error-handling | 0 | 以 UTF-8 读取文本，缺失返回 undefined，其余错误照常抛出。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [discover.ts](../core/workspace/discover.ts.md) | src/core/workspace/discover.ts | 从显式路径或逐级向上查找最近的 schema 2 researchspec 工作区，返回可辨识的解析结果。 |
| [graph-bootstrap.ts](../cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [graph-discover.ts](../core/workspace/graph-discover.ts.md) | src/core/workspace/graph-discover.ts | 图工作区发现：在向上查找基础上提供 require 变体，把缺失、旧格式与非法路径直接转为异常。 |
| [tools.ts](../adapters/tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| fileExists | 函数 | 3–10 | 用 access 判断路径是否存在，任何失败都视为不存在。 |
| isDirectory | 函数 | 12–18 | 判断路径是否为目录，失败时返回 false。 |
| readOptionalText | 函数 | 20–28 | 以 UTF-8 读取文本，缺失返回 undefined，其余错误照常抛出。 |
