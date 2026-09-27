# Claim Verification Report

> 适用对象：`benchmark/partial-manuscript.md`、`benchmark/claims.yaml`、`benchmark/sources.yaml`、`benchmark/goal.md`
>
> 范围：核查 `partial-manuscript.md` 中所引主要论断（CLM-01 / CLM-02 / CLM-03）能否由本基准包提供的资料支持，并标注仍需补证的地方。
>
> 约束提醒：本目录为合成材料，仅用于 ResearchSpec dogfooding；本报告只对照包内材料，不联网检索，不补造数据。

## 核查结论一览

| 论断 | 草稿中的使用方式 | 包内材料是否支持 | 处置 |
| --- | --- | --- | --- |
| CLM-01 | “Structured prompting coincided with more visible outline revisions in one introductory course” | 支持（措辞与 SYN-CLASSROOM-01 一致） | 可保留 |
| CLM-02 | 草稿明确指出“the stronger statement that generative AI reduces workload … is not supported” | 不支持原表述；证据双向 | 需降级措辞或删除原断言 |
| CLM-03 | 草稿未提及 | 证据不足以断言“清晰的披露指引”与“不确定性下降”的关联 | 暂不在正文出现，或仅作为假设 |

## 各论断详细核查

### CLM-01 — Structured prompting may increase visible revision activity

- **claim 强度**：`tentative`。
- **支持来源**：SYN-CLASSROOM-01（kind：classroom_observation_summary；scope：one first-year writing course, six weeks）。
- **来源 finding**：“Students using structured AI prompts produced more outline revisions, while final rubric scores varied widely.”
- **来源 limits**：无对照组；无写作质量验证；所有提示词由教师提供。
- **草稿对应表述**：“Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`)”。措辞使用 “coincided with” 而非 “caused”，并限定到“一门入门课程”，与 `tentative` 强度匹配。
- **核查结论**：✓ **支持**。当前草稿措辞未越出 SYN-CLASSROOM-01 的范围；可继续保留。
- **仍需补证**（如果要进一步强化，而非当前必需）：
  - 增加对照条件（如未使用结构化提示词的小组）以排除自然修订量差异。
  - 引入与修订活动挂钩的写作质量指标，仅“更多大纲修订”不等于写作改进（来源 limits 已声明）。
  - 说明提示词由教师提供这一外部变量对结论泛化的限制。

### CLM-02 — Generative AI reduces instructor workload

- **claim 强度**：`unsupported_as_written`。
- **支持来源**：SYN-INTERVIEW-02（kind：instructor_interview_summary；scope：five instructors at one institution）。
- **来源 finding**：“Instructors reported faster formative feedback but additional time spent checking unsupported claims.” —— 同时包含“更快反馈”与“额外核查时间”两个方向。
- **来源 limits**：自报工作量；小便利样本；无时间日志。
- **claim 自身 limits**：证据同时包含“时间节省”和“新增核查工作”；无工作量测量数据。
- **草稿对应表述**：草稿并未把 CLM-02 当作成立结论，而是显式标注“the stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence”，并在前一句提到“faster feedback may be offset by verification work”。
- **核查结论**：✗ **原表述（无方向、无条件净减工作量）不被支持**；草稿当前对 CLM-02 的处理方式（标注不支持 + 给出双方向观察）是合规的。
- **仍需补证**（如果要使任何关于工作量的论断站得住脚，至少需要其中一项）：
  - 工作量时间日志或系统记录的客观测量，而非自报。
  - 多机构、跨学科样本，超越“one institution”便利样本。
  - 明确界定“工作量”口径（反馈生成、核查、出题、咨询、文档等是否分项统计）。
  - 拆解“节省的反馈时间”是否被“新增的核查时间”抵消或超过，给出净效应方向。
- **建议草稿处理**：维持“不支持”判断；若保留 CLM-02，建议把措辞降级为“interview summaries indicate that any time savings may be offset by verification work”，并把 `unsupported_as_written` 标注沿用。

### CLM-03 — Clear disclosure guidance is associated with fewer student uncertainties

- **claim 强度**：`hypothesis_only`。
- **支持来源**：SYN-SURVEY-03（kind：student_survey_summary；scope：84 voluntary responses）与 SYN-POLICY-04（kind：institutional_policy_excerpt；scope：one synthetic university policy）。
- **来源 findings**：
  - SYN-SURVEY-03：“Respondents valued rapid feedback; some reported uncertainty about permitted use and attribution.” —— 表明存在不确定性，但未比较“清晰 vs 不清晰”两种情形下的不确定性差异。
  - SYN-SURVEY-03 limits：自愿响应偏差；态度而非行为；本地政策在数据收集期间发生变化。
  - SYN-POLICY-04：“Course-level disclosure rules are required, but acceptable assistance is left to instructors.” —— 描述政策文本，不描述实施效果。
  - SYN-POLICY-04 limits：政策文本不能反映实施质量；不可跨机构推广。
- **claim 自身 limits**：“The supplied materials do not directly compare policy clarity with uncertainty.” —— 与本核查一致。
- **草稿对应表述**：**草稿正文中并未引用 CLM-03**。该论断与前两份合成材料一同被登记在 `claims.yaml`，但 `partial-manuscript.md` 既未在 Preliminary findings 段提及，也未列入 Missing sections。
- **核查结论**：✗ **在当前包内材料下，无法支持“清晰披露指引与不确定性下降相关”这一关联表述**。SYN-SURVEY-03 只提供横截面的不确定性观察，SYN-POLICY-04 只提供政策文本；两者都不构成对“清晰度—不确定性”关联的直接证据。
- **仍需补证**（任何形式的强主张都需要）：
  - 跨政策清晰度梯度的学生不确定性比较（例如不同院系、不同课程条款）。
  - 政策实施质量数据（教师如何在课内解释、何时给出示例、是否提供常见问题清单）。
  - 时间序列或前后对比，区分“政策变化前/后”的不确定性变化。
  - 把“披露”与“可接受使用”拆分，分别度量其清晰度对学生不确定性的影响。
- **建议草稿处理**：
  - 在 “Missing sections” 中显式补一行，说明“政策清晰度对学生不确定性的影响”因证据缺口暂不展开；
  - 或在 “Discussion of policy variation” 章节中以假设而非结论出现，并明确标注 `hypothesis_only`；
  - 不要把 CLM-03 提升为与 CLM-01 同级的事实型表述。

## 草稿整体一致性检查

- 草稿正文只把 CLM-01 与 CLM-02 写进了 Preliminary findings，对 CLM-03 选择沉默。这与 `claims.yaml` 中 CLM-03 的 `hypothesis_only` 强度一致，但读者若直接读 `claims.yaml` 仍会以为论文支持该假设。建议在草稿的 Missing sections 或文末注明 CLM-03 因证据缺口暂未纳入正文，避免被误读。
- 草稿明确区分了观察（CLM-01）与不被支持的强主张（CLM-02），符合 `goal.md` 中“区分观察、解释与未知项”的约束。
- 草稿没有给出因果性语言（无 “causes / leads to / improves”），没有夸大样本规模，没有补造效应量，符合 `goal.md` 中“不补造参与者信息、效应量、引用或伦理审批”的约束。

## 仍需补证的清单（汇总）

1. **CLM-01 进一步增强**（非必需，但若升级为更强主张需要）：
   - 对照组或前后对比；
   - 与修订活动挂钩的写作质量度量；
   - 关于“提示词由教师统一提供”这一混杂变量的说明。
2. **CLM-02 任何形式的工作量结论**：
   - 客观时间日志或系统记录；
   - 多机构、跨学科样本；
   - 工作量分项统计（反馈、核查、出题、咨询等）；
   - 净效应方向判断。
3. **CLM-03 任何形式的关联主张**：
   - 跨政策清晰度梯度的学生不确定性比较；
   - 政策实施质量数据；
   - 政策变化前后对比；
   - “披露”与“可接受使用”两类规则清晰度的拆解度量。
4. **草稿层面**：
   - 在 Missing sections 中显式声明“政策清晰度对学生不确定性的影响”因证据缺口暂未纳入；
   - 维持对 CLM-02 不支持立场的标注，避免后续修订无意间改回原表述；
   - 若以后追加 Methods、Discussion、Conclusion 章节，须继续保持“区分观察、解释与未知项”的写作约束。

## 与 `goal.md` 约束的对齐检查

- 仅使用本基准包提供的合成材料 ✓
- 明确区分观察、解释与未知项 ✓（草稿对 CLM-01 用“coincided with”，对 CLM-02 显式标注不支持，对 CLM-03 留白）
- 不补造参与者信息、效应量、引用或伦理审批 ✓（本核查报告未引入任何外部数据）
- 如需改变研究范围或 claim 强度，必须先让用户决定 —— 本报告未改动 `claims.yaml` 强度，仅给出建议；任何升级或删除由用户决定。