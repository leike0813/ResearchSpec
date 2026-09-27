# 草稿论断核查报告

> TEST FIXTURE — NOT A REAL VERIFICATION
>
> 本报告对照 `partial-manuscript.md`（草稿）、`claims.yaml`（论断声明）和 `sources.yaml`（合成证据）三方，逐项检查草稿中的论断是否落在证据可支撑的范围内。范围仅限本基准包提供的合成材料。

## 1. 核查范围与方法

- **被核查文本**：`benchmark/partial-manuscript.md`
- **论断声明源**：`benchmark/claims.yaml`（CLM-01 / CLM-02 / CLM-03）
- **证据源**：`benchmark/sources.yaml`（SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 / SYN-POLICY-04）
- **核查方式**：逐句对照草稿正文中具有事实主张意味的陈述，标注其是否能由现有 sources 支撑、是否与 claims.yaml 中声明的强度一致，以及是否显式带上了声明中要求的 limits。

## 2. 逐条核查

### 2.1 引言中的语境陈述

> "Universities are experimenting with generative AI in writing courses while instructors and students negotiate new expectations for feedback, authorship, and disclosure."

- **核查结论**：可支撑，但偏弱，且未引用具体 source。
- **依据**：SYN-SURVEY-03（学生反馈“uncertainty about permitted use and attribution”）与 SYN-POLICY-04（要求课程级 disclosure，acceptable assistance 留给教师）共同提供了“expectations for feedback, authorship, and disclosure”这一表述的事实基础。
- **强度匹配**：作为引言性语境陈述，强度合理；但草稿未在文中标注 source 编号，读者难以回溯。
- **缺口**：应至少标注 SYN-SURVEY-03 与 SYN-POLICY-04，或在脚注中说明该陈述为综合两项材料的概述。

### 2.2 CLM-01（结构化提示 → 可见修订活动增加）

> "Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`)."

- **核查结论**：支撑成立，措辞与 tentative 强度一致。
- **依据**：SYN-CLASSROOM-01 直接报告 “Students using structured AI prompts produced more outline revisions”，且作用域为 “one first-year writing course, six weeks”。
- **强度匹配**：✓ 草稿使用 “coincided” 与 “in one introductory course”，回避了因果与泛化表述，与 claims.yaml 中 `strength: tentative` 一致。
- **缺口**：
  - claims.yaml 中为 CLM-01 声明的 limits（“Single course”、“Revision activity is not equivalent to writing quality”）未在草稿本句中显式复述。
  - SYN-CLASSROOM-01 自带的 limits（“No comparison group”、“No validated measure of writing improvement”、“Instructor supplied all prompts”）亦未出现。
  - 建议在结论或讨论中补足 “outline revisions ≠ writing quality” 这一关键限定，否则读者极易把修订次数误解为质量提升。

### 2.3 访谈小结（反馈速度 vs. 验证负担）

> "Interview summaries also suggest that faster feedback may be offset by verification work."

- **核查结论**：支撑成立，措辞审慎。
- **依据**：SYN-INTERVIEW-02 报告 “faster formative feedback but additional time spent checking unsupported claims”。
- **强度匹配**：✓ “suggest”、“may” 与访谈类、自报告型证据相称。
- **缺口**：
  - 未标注证据来源 SYN-INTERVIEW-02。
  - 未提及 SYN-INTERVIEW-02 的关键局限（self-reported workload、small convenience sample、no time logs），导致“verification work”这一表述仍可能被误读为可量化的工作量转移。

### 2.4 CLM-02（生成式 AI 降低教师工作量）—— 主动降级

> "The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence."

- **核查结论**：✓ 草稿自身已显式将 CLM-02 标记为不被现有证据支撑，与 claims.yaml 中 `strength: unsupported_as_written` 完全一致。
- **依据**：SYN-INTERVIEW-02 同时报告了“时间节省”和“新增 verification work”，与“无 measured workload data”共同使“reduces workload”这一强陈述无法成立。
- **缺口**：
  - 草稿的 “not supported” 表述可以更精确——并非完全无证据，而是证据呈混合方向且无测量。这一点在补 Methods/Discussion 时应澄清，避免读者把 CLM-02 当作纯否定。
  - 仍建议在结论或 discussion 中简要列出 SYN-INTERVIEW-02 的具体混合方向，避免“not supported”被误读为“workload unchanged”。

### 2.5 CLM-03（披露指引清晰度 → 学生不确定性降低）

- **核查结论**：⚠ **草稿完全未引用、未提及 CLM-03**。
- **依据**：claims.yaml 中 CLM-03 由 SYN-SURVEY-03 与 SYN-POLICY-04 共同支持，但草稿的 Preliminary findings 中只字未提。
- **强度匹配**：N/A（缺失）。
- **缺口**：
  - 这是本轮核查中最显著的一处遗漏。CLM-03 是 claims.yaml 中明确登记的第三条论断，且其 `strength: hypothesis_only` 决定了它必须以假设而非结论形态出现。完全缺失意味着读者既看不到该假设，也看不到与其捆绑的 limits（“materials do not directly compare policy clarity with uncertainty”）。
  - 补写时建议在 Preliminary findings 或 Discussion 中加入假设性表述（避免变成结论），例如：“It is plausible, but not directly demonstrated by the supplied materials, that clearer disclosure guidance would reduce students’ uncertainty about acceptable AI use (CLM-03).”

## 3. 来源 limits 的总体复述情况

下表汇总 4 个 source 的关键 limits 在草稿中是否被显式带出：

| Source | 关键 limits | 草稿是否显式带出 |
|---|---|---|
| SYN-CLASSROOM-01 | 无对照组、无写作质量的效度验证、提示由教师提供 | 否 |
| SYN-INTERVIEW-02 | 自报告工作量、便利样本、无时间日志 | 否 |
| SYN-SURVEY-03 | 自愿响应偏差、态度≠行为、数据收集期间政策变更 | 否 |
| SYN-POLICY-04 | 政策文本≠实施质量、不可跨校泛化 | 否 |

- **核查结论**：草稿在正文层面未显式带出任何 source 的 limits；只在 “Missing sections” 自承 Methods、Discussion 等章节尚未完成。
- **风险**：在不补 limits 的情况下，CLM-01 与 CLM-02 的降级表述仍可能被读者忽略；CLM-03 的缺失使得 hypothesis_only 的强度声明形同虚设。

## 4. 仍需补证的清单

按优先级排序，落到具体行动：

1. **补 CLM-03**：在 Preliminary findings 或 Discussion 中以 hypothesis 形态引入 CLM-03，附 SYN-SURVEY-03 + SYN-POLICY-04 的合成解读，并显式说明“现有材料未直接比较政策清晰度与不确定性”。
2. **补 CLM-01 的限定**：在引入 CLM-01 的同一段落补一句 “outline revision activity is not equivalent to writing quality, and the observation comes from a single course with no comparison group”，避免修订次数被读成质量改进。
3. **补 CLM-02 的精确化**：将 “not supported” 替换为更准确的 “the supplied interview summaries report both time savings and additional verification work, and no measured workload data is available”。
4. **补 Methods 章节**：明确证据选择的纳入/排除标准、四份材料的关系（observation / interview / survey / policy 各自承担的证据角色），以及为什么不能进行跨材料因果推断。
5. **补 Discussion of policy variation**：基于 SYN-POLICY-04 指出课程层面 disclosure 强制而 acceptable assistance 留给教师造成的执行差异，并标明这是单机构政策文本，不可泛化。
6. **补 Alternative explanations**：对 CLM-01，至少需要讨论 “提示的结构化本身而非 AI 工具可能驱动了修订可见度” 这一替代解释；对 CLM-02，需讨论 “faster feedback 是否真正抵消 verification work” 在没有时间日志时无法量化。
7. **补 Conclusion 与证据强度对齐**：结论部分应只重述 CLM-01（tentative）、CLM-02（unsupported as written）、CLM-03（hypothesis only）三种强度，不引入新的因果或泛化语言。
8. **统一 source 标注**：在正文每一处事实性陈述处添加 `SYN-*` 编号，便于读者按图索骥；当前仅在 CLM-01 一处出现编号引用，其余三处缺失。

## 5. 总结

- 草稿对 **CLM-01 的措辞** 与 **CLM-02 的降级** 与 claims.yaml 声明的强度一致，未越界。
- 草稿对 **CLM-03** 完全缺位，是当前最显著的论断级遗漏。
- 所有 4 份 source 的 **limits 均未在正文显式带出**，需要 Methods / Discussion / Conclusion 章节补足。
- 引言中的语境陈述可由 SYN-SURVEY-03 与 SYN-POLICY-04 共同支撑，但当前未标注来源。

无阻塞性问题；以上 8 项补证可在现有 `goal.md` 约束（不补造参与者信息、效应量、引用或伦理审批）内完成，无需扩大研究范围。