
# src/cli/command-catalog.ts
所属分层：[CLI 命令入口层](../../../layers/cli.md)  
所属目录：[src/cli](../../../modules/src/cli.md)
<!-- node: file:src/cli/command-catalog.ts -->

CLI 命令目录 SSOT：声明 16 个顶层命令与 5 个 plugin 子命令的语法、分组、工作区要求、读写影响与选项，并据此注册 Commander 命令与帮助文本。
源码：[src/cli/command-catalog.ts](../../../../../src/cli/command-catalog.ts)

## 符号（5）
<!-- node: function:src/cli/command-catalog.ts:applyGlobalCliOptions -->
<!-- node: function:src/cli/command-catalog.ts:cliHelpTarget -->
<!-- node: function:src/cli/command-catalog.ts:getCliCommandDefinition -->
<!-- node: function:src/cli/command-catalog.ts:registerCliCommand -->
<!-- node: function:src/cli/command-catalog.ts:renderCliPayloadHelp -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| applyGlobalCliOptions | 函数 | 190–195 | 简单 | cli、options、registration、utility | 1 | 把全局选项目录挂到根命令上。 |
| cliHelpTarget | 函数 | 197–203 | 简单 | help、cli、parsing、ux | 1 | 从原始 argv 中剥离选项值，定位最长匹配的子命令并给出精确的 help 提示目标。 |
| getCliCommandDefinition | 函数 | 152–156 | 简单 | accessor、command-catalog、validation、utility | 0 | 按 ID 取出命令定义，未知 ID 立即抛错。 |
| registerCliCommand | 函数 | 158–174 | 中等 | cli、commander、registration、help | 1 | 依据目录定义注册 Commander 子命令，包括必填标记、自定义参数解析器与 payload 帮助文本。 |
| renderCliPayloadHelp | 函数 | 176–188 | 中等 | help、rendering、documentation、payload | 1 | 把 payload 定义渲染为帮助文本：输入概览、运行时 schema、字段清单与约束。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [payload-catalog.ts](payload-catalog.ts.md) | src/cli/payload-catalog.ts | CLI payload 目录 SSOT：为每个命令声明输入形态、字段、约束与运行时 schema 引用，供帮助文本与 Agent 手册复用。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.test.ts](../../tests/adapters.test.ts.md) | tests/adapters.test.ts | 验证 36 个工具与 28 个命令包装器的注册表完整性、每工具路径约定、Companion 四个自包含 Skill 的渲染，以及 Navigate 单一入口在各交付模式下的投影。 |
| [command-renderer.ts](../adapters/command-renderer.ts.md) | src/adapters/command-renderer.ts | 把唯一的 Navigate 命令包装内容按各宿主要求的 command 格式渲染为可落地文件，同时给出旧版 CLI 命令 ID 供遗留清理识别。 |
| [education-agent-skills-audit.test.ts](../../tests/education-agent-skills-audit.test.ts.md) | tests/education-agent-skills-audit.test.ts | 锁定 Education Agent Skills 的干净快照身份，校验 241 个跟踪文件清点、frontmatter 解析、证据与许可及关系 schema 的未决状态，以及由 JSON 确定性派生的审计报告。 |
| [graph-cli-static.test.ts](../../tests/graph-cli-static.test.ts.md) | tests/graph-cli-static.test.ts | 静态断言 CLI 仍暴露全部 16 个公开命令，并校验 help 目标解析不被裁剪。 |
| [handbook.ts](handbook.ts.md) | src/cli/handbook.ts | 从 CLI 命令目录与控制选择器家族派生出 CLI 手册的 Markdown、MDX 命令页与侧边栏，是 CLI 参考文档的 canonical renderer。 |
| [main.ts](main.ts.md) | src/cli/main.ts | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| applyGlobalCliOptions | 函数 | 190–195 | 把全局选项目录挂到根命令上。 |
| cliHelpTarget | 函数 | 197–203 | 从原始 argv 中剥离选项值，定位最长匹配的子命令并给出精确的 help 提示目标。 |
| getCliCommandDefinition | 函数 | 152–156 | 按 ID 取出命令定义，未知 ID 立即抛错。 |
| registerCliCommand | 函数 | 158–174 | 依据目录定义注册 Commander 子命令，包括必填标记、自定义参数解析器与 payload 帮助文本。 |
| renderCliPayloadHelp | 函数 | 176–188 | 把 payload 定义渲染为帮助文本：输入概览、运行时 schema、字段清单与约束。 |
