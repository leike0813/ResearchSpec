# ResearchSpec 与 ARSU 核心运行模型

本文档组面向维护 ResearchSpec 核心、ARSU 转换层和运行时控制面的开发者。它回答一个贯穿全项目的问题：当用户通过宿主 Agent 调用 ARSU Skill 时，谁决定做什么、谁生产学术内容、谁能改变运行状态，以及这些事实如何被保存并在下一次会话中恢复。

本文档组描述当前已发布的双模式运行时。新 workspace 默认使用 adaptive runtime；Schema `0.2` 的 `arsu-v0-1` workflow graph 作为 strict compatibility runtime 保留。它不是未来路线图，也不把历史 OpenSpec change 或上游 ARS 的静态流程叙述当成当前运行权威。

## 阅读顺序

1. [核心运行模型](core_runtime_model.md)：先建立宏观架构、权威边界和双层 OpenSpec 模型。
2. [运行时协议](runtime_protocols.md)：理解共用入口及两种 runtime 的分流。
3. [Adaptive protocol](adaptive_runtime_protocol.md)：默认 runtime 的 obligation、evidence、Gate、completion 与 case action。
4. [Strict compatibility protocol](strict_runtime_protocol.md)：Schema `0.2` graph 的 work、transition、parallel/join、Passport 与 revision round。
5. [Deep Research](deep_research_workflow.md)、[Academic Paper](academic_paper_workflow.md)、[Academic Paper Reviewer](academic_paper_reviewer_workflow.md)：分别理解三个 standalone Skill 的内层 agent 编排，以及两种外层控制投影。
6. [Academic Pipeline](academic_pipeline_workflow.md)：区分 adaptive route 和 strict pipeline graph。
7. [当前实现发现](current_state_findings.md)：查看文档漂移、两层模型之间的张力和当前验证能力边界。

如果只需要一幅总图，先看[系统架构图](diagrams/rendered/system-architecture.svg)；如果正在调试某次运行，直接阅读[运行时协议](runtime_protocols.md)。

## 一句话模型

> ResearchSpec CLI 是文件化工作流的确定性控制面；ARSU Skills 是学术语义生产者；宿主 Agent 按 CLI 返回的 action availability、descriptor 与 `next_selectors` 调用 Skill、组织人机确认，但不能自行发明或推进运行状态。

## 三种容易混淆的“流程”

| 名称 | 负责什么 | 是否为运行权威 |
| --- | --- | --- |
| Adaptive profile | route、持久化 hard obligation、accepted evidence、formal policy、completion criterion、case action 与 soft playbook | 是，默认 |
| Strict compatibility profile | subflow、work item、parallel/join、formal Gate、Decision 分支和 transition | 是，仅 Schema `0.2` compatibility |
| ARSU Skill workflow | 学术 agent、phase、检查点、写作或评审方法 | 否；它是语义执行程序 |
| 宿主 Agent 对话 | 路由解释、上下文组织、Skill 调用、用户确认和错误说明 | 否；它消费 CLI 权威 |

ARSU 内部可以称某一步为 checkpoint、state 或 stage，但它们本身不会进入 ResearchSpec authority。CLI 才会持久化 adaptive 的 obligation、attempt、accepted evidence、Gate、completion 与 case action，或 strict 的 graph state、work receipt、Gate、Decision 与 transition。

## 术语

| 术语 | 本文含义 |
| --- | --- |
| Route | 路由目录中的一个公开 ARSU 模式或 pipeline 入口，如 `academic-paper:revision` |
| Template | strict profile 中可实例化的静态子流程定义 |
| Subflow instance | 一次已经 Start 的 route 实例；strict instance 另有 stage 与 scoped graph node |
| Action availability | CLI 根据 profile 与持久化证据计算的当前合法动作集合；strict 的这一视图称 frontier |
| Action descriptor v2 | 对一个当前 selector 的 command、语义输入、CLI-derived 字段、availability basis、execution policy 与可能 next selectors 的机器可读说明 |
| Execution policy | `direct` 单次由 CLI 规划/校验/提交；`human_confirmed` 需声明的人类确认；`plan_bound` 另需 preview、plan hash 与执行确认 |
| Hard obligation | adaptive 中已持久化、带 scope 与依赖的完成约束；attempt 不会自动满足它，只有接受 evidence、case resolution 或 formal policy effect 才会改变它 |
| Accepted evidence | 经过 CLI 验证并登记、可满足对应 obligation 的 evidence；candidate 和 working material 均不等于它 |
| Candidate | ARSU 生产、尚待 CLI 登记的候选工件文件 |
| Artifact | 已由 CLI 校验路径和哈希并登记到 registry 的工件 |
| Formal Gate | profile 声明的阻塞式语义判定；须经 Verify、用户确认和 CLI 提交 |
| Advisory gate/checkpoint | Skill 内部或 route catalog 中的提示性检查；不会自动写 Gate ledger |
| Decision | 对 scope、claim、structure、branch 或 override 的显式人类选择 |
| Receipt | 一次 Start、evidence/Gate Submit、completion/Advance、case action 或 apply 事务的哈希绑定执行证据 |
| Next selectors | 成功写入返回的受限后续详情入口；优先用它们定向读取，只有需要重新选择或处理冲突时才重读完整 status |

## 事实源优先级

不存在一个覆盖所有问题的万能 SSOT。应按问题选择事实源：

| 问题 | 当前事实源 |
| --- | --- |
| 用户如何进入、确认、恢复和结束 | [`docs/arsu_user_usage_model.md`](../arsu_user_usage_model.md) |
| 产品规范 | [`openspec/specs/`](../../openspec/specs/) |
| Route 含义、前置条件、工件、风险和 cost | [`src/arsu-converter/routing/catalog.ts`](../../src/arsu-converter/routing/catalog.ts) |
| adaptive profile、strict template/DAG、Gate、completion 和 transition | [`src/arsu-converter/workflow/catalog.ts`](../../src/arsu-converter/workflow/catalog.ts) |
| selector、frontier 和事务语义 | [`src/core/runtime/`](../../src/core/runtime/) |
| Wire shape 和 schema | [`src/core/contracts/`](../../src/core/contracts/) |
| ARSU 内部 agent 与 phase | [`skills/arsu/`](../../skills/arsu/) 中四个 `SKILL.md` |
| 已安装给 Agent 的说明 | converter 生成的 Skill 与 Companion 投影 |

发生冲突时，不从 `SKILL.md` 重建外层控制。当前运行顺序以 workspace 的 `specs/workflow.yaml`、`runs/current/state.yaml` 以及 CLI `status --json`、`instructions <selector> --json` 为准；成功写入后优先按结果的 `next_selectors` 读取详情。只有 strict workspace 才从这些文件派生 stage 与 transition graph。

## 覆盖范围

本文档组覆盖：

- 4 个 ARSU Skills；
- 4 个 Companion Skills 与固定 CLI 边界；
- 25 个 standalone mode 和 2 个 pipeline entry；strict compatibility 另有 1 个内部 revision-round template；
- 17 个顶层 CLI 命令；
- 15 个固定 Skills：4 个 ARSU、4 个 Companion、7 个 Zotero Adapter；
- stable specs、run state、artifact registry、Gate/Decision ledger、receipts、contract changes 和 draft patches；
- 与核心权威边界直接相关的领域插件和 Zotero literature adapter。

领域插件的供应商审计、各类 Zotero 操作以及 ARSU 上游文件的逐项说明不在此处重复。

## 图的维护方式

`diagrams/src/` 保存 PlantUML 或 DOT 源，`diagrams/rendered/` 保存同名 SVG。PlantUML 用于组件、泳道和时序关系，DOT 用于依赖图和状态派生关系。每张图的标题必须标明 `shared`、`adaptive default` 或 `strict compatibility`；图本身不是运行权威。
