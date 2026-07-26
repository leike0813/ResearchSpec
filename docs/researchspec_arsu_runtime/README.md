# ResearchSpec 与 ARSU 核心运行模型

本文档组面向维护 ResearchSpec 核心、ARSU 转换层和运行时控制面的开发者。它回答一个贯穿全项目的问题：当用户通过宿主 Agent 调用 ARSU Skill 时，谁决定做什么、谁生产学术内容、谁能改变运行状态，以及这些事实如何被保存并在下一次会话中恢复。

本文档描述 2026-07-20 仓库中的 current state。它不是未来路线图，也不把历史 OpenSpec change 或上游 ARS 的静态流程叙述当成当前运行权威。

## 阅读顺序

1. [核心运行模型](core_runtime_model.md)：先建立宏观架构、权威边界和双层 OpenSpec 模型。
2. [运行时协议](runtime_protocols.md)：理解 `status → instructions → start/submit/advance → status` 如何真正落盘。
3. [Deep Research](deep_research_workflow.md)、[Academic Paper](academic_paper_workflow.md)、[Academic Paper Reviewer](academic_paper_reviewer_workflow.md)：分别理解三个 standalone Skill 的内层 agent 编排和外层 route/profile。
4. [Academic Pipeline](academic_pipeline_workflow.md)：理解跨 Skill 调度、mid-entry、formal Gate 和动态 revision round。
5. [当前实现发现](current_state_findings.md)：查看文档漂移、两层模型之间的张力和当前验证能力边界。

如果只需要一幅总图，先看[系统架构图](diagrams/rendered/system-architecture.svg)；如果正在调试某次运行，直接阅读[运行时协议](runtime_protocols.md)。

## 一句话模型

> ResearchSpec CLI 是文件化工作流的确定性控制面；ARSU Skills 是学术语义生产者；宿主 Agent 按 CLI 返回的 frontier 调用 Skill、组织人机确认，但不能自行发明或推进运行状态。

## 三种容易混淆的“流程”

| 名称 | 负责什么 | 是否为运行权威 |
| --- | --- | --- |
| ResearchSpec workflow profile | subflow、work item、parallel/join、formal Gate、Decision 分支和 transition | 是 |
| ARSU Skill workflow | 学术 agent、phase、检查点、写作或评审方法 | 否；它是语义执行程序 |
| 宿主 Agent 对话 | 路由解释、上下文组织、Skill 调用、用户确认和错误说明 | 否；它消费 CLI 权威 |

ARSU 内部可以称某一步为 checkpoint、state 或 stage，但只有 workflow profile 中的 Gate、Decision 和 transition 会进入 ResearchSpec 的账本与状态文件。

## 术语

| 术语 | 本文含义 |
| --- | --- |
| Route | 路由目录中的一个公开 ARSU 模式或 pipeline 入口，如 `academic-paper:revision` |
| Template | workflow profile 中可实例化的静态子流程定义 |
| Subflow instance | 一次已经 Start 的模板实例，拥有独立 stage 和 scoped selector |
| Frontier | CLI 根据 profile 与持久化证据实时计算出的当前合法动作集合 |
| Candidate | ARSU 生产、尚待 CLI 登记的候选工件文件 |
| Artifact | 已由 CLI 校验路径和哈希并登记到 registry 的工件 |
| Formal Gate | profile 声明的阻塞式语义判定；须经 Verify、用户确认和 CLI 提交 |
| Advisory gate/checkpoint | Skill 内部或 route catalog 中的提示性检查；不会自动写 Gate ledger |
| Decision | 对 scope、claim、structure、branch 或 override 的显式人类选择 |
| Receipt | 一次 Start、Submit、Advance 或 apply 事务的哈希绑定执行证据 |

## 事实源优先级

不存在一个覆盖所有问题的万能 SSOT。应按问题选择事实源：

| 问题 | 当前事实源 |
| --- | --- |
| 用户如何进入、确认、恢复和结束 | [`docs/arsu_user_usage_model.md`](../arsu_user_usage_model.md) |
| 产品规范 | [`openspec/specs/`](../../openspec/specs/) |
| Route 含义、前置条件、工件、风险和 cost | [`src/arsu-converter/routing/catalog.ts`](../../src/arsu-converter/routing/catalog.ts) |
| 可执行 template、artifact DAG、Gate 和 transition | [`src/arsu-converter/workflow/catalog.ts`](../../src/arsu-converter/workflow/catalog.ts) |
| selector、frontier 和事务语义 | [`src/core/runtime/`](../../src/core/runtime/) |
| Wire shape 和 schema | [`src/core/contracts/`](../../src/core/contracts/) |
| ARSU 内部 agent 与 phase | [`skills/arsu/`](../../skills/arsu/) 中四个 `SKILL.md` |
| 已安装给 Agent 的说明 | converter 生成的 Skill 与 Companion 投影 |

发生冲突时，不从 `SKILL.md` 重建外层 stage、Gate 或 transition。当前运行顺序以 workspace 的 `specs/workflow.yaml`、`runs/current/state.yaml` 以及 CLI `status --json`、`instructions <selector> --json` 为准。

## 覆盖范围

本文档组覆盖：

- 4 个 ARSU Skills；
- 4 个 Companion Skills 与固定 CLI 边界；
- 25 个 standalone mode、2 个 pipeline entry 和 1 个内部 revision-round template；
- 16 个顶层 CLI 命令；
- stable specs、run state、artifact registry、Gate/Decision ledger、receipts、contract changes 和 draft patches；
- 与核心权威边界直接相关的领域插件和 Zotero literature adapter。

领域插件的供应商审计、各类 Zotero 操作以及 ARSU 上游文件的逐项说明不在此处重复。

## 图的维护方式

`diagrams/src/` 保存 PlantUML 或 DOT 源，`diagrams/rendered/` 保存同名 SVG。PlantUML 用于组件、泳道和时序关系，DOT 用于依赖图和状态派生关系。图中复制的 route/profile 事实均在图注中指向上述 converter-owned catalog；图本身不是运行权威。
