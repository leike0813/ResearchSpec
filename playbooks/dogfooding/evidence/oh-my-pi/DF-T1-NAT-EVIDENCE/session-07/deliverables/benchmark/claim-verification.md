# 草稿论断核查 — claim-verification

> TEST FIXTURE 配套核查 — 仅基于 `benchmark/` 内合成材料，不联网、不补造数据。

核查对象：`benchmark/partial-manuscript.md` 中的"主要论断"。依据：`sources.yaml`、`claims.yaml`、`goal.md`。

## 1. 核查总览

| 论断 | 手稿表述（措辞来源） | 资料是否支持 | 强度判断 | 状态 |
| --- | --- | --- | --- | --- |
| C-A：结构化 AI prompt 出现时，一门入门写作课中"可见的大纲修订"更多 | Preliminary findings 第 1 句（CLM-01） | 由 `SYN-CLASSROOM-01` 支持（finding 一致），但措辞强度高于资料 | tentative | 措辞需校准 |
| C-B：访谈提示"更快的形成性反馈可能被核查工作抵消" | Preliminary findings 第 2 句 | 由 `SYN-INTERVIEW-02` 部分支持，"抵消"为推断 | tentative | 措辞需校准 |
| C-C："生成式 AI 减少教师工作量"这一更强论断未被资料支持 | Preliminary findings 第 3 句（CLM-02） | 由 `claims.yaml` 与 `SYN-INTERVIEW-02` 一致：unsupported_as_written | — | 正确，无需修改 |
| C-D：研究只识别"有用的假设与设计约束"，不主张普遍因果效应 | Introduction 第 2 句 | 与 `goal.md`、全部 `sources.yaml` 的 `limits` 字段一致 | — | 正确，无需修改 |

## 2. 逐项核查

### 2.1 C-A：结构化 prompt ↔ 更多可见大纲修订

- 手稿原文："Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`)."
- 资料原文（`SYN-CLASSROOM-01`）："Students using structured AI prompts produced more outline revisions, while final rubric scores varied widely."
- 一致点：方向一致；范围被限定在"one introductory course"。
- 偏差点：手稿用 "coincided with"（并列共现），资料用 "produced"（更具方向性的因果动词）。`claims.yaml` CLM-01 用 "may increase ... in some introductory writing contexts"（modal + 条件范围），与"coincided with"措辞最接近。
- 缺失项：
  - 资料明确指出 "No comparison group / No validated measure of writing improvement / Instructor supplied all prompts"。手稿只在隐含范围（"in one introductory course"）里提到了前两项，未在 Preliminary findings 这一节明示这些限制。
  - 资料同时说 "final rubric scores varied widely"，意味着在修订活动增加时，**最终分数端不可推断**。手稿对此未置一词，存在选择性呈现修订侧、略去分数侧的风险。

结论：方向有据，但两个限制（无对照、分数散度）应在同节或紧随段落中点明。

### 2.2 C-B：反馈更快可能被核查工作抵消

- 手稿原文："Interview summaries also suggest that faster feedback may be offset by verification work."
- 资料原文（`SYN-INTERVIEW-02`）："Instructors reported faster formative feedback but additional time spent checking unsupported claims."
- 一致点：更快反馈 + 额外核查成本，方向一致。
- 偏差点：资料用 "but additional time"（平列、可叠加），手稿用 "may be offset by"（隐含净效果可为零或负）。"offset" 是一个未被任何资料支持的**净效应推断**。
- 缺失项：
  - 资料 `limits` 明确："Self-reported workload / Small convenience sample / No time logs"。没有任一项陈述支持"净被抵消"。
  - 措辞 "may be offset" 接近一个**比较型净效应假设**，超出了资料所能支撑的范围。

结论：可保留"更快反馈 + 额外核查成本"的并列事实，但"抵消 / net-off" 这层含义超出资料范围，建议改写为并列描述。

### 2.3 C-C：更强论断（"AI 减工作量"）不被支持

- 手稿原文："The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence."
- 资料原文（`SYN-INTERVIEW-02`）：如上。
- claims.yaml CLM-02：`strength: unsupported_as_written`，并指出"资料同时报告省时与新核查工作；无工作量实测数据"。

结论：核查通过。手稿明确把这一论断标记为"不被资料支持"，与 claims.yaml、sources.yaml 一致。

### 2.4 C-D：仅识别假设与设计约束，不主张普遍因果

- 手稿原文："This paper examines a small synthetic evidence set to identify useful hypotheses and design constraints rather than general causal effects."
- 一致点：与 `goal.md` 末段（"避免把短期课堂观察表述为普遍因果结论"），以及全部 4 条 source 的 `limits` 字段（含 "Not generalizable across institutions" / "Single course" / "Small convenience sample" 等）相一致。
- 偏差点：手稿用了 "synthetic evidence set" 这个名词，与 benchmark/README 中"合成材料 / SYN-* source ID"对齐良好。

结论：核查通过。

## 3. 仍需补证 / 措辞校准的具体位置

1. **C-A 限制信息缺失（必须补）**：
   - 在 Preliminary findings 中紧跟 C-A 之后，至少补入以下两条限制：
     - 无对照课程（`No comparison group`）；
     - 最终 rubric 分数散度大（`final rubric scores varied widely`），意味着修订活动 ≠ 写作质量。
   - 现状：partial-manuscript.md 第 "Missing sections" 已承诺 "Methods and evidence-selection limitations"，但 Preliminary findings 本节未明示限制，会让读者先建立过强印象。

2. **C-B "offset" 措辞过强（必须改）**：
   - 现状 "may be offset by verification work" 超出了 `SYN-INTERVIEW-02` 的"自我报告 + 无时序日志"所能支撑的强度。
   - 建议改写为并列结构，例如：
     - "Interview summaries also suggest that faster formative feedback was accompanied by additional time checking unsupported claims — a net workload effect is not established by the supplied self-reports."
   - 同步把 "faster feedback may be offset" 中 "offset" 的净效应含义去掉，避免把并列叙述误读为定量净效果。

3. **"Missing sections" 与现成措辞的对齐（建议调整）**：
   - 当前列出四项缺失（方法、政策的横向差异、可替代解释、结论与资料匹配的强度校准）。
   - 其中"结论与资料匹配"的强度校准可被上述 C-A / C-B 措辞修改直接覆盖；不必单列为缺失节，但可在结论里重申 tentative 与 unsupported_as_written 的区别。

## 4. 与 `claims.yaml` 三条声明的一致性核对

| Claim | 手稿涉及？ | 一致点 | 不一致点 |
| --- | --- | --- | --- |
| CLM-01 tentative | 是（C-A） | 资料—声明—手稿方向一致 | 修订侧强、限制侧略 |
| CLM-02 unsupported_as_written | 是（C-C，明确点名） | 手稿明确指出不被支持 | 无 |
| CLM-03 hypothesis_only | 否 | 手稿未把"清晰的披露指引"作为论断使用 | 若在 Discussion 引入，须按 hypothesis_only 表达，不可写成 supported |

手稿未触及 CLM-03，因此无需核查其与资料的匹配；但若后续 Discussion 涉及"政策—不确定性"主题，必须按 `claims.yaml` 的 `hypothesis_only` 强度书写，且不得拼接 `SYN-SURVEY-03` + `SYN-POLICY-04` 形成"清晰披露 ⇄ 不确定性更少"的因果陈述（资料并未直接比较政策清晰度与不确定性）。

## 5. 核查依据与不擅作主张的范围

- 仅基于 `benchmark/` 内四份文件（`goal.md` / `sources.yaml` / `claims.yaml` / `partial-manuscript.md`）以及本目录 `README.md` 的合成材料声明。
- 未联网、未补造参与者信息、效应量、引用、伦理审批。
- 任何超出"措辞校准 / 限制补全 / 方向一致"的实质性新论断，必须先回 `goal.md` 约束 → 用户决定 → 再落到 claims.yaml 与手稿。
