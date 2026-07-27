# 核心运行与逻辑模型

![Shared：ResearchSpec 与 ARSU 的双模式架构](diagrams/rendered/system-architecture.svg)

## 1. 共享权威边界

ResearchSpec CLI 是文件化控制面；ARSU Skills 生产研究、写作、评审和修改语义；宿主 Agent 解释当前 instructions、调用 Skill 并组织人类确认。CLI 不调用模型，Skill 也不直接写 `state.yaml`、artifact registry、Gate/Decision ledger、attempt ledger 或 receipt。

稳定 specs 描述研究意图和约束；registry 记录已接受 artifacts；ledgers 记录 Gate/Decision；receipts 绑定事务输入和执行；change 与 draft patch 保持 current/proposed 分离。`revision_patch` 必须经 patch lifecycle 应用，不能由 producer 覆盖 base draft。

## 2. 默认 adaptive 与 strict compatibility

| 维度 | Adaptive default | Strict compatibility |
| --- | --- | --- |
| 控制单位 | route、hard obligation、accepted evidence、Gate、completion、case action | template、stage、work、Gate、transition |
| 顺序 | 仅 declared hard edge；soft playbook 只建议 | profile 声明 DAG、parallel/join、parent/child graph |
| Pipeline | route obligations，不承诺 stage graph | end-to-end/mid-entry parent graph 与 revision round |
| Passport | 不支持 import | confirmed mid-entry 中以非权威 evidence 导入 |
| 选择 | 新 workspace 默认 | `--profile strict` 或既有 Schema `0.2` workspace |

两者都要求以 `status` 和 `instructions` 取得当前行动许可。CLI 始终在当前读前置条件下规划、校验并以 receipt-first 写入 authority；外部执行边界由 action descriptor 的 policy 决定，并投影为 `execution_requirements`。`direct` 可单次执行，`human_confirmed` 需要声明的人类确认，`plan_bound` 要求 preview、匹配的 action basis、plan hash 和执行确认。formal Gate 始终需要用户确认；scope、claim、structure、branch 与 override 则使用明确 Decision。

## 3. Agent 与风险边界

Companion 负责路由、提议、决策和验证的人机流程；plugin 与 Zotero Adapter 只能向当前 ARSU producer 提供有界材料。它们不创建 workflow authority、不会因为安装成功而改变 frontier，也不替代私有文献库状态。

Action v2 descriptor 是运行时的风险边界：执行者必须消费当前 selector、availability、basis、语义输入槽和 execution policy，而不是从静态 Skill 或旧会话猜测顺序。成功写入返回 `next_selectors`；调用者优先进行定向读取，只有需要重新选择路线、处理冲突或缺少下一 selector 时才刷新完整 status。

`doctor` 默认只读，按 `healthy`、`retry_existing_transaction`、`deterministically_repairable`、`requires_human_reconstruction` 或 `conflicting_evidence` 分类。它同时检查 receipt→authority 与 authority→receipt/state。新 adaptive 写入使用 receipt v2，保存 action identity、规范化语义输入、完整读前置条件和 authority target；中断事务只能按原 plan 精确补齐缺失阶段。receipt v1 保持可读，信息不足时报告 `requires_human_reconstruction`，不迁移也不猜测。确定性 repair 仍属于 `plan_bound`，先写 repair receipt、再替换 authority 并 post-check。strict-to-adaptive migration同样只经 plan、backup、receipt 与 rollback 进行。

## 4. 双层 OpenSpec

![Shared：仓库治理与研究运行的两个 OpenSpec 风格层次](diagrams/rendered/two-level-openspec-model.svg)

仓库的 OpenSpec change 改变 ResearchSpec 软件；用户 research change 改变其 stable research contracts。两层都采用 current/proposed separation，但彼此不能替代。
