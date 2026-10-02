
# src/core/contracts/capability-graph.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/contracts](../../../../modules/src/core/contracts.md)
<!-- node: file:src/core/contracts/capability-graph.ts -->

能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。
源码：[src/core/contracts/capability-graph.ts](../../../../../../src/core/contracts/capability-graph.ts)

## 符号（4）
<!-- node: function:src/core/contracts/capability-graph.ts:findUnreachableGraphNodes -->
<!-- node: function:src/core/contracts/capability-graph.ts:parseCapabilityGraphProfile -->
<!-- node: function:src/core/contracts/capability-graph.ts:unique -->
<!-- node: function:src/core/contracts/capability-graph.ts:validateGraphCapabilityReferences -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| findUnreachableGraphNodes | 函数 | 295–331 | 中等 | graph-profile、reachability、diagnostics | 0 | 从入口节点沿 prerequisites 与 Decision 解锁关系做可达性遍历，返回不可达节点 ID 列表。 |
| parseCapabilityGraphProfile | 函数 | 267–269 | 中等 | contract、parser、graph-profile | 0 | 能力图谱 profile 的解析入口，委托 CapabilityGraphProfileSchema 做完整校验。 |
| unique | 函数 | 234–247 | 中等 | contract、validation、deduplication | 0 | 对对象数组按 key 去重，重复项以带路径的 Zod issue 报告。 |
| validateGraphCapabilityReferences | 函数 | 279–293 | 中等 | graph-profile、validation、diagnostics | 1 | 检查图谱各节点的 capability_id 是否在给定能力 ID 集合内，返回结构化诊断。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [stable-specs.ts](stable-specs.ts.md) | src/core/contracts/stable-specs.ts | 稳定 spec 契约：project / sources / claims / manuscript 四类 spec 的 Zod schema、StableId 命名规则与 YAML frontmatter 解析入口。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic-paper-reviewer.ts](../../arsu-converter/workflow/graph-profiles/academic-paper-reviewer.ts.md) | src/arsu-converter/workflow/graph-profiles/academic-paper-reviewer.ts | 同行评审图谱预设：panel 产出评审组配置后，specialist 与 da 并行评审，再汇入 editorial 判断与 review synthesis 汇总裁决。 |
| [academic-paper.ts](../../arsu-converter/workflow/graph-profiles/academic-paper.ts.md) | src/arsu-converter/workflow/graph-profiles/academic-paper.ts | 论文写作图谱预设：intake → structure → argument → draft → cite-check → paper-gate → abstract 的主链，并提供独立可入口的 format 渲染节点。 |
| [academic-pipeline.ts](../../arsu-converter/workflow/graph-profiles/academic-pipeline.ts.md) | src/arsu-converter/workflow/graph-profiles/academic-pipeline.ts | 端到端学术流水线图谱预设：以 subgraph 节点绑定 research-main 子图，另提供 mid-entry 入口、评审与修订重评审回路，以及 format、final-integrity 交付尾段。 |
| [capability-graph.test.ts](../../../tests/capability-graph.test.ts.md) | tests/capability-graph.test.ts | 图谱契约测试：验证最小无环图谱通过、未知能力引用被诊断、重复节点 ID、repeatable 轮次角色约束、node_output 绑定来源要求、不可达节点诊断与修订轮模板选项解析。 |
| [capability-registry.test.ts](../../../tests/capability-registry.test.ts.md) | tests/capability-registry.test.ts | 能力注册表测试：验证全部内置能力包可加载且为 operational 目录名，并覆盖 ID/路径不匹配、重复 ID、manifest 与 knowledge 哈希不符、未知 schema 引用、ARS 溯源缺失及图谱输入准入诊断。 |
| [extensions.ts](../../plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [graph-run-advanced.test.ts](../../../tests/graph-run-advanced.test.ts.md) | tests/graph-run-advanced.test.ts | 图谱运行高级测试：覆盖 mid-entry 只暴露确认入口节点、子图绑定与父角色校验、父绑定子运行创建、运行完成判定、修订轮次独立节点文件与 node_output 显式 from_role 解析。 |
| [graph-run.ts](../runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-workspace-index.ts](../runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [graph-workspace.ts](../../../tests/helpers/graph-workspace.ts.md) | tests/helpers/graph-workspace.ts | 图谱测试夹具库：提供最小图谱样例、schema 2 基础工作区与运行目录的落盘助手，以及按图谱合成能力 manifest 的测试注册表。 |
| [graph-workspace.ts](graph-workspace.ts.md) | src/core/contracts/graph-workspace.ts | schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。 |
| [index.ts](../../arsu-converter/workflow/graph-profiles/index.ts.md) | src/arsu-converter/workflow/graph-profiles/index.ts | 图谱预设 barrel：汇总 7 个 authored 图谱对象及其 YAML 投影，按 profile_id 排序后统一导出。 |
| [minimal.ts](../../arsu-converter/workflow/graph-profiles/minimal.ts.md) | src/arsu-converter/workflow/graph-profiles/minimal.ts | 最小图谱预设：复用 research-main 的节点集合但移除 rq-gate，节点 ID 收敛为 rq，入口路由指向 deep-research:quick。 |
| [paper-humanizer.test.ts](../../../tests/paper-humanizer.test.ts.md) | tests/paper-humanizer.test.ts | paper-humanizer 测试：验证提取索引对固定 vendor 的哈希绑定、能力包已创作并注册、图谱可对内置注册表解析，以及 authoring 幂等与 Reference-mode 入口存在。 |
| [paper-humanizer.ts](../../arsu-converter/workflow/graph-profiles/paper-humanizer.ts.md) | src/arsu-converter/workflow/graph-profiles/paper-humanizer.ts | 论文人性化润色图谱预设：review 节点产出评审报告与修订计划，经 plan-gate 与 plan-decision 确认后进入按轮次执行的修订阶段。 |
| [preset-graphs.test.ts](../../../tests/preset-graphs.test.ts.md) | tests/preset-graphs.test.ts | 预设图谱测试：验证 research-main 预设可解析且节点全部可达、Gate 与前置绑定正确，converter 自有注册表与打包投影一致，minimal/writing/reviewer/pipeline 预设保留声明的 handoff 物化交接。 |
| [registry.ts](../../capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [registry.ts](../../graph-profiles/registry.ts.md) | src/graph-profiles/registry.ts | 图谱配置注册表层：加载并校验 skills/arsu/profiles/registry.json，逐个比对 profile 文件 SHA-256，并交叉验证图谱引用的能力在能力注册表中存在。 |
| [research-main.ts](../../arsu-converter/workflow/graph-profiles/research-main.ts.md) | src/arsu-converter/workflow/graph-profiles/research-main.ts | 研究主链图谱预设：research-question → rq-gate → methodology → literature → grading → synthesis → report 的线性研究流程，Gate 绑定在方法学与文献节点上。 |
| [review-response.test.ts](../../../tests/review-response.test.ts.md) | tests/review-response.test.ts | review-response 测试：验证能力包已创作注册、图谱解析并声明修订回路、运行可经轮次 Decision 推进至完成，以及 handoff 物化出 revision-master 工作台资源、authoring 幂等。 |
| [review-response.ts](../../arsu-converter/workflow/graph-profiles/review-response.ts.md) | src/arsu-converter/workflow/graph-profiles/review-response.ts | 审稿回复图谱预设：解析稿件与评审意见、原子化评论并生成整体工作板，再按修订轮模板循环执行修订与响应，直至 Decision 选定退出。 |
| [validators.ts](../../capabilities/validators.ts.md) | src/capabilities/validators.ts | 能力校验器执行层：按 manifest 声明依次运行 policy 与 script 校验器；script 校验器在临时目录写入 submission.json 后按 argv 模板执行，网络型校验器失败降级为 degraded 而非 pass。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| findUnreachableGraphNodes | 函数 | 295–331 | 从入口节点沿 prerequisites 与 Decision 解锁关系做可达性遍历，返回不可达节点 ID 列表。 |
| parseCapabilityGraphProfile | 函数 | 267–269 | 能力图谱 profile 的解析入口，委托 CapabilityGraphProfileSchema 做完整校验。 |
| unique | 函数 | 234–247 | 对对象数组按 key 去重，重复项以带路径的 Zod issue 报告。 |
| validateGraphCapabilityReferences | 函数 | 279–293 | 检查图谱各节点的 capability_id 是否在给定能力 ID 集合内，返回结构化诊断。 |
