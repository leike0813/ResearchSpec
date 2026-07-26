# Agent 流动运行模型、交互协议、恢复能力与 OpenSpec 闭环开发指引

## 文档定位

本文汇总 ResearchSpec 实际运行问题与固定 Zotero Literature Adapter 融合问题的只读调查结论，以及已经确认的产品决策。它是后续 OpenSpec change、DTO/Schema 设计、实现和验收的共同输入，不描述当前代码已经具备的能力，也不替代 `docs/arsu_user_usage_model.md` 的现行用户模型权威。

后续实现必须先通过显式 OpenSpec change 更新受影响的产品规范和用户模型，再修改代码。尤其是新增顶层命令、改变 run 生命周期、改变 draft patch 应用路径、扩展固定 Agent Skill surface 或改变文献来源策略，都不能作为孤立修补直接落地。

## 调查结论

运行协议调查发现的六个问题均成立，且具有同一个结构性根因：ResearchSpec 已经从 spec/guardrail layer 滑向细粒度 process engine。当前 CLI 将内部完整 Snapshot、严格 DTO 和预定义 workflow graph 直接暴露为 Agent 交互协议，主要围绕正常事务路径构建，没有为有界读取、最小语义输入、自适应规划、异常恢复和 proposed/current 治理闭环提供独立设计。

固定 Zotero Literature Adapter 还存在第七个相交但相对独立的问题：静态交付、用户发现、实时就绪检查、任务路由和 ARSU 文献工作之间没有形成闭环。新版 Adapter 已经提供七个职责明确的 Skills，现有 ResearchSpec 仍按两 Skill surface 和泛化的 “when available” 提示工作，导致真实的 library backend 无法成为 Agent 默认可执行的研究能力。

```text
内部完整 Snapshot / DTO
          |
          +-- 直接输出给 Agent ------ status 过大且包含重复视图
          +-- 要求 Agent 精确填写 -- payload 深嵌套且不可发现
          +-- 混合两级生命周期 ---- subflow 完成错误终结整个 run
          +-- 依赖严格加载器 ------ authority 文件损坏后无法自救
          +-- 治理对象位于旁路 ---- changes / draft-patches 不进入 frontier
          +-- 将软计划升级为权威 ---- Agent 被固定 DAG 和逐节点事务支配
          +-- 外部能力缺少闭环 ---- Adapter 已交付但不会被可靠发现和调用
```

### 1. CLI JSON 输出无界

在隔离的全新 workspace 中，`status --json` 实测为 224,507 bytes、6,199 行。完整 workflow 的紧凑 JSON 仍约为 113,745 bytes；`frontier`、`startable_subflows` 和 `subflows` 又重复表达同一批 27 个模板。

直接原因是 [`buildStatus`](../src/core/runtime/query.ts) 同时返回原始 workflow 文档和完整派生 `workflow_control`。Start 和 Submit 的成功响应还会内嵌 `workflow_control_after`，导致每次事务后的响应继续膨胀。格式压缩只能减少空白，不能消除不应出现在 status 中的静态图和重复投影。

### 2. 写入 payload 不可发现且包含大量机械字段

`submit --help` 只说明需要 strict work 或 Gate JSON，没有给出字段形状、类型、枚举、语义、最小示例或 schema 查询入口。真正的校验规则位于内部 Zod Schema，而 instructions 中的 input contract 是另一份手工投影，只有字段名，已经出现规范、实现和测试之间的漂移。

Agent 当前被要求转录的 `schema_version`、instruction basis、parent selector、dependency artifact IDs、可信 evidence、latest attempt 等字段，大多可以从 selector、workflow profile 和当前 Snapshot 唯一推导。真正需要 Agent 或用户提供的是 verdict、findings、有歧义的选择、proposal intent 等语义内容。

### 3. Subflow 和 run 生命周期被错误合并

[`planTransitionAdvance`](../src/core/runtime/gate-transition-control.ts) 在执行 `complete_subflow` 后，只要当前已经实例化的对象全部处于 `complete`、`failed` 或 `cancelled`，就把整个 run 写成 `complete`。随后 [`planSubflowStart`](../src/core/runtime/subflow-control.ts) 将该状态视为不可逆终态，拒绝启动后续 subflow。

同时，只读 workflow evaluator 仍会把满足 prerequisite 的外部模板放入 `startable_subflows`，形成同一 Snapshot 下“status 表示可以启动、Start 以 `run_terminal` 拒绝”的控制面冲突。该问题最容易在唯一 standalone/root subflow 完成后稳定复现，并非偶发的 YAML 写坏。

### 4. 已有恢复原语没有形成恢复接口

Receipts、plan hash、WritePlan read precondition、staging/rename 和 `check runtime` 已经提供部分事务完整性基础，个别 Start 路径也能识别 orphan receipt 并完成 authority commit。

但当前 `check` 只诊断，不产生结构化 repair plan；严格 Snapshot loader 一旦无法解析 `state.yaml`，多数正常命令也会因缺少 run state 或存在 blocking diagnostics 而失效。项目没有独立的容错诊断 loader、state 恢复副本、repair receipt、repair plan hash 或统一的 orphan transaction reconciliation 入口。Receipts 目前也不是能够无条件重建全部 state 字段的完整事件日志。

### 5. 科研运行层的 OpenSpec 模型没有闭环

仓库开发治理层仍以 `openspec/specs/` 和 `openspec/changes/` 管理 ResearchSpec 产品本身；脱节的是用户科研运行层。

- Public CLI 只有 contract change 的创建入口，没有创建 draft patch 的命令。
- Workspace loader 只被动扫描已经存在的 `draft-patches/*.json`。
- `academic-paper:revision` 的 `revision_patch` 被当作普通 work artifact 登记，后续 `revised_draft` 仅依赖该 artifact type。
- 静态 Academic Paper Skill 又要求将 revision patch 写入 `researchspec/draft-patches/`，与动态 profile/instructions 不一致。
- Workflow evaluator 不读取 pending changes/patches；它们不是 frontier node，也不会阻断仍以旧合同为前提的推进。
- Navigate 只在自然语言说明中提醒将高影响语义变化交给 Propose，CLI 没有可发现、可恢复的触发点。

因此，当前真实主流程绕过了 `draft-patches` lifecycle，contract changes 也只会在用户或 Agent 主动想起 Propose 时产生。

### 6. 正常执行路径本身过于繁琐、僵硬和脆弱

前五项问题并不能完整解释实际使用体验。即使所有文件都有效、所有命令都成功，当前 happy path 仍然存在过高的控制面仪式成本。

按现有 acceptance helper 推演一次不含 revision、最终 accepted 的 end-to-end pipeline，流程包含 5 次 Start、19 次 Work Submit、7 次 Gate、1 次 branch Decision 和 11 次 Advance。加上每个动作要求的 status、instructions、input 组装、dry-run 和 execute，完整协议约产生 166 至 177 次 CLI 调用，而真正需要用户进行语义确认的约为 9 次。一次 standalone full route 也通常需要数十次 CLI 调用。

因此，主要繁琐点不是人类确认过多，而是审计不变量被一比一映射成了外部 Agent 交互边界：

- Parent confirmation 已经授权 mechanical child Start，automatic submission 已经允许机械登记，unique transition 也不存在新语义选择，但 Agent 仍需逐节点完成 preview、hash binding、execute 和 status 循环。
- ARSU Skill 已经拥有研究、写作和评审的内层语义过程，ResearchSpec 又按 primary artifacts、stage、parallel/join、Gate 和 transition 建立外层 operational graph，形成双重编排。
- 只有少数 route 的 artifact graph 经过显式设计；其余多产物 route 会按 catalog 顺序机械串联。这些 hard dependencies 不能证明学术上确实要求该顺序。
- Profile 未声明并行时，Agent 不得基于实际任务自行并行；临时补证、回修上游、替换产物、跳过不适用节点和创建修复任务也没有一等运行语义。
- Run/Subflow Schema 虽然出现 waiting、blocked、failed、cancelled 等状态，但正常事务没有完整的 pause、cancel、fail、reopen、replace、waive、not-applicable 或 backtrack 路径。
- Work Submit 实际接近单赋值：同一 work 的不同 hash 会形成 conflict，无法自然表示新的 attempt、替代结果或 supersede。
- 任一 blocking Snapshot diagnostic 都会通过全局 guard 阻断 Start、Submit、Gate 和 Advance，使局部问题扩散为整个 run 的故障域。

这里必须区分三类刚性：

1. ARSU 带来的学术方法刚性，例如真实 prerequisite、角色边界、必要交付物和完整性检查；这些应保留为 outcome、obligation 和 guardrail。
2. ResearchSpec 为确定性和审计增加的内部刚性，例如 hash、receipt、plan binding、registry/ledger SSOT 和 authority write；这些应由 CLI 内部承担，不应成为 Agent 的 authoring burden。
3. 本应由 Agent 自适应却被 profile 固化的执行计划，例如推荐顺序、普通 artifact 粒度、并行方式、重试、替代和局部回修；这些默认不应成为 blocking authority。

### 7. Library Adapter 已交付，但没有进入研究主路径

固定 Zotero Literature Adapter 的当前上游 release
`host-bridge/hbrs-f9f28ddce98be3008e13bbdb` 包含七个顶层 Skills：

- `zotero-library-agent`：Zotero 宽泛任务和跨任务请求的 router；
- `zotero-library-query`、`zotero-literature-acquisition`、
  `zotero-literature-analysis`、`zotero-research-synthesis` 和
  `zotero-library-curation`：五个可独立执行的 task Skills；
- `zotero-bridge-cli`：精确命令、诊断和恢复的 mechanism Skill。

现有 ResearchSpec audit、converter、catalog、delivery 和 Agent surface
仍绑定旧的两 Skill 模型。只投影 router 和 CLI 会使 router 指向未交付的
task Skills；将七个 Skills 无差别平铺为普通入口又会放大路由噪声，并增加
Acquisition、Synthesis 和 Curation 被错误触发的风险。

Deep Research 虽然已经声明可用时优先查询 Zotero，但静态 status 只能报告
安装和投影事实，`connection_state` 没有 live readiness 语义；Navigate
不识别 Zotero-bound 请求，bibliography agent 也没有消费 Adapter task
result、检索范围、分页、外部来源 provenance、附件可用性和 coverage
限制的正式接缝。结果是 Agent 仍然容易绕过 Adapter，直接进入裸网络检索。

这里必须分开三类事实：

1. Static delivery：release、runtime、七个 Skills、hash 和 projection 是否完整；
2. Live readiness：profile、Bridge、认证以及当前 read/search/write capability 是否就绪；
3. Operation result：本次 query、acquisition、analysis 或 synthesis 的范围、完成度、证据和诊断。

Static delivery 由 ResearchSpec 离线检查。Live readiness 和 operation
result 只能在用户授权的 Adapter invocation 中获得，不得被伪装成长期有效的
ResearchSpec status 或 workflow authority。

## 已确认的产品决策

### 决策一：Run 终结必须具有显式语义

接受以下方向：

- `complete_subflow` 只改变目标 subflow instance，不得隐式终结 run。
- Standalone subflow 完成且暂时没有 active instance 时，run 仍保持可继续工作的开放状态；可以引入 `idle` / `waiting`，也可以在后续 Schema 设计中选择语义等价的表达。
- 不可逆的 `run.status = complete` 只能来自显式 run-level `complete_run` effect 或专门的 finish/finalize transaction。
- End-to-end pipeline 的最终 transition 可以声明 `complete_run`；普通 standalone completion 不得声明。
- Status 与 Start 必须复用同一个 startability 判定，不能再次出现读侧和写侧相互矛盾。

仅把规则改成“所有 root instances 终结后 complete”不满足决策，因为已经实例化的集合无法表达用户是否还会启动新的 standalone 工作。

### 决策二：Doctor 成为第十七个顶层 CLI 命令

接受通过显式 OpenSpec change 修改当前固定十六命令的产品契约，新增独立的 `doctor`，而不把修复写操作隐藏在只读语义的 `check` 中。

Doctor 的目标是恢复确定性控制面事实，不是绕过 workflow authority：

- 默认执行容错、只读诊断；即使标准 Snapshot 无法完整加载也必须能够运行。
- 诊断至少区分 `healthy`、`retry_existing_transaction`、`deterministically_repairable`、`requires_human_reconstruction` 和 `conflicting_evidence`。
- 优先建议幂等重试原始事务；只有原事务无法完成且事实可唯一推导时，才生成 repair plan。
- 修复必须支持 dry-run，返回 `plan_sha256`，使用 read hash precondition，并在非交互执行时要求匹配的 plan hash 和显式确认。
- 修复前保留原始损坏内容，写入 repair receipt；authority file 最后提交，完成后重新运行 runtime check。
- Doctor 不得猜测 active stage，不得补造 Start、Gate、Decision 或 transition evidence，不得改变 Gate verdict、选择 branch、删除冲突 ledger/receipt，或从 artifact 内容推断 scope、claim 和 workflow semantics。
- 当 receipts 和现有事实不能形成唯一、连续、无冲突的恢复链时，只能报告候选恢复范围并请求人类决策。

Doctor 不能替代正常事务韧性。后续设计仍应评估 run lifecycle projection、commit marker 或轻量 journal，使 state 能够从明确证据重建，并减少 orphan authority commit。

### 决策三：重新建立 current/proposed 核心环路

接受 ResearchSpec 继续以 OpenSpec 式 current/proposed 治理作为产品身份，并消除 `revision_patch` 与 `draft-patches/` 的双轨实现。

- Revision work 产生 canonical pending draft patch，而不是另一个语义相似的普通 artifact。
- Pending patch 必须成为可发现、可恢复的 frontier 对象。
- 用户通过 Decide 接受 patch 后，受控 apply 才生成 revised draft、apply report 和相应 receipt，并解锁后续 work。
- Base artifact/hash 漂移必须使 pending patch 进入明确的 stale/blocking 状态，不得静默套用。
- 综合、审稿或 Gate 若发现 scope、claim、structure、source policy 或 workflow semantics 已不再成立，应产生结构化 semantic-delta/proposal intent，并将相关推进转入 contract change 环路。
- Contract change 是条件触发的核心治理分支，不应强制污染每个 happy path。普通探索、措辞调整、工具选择和不改变 stable contracts 的 artifact 迭代不进入 change lifecycle。
- CLI 负责严格校验和 lifecycle 写入；Producer/Verify 负责识别并说明语义变化，脚本不得替代学术判断。

### 决策四：以 `fluid, not rigid` 为运行哲学

接受 OpenSpec 的 `fluid, not rigid` 哲学作为 ResearchSpec 运行模型的核心，并将 ResearchSpec 从细粒度 workflow scheduler 调整为 goal/obligation-based case control plane。

该决策不取消 CLI 权威，而是重新限定权威边界：

- CLI 对 contracts、hard obligations、accepted evidence、formal Gates、Decisions、proposed/current lifecycle 和受控 commit 保持权威。
- CLI 判断一个结果或状态变化能否被接受，但不垄断决定 Agent 下一步只能做什么。
- ARSU 提供学术语义方法、真实 prerequisite、质量要求和默认 playbook，不要求 ResearchSpec 将每个内层 phase 或 primary artifact 镜像为外层 blocking node。
- Agent 是硬承诺之间的自适应 planner，可以按实际研究情形排序、并行、补证、回修、重试、替换、降级或停止工作。
- Workflow/profile 默认描述 obligations、hard constraints、completion criteria 和推荐 playbook；只有经过明确论证的学术或治理依赖才成为 hard edge。
- Strict process engine 保留为用户明确选择的运行模式，适用于端到端高保证 pipeline、受监管过程或需要逐 Gate 强复现的任务；它不再是所有 standalone ARSU 工作的默认本体。
- 可审计性通过 accepted artifacts、evidence、receipts、Decisions 和执行轨迹获得，不要求事前穷举并锁死全部合法路径。

增加 optional、retry 和 dynamic node 可以作为迁移手段，但终局不应只是一个功能更多、规则更复杂的 DAG engine。目标是 case management：稳定 specs 定义目标和约束，runtime 维护未满足义务和 hard blockers，实际执行路径由 Agent 在受控边界内动态形成。

### 决策五：固定 Zotero Adapter 采用七 Skill 闭包和 Adapter-native throughout

接受将固定 Zotero Literature Adapter 从两 Skill 模型升级为完整的七
Skill 投影闭包，并通过 role、visibility 和 hard dependency 控制发现与调用：

- `zotero-library-agent` 是 Zotero 宽泛任务和跨任务请求的默认 router；
- 五个 task Skills 在用户意图明确时可以直接调用，也可以被 ARSU producer
  作为有界 provider 嵌套调用；
- `zotero-bridge-cli` 是所有 task/router 的 mechanism dependency，只在精确
  操作、诊断和恢复时直接推荐；
- 固定 Agent Skill surface 从四个 ARSU、四个 Companion 和两个 Adapter
  调整为四个 ARSU、四个 Companion 和七个 Adapter，共十五个 Skills；
- 31 个注册工具接收十五个固定 Skills，28 个 command-capable 工具仍只接收
  八个 ResearchSpec wrappers，Adapter 不新增 command wrapper。

Navigate 只负责判断请求属于 ResearchSpec/ARSU research 还是 Zotero-bound
task。进入 Zotero 后，由 `zotero-library-agent` 或意图已经明确的 task Skill
负责具体路由；进入 Deep Research 后，bibliography coordinator 直接调用
所需 task Skill，不再经过第二层泛化 router。

Adapter 就绪时，文献型研究采用 Adapter-native throughout：

1. `zotero-library-query` 优先查询当前 library、collection、selection、
   notes、attachments 和 readiness；
2. 出现覆盖缺口时，`zotero-literature-acquisition` 优先承担外部候选发现、
   live duplicate 检查和 acquisition 准备；
3. 已筛选来源需要全文、精确 locator、notes 或 annotations 时，优先使用
   `zotero-literature-analysis`；
4. 已界定 Zotero corpus、Topic 或 Graph 能为当前研究提供上下文时，优先使用
   `zotero-research-synthesis`；
5. ARSU bibliography/synthesis producer 仍拥有研究问题、纳排标准、跨 provider
   去重、来源核验、覆盖判断、Search Strategy、claims 和正式 artifacts；
6. 裸网络检索只用于 Adapter 未就绪或被跳过、Adapter 不支持的来源、协议要求的
   额外数据库、时效性网页事实以及有证据支持的覆盖补缺。

“积极使用 Adapter”是默认 provider 优先级，不是必须机械执行全部 task
Skills。Systematic review 仍由检索协议决定多来源覆盖；当前事件和网页事实可以
外部来源优先或并行。`zotero-library-curation`、mutation、apply-back 和维护操作
永不作为研究流程的隐式步骤。

每个文献型 route 显示简短 source-policy card。首次配置、readiness 失效、
私有范围变化或 library-bound 请求才展开完整设置与授权。ResearchSpec 的
`init`、`update`、`status`、`check`、conversion 和 installation 保持离线，
不连接 Zotero、不读取凭据，也不执行 Adapter runner。

接受 bounded managed-library 模式作为 Adapter 就绪时的推荐默认：

- 用户在 route confirmation 时一次性授权本次研究使用指定 Zotero collection；
- bibliography coordinator 先筛选 Acquisition 候选，随后才允许将已接受文献
  导入该 collection 并准备附件；
- 授权只覆盖本次研究、指定 collection 和已接受文献；
- 未授权时退回 candidate-only，不写 Zotero；
- 全库 metadata、tag、collection、note、merge、delete 和其它整理仍需独立
  Curation 请求与现时批准。

上游七个 Skills 的 `runner.json` 和 `output.schema.json` 作为
automation-facing runtime metadata 原样保留并纳入 immutable audit。保留这些
文件不授权 ResearchSpec 执行 runner、解释 `__SKILL_DONE__`、接管 Host
workflow，或将 Adapter result 直接写入 ResearchSpec authority state。实际
Agent host 可以在其支持时消费 runner/schema；ResearchSpec 只负责静态审计、
转换、投影和完整性检查。

Adapter task result 首先是 producer working evidence。Bibliography
coordinator 应通过 provider-neutral handoff 引用上游 result，而不是复制整套
schema；只有经统一筛选、去重和核验的来源及必要 provenance 才随 durable
bibliography/source artifact 提交。

## 目标运行与交互模型

后续设计应将硬承诺、软计划和工作轨迹分层，并在承诺边界使用最小 Agent 交互合同：

```text
┌─────────────────────────────────────────────┐
│ 硬承诺                                      │
│ stable contracts / required obligations     │
│ formal Gates / Decisions / completion rules │
└──────────────────────┬──────────────────────┘
                       │ 约束可接受结果
                       v
┌─────────────────────────────────────────────┐
│ 软计划                                      │
│ ARSU default playbook + Agent adaptive plan │
│ order / parallel / retry / replace / rework │
└──────────────────────┬──────────────────────┘
                       │ 产生 attempts 与 evidence
                       v
┌─────────────────────────────────────────────┐
│ 工作轨迹                                    │
│ working materials / candidates / diagnostics│
│ accepted artifacts / receipts               │
└──────────────────────┬──────────────────────┘
                       │ 只在承诺边界受控提交
          ┌────────────┼───────────────┐
          v            v               v
   artifact commit  Gate/Decision  propose/patch/apply

authority 损坏 -> doctor diagnose -> retry / repair / human reconstruction
```

### Obligation-based case control

Runtime 的主要问题不再是“当前唯一合法 node 是什么”，而是：

- 当前有哪些尚未满足的 hard obligations；
- 哪些 evidence 和 artifacts 已经被接受；
- 哪些动作当前可做，哪些只是推荐下一步；
- 哪些 hard blockers 必须先解决；
- 哪些偏离仍位于已确认的执行边界内；
- 哪些变化已经触及 contract、Gate、branch、override 或 completion，必须升级为人类决定。

Agent 在已确认的执行边界内可以自由安排 soft plan。普通失败首先形成局部 attempt 或 obligation 状态，并允许重试、替换 producer/method、补证、回修、降级 optional output、waive/not-applicable、暂停或放弃 subflow。只有违反 hard obligation、改变 stable semantics 或请求越过正式 Gate 时才升级为全局 blocker 或 Decision。

Intermediate working material 不必全部立即升级为 authority artifact。多个机械产出可以在 checkpoint 或 obligation boundary 以 bundle 方式登记；事务数量应随 durable commitment boundary 增长，而不是随 ARSU 内部 phase 或每个临时 artifact 等比例增长。

### 有界读取协议

默认 `status` 只应返回：

- workspace 和 run identity/lifecycle；
- active、idle 和最近相关 instance 的紧凑摘要；
- 尚未满足的 hard obligations、推荐下一步、其他允许动作及简短原因；
- blockers、pending Gate/Decision/change/patch 的 ID 和计数；
- workflow path/hash reference；
- diagnostics 分类计数；
- 下一条建议的定向查询。

完整 workflow、全部历史 instances、完整 plugin/adapter 对象和大集合不得内嵌在默认 status 中。它们应通过已有 `instructions`、`show`、`list` 或明确的详细视图定向读取；任何可增长集合都必须有界或分页。Start、Submit、Advance 和 Decide 的结果只返回事务结果、receipt/plan identity、影响摘要和下一 selectors，不返回完整 `workflow_control_after`。

### 最小写入协议

每个可写 selector 的 instructions 都应产生一个由 DTO/Schema SSOT 派生的 action descriptor，至少包括：

- command 和 canonical selector；
- 当前 basis/expiry 条件；
- CLI 已解析的机械字段；
- Agent/用户必须填写的语义槽位；
- 字段类型、枚举、约束和语义说明；
- 最小有效示例或可直接补全的 input template；
- dry-run 和 execute 要求；
- 成功后可能出现的下一 selector。

Agent 不再手写 payload schema version。大段语义 payload 优先保存为文件并通过 path/hash 引用；小型 verdict、choice、reason 等可以保留为紧凑结构化输入。校验错误必须返回稳定错误码、字段路径、期望类型/枚举和 action schema reference，不能要求 Agent 通过反复提交猜测合同。

### Adapter-native 文献工作

```text
literature route + source-policy card
                |
                v
      just-in-time live readiness
                |
                v
       query existing Zotero corpus
                |
        coverage / gap assessment
                |
                v
 acquisition discovers external candidates
                |
        ARSU screening and verification
                |
       +--------+----------------+
       | managed-library consent |
       +--------+----------------+
                |
     import accepted items to bounded collection
                |
       analysis / synthesis when useful
                |
                v
 ARSU bibliography, claims and durable artifacts

unsupported source / protocol requirement / residual gap
                -> bounded external-search supplement
```

Adapter 内部 operation 顺序属于 Agent 的 soft plan。指定 private
selection/collection、library-only/offline、systematic-review protocol 和
managed-library write scope 才形成 hard source constraint。Adapter failure
通常只影响相应 provider attempt；除非请求语义本身依赖私有 library state，否则
不得升级为整个 run 的 blocker。

## SSOT 与模块边界

实现前应先设计并冻结以下 DTO/Schema 边界：

1. Hard obligation、hard dependency、completion criterion 与 formal Gate/Decision policy。
2. Soft playbook、Agent-selected ephemeral plan、attempt 和 accepted evidence，禁止与 authority state 混为一体。
3. Agent-facing status summary，不复用完整 internal Snapshot DTO。
4. Action descriptor 和 input template，由实际 validator schema 派生，禁止另建手写字段清单。
5. Run lifecycle effect，明确区分 `complete_subflow` 和 `complete_run`。
6. Doctor finding、repair candidate、repair plan 和 repair receipt。
7. Pending contract change 与 pending draft patch 的统一 case action 表达。
8. Draft patch apply result 与 revised artifact registry identity，避免两个事实源描述同一次文本修改。
9. Literature Adapter skill catalog，以 `skills[]` 唯一描述
   `router | task | mechanism` role、visibility、capability、authority 和 hard dependencies，
   禁止继续维护 `primary/helper` 二元事实源。
10. Provider-neutral retrieval handoff，引用 Adapter task result 的
    provider/Skill/release、operation、query/filter、scope、time、paging、Zotero refs、
    external provenance、evidence depth、duplicate/readiness、artifact hash 和 coverage limits。
11. Managed-library authorization，明确研究、collection、允许的 acquisition effect、
    expiry 和撤销边界，不与 static delivery、live readiness 或 Curation authority 混合。
12. Adapter runner/schema asset policy，允许固定 Zotero Adapter 逐字节保留经审计的
    runtime metadata，同时保持 ResearchSpec conversion、installation 和 runtime 不执行它们。

Workflow profile 不再穷举并拥有所有合法执行路径。它拥有 hard obligations、确有必要的依赖、formal Gates、completion criteria、可选 strict process，以及 converter-owned default playbook；soft sequencing 和普通执行选择不进入 blocking authority。Core 只解释通用 case contracts，不得把 ARSU pipeline 特例硬编码进 runtime。Semantic-delta 和 adaptive plan 由 Agent 生产，CLI 只校验结构、引用、权限、hard invariants 和允许的 commit effect。

## 下一阶段开发路线图

以下路线图由一个协调 OpenSpec change 管理。里程碑编号表达依赖与验收边界，
不要求运行时工作和 Zotero 供应链工作完全串行。

```text
M0  产品、迁移与接口冻结
├── Z1  七 Skill 上游审计
│   └── Z2  静态转换、交付与十五 Skill 闭环
└── M1  Case/Recovery 契约与兼容投影
    ├── M2  显式 run completion 纵向切片
    │   └── M3  有界读取与最小写入协议
    │       └── M4  Doctor
    └── M5  Adaptive case runtime
        └── M6  Proposed/current 闭环

M3 + M5 + Z2 ──> Z3  Adapter-native runtime
M4 + M6 + Z3 ──> M7  收敛、迁移与默认切换
```

### M0：产品、迁移与接口冻结

创建一个协调 change，完成 proposal、delta specs、design 和 tasks：

- 明确 obligation-based case control、hard/soft authority 边界、explicit
  completion、Doctor、proposed/current 和 Adapter-native 的共同产品方向；
- 冻结新增 DTO/Schema 的职责、统一 action availability SSOT 和 bounded
  protocol，不在 M0 修改运行时代码或主 specs；
- 冻结迁移原则：新 workspace 以 adaptive 为默认，现有 Schema `0.2`
  workspace 继续按 strict profile 读取，不自动改写；
- 固定十七个顶层 CLI 命令、十五个固定 Skills、八个 command wrappers，以及
  七份 `runner.json` 和七份 `output.schema.json` 的静态资产身份。

M0 完成的判据是协调 change 达到 apply-ready，且后续里程碑的依赖、验收和非目标
已经在 tasks 中形成唯一任务图。

### M1：Case/Recovery 契约与兼容投影

- 先定义 CaseState、hard obligation、attempt、working/accepted evidence、
  case action、completion effect、ActionAvailability、Doctor finding/plan/receipt
  和 Agent-facing summary；
- 建立 adaptive 与 strict profile 的共同解释边界，保留现有 Schema `0.2`
  process engine 的只读兼容投影；
- 在改变行为前为 strict `0.2` 现状增加稳定行为刻画，禁止在迁移期间双写两套
  runtime authority。

### M2：显式 run completion 纵向切片

- 让 `complete_subflow` 只终结 instance，只有 `complete_run` 可以写入 run terminal；
- 让 Status 与 Start 共享同一个 action availability evaluator；
- 覆盖 standalone subflow 完成后继续启动合法工作，以及 strict pipeline 最终
  transition 显式终结 run 的两条用户旅程。

M2 是首个运行时实现切片。它先消除当前最危险的不可逆生命周期误判，再扩展协议。

### M3：有界读取与最小写入协议

- 默认 status 改用 bounded CaseStatusSummary，大集合通过定向或分页的
  `instructions`、`show` 和 `list` 读取；
- 所有写命令从同一 validator/schema 生成 action descriptor，只要求 Agent
  填写最小语义槽位；
- Start、Submit、Advance 和 Decide 的成功响应只返回 receipt/plan identity、
  影响摘要和 next selectors，校验错误返回稳定 code、field path、expectation
  和 schema reference。

### M4：Doctor

- 建立绕过标准 Snapshot 加载的 tolerant observation；
- 实现固定 finding taxonomy、原事务重试优先级和确定性 repair plan；
- repair 使用 dry-run、plan hash、read precondition、原始内容备份、receipt-last
  authority commit 与 post-check，禁止制造 Gate、Decision 或学术语义。

### M5：Adaptive case runtime

- Runtime authority 只维护 hard obligations、accepted evidence、formal
  Gate/Decision、pending case actions、completion 和 receipts；
- Agent 可在硬承诺之间重排、并行、重试、替换、补证和回修；失败、pause、
  waive 与 not-applicable 只影响所属 scope；
- converter-owned profile 保存 obligations、真实 hard edges、formal policies、
  completion 和默认 playbook；strict process 保持显式可选。

### M6：Proposed/current 闭环

- `submit patch:<selector>` 创建 canonical pending patch，`decide patch:<id>`
  接受、拒绝或延后，`advance patch:<id>` 在 base 未漂移时受控 apply；
- revision 不再同时注册普通 `revision_patch` artifact；
- 高影响 semantic delta 创建或关联 contract change，并只阻断依赖旧 contract
  的相关 obligation。

### Z1：七 Skill 上游审计

- 将固定 Zotero Adapter 锁定到上游 commit
  `cec8fcddd8a3ef134bf6bdd80fcb2324c15707de` 和 release
  `host-bridge/hbrs-f9f28ddce98be3008e13bbdb`；
- 审计七个 Skills、release assets、license、provenance、依赖、runner 和 output
  schema，形成不可变、离线可复核的 admission 输入；
- 保持 static delivery、live readiness 和 operation result 三类事实分离。

### Z2：静态转换、交付与十五 Skill 闭环

- 用 `skills[]` 统一表达 router、task、mechanism 的 role、visibility、
  capability、authority 和 hard dependency，删除 primary/helper 二元事实源；
- 更新 converter、catalog、delivery、browser harness 和 package verification，
  交付四个 ARSU、四个 Companion、七个 Adapter 的固定十五 Skill surface；
- 七份 runner/schema 逐字节审计、转换、投影和发布，ResearchSpec 永不执行或解释。

### Z3：Adapter-native runtime

- Navigate 区分 ResearchSpec/ARSU research 与 Zotero-bound task，并显示简短
  source-policy card；
- 用户确认 provider 后，由 Adapter Skill just-in-time 检查 live readiness；
- Deep Research bibliography coordinator 按需直接调用 query、acquisition、
  analysis 和 synthesis task Skills，通过 provider-neutral handoff 接收结果；
- managed-library 授权绑定 run、指定 collection、已接受文献、允许的 acquisition
  effects 和有效期；未授权时保持 candidate-only，Curation 永不隐式执行；
- 普通研究允许按缺口补充外部来源；private collection/selection、
  library-only 和 offline 路线在 Adapter 不可用时必须暂停。

### M7：收敛、迁移与默认切换

- 重新生成 ARSU、Companion 和 workflow profile，更新 canonical user model、
  README、AGENTS、release/traceability 文档；
- 为显式 legacy migration 实现 dry-run、plan hash、非交互绑定和 receipt，
  默认 update 不迁移用户 runtime；
- 运行 converter、idempotence、package、OpenSpec、runtime、Adapter 和用户旅程
  验收。只有全部 Gate 通过后，新 workspace 才正式切换到 adaptive 默认。

## 验收标准

后续 change 至少应覆盖以下稳定、用户可观察行为：

- 新 workspace、长运行和多 revision round 下的默认 `status --json` 都保持有界，不包含完整 workflow 或无界历史集合。
- Status 能区分 hard obligations、hard blockers、recommended actions 和其他 allowed actions；它不把 soft recommendation 描述成唯一合法 frontier。
- Status、instructions 和写命令对同一 action 的可用性结论一致。
- 每个 Agent 可调用的写命令都能从 help 或对应 instructions 获得完整且语义明确的最小输入，不再要求手写 schema version。
- 默认运行模式允许 Agent 在不改变 stable semantics 或绕过 hard obligation 的前提下重排、并行、重试、替换、补证和回修，不要求 profile 事前枚举每个合法步骤。
- 没有学术或治理依据的 catalog 顺序不得生成 hard dependency；每个 hard edge 都必须能够追溯到明确 obligation 或 invariant。
- Mechanical Start、Submit 和 unique transition 不再逐节点制造完整 preview/execute/status 仪式；CLI 事务数量随 durable boundary 增长，而不是随内部 artifact 数量线性增长。
- Attempt 失败、optional work 不适用、producer 替换和 subflow 暂停只影响相应 case scope；无关 obligations 仍可继续。
- Strict pipeline 作为显式选择时仍能强制其声明的顺序、Gate 和 completion rules，并保持可审计、可恢复。
- 完成 standalone subflow 后，可以在同一开放 run 中启动另一个合法 subflow；只有显式 run-level completion 才使 Start 进入 terminal block。
- `doctor` 能在 `state.yaml` 语法损坏、Schema 损坏和 orphan receipt 等代表性场景中运行，并明确区分可重试、可确定修复、冲突和需要人类重建。
- Doctor 的任何修复都绑定 plan hash、保存原始内容、产生 receipt，并且不能制造 Gate、Decision 或学术语义。
- Academic Paper revision 的 canonical patch 会进入 `draft-patches` lifecycle 和 frontier；接受后生成 revised draft，拒绝、延后和 base drift 均具有明确状态。
- 高影响 semantic delta 会进入 contract change lifecycle，并在解决前阻断依赖旧合同的相关推进；普通 artifact 工作不被无条件增加人工 Gate。
- 固定 Zotero Adapter 的七个 Skills 形成完整安装闭包；router、task 和 mechanism
  具有不同的发现等级，普通 Navigate 不把七个入口无差别平铺给用户。
- `init`、`update`、`status`、`check`、conversion 和 installation 只验证静态
  交付事实，不连接 Zotero、不读取凭据，也不执行 runner。
- Adapter 就绪的普通文献研究先查询现有 library，再由 Acquisition 按覆盖缺口
  发现外部候选；Analysis 和 Synthesis 在相关证据目标出现时优先使用，裸网络检索
  只承担不支持来源、协议要求和残余缺口。
- Bibliography coordinator 输出唯一的纳排、去重、来源核验、覆盖判断、
  Search Strategy 和正式 bibliography；Adapter result 不会绕过 producer 直接成为
  ResearchSpec authority artifact。
- Managed-library 模式只在用户确认本次研究和指定 collection 后导入已接受文献并
  准备附件；未授权时保持 candidate-only，Curation 和全库维护永不隐式执行。
- Private selection/collection、library-only 和 offline 请求在 Adapter 不可用时明确
  暂停；普通研究可以局部回退，不能用公开检索冒充私有 library state。
- 七份 `runner.json` 和七份 `output.schema.json` 按上游字节纳入审计、转换和
  投影；ResearchSpec 不执行、解释或将其提升为自身 workflow protocol。
- 测试应验证这些稳定行为和状态边界，不精确锁定完整错误文案、大段 JSON、字段顺序或内部调用顺序。

## 非目标

- 不引入运行时 LLM API 或平台特定 Agent 适配。
- Doctor 不提供任意 YAML 编辑、强制推进、历史删除或语义覆写能力。
- 不把每次 artifact 修改都升级为 contract change。
- 不在 core 中硬编码 Academic Pipeline 图。
- 不退回缺少 contracts、provenance、Gates 和 Decisions 的 free-form Agent 模式。
- 不要求 profile 穷举 Agent 的全部合法动作，也不通过不断增加 optional/retry/dynamic 分支把现有 DAG engine 变得更加复杂。
- 不删除 strict pipeline；它是明确选择的高保证运行模式，而非默认本体。
- 不通过压缩、截断或要求 Agent 使用外部 JSON 工具来掩盖协议体积问题。
- 不保留普通 `revision_patch` artifact 与 pending `draft-patch` 两套可相互绕过的事实源。
- 不把 Zotero Adapter 建模为新的强制 subflow、Gate 或 ResearchSpec workflow authority。
- 不因 Adapter 已安装就机械执行全部 task Skills，也不让七个 Skills 作为无差别的
  默认入口抢占 ARSU route。
- 不在未获 managed-library 授权时导入、下载附件、修改 collection 或执行其它写入，
  也不将 Acquisition 授权扩大为全库 Curation 授权。
- 不要求 Zotero Adapter 取代 systematic-review protocol 指定的多来源检索、
  当前网页事实或 Adapter 明确不支持的来源。
- 不执行上游 runner，不把 runner/schema 变成 ResearchSpec runtime、状态机或新的
  stdout authority contract。

## 后续 OpenSpec change 的范围要求

后续正式 change 应作为一个协调变更处理上述共同根因，而不是拆成互不知情的局部补丁。Change proposal 必须明确修改：

- canonical user usage model 与顶层 CLI command registry；
- CLI interface、framework core、case/obligation control、subflow control、Gate/transition control、artifact submit、contract change、Companion Skills、ARSU workflow profile、Agent surface 和 literature system adapter 相关 specs；
- Agent-facing DTO/Schema、obligation/playbook/attempt contracts、run-state Schema、repair contracts、patch/change case-action contracts、provider handoff 和 managed-library authorization contracts；
- 固定 Zotero Adapter 的新 release audit、七 Skill admission、role-aware catalog、
  runner/schema asset policy、converter-owned generated tree 和 Deep Research
  Adapter-native projection；
- 现有 generated Skill/profile 漂移及 converter-owned SSOT；
- 只覆盖稳定交互边界的最小必要回归和用户旅程测试。

设计完成后应再次检查：每个规则是否只有一个事实源、每个字段由正确一方填写、每个 hard edge 是否确有学术或治理依据、每个 soft plan 是否仍允许 Agent 自适应、每个 terminal 状态是否有显式语义、每个异常是否存在不绕过 authority 的局部恢复路径、每个 high-impact semantic change 是否真实经过 proposed/current 边界、每个 Adapter task 是否由正确 role 承担、每次外部检索是否有可解释的 provider 选择、每个 library write 是否落在用户确认的 collection 和 effect 范围内，以及每个保留的 runner/schema 是否始终只作为审计过的上游 runtime metadata。
