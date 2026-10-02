
# src/cli/handlers/graph-context.ts
所属分层：[CLI 命令入口层](../../../../layers/cli.md)  
所属目录：[src/cli/handlers](../../../../modules/src/cli/handlers.md)
<!-- node: file:src/cli/handlers/graph-context.ts -->

list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。
源码：[src/cli/handlers/graph-context.ts](../../../../../../src/cli/handlers/graph-context.ts)

## 符号（8）
<!-- node: function:src/cli/handlers/graph-context.ts:handleGraphArchive -->
<!-- node: function:src/cli/handlers/graph-context.ts:handleGraphChangeDecision -->
<!-- node: function:src/cli/handlers/graph-context.ts:handleGraphHandoff -->
<!-- node: function:src/cli/handlers/graph-context.ts:handleGraphList -->
<!-- node: function:src/cli/handlers/graph-context.ts:handleGraphPack -->
<!-- node: function:src/cli/handlers/graph-context.ts:handleGraphPropose -->
<!-- node: function:src/cli/handlers/graph-context.ts:handleGraphShow -->
<!-- node: function:src/cli/handlers/graph-context.ts:selectPackFiles -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| handleGraphArchive | 函数 | 176–188 | 简单 | cli-handler、project-change、governance、write | 0 | 校验变更状态可归档后把目录移动到 changes/archive 之下。 |
| handleGraphChangeDecision | 函数 | 190–203 | 中等 | cli-handler、decision、governance、human-confirmation | 0 | 记录项目变更的人类决定（接受/拒绝/推迟/取代），只改 frontmatter，不触碰稳定 spec。 |
| handleGraphHandoff | 函数 | 110–135 | 中等 | cli-handler、handoff、conditional-write、graph | 0 | 无 --input 时渲染当前 run handoff，否则按语义输入改写并交由 run 写入层提交。 |
| handleGraphList | 函数 | 28–69 | 复杂 | cli-handler、inspection、pagination、listing | 0 | 列出 procedures、tools、profiles、runs、nodes、changes 或 diagnostics，支持词法查询与基于集合指纹的分页游标。 |
| handleGraphPack | 函数 | 137–156 | 中等 | cli-handler、pack、determinism、export | 0 | 按 scope 选取文件并生成确定性 ZIP 上下文包，已存在输出需 --force 才覆盖。 |
| handleGraphPropose | 函数 | 158–174 | 中等 | cli-handler、project-change、governance、write | 0 | 创建项目变更目录与 change.md，按 --with 生成 design/tasks/delta 支撑文档。 |
| handleGraphShow | 函数 | 71–108 | 中等 | cli-handler、inspection、selector、read-only | 0 | 按 procedure/profile/run/node/change 选择器输出单个精确对象的完整内容。 |
| selectPackFiles | 函数 | 205–230 | 中等 | selection、pack、filtering、workspace | 0 | 按 all/specs/profiles/runs/changes 或 run:/change: 前缀从索引中筛选可打包文件。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../../procedures/catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [graph-discover.ts](../../core/workspace/graph-discover.ts.md) | src/core/workspace/graph-discover.ts | 图工作区发现：在向上查找基础上提供 require 变体，把缺失、旧格式与非法路径直接转为异常。 |
| [graph-run.ts](../../core/runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-workspace-index.ts](../../core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [graph-workspace.ts](../../core/contracts/graph-workspace.ts.md) | src/core/contracts/graph-workspace.ts | schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。 |
| [tools.ts](../../adapters/tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [types.ts](../types.ts.md) | src/cli/types.ts | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [main.ts](../main.ts.md) | src/cli/main.ts | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| handleGraphArchive | 函数 | 176–188 | 校验变更状态可归档后把目录移动到 changes/archive 之下。 |
| handleGraphChangeDecision | 函数 | 190–203 | 记录项目变更的人类决定（接受/拒绝/推迟/取代），只改 frontmatter，不触碰稳定 spec。 |
| handleGraphHandoff | 函数 | 110–135 | 无 --input 时渲染当前 run handoff，否则按语义输入改写并交由 run 写入层提交。 |
| handleGraphList | 函数 | 28–69 | 列出 procedures、tools、profiles、runs、nodes、changes 或 diagnostics，支持词法查询与基于集合指纹的分页游标。 |
| handleGraphPack | 函数 | 137–156 | 按 scope 选取文件并生成确定性 ZIP 上下文包，已存在输出需 --force 才覆盖。 |
| handleGraphPropose | 函数 | 158–174 | 创建项目变更目录与 change.md，按 --with 生成 design/tasks/delta 支撑文档。 |
| handleGraphShow | 函数 | 71–108 | 按 procedure/profile/run/node/change 选择器输出单个精确对象的完整内容。 |
