# Draft Claim Verification — Synthetic Benchmark

> 仅核查 `partial-manuscript.md` 中已被表述为研究论断的句子，对照本目录提供的 `sources.yaml`、`claims.yaml`、`goal.md`。
> 所有材料均为合成 fixture，不对应真实研究、参与者或出版物。

## 1. 论断逐条核查

### 1.1 "Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`)."

- **证据对应**：`SYN-CLASSROOM-01`（课堂观察摘要，范围：1 门一年级写作课，6 周）。
- **支持度**：✅ 直接支持。来源结论为“使用结构化 AI 提示的学生产生了更多大纲修订”，草稿使用“coincided with”属相关描述，未做强因果推断。
- **遗漏的限定**：来源同时指出“final rubric scores varied widely”，草稿未提及；这关系到“修订可见 ≠ 写作质量提高”的边界，源自 `claims.yaml` 对 `CLM-01` 的 `limits`。
- **核查结论**：表述方向正确，但缺少“最终评分差异较大、无对照组、无写作改进验证指标”这类必要的限定，否则易被读者误读为改进。

### 1.2 "Interview summaries also suggest that faster feedback may be offset by verification work."

- **证据对应**：`SYN-INTERVIEW-02`（5 位教师访谈摘要）。
- **支持度**：✅ 直接支持。来源原话“faster formative feedback but additional time spent checking unsupported claims”对应“反馈加快可能被核查工作抵消”。
- **遗漏的限定**：来源标记 `limits` 为“自我报告工作量；便利样本；无时间日志”，草稿未把这些限制写进句子。
- **核查结论**：方向与措辞恰当，强度“may be offset”克制；补一句样本与测量限制会更稳。

### 1.3 "The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence."

- **证据对应**：`claims.yaml` 中 `CLM-02` 已被标注 `strength: unsupported_as_written`；`SYN-INTERVIEW-02` 同时存在“时间节省”与“新增核查工作”两面信号。
- **支持度**：✅ 元论断成立。草稿明确拒绝把“减负”作为支持结论，符合现有材料。
- **遗漏的限定**：草稿只点了“更强表述”，未给出拒绝的具体理由（双向信号 + 无测量数据），读者不易判断“为什么不算支持”。
- **核查结论**：判断正确；建议在拒绝 `CLM-02` 时补一句双向证据 + 无测量数据的依据。

## 2. 草稿未提及、但 `claims.yaml` 已登记的论断

| 论断 ID | 当前强度 | 草稿是否提及 | 备注 |
| --- | --- | --- | --- |
| `CLM-03` 清晰的披露指引与学生不确定性减少相关 | `hypothesis_only` | ❌ 未提及 | `SYN-SURVEY-03`、`SYN-POLICY-04` 未直接对比政策清晰度与不确定性，草稿如纳入此线，必须标为待证假设而非观察 |

`CLM-03` 的处理方式需作者在补查阶段决定：要么在“Missing sections”中的“Discussion of policy variation”里作为假设提出，要么暂不写进论文以避免越位。

## 3. 仍需补证 / 待澄清的清单

1. **`CLM-01` 修订可见性 vs. 写作质量**：`SYN-CLASSROOM-01` 没有写作改进的验证指标。需在正文中明说“修订活动增多不等于写作质量提升”，或在引言/讨论中作为已知边界列出。
2. **`CLM-02` 工作量净变化**：现有材料仅给出双向自我报告，缺少带时间记录的工作量测量。补证方向：要么进一步做教师时间日志，要么把该论断从支持列表中删除，仅保留为“待研究问题”。
3. **`CLM-03` 政策清晰度 ↔ 学生不确定性的关联**：现有材料没有把政策清晰度作为变量测量，也没有把不确定性作为因变量测量。补证方向：需要带政策分级 + 学生不确定性量表的新材料，或明确标记为假设。
4. **`SYN-INTERVIEW-02` 的样本限制**：n = 5、自我报告、便利抽样、无时间日志；这些限制目前仅写在来源 `limits` 里，草稿正文尚未引用。
5. **`SYN-SURVEY-03` 的样本限制**：84 份自愿作答、态度非行为、数据收集期间政策变更；草稿正文尚未引用，纳入“替代解释”章节时必须带上。
6. **`SYN-POLICY-04` 的代表性**：仅一所合成高校的政策摘录，不可外推；草稿如讨论政策，需明示样本。
7. **缺失章节与方法学说明**：草稿“Missing sections”列出的四项（方法与证据选取限制、政策变异讨论、替代解释明确化、与证据匹配的结论）目前全部为空白，写作前需先就范围与深度与作者确认。
8. **通用认知边界**：`goal.md` 要求“避免把短期课堂观察表述为普遍因果结论”，草稿首段已声明立场，但所有 `Preliminary findings` 句子都还需逐条校核，确保没有“短期观察 → 一般化”漂移。

## 4. 核查动作建议（按优先级）

1. 在正文为论断 1.1、1.2 加上对应来源的 `limits`，避免仅引用发现本身。
2. 在“Missing sections”的“Discussion of policy variation”里显式处理 `CLM-03`，明确标注为假设而非观察。
3. 决定 `CLM-02` 的处置：要么降级为待研究问题，要么要求补充带测量的工作量证据后再写入正文。
4. 草稿定稿前用 `claims.yaml` 的 `strength` 字段做最后一遍强度对齐——每条正文结论的措辞强度（coincided / may be offset / is not supported）应与 `claims.yaml` 中标注的强度一致。
