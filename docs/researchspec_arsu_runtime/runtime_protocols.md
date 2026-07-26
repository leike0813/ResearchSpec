# CLI 与运行时协议

## 1. 命令不是能力清单，而是控制面的几个入口

| 组 | 命令 | 作用 |
| --- | --- | --- |
| 安装与投影 | `init`、`update` | 准备 workspace、安装或刷新受管 Agent 文件；不启动科研工作 |
| 运行控制 | `status`、`instructions`、`start`、`submit`、`advance` | 读取 frontier，执行原子 Start/Submit/Gate/Transition |
| 查询、验证与导出 | `check`、`list`、`show`、`handoff`、`pack` | 检查确定性事实、解析对象和产生派生视图 |
| 语义变更生命周期 | `propose`、`decide`、`archive` | 提议、决定、应用或归档高影响 change/draft patch |
| 领域增强 | `plugin` | list/show/install/uninstall/update/instructions；不拥有核心 workflow |

所有命令共享结构化 `CommandResult` envelope、退出类别，以及 `--json`、`--dry-run`、`--yes` 等全局行为。`--yes` 只授权已经预览且内容未漂移的机械事务，不能制造 formal Gate 或语义 Decision。

## 2. 统一运行循环

![统一运行时交互序列](diagrams/rendered/runtime-control-loop.svg)

```text
status
→ instructions <canonical-selector>
→ start / semantic production / submit / gate / decide / advance
→ status
```

每次写事务后重新执行 `status` 不是展示习惯，而是协议的一部分：上一份 instructions 和 plan 只对它绑定的 basis 有效。状态、依赖、artifact hash 或用户选择变化后，旧 preview 不得复用。

## 3. Selector 是 CLI 与 Skill 的接口

| Selector | 指向 | Instructions 给出什么 |
| --- | --- | --- |
| `subflow:<template>` | 可由用户启动的外部 route | route summary、前置条件、完整 graph、Start input contract |
| `subflow:<parent>/<node>` | pipeline frontier 中可启动的 child | parent scope、child template、继承的 Start 授权 |
| `work:<instance>/<node>` | 一个 ready work item | producer Skill/route、读依赖、输出路径、validation 与 submission policy |
| `gate:<instance>/<node>` | 一个 ready formal Gate | validator、证据、verdict payload、确认与后果 |
| `transition:<instance>/<node>` | 一个 ready 或 decision-required transition | 前置 Gate/Decision、effect、plan basis |

Scoped selector 防止不同实例、revision round 或同名 node 相互污染。裸 work ID 不具有足够身份，运行时会拒绝。

## 4. Status 与 frontier 如何形成

![Frontier 派生模型](diagrams/rendered/frontier-evaluation.svg)

`status` 读取完整 workspace snapshot：解析配置、workflow profile、run state、registry、Gate/Decision ledger、receipt、changes、patches、plugins 和 adapter 静态状态。Workflow evaluator 随后逐实例计算：

1. work 的依赖、parallel capacity 与 join 是否满足；
2. candidate 是否已通过 registry/path/hash/receipt/completion 条件；
3. child subflow 是否可启动或完成；
4. stage 中的 work/child 是否全部完成；
5. formal Gate 是否 ready、pass、fail、challenged 或已有 accepted override；
6. transition 是否唯一、需要 Decision、可推进或被阻塞；
7. 当前实例和全局 frontier 应暴露哪些 canonical selectors。

典型汇总状态包括 `ready`、`stage_work_complete`、`gate_required`、`decision_required`、`transition_ready`、`blocked` 和 `complete`。它们是派生结论，不应手工写回文件。

## 5. Start：把确认的 route 变成实例

Start 前必须完成：

- route catalog 的语义匹配；
- 与当前 status 可用 subflow 的交集；
- prerequisite expansion 和缺失输入检查；
- Skill、mode/entry、预计工件、formal Gates、risk 和 cost 摘要；
- `instructions subflow:` 的当前 graph 与 strict input；
- 用户对这一精确 route/graph/input 的确认。

执行顺序是：校验 instruction basis 和前置条件，生成 Start plan，dry-run 展示写集与 `plan_sha256`，确认后先写 Start receipt，最后更新 `state.yaml`。同一 plan 可幂等识别；route、input、graph 或 basis 变化必须重新确认。

Pipeline child 只能从 parent-scoped frontier 启动。父 route 的确认可以授权该图内声明的机械 child Start，但不确认 child 内 formal Gate，也不授权新的 branch。

## 6. Work Submit：从候选文件到正式 artifact

ARSU producer 先按照 work instructions 写 candidate。CLI Submit 随后检查：

- candidate 位于声明的 workspace containment boundary；
- 文件存在、非空并符合 text/binary validation profile；
- 实际 SHA-256 与 preview/expected hash 一致；
- artifact type、producer、route、selector 和输出路径匹配；
- required contracts、upstream artifacts、Gate/Decision 依赖仍可信；
- 同一 work 没有冲突登记。

提交成功先创建 `artifact_submit` receipt，再把 candidate artifact 和 receipt artifact 一次性加入 registry。它不修改 active stage，不写 Gate/Decision ledger，也不代表内容已通过学术评价。

`submission.policy: automatic` 表示可信 Start 可以授权这项机械登记；它仍必须 dry-run、绑定 candidate hash 并重新检查。Manual policy 则需要逐 work 展示 preview 并取得确认。

## 7. Formal Gate：语义判定与持久化分离

Formal Gate 的完整流程是：

1. CLI instructions 声明 gate type、validator 和所需证据。
2. `researchspec-verify` 先运行确定性 check，再读取 contracts、artifacts、claims 和现有 ledger。
3. Verify 产生可证伪、带 ID/path 的 proposed verdict；它此时不写 workspace。
4. 用户查看 verdict、限制、条件和推进后果并明确确认。
5. CLI dry-run 和执行相同 `submit gate:` payload，先写 receipt，最后 append Gate ledger。
6. 重新 status，观察 transition 是否被解锁。

Start confirmation、普通 checkpoint、“继续”、`--yes` 或 ARSU 内部的 PASS 都不能替代第 4 步。

### Challenge、reverification 与 override

用户挑战 verdict 时，Verify 必须重新检查并将新 payload 绑定被挑战的 basis。不能直接把 challenged fail 改写成 pass。若重新验证仍 fail，只有用户通过 Decide 接受一个绑定该 Gate event 和可信 receipt 的 override，transition 才可能满足要求。

## 8. Decision：只记录真正的语义选择

Decision ledger 用于 scope、claim、structure、workflow branch 和 failed-Gate override。普通检索探索、插件拒绝、工具选择或措辞讨论不应污染 ledger。

Workflow branch 的候选来自 transition metadata，而不是 Agent 自由提出。`decide transition:<instance>/<node>` 只接受其中一个 canonical option；reject/postpone 不会隐式选择另一个分支。

## 9. Advance：唯一可以推进 active stage 的常规事务

Advance 只接受当前 frontier 中已经满足 Gate/Decision/receipt 要求的 transition。无 branch 时必须是唯一 ready transition；有 branch 时必须已有匹配的 accepted Decision。

CLI dry-run 返回 plan hash 和 effect。执行时先写 transition receipt，最后更新 `state.yaml`：激活下一 stage、完成子流程或完成 run。若写前提漂移，事务停止，不用手工补齐任何一半。

## 10. 四类事务的写集

![事务写集和权威最后写入](diagrams/rendered/transaction-write-sets.svg)

| 事务 | 先写证据 | 最后写权威 | 明确不写 |
| --- | --- | --- | --- |
| Start | Start receipt；可选 Passport import projection | `state.yaml` | Gate/Decision ledger |
| Work Submit | Submit receipt | `artifact-registry.json` | state、Gate/Decision ledger |
| Gate Submit | Gate receipt | `gate-ledger.jsonl` append | state、registry、Decision ledger |
| Advance | Transition receipt | `state.yaml` | registry、Gate/Decision ledger |
| Decide/apply | apply receipt、目标文件、registry/lifecycle | `decision-ledger.jsonl` append | 未经决定的其他语义对象 |

“receipt first、authority last”使中断后的 snapshot 能区分未完成事务、幂等重试和真正冲突。

## 11. Contract change 生命周期

![Contract change 生命周期](diagrams/rendered/contract-change-lifecycle.svg)

`propose` create-only 生成 proposal、tasks 和 `contract-patch.yaml`，不修改 stable specs，也不写 Decision ledger。`decide accept` 会重新验证 target/current value/evidence，应用 stable spec、写 apply receipt、更新 registry 和 patch lifecycle，最后追加 Decision event。Reject 只解决 lifecycle 并记录决定；postpone 记录非终结事件，item 仍可再次处理。

`archive` 只处理已经有可信 resolution 证据的 change 或 draft patch。Archive 不删除 registry、Gate 或 Decision 历史。

## 12. Resume、导出与外部材料

### Resume

新会话只需重新加载 workspace 并运行 status。Agent 应从当前 frontier 恢复，而不是复述旧聊天后自行跳到某阶段。Handoff 是便于阅读的派生摘要，不能覆盖 status。

### Handoff 与 Pack

`handoff --stdout` 适合临时恢复；写入 handoff 文件和创建 pack 都先 dry-run。Pack 默认不含 artifacts；`--include-artifacts` 是显式的隐私敏感选择。两者都不推进工作流。

### Material Passport

ARS Material Passport 只能在确认的 `academic-pipeline:mid-entry` Start 中通过专门 import 事务进入，并被拆为非权威证据。它不能覆盖 current state、Decision 或 Gate receipt。

### Plugins 与 Zotero

插件建议与 route confirmation 分开；安装完成也不改变 core producer 或 frontier。插件输出和 Zotero 查询结果只是当前 ARSU producer 的 working material。若增强不可用，核心 route 按原图继续；涉及 private selection/collection 的请求则必须停下等待真实 adapter 或用户输入，不能用公开检索冒充私有库状态。

## 13. 失败恢复原则

- usage error：修正 selector、strict JSON 或参数，不改变 workspace。
- domain block：补齐真实 prerequisite、Gate、Decision 或 artifact，不伪造 evidence。
- write conflict：重新加载 snapshot，检查已有 receipt/output，禁止删除证据以求重试成功。
- plan/candidate drift：丢弃旧确认，重新 instructions、preview 和确认。
- post-check failure：如实报告已发生的事务与剩余诊断，不手工完成或回滚 ledger/state。
- Skill 失败：保留当前 frontier，允许重试、暂停或重新路由；不得跳过 formal Gate。
