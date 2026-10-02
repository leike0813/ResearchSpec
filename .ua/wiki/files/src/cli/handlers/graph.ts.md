
# src/cli/handlers/graph.ts
所属分层：[CLI 命令入口层](../../../../layers/cli.md)  
所属目录：[src/cli/handlers](../../../../modules/src/cli/handlers.md)
<!-- node: file:src/cli/handlers/graph.ts -->

图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。
源码：[src/cli/handlers/graph.ts](../../../../../../src/cli/handlers/graph.ts)

## 符号（8）
<!-- node: function:src/cli/handlers/graph.ts:diagnosticMatchesTarget -->
<!-- node: function:src/cli/handlers/graph.ts:handleGraphAdvance -->
<!-- node: function:src/cli/handlers/graph.ts:handleGraphCheck -->
<!-- node: function:src/cli/handlers/graph.ts:handleGraphDecide -->
<!-- node: function:src/cli/handlers/graph.ts:handleGraphDoctor -->
<!-- node: function:src/cli/handlers/graph.ts:handleGraphInstructions -->
<!-- node: function:src/cli/handlers/graph.ts:handleGraphStart -->
<!-- node: function:src/cli/handlers/graph.ts:handleGraphStatus -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| diagnosticMatchesTarget | 函数 | 541–553 | 中等 | diagnostics、filtering、utility | 0 | 按目标标识匹配诊断条目路径，支持 check 命令的定点过滤。 |
| handleGraphAdvance | 函数 | 483–504 | 中等 | cli、graph-advance、mutation | 0 | 处理节点提交：要求 actor 名称后调用 submitGraphNode 落盘节点产出。 |
| handleGraphCheck | 函数 | 506–526 | 中等 | cli、diagnostics、check | 0 | 按 strict 与 target 过滤工作区诊断并汇总退出状态。 |
| handleGraphDecide | 函数 | 448–481 | 中等 | cli、gate、decision、override | 0 | 处理 Gate 与 Decision 记录：按选项路由到 recordGraphGate、recordGraphDecision 或 overrideGraphGate。 |
| handleGraphDoctor | 函数 | 528–539 | 中等 | cli、diagnostics、doctor | 0 | 汇总工作区、插件域与能力注册表的可用性诊断，作为 doctor 命令输出。 |
| handleGraphInstructions | 函数 | 143–409 | 复杂 | cli、instructions、routing、procedures | 0 | 生成节点级 instructions：解析选择器、渲染 ARSU 路由与 Procedure 目录、检查项目入口安装与 review-workspace 交接指引。 |
| handleGraphStart | 函数 | 411–446 | 中等 | cli、graph-start、confirmation | 0 | 处理启动命令：要求人工确认人，调用 startGraphRun 创建冻结运行，支持 dry-run 预演。 |
| handleGraphStatus | 函数 | 67–141 | 复杂 | cli、read-only、graph-status | 0 | 只读输出图谱运行状态：工作区校验、运行索引、插件状态视图与当前 frontier 摘要。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-manifest.ts](../../core/contracts/capability-manifest.ts.md) | src/core/contracts/capability-manifest.ts | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |
| [catalog.ts](../../arsu-converter/routing/catalog.ts.md) | src/arsu-converter/routing/catalog.ts | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |
| [catalog.ts](../../procedures/catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [contracts.ts](../../arsu-converter/routing/contracts.ts.md) | src/arsu-converter/routing/contracts.ts | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |
| [graph-check.ts](../../plugins/graph-check.ts.md) | src/plugins/graph-check.ts | 对工作区已选插件域做只读体检：域可用性、已投影文件哈希与能力清单一致性，全部收敛为结构化 Diagnostic。 |
| [graph-discover.ts](../../core/workspace/graph-discover.ts.md) | src/core/workspace/graph-discover.ts | 图工作区发现：在向上查找基础上提供 require 变体，把缺失、旧格式与非法路径直接转为异常。 |
| [graph-run.ts](../../core/runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-status.ts](../../plugins/graph-status.ts.md) | src/plugins/graph-status.ts | 为 graph 工作区汇总插件状态视图：已选、可用、已投影域以及已解析与已投影的 capability/profile ID，注册表加载失败时降级为错误信息。 |
| [graph-workspace-index.ts](../../core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [instructions.ts](../../review-workspace/instructions.ts.md) | src/review-workspace/instructions.ts | 按 profile 或 capability 决定是否提供本地静态评审面：返回描述符/结果契约名、包内页面与 workbench 路径、评审阶段映射和给 Agent 的操作指引。 |
| [packet.ts](../../procedures/packet.ts.md) | src/procedures/packet.ts | 构造 schema `"1"` 的 Procedure 激活包：携带正文摘要、包内知识资源、输入输出、权限边界与推荐执行 Agent 画像。 |
| [project-entry.ts](../../adapters/project-entry.ts.md) | src/adapters/project-entry.ts | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [projection.ts](../../arsu-converter/routing/projection.ts.md) | src/arsu-converter/routing/projection.ts | 路由语义的文本投影层：把 Skill、路由、前置条件组渲染为 SKILL.md frontmatter description 与命令描述，并校验 frontmatter 中的 name 与 Skill ID 一致后改写 description。 |
| [registry.ts](../../capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [runtime-capabilities.ts](../../plugins/runtime-capabilities.ts.md) | src/plugins/runtime-capabilities.ts | 按工作区已选插件域把扩展能力合并进基础能力注册表，产出运行时统一视图并保持能力 ID 有序。 |
| [types.ts](../../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |
| [types.ts](../types.ts.md) | src/cli/types.ts | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-cli.test.ts](../../../tests/graph-cli.test.ts.md) | tests/graph-cli.test.ts | 图谱 CLI 集成测试：在 schema 2 工作区上验证 status/check/doctor 只读路径，以及 start → instructions → advance 的节点闭环。 |
| [main.ts](../main.ts.md) | src/cli/main.ts | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| diagnosticMatchesTarget | 函数 | 541–553 | 按目标标识匹配诊断条目路径，支持 check 命令的定点过滤。 |
| handleGraphAdvance | 函数 | 483–504 | 处理节点提交：要求 actor 名称后调用 submitGraphNode 落盘节点产出。 |
| handleGraphCheck | 函数 | 506–526 | 按 strict 与 target 过滤工作区诊断并汇总退出状态。 |
| handleGraphDecide | 函数 | 448–481 | 处理 Gate 与 Decision 记录：按选项路由到 recordGraphGate、recordGraphDecision 或 overrideGraphGate。 |
| handleGraphDoctor | 函数 | 528–539 | 汇总工作区、插件域与能力注册表的可用性诊断，作为 doctor 命令输出。 |
| handleGraphInstructions | 函数 | 143–409 | 生成节点级 instructions：解析选择器、渲染 ARSU 路由与 Procedure 目录、检查项目入口安装与 review-workspace 交接指引。 |
| handleGraphStart | 函数 | 411–446 | 处理启动命令：要求人工确认人，调用 startGraphRun 创建冻结运行，支持 dry-run 预演。 |
| handleGraphStatus | 函数 | 67–141 | 只读输出图谱运行状态：工作区校验、运行索引、插件状态视图与当前 frontier 摘要。 |
