# 当前实现发现与审阅注记

## 1. 文档定位

本章记录代码、generated Skill、OpenSpec spec 与文档之间可验证的差异。它不替代当前事实源：用户入口以 `docs/arsu_user_usage_model.md` 为准，route 语义以 routing catalog 为准，adaptive/strict control 以 workspace profile、state、`status` 与 scoped `instructions` 为准。

## 2. 当前 surface

| 项目 | 当前事实 |
| --- | --- |
| 固定 Skills | 15：4 ARSU、4 Companion、7 Zotero Adapter |
| CLI | 17 个顶层命令，包含 `doctor` 与 `plugin` |
| ARSU routes | 25 个 standalone mode、2 个 pipeline entry |
| 默认 runtime | adaptive：route、hard obligation、evidence、Gate、completion、case action 与 soft playbook |
| compatibility runtime | strict Schema `0.2`：27 个外部 template 和 1 个内部 revision-round template |

不要将 strict template 总数、parallel group、stage、work node 或 transition 数量写成 adaptive 的 current-state 事实。反过来，也不要把 adaptive obligation 误读为 strict graph node。

## 3. 双模式控制的边界

Adaptive profile 对每条 route 投影 durable-output obligations；只有声明的 hard dependency 才限制证据接受顺序。它支持 attempt、accept-evidence、pause/retry、formal Gate、completion 与 case resolution，不承诺 parent/child pipeline graph、动态 revision round、Material Passport import 或 ARSU 内部 phase 的逐项调度。

Strict profile 保留 `arsu-v0-1` graph：work DAG、parallel/join、parent/child pipeline、formal Gate、Decision branch、transition 和 dynamic revision round 都是该 compatibility 图的事实。Material Passport 也只在 strict confirmed mid-entry Start 中作为非权威 evidence 导入。

## 4. ARSU 语义与确定性控制的张力

ARSU 的 13-agent Deep Research、12-role Academic Paper、7-agent Reviewer 与 Pipeline 的内部角色仍是语义执行说明。它们可产出复杂研究材料，却不拥有 registry/state/ledger 写权限。Skill 的 checkpoint、panel parallelism、token budget、revision 建议或 upstream Reject 叙述，不会自动成为 adaptive obligation、strict Gate 或 transition。

`integrity_verification_agent` 和 `state_tracker_agent` 是 pipeline 内部角色，不是 workflow authority。formal Gate validator 是 `researchspec-verify`；runtime state、completion 和 strict round identity 只由 CLI receipt-backed transaction 更新。

## 5. 仍然有限的确定性验证

Runtime 能校验 workspace containment、路径、非空/media profile、hash、registry identity、producer/route、declared dependency、receipt 与 required Gate。许多文本 artifact 的 semantic schema 仍有意保持较浅：它要求可辨认的 artifact type、route-purpose、限制与未解决问题，但不把每一段 ARSU 学术方法写成强制字段。cost 也只是 `effort` 与 `interaction` 的分类，不是 token、时间或金额估算。

## 6. Action、恢复与治理边界

每个可写 selector 都通过 Action v2 descriptor 公开语义输入、CLI-derived 字段、availability basis 和一种 execution policy：`direct` 由 CLI 单次规划/校验/提交，`human_confirmed` 需要声明的人类确认，`plan_bound` 才要求 preview、plan hash 与执行确认。成功结果返回 `next_selectors`；调用者应定向读取，不把完整 status refresh 当作每次机械写入后的固定步骤。

`doctor` 默认只读，按固定 finding taxonomy 区分可重试事务、确定性修复、人类重建与冲突证据。repair 是 plan-bound，遵循 receipt-first、authority replacement、post-check；已有 receipt 的中断事务只允许精确 retry。`update --migrate-runtime` 是 strict Schema `0.2` 到 adaptive 的受控 plan/backup/receipt/rollback 事务，不会把 strict graph 或 Passport 语义投射到 adaptive。

`patch:` 和 `change:` 是跨 runtime 的受控治理 selector，不是 adaptive obligation 或 strict graph node。draft patch 先保持 pending，随后由 `decide` 解析，并仅由 `advance` 应用已接受 patch；contract change 也经 `propose` 与 `decide` 的 current/proposed lifecycle 处理。

## 7. 已识别的文档漂移

历史设计文档仍可能把未实现构想写成 Target，或把 strict graph 当作唯一 runtime。`docs/arsu_user_usage_model.md` 和本目录必须同时维护 adaptive default 与 strict compatibility 的边界；若代码、main spec 与 canonical user model 再次不一致，应记录为明确产品问题，而不是在 Agent prompt 中静默调和。

图源与 SVG 是成对的派生产物。图标题必须标注 `shared`、`adaptive default` 或 `strict compatibility`，并以对应 protocol 页而非手写数字作为解释入口。
