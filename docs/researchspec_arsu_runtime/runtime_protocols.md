# CLI 与运行时协议

ResearchSpec 的共用协议是：CLI 从 workspace 文件读取当前事实，返回 action-specific instructions；Agent 按 descriptor 的 execution policy 调用 ARSU 或 Companion；CLI 在当前读前置条件下规划、校验并以 receipt-first transaction 写入权威文件。

```text
status → instructions <selector> → start / submit / advance / decide → next_selectors → 定向读取
```

这不是固定 stage loop。新 workspace 默认使用 [adaptive protocol](adaptive_runtime_protocol.md)：CLI 以 obligation、accepted evidence、formal Gate、completion 与 case action 控制进度。Schema `0.2` workspace 使用 [strict compatibility protocol](strict_runtime_protocol.md)：CLI 以 work graph、Gate 和 transition frontier 控制进度。

命令发现从 `researchspec --help` 进入，再按需读取
`researchspec <command> --help`；[CLI handbook](../cli_handbook.md)是由同一 typed
catalog 生成的静态参考。Navigate 可渐进式读取该 handbook，文件缺失或 drift 时回退到
help。静态资料不声明当前 action availability，也不替代 `status` 和
`instructions <selector>` 返回的动态 descriptor。

![Shared：双模式控制面与权威边界](diagrams/rendered/system-architecture.svg)

## 1. 共用命令边界

| 分组 | 命令 | 作用 |
| --- | --- | --- |
| Bootstrap | `init`、`update` | 建立/刷新 workspace；`update --migrate-runtime` 执行受控 strict-to-adaptive migration |
| Control | `status`、`instructions`、`start`、`submit`、`advance` | 读取当前动作、执行运行时事务 |
| Inspection and recovery | `check`、`doctor`、`list`、`show` | 校验、诊断、预览确定性修复和查看权威对象 |
| Context | `handoff`、`pack` | 生成可移交的派生上下文 |
| Governance | `propose`、`decide`、`archive` | 处理高影响 contract change、case resolution 与 draft patch lifecycle |
| Domain Skills | `plugin` | 检查、安装、更新或卸载已审查的可选 domain Skill |

`doctor` 不自行选择修复：默认只读；只有唯一可推导的控制面事实才会给出 repair plan。它按 `healthy`、`retry_existing_transaction`、`deterministically_repairable`、`requires_human_reconstruction` 或 `conflicting_evidence` 分类。repair 是 `plan_bound`：preview 绑定读哈希和 postcondition，执行需匹配 plan hash，先写 repair receipt、再替换 authority 并 post-check；已存在 receipt 的中断事务只能精确 retry。

Action v2 descriptor 精确声明写入政策。`direct` 由 CLI 在单次调用中规划、校验并提交，dry-run 可选且不重放外部 plan hash；`human_confirmed` 需要 descriptor 指定的人类确认，dry-run 仅在 descriptor 要求时使用；`plan_bound` 必须先 preview，再以匹配的 plan hash 和所需确认执行。`--yes` 不能代替 formal Gate 的人类确认，也不能制造语义 Decision。

## 2. 共用审计与风险规则

所有模式共享以下不变量：

- ARSU Skill、Companion、plugin 和 Zotero Adapter 只能生成语义内容或 working material，不能手改 workflow authority 文件；
- candidate 或 attempt 不等于已接受的证据，更不等于学术认可；
- formal Gate 的 verdict 必须绑定声明证据、validator 和用户确认；challenge 后以新的 basis 重验；
- scope、claim、structure、branch、failed-Gate override 与 obligation resolution 使用显式 Decision；
- receipt、registry、Gate/Decision ledger、attempt ledger、state 和受控 change/patch 生命周期共同提供恢复依据；
- `status` 与 `instructions` 是当前行动许可，历史聊天、Skill phase 和静态流程图不能替代它们。

![Shared：高影响语义的 current/proposed 生命周期](diagrams/rendered/contract-change-lifecycle.svg)

## 3. Patch、change、resume 与外部材料

高影响 contract change 通过 `propose` 创建 pending proposal，再由 `decide` 接受、拒绝或 postpone；`archive` 只归档已有可信 resolution 的 change 或 draft patch。`revision_patch` 是 draft-patch lifecycle 的可审阅输入：它绑定 base artifact/hash，由 CLI 的 patch transaction 形成 revised output、apply report 与 receipt，ARSU producer 不直接覆盖原稿。

新会话从 `status` 恢复，再读取当前 selector 的 instructions。写入成功后优先跟随结果的 `next_selectors` 取得所需细节，而非无条件重读完整 status。`handoff` 和 `pack` 是派生视图，不覆盖 authority state。Zotero 与插件只提供有界辅助材料；其不可用不会让 Agent 编造私有 library、证据、Gate 或下一动作。

Material Passport 是 strict compatibility 的导入能力，详见 [strict protocol](strict_runtime_protocol.md)。adaptive workspace 不接受 Passport import。
