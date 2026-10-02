
# src/cli/handlers
> 目录聚合页：4 个文件、26 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/cli/handlers/graph-bootstrap.ts](../../../files/src/cli/handlers/graph-bootstrap.ts.md) | 文件 | 5 | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [src/cli/handlers/graph-context.ts](../../../files/src/cli/handlers/graph-context.ts.md) | 文件 | 8 | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [src/cli/handlers/graph-plugins.ts](../../../files/src/cli/handlers/graph-plugins.ts.md) | 文件 | 5 | plugin 子命令组处理器：列出、查看、安装、卸载与刷新领域 Skill 插件，安装要求显式领域 ID 与非交互下的 --yes 确认。 |
| [src/cli/handlers/graph.ts](../../../files/src/cli/handlers/graph.ts.md) | 文件 | 8 | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/plugins](../plugins.md) | 8 |
| [src/core/runtime](../core/runtime.md) | 6 |
| [src/core/workspace](../core/workspace.md) | 6 |
| [src/adapters](../adapters.md) | 5 |
| [src/cli](../cli.md) | 4 |
| [src/arsu-converter/routing](../arsu-converter/routing.md) | 3 |
| [src/core/contracts](../core/contracts.md) | 3 |
| [src/procedures](../procedures.md) | 3 |
| [src/capabilities](../capabilities.md) | 1 |
| [src/cli/prompts](prompts.md) | 1 |
| [src/core/validation](../core/validation.md) | 1 |
| [src/literature-adapters](../literature-adapters.md) | 1 |
| [src/review-workspace](../review-workspace.md) | 1 |
| [src/utils](../utils.md) | 1 |
