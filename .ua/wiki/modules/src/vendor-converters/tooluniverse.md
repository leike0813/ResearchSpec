
# src/vendor-converters/tooluniverse
> 目录聚合页：4 个文件、18 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/vendor-converters/tooluniverse/cli.ts](../../../files/src/vendor-converters/tooluniverse/cli.ts.md) | 文件 | 1 | ToolUniverse 转换器的命令行薄封装，向上游定位仓库根后分派 convert / check / idempotence 三个子命令。 |
| [src/vendor-converters/tooluniverse/converter.ts](../../../files/src/vendor-converters/tooluniverse/converter.ts.md) | 文件 | 7 | ToolUniverse vendor 转换器主体：按审计与依赖决策生成 130 个已评审 Skill 的 bundle、manifest 与转换报告，并提供输出校验与幂等性检查。 |
| [src/vendor-converters/tooluniverse/dependency-decisions.json](../../../files/src/vendor-converters/tooluniverse/dependency-decisions.json.md) | 配置 | 0 | ToolUniverse 130 个已审 Skill 之间的依赖与路由决定清单：每条关系带 relation 类型与指向上游 SKILL.md 具体行号的证据片段。 |
| [src/vendor-converters/tooluniverse/semantic-adaptations.ts](../../../files/src/vendor-converters/tooluniverse/semantic-adaptations.ts.md) | 文件 | 10 | ToolUniverse 已评审内容的语义适配规则集：修补 v1.3.1 到 v1.5.4 之间的工具契约漂移，按工具族、文件或 Skill 精确作用域生效。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/plugins](../plugins.md) | 2 |
| [src/vendor-converters/shared](shared.md) | 2 |
| [src/core/workspace](../core/workspace.md) | 1 |
