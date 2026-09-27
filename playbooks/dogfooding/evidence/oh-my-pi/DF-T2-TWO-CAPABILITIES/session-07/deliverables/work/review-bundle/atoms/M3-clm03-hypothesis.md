# Atomic Comment — M3 (`COM-M3`)

## 元数据
- 来源：`benchmark/review-comments.md` Major Comment #3
- 立场：`accepted_with_conditions`（作者保留 policy-clarity 观点，但要求降级为 hypothesis、删除因果/关联性表述）
- 优先级：`high`（触及稳定 claim ID `CLM-03` 的强度与措辞）
- 与文档目标条目对应：`Preliminary findings` 或新建 `Hypotheses` 子段；claim ID = `CLM-03`

## 引用
> The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis.

## 拆解要求（what this comment requires）
1. 在 `Preliminary findings` 或新设 `Hypotheses` 段中陈述：`CLM-03` 是 future research hypothesis，证据未直接对其进行检验。
2. 删除任何将"policy clarity" 与"uncertainties" 直接挂钩的关联性或因果措辞（"associated with", "leads to", "results in fewer" 等）。
3. 推荐措辞（待作者授权）：
   - "`CLM-03` (hypothesis): Whether clearer institutional disclosure guidance reduces student uncertainty about acceptable AI use is proposed here as a future research hypothesis; the supplied evidence does not directly test the relationship."
4. 同步 `claims.yaml`：`strength = hypothesis_only`（保持），`limits` 字段需追加反映 M3 要求的措辞。

## 写作目标位点（target locations）
- `manuscript` → 新增 `Hypotheses` 段或在 `Preliminary findings` 内引入 hypothesis 标记；目标区域：`CLM-03` 首次被引用处。
- `researchspec/specs/claims.yaml` → `CLM-03`。

## 现有 evidence 支撑
- `SYN-SURVEY-03`：84 名自愿样本；态度而非行为；采集期政策变化。
- `SYN-POLICY-04`：政策文本要求课程层披露，但未覆盖实施质量。
- 当前 `claims.yaml`：`CLM-03` 即标为 `hypothesis_only` — 与 M3 完全一致；这一步主要是确保正文和 yaml 双侧保持一致。

## 局限（gap summary）
- 现稿的 `Introduction` 与 `Preliminary findings` 完全未出现 `CLM-03`；claims.yaml 已声明其强度，但正文无引用。
- M3 的两步：（1）确保 `CLM-03` 在正文中以 hypothesis 形式出现；（2）避免任何关联性/因果措辞。

## 依赖
- 与 M2 共用 `claims.yaml` 更新，建议同时执行。
- 不依赖 M4，但若 M4（Methods）中明确"未直接对比政策清晰度"，能进一步支撑 M3 的 hypothesis 表述。

## 待作者确认（pending confirmations）
- [ ] 接受 alternative A（保留 hypothesis + 删除关联措辞）或 alternative B（删除 `CLM-03` 仅保留为 `Discussion` 中"further research needed"）
- [ ] 同意新增 `Hypotheses` 子段、或继续合并在 `Preliminary findings`

## 完成判据
- 正文中 `CLM-03` 只以 hypothesis 身份出现；不出现"associated with"、"leads to"、"results in"、"reduces" 等因果/关联措辞。
- `claims.yaml` 中 `CLM-03` 的 limits 字段同步更新。
