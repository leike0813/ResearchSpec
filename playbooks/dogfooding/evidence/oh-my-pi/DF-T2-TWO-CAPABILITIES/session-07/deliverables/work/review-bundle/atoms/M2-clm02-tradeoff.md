# Atomic Comment — M2 (`COM-M2`)

## 元数据
- 来源：`benchmark/review-comments.md` Major Comment #2
- 立场：`accepted`（作者已接受）
- 优先级：`high`（触及 `CLM-02` 关键过度表述）
- 与文档目标条目对应：`Preliminary findings`；claim ID = `CLM-02`

## 引用
> `CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it.

## 拆解要求（what this comment requires）
1. 改写或删除现有 `CLM-02` 表述。
2. 新版本必须：
   - 删除"reduces instructor workload"这种纯收益表述；
   - 显式呈现"faster formative feedback" ⇄ "added verification of unsupported claims" 的权衡；
   - 强度应与 `SYN-INTERVIEW-02` 的限定（自报、便利抽样、无时间日志）一致；
   - 继续使用 stable claim ID `CLM-02`，便于回溯。
3. 推荐措辞（待作者授权）：
   - "`CLM-02` (revised): Instructor interviews suggest generative AI may shorten formative feedback time while introducing additional work to verify unsupported claims, with the net effect on instructor workload unmeasured in the supplied evidence."

## 写作目标位点（target locations）
- `manuscript` → `Preliminary findings` 中原文"The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence."（需重写）
- 同步更新 `researchspec/specs/claims.yaml` 中的 `CLM-02` 措辞、`strength`、`limits`

## 现有 evidence 支撑
- `SYN-INTERVIEW-02`：5 位教师便利访谈；同时记录了时间节省与新增核对工作。
- `claims.yaml`：`CLM-02` 当前 `strength = unsupported_as_written` — 与 M2 的需求完全一致。

## 局限（gap summary）
- 现稿同时承认"may be offset"和"is not supported"两个表述，互相削弱 — M2 要把这两层合一：在 `Preliminary findings` 中给出明确的权衡措辞，并在 `claims.yaml` 中以 `tentative` 或保持 `unsupported_as_written` 但提供改写后 wording。

## 依赖
- 与 M3（CLM-03 降级）共用同一 claim 重写表，可在同一轮修订内并行完成。
- 依赖 `claims.yaml` 同步更新（system-of-record）。

## 待作者确认（pending confirmations）
- [ ] 在 alternative A（按权衡改写）与 alternative B（直接删除 `CLM-02`，改为对 `SYN-INTERVIEW-02` 的纯定性陈述）之间选择
- [ ] 同意 `claims.yaml` 中 `CLM-02` 措辞同步更新

## 完成判据
- 稿件正文不再出现"reduces workload"的纯收益表述。
- `claims.yaml` 中 `CLM-02` 反映新的措辞。
- 如选 alternative B，必须在 `Methods` 或 `Discussion` 中明确说明为何删除。
