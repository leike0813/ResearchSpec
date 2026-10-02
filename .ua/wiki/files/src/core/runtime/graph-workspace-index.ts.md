
# src/core/runtime/graph-workspace-index.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/runtime](../../../../modules/src/core/runtime.md)
<!-- node: file:src/core/runtime/graph-workspace-index.ts -->

schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。
源码：[src/core/runtime/graph-workspace-index.ts](../../../../../../src/core/runtime/graph-workspace-index.ts)

## 符号（8）
<!-- node: function:src/core/runtime/graph-workspace-index.ts:inspectGraphWorkspaceFormat -->
<!-- node: function:src/core/runtime/graph-workspace-index.ts:loadGraphWorkspaceIndex -->
<!-- node: function:src/core/runtime/graph-workspace-index.ts:scanChanges -->
<!-- node: function:src/core/runtime/graph-workspace-index.ts:scanGraphProfiles -->
<!-- node: function:src/core/runtime/graph-workspace-index.ts:scanNodes -->
<!-- node: function:src/core/runtime/graph-workspace-index.ts:scanRuns -->
<!-- node: function:src/core/runtime/graph-workspace-index.ts:validateParentBindings -->
<!-- node: function:src/core/runtime/graph-workspace-index.ts:validateProfileSubgraphs -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [inspectGraphWorkspaceFormat](../../../../symbols/src/core/runtime/graph-workspace-index.ts/inspectGraphWorkspaceFormat.md) | 函数 | 105–116 | 简单 | inspection、workspace、read-only、format-check | 4 | 只读检查 config.yaml 是否存在、为常规文件且符合 schema 2，返回 current 与原因。 |
| [loadGraphWorkspaceIndex](../../../../symbols/src/core/runtime/graph-workspace-index.ts/loadGraphWorkspaceIndex.md) | 函数 | 118–197 | 复杂 | index、workspace、validation、orchestration | 13 | 构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。 |
| scanChanges | 函数 | 425–461 | 中等 | scanner、project-change、validation、workspace | 1 | 扫描活动与已归档的项目变更目录，限制包内文档集合并解析 change frontmatter。 |
| [scanGraphProfiles](../../../../symbols/src/core/runtime/graph-workspace-index.ts/scanGraphProfiles.md) | 函数 | 199–231 | 中等 | scanner、profiles、validation、workspace | 2 | 扫描 profiles 目录中的 YAML profile，检测重复 profile_id 并在无有效 profile 时报错。 |
| scanNodes | 函数 | 388–423 | 中等 | scanner、nodes、validation、runs | 1 | 扫描 run 的节点实例文件，检测 run_id 不匹配、同 run 内节点实例重复与冻结图未声明节点。 |
| [scanRuns](../../../../symbols/src/core/runtime/graph-workspace-index.ts/scanRuns.md) | 函数 | 277–358 | 复杂 | scanner、runs、validation、hashing | 2 | 扫描每个 run 目录的 run/graph/handoff 与节点，并交叉校验目录名、冻结图哈希、profile 身份与 entry 声明。 |
| validateParentBindings | 函数 | 360–386 | 中等 | validation、runs、subgraph、consistency | 0 | 校验子 run 的父绑定唯一性、父 run 存在性、subgraph 节点匹配与 profile 声明一致性。 |
| validateProfileSubgraphs | 函数 | 233–275 | 复杂 | validation、profiles、subgraph、cycle-detection | 0 | 校验子图 profile 绑定（存在性、版本、entry 暴露）并用 DFS 检测子图引用环。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [graph-workspace.ts](../contracts/graph-workspace.ts.md) | src/core/contracts/graph-workspace.ts | schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。 |
| [installations.ts](../../adapters/installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [managed-target.ts](../../adapters/managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [path-boundary.ts](../workspace/path-boundary.ts.md) | src/core/workspace/path-boundary.ts | 路径边界守卫：要求 root 与 target 都是绝对路径、目标不逃逸根目录，并逐级 lstat 拒绝路径中的符号链接与非目录祖先。 |
| [types.ts](../validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |
| [write-plan.ts](../workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-validators.test.ts](../../../tests/capability-validators.test.ts.md) | tests/capability-validators.test.ts | 校验器执行测试：覆盖 script 校验器通过与失败、网络校验器降级为 degraded 而非 pass、未知 policy 与未解析 schema 校验器 fail-closed，以及 submitGraphNode 触发注册表声明的校验器。 |
| [discover.ts](../workspace/discover.ts.md) | src/core/workspace/discover.ts | 从显式路径或逐级向上查找最近的 schema 2 researchspec 工作区，返回可辨识的解析结果。 |
| [graph-bootstrap.ts](../../cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [graph-check.ts](../../plugins/graph-check.ts.md) | src/plugins/graph-check.ts | 对工作区已选插件域做只读体检：域可用性、已投影文件哈希与能力清单一致性，全部收敛为结构化 Diagnostic。 |
| [graph-context-cli.test.ts](../../../tests/graph-context-cli.test.ts.md) | tests/graph-context-cli.test.ts | 覆盖 graph list 与 show、procedure 的全局发现与工作区激活、instructions 的有界契约、游标稳定性、插件安装确认、propose/decide/archive 变更流程以及 pack 与 handoff 输出。 |
| [graph-context.ts](../../cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [graph-delivery.ts](../../plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [graph-discover.ts](../workspace/graph-discover.ts.md) | src/core/workspace/graph-discover.ts | 图工作区发现：在向上查找基础上提供 require 变体，把缺失、旧格式与非法路径直接转为异常。 |
| [graph-plugins.ts](../../cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts | plugin 子命令组处理器：列出、查看、安装、卸载与刷新领域 Skill 插件，安装要求显式领域 ID 与非交互下的 --yes 确认。 |
| [graph-run-advanced.test.ts](../../../tests/graph-run-advanced.test.ts.md) | tests/graph-run-advanced.test.ts | 图谱运行高级测试：覆盖 mid-entry 只暴露确认入口节点、子图绑定与父角色校验、父绑定子运行创建、运行完成判定、修订轮次独立节点文件与 node_output 显式 from_role 解析。 |
| [graph-run-conflict.test.ts](../../../tests/graph-run-conflict.test.ts.md) | tests/graph-run-conflict.test.ts | 图谱运行冲突测试：验证扫描后出现的节点文件、扫描后被改动的节点文件、歧义重复节点实例均被拒绝，以及失败 Gate 的 override 记录在所属 Gate 内并解锁下游。 |
| [graph-run.test.ts](../../../tests/graph-run.test.ts.md) | tests/graph-run.test.ts | 图谱运行主路径测试：验证运行创建的确定性与冻结图谱、dry-run 不落盘、frontier 随提交推进、乱序提交被拒、Gate/Decision 阻塞下游、图谱文本漂移后哈希稳定与缺失绑定输入的 fail-closed。 |
| [graph-run.ts](graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-security.test.ts](../../../tests/graph-security.test.ts.md) | tests/graph-security.test.ts | 验证安全边界：非法项目路径与符号链接组件被拒绝，无效安装清单在任何读取前阻断全部投影写操作，符号链接父目录下的投影不改动目标。 |
| [graph-status.ts](../../plugins/graph-status.ts.md) | src/plugins/graph-status.ts | 为 graph 工作区汇总插件状态视图：已选、可用、已投影域以及已解析与已投影的 capability/profile ID，注册表加载失败时降级为错误信息。 |
| [graph-workspace.test.ts](../../../tests/graph-workspace.test.ts.md) | tests/graph-workspace.test.ts | 图谱工作区索引测试：验证 schema 2 接受、schema 1 拒绝，空工作区加载，运行/冻结图谱/节点/handoff 扫描，以及冻结图谱哈希不符与未知、重复节点实例的诊断。 |
| [graph-workspace.ts](../../../tests/helpers/graph-workspace.ts.md) | tests/helpers/graph-workspace.ts | 图谱测试夹具库：提供最小图谱样例、schema 2 基础工作区与运行目录的落盘助手，以及按图谱合成能力 manifest 的测试注册表。 |
| [graph.ts](../../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [review-response.test.ts](../../../tests/review-response.test.ts.md) | tests/review-response.test.ts | review-response 测试：验证能力包已创作注册、图谱解析并声明修订回路、运行可经轮次 Decision 推进至完成，以及 handoff 物化出 revision-master 工作台资源、authoring 幂等。 |
| [runtime-capabilities.ts](../../plugins/runtime-capabilities.ts.md) | src/plugins/runtime-capabilities.ts | 按工作区已选插件域把扩展能力合并进基础能力注册表，产出运行时统一视图并保持能力 ID 有序。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [inspectGraphWorkspaceFormat](../../../../symbols/src/core/runtime/graph-workspace-index.ts/inspectGraphWorkspaceFormat.md) | 函数 | 105–116 | 只读检查 config.yaml 是否存在、为常规文件且符合 schema 2，返回 current 与原因。 |
| [loadGraphWorkspaceIndex](../../../../symbols/src/core/runtime/graph-workspace-index.ts/loadGraphWorkspaceIndex.md) | 函数 | 118–197 | 构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。 |
