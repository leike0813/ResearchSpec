
# src/adapters/command-renderer.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/adapters](../../../modules/src/adapters.md)
<!-- node: file:src/adapters/command-renderer.ts -->

把唯一的 Navigate 命令包装内容按各宿主要求的 command 格式渲染为可落地文件，同时给出旧版 CLI 命令 ID 供遗留清理识别。
源码：[src/adapters/command-renderer.ts](../../../../../src/adapters/command-renderer.ts)

## 符号（1）
<!-- node: function:src/adapters/command-renderer.ts:renderCommand -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [renderCommand](../../../symbols/src/adapters/command-renderer.ts/renderCommand.md) | 函数 | 32–56 | 中等 | renderer、host-adapter、format-adapter、commands | 2 | 按宿主 command format 渲染命令包装文件，处理参数占位符、冒号替换与各格式 frontmatter 差异。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [command-catalog.ts](../cli/command-catalog.ts.md) | src/cli/command-catalog.ts | CLI 命令目录 SSOT：声明 16 个顶层命令与 5 个 plugin 子命令的语法、分组、工作区要求、读写影响与选项，并据此注册 Commander 命令与帮助文本。 |
| [navigate.ts](companion/workflows/navigate.ts.md) | src/adapters/companion/workflows/navigate.ts | 唯一用户可见入口 Navigate 的执行指引：定义何时需要正式图工作流、standalone 与 graph 两种模式的差异，以及文献来源策略的投影方式。 |
| [shared-guidance.ts](companion/shared-guidance.ts.md) | src/adapters/companion/shared-guidance.ts | 所有 Companion Skill 共享的 CLI 纪律正文，覆盖文件归属、行动前阅读、人权确认边界、命令行为与失败处理表格。 |
| [tools.ts](tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.test.ts](../../tests/adapters.test.ts.md) | tests/adapters.test.ts | 验证 36 个工具与 28 个命令包装器的注册表完整性、每工具路径约定、Companion 四个自包含 Skill 的渲染，以及 Navigate 单一入口在各交付模式下的投影。 |
| [delivery.ts](delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [legacy-reconciliation.ts](legacy-reconciliation.ts.md) | src/adapters/legacy-reconciliation.ts | 规划对旧宿主 Skill 目录与过时命令包装的安全清理：仅删除内容与已知 ResearchSpec 字节完全一致的树，其余一律保留并给出诊断。 |
| [managed-target.ts](managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [renderCommand](../../../symbols/src/adapters/command-renderer.ts/renderCommand.md) | 函数 | 32–56 | 按宿主 command format 渲染命令包装文件，处理参数占位符、冒号替换与各格式 frontmatter 差异。 |
