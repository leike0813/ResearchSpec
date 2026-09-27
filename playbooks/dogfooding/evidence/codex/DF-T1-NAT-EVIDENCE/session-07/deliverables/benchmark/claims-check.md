# 论断核查：partial-manuscript.md vs 项目资料

> 范围：只核对 `benchmark/partial-manuscript.md` 中明确表达或带 `CLM-*` 编号的主论断，按 `claims.yaml` / `sources.yaml` 判定支持状态。仅使用本基准包提供的合成材料，不补造证据。

## 1. 总体判断

草稿中两个被引用的主论断（CLM-01、关于 CLM-02 的反声明）与 `claims.yaml` / `sources.yaml` 一致，措辞也都按资料中的限制做了收口；CLM-03（披露指引与学生不确定性的关系）在 `claims.yaml` 中存在，但草稿完全未使用，对应资料 SYN-SURVEY-03 / SYN-POLICY-04 也没有在文中出现，构成一个明显的内容缺口。

## 2. 逐条核查

### CLM-01 — 结构化 AI 提示与可见的提纲修订

- 草稿措辞：「Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`).」
- 资料支持：`claims.yaml` 中 `strength: tentative`，限定为单一课程；唯一支撑来源 `SYN-CLASSROOM-01`（一门一年级写作课、六周；提示由教师统一提供；无对照组、无写作质量验证度量）。
- 判定：**可支持**，且草稿已用 `coincided with` / `in one introductory course` 保留了"关联、非因果、单课程"的限定，与 `strength: tentative` 匹配。
- 仍需补证：
  - 当前没有比较组，无法排除"提纲修订增加"是教师高密度提示的附带效应而非 AI 本身的因果；建议在缺失的 Methods 一节明确这一点。
  - SYN-CLASSROOM-01 同时报告"最终评分差异较大"，但草稿未提及，应在 Limitations 或 Findings 末尾补一句，避免读者把"修订可见"误读为"质量提升"。

### 关于 CLM-02 的两条措辞

草稿同时包含两条与 CLM-02 相关的措辞，必须分别核对。

#### (a) 反馈速度与核验成本的权衡

- 草稿措辞：「Interview summaries also suggest that faster feedback may be offset by verification work.」
- 资料支持：`SYN-INTERVIEW-02` finding = "faster formative feedback but additional time spent checking unsupported claims"，且 `claims.yaml` 已将 CLM-02 标为 `unsupported_as_written`。
- 判定：**可支持**。草稿用 `suggest` / `may be offset` 与"自报、非测量"的资料一致。
- 仍需补证：
  - SYN-INTERVIEW-02 同时声明样本是"five instructors at one institution, convenience sample, no time logs"——草稿未透露访谈样本量与"自报、无时日志"这两条限制，应在 Methods 中补一句，避免读者把这段当作业绩证据。

#### (b) 对 CLM-02 的反声明

- 草稿措辞：「The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence.」
- 资料支持：`claims.yaml` 中 CLM-02 `strength: unsupported_as_written`，并显式列出 "Evidence reports both time savings and new verification work" / "No measured workload data"。
- 判定：**可支持**，且这一反声明本身正确指向了 `claims.yaml` 已声明的限制。
- 仍需补证：无。反声明本身就是结论，不必再补充。

### CLM-03 — 披露指引与学生不确定性（草稿未出现）

- `claims.yaml` 文本：「Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use.」
- `strength: hypothesis_only`；支撑来源 `SYN-SURVEY-03`、`SYN-POLICY-04`。
- 草稿中**完全未引用** CLM-03，也未引用 SYN-SURVEY-03 / SYN-POLICY-04。
- 判定：**缺口**。
- 仍需补证：
  - 若想在 Discussion 或 Conclusion 中处理"学术诚信 / 学生对可接受使用的认知"，需要把 CLM-03 单独列为一个 hypothesis-only 论断，并注明：
    - SYN-SURVEY-03 = 自愿样本 84 份、态度而非行为、数据收集期间本地政策变化；
    - SYN-POLICY-04 是某合成大学的政策节选，"课程级披露要求"与"可接受辅助由教师裁定"由同一文本承载，资料中并没有直接比较"政策清晰度 ↔ 学生不确定性"，因此 CLM-03 只能停留在 hypothesis，不能写成 found / associated-with。

## 3. 与 `goal.md` 的对齐

`goal.md` 要求：

- "区分观察、解释与未知项" —— 草稿在 CLM-01 与 CLM-02 上做到了；
- "不补造参与者信息、效应量、引用或伦理审批" —— 草稿未补造；
- "避免把短期课堂观察表述为普遍因果结论" —— CLM-01 的措辞已避免，CLM-02 也已显式撤回。

但 `goal.md` 还要求"明确区分观察、解释与未知项"。当前 Discussion 缺失，"faster feedback may be offset by verification work" 这句是解释性表述，却没有配套的方法说明把"自报访谈"与"观察"分开，建议补 Methods 小节。

## 4. 缺失小节对应的核查任务

草稿自列的 Missing sections 每一项都对应一个待补的核查/写作动作：

- Methods and evidence-selection limitations：补 SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 的样本、采样方式、可比性限制；
- Discussion of policy variation：把 SYN-POLICY-04 引入，并明确"政策清晰度 ↔ 不确定性"只能作为 hypothesis（CLM-03）；
- Explicit treatment of alternative explanations：CLM-01 的"提纲修订增加"需把"教师统一提示"作为替代解释列出；
- Conclusion calibrated to the supplied evidence：结论只能停留在 tentative / unsupported_as_written / hypothesis_only 三档，与 `claims.yaml` 对齐。

## 5. 一句话总结

CLM-01 与关于 CLM-02 的两条措辞当前都被项目资料支持，且已按 `claims.yaml` 的强度收口；唯一未在草稿出现的论断是 CLM-03，连带 SYN-SURVEY-03 / SYN-POLICY-04 两条资料也未被引用，这是补 Discussion 与 Conclusion 时必须处理的内容缺口。
