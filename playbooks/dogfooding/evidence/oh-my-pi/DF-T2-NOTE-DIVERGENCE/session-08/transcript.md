



---

Now I have the context. The user said "接着完成前次的资料核查" — continue completing the previous material verification work. The previous note (`benchmark/ordinary-task-note.md`) was already copied to `work/researchspec-notes/writing-evidence.md`. Let me check the current state and proceed with the verification task.

Looking at the situation:
- Goal: verify which draft claims in `benchmark/partial-manuscript.md` are supported by `benchmark/sources.yaml`
- The note already exists at `work/researchspec-notes/writing-evidence.md`
- Need to do the source-by-source check now- All sources are SYN-* (test fixtures); must NOT fabricate participants/effects/citations/ethics

Let me look at the draft claims and source mappings carefully.

---

Now let me update the writing-evidence.md note with the actual findings from the source-vs-claim check. First, let me carefully re-examine each draft claim against each source.

**Draft claims** (from `partial-manuscript.md`):
1. "Structured prompting coincided with more visible outline revisions in one introductory course" — backed by `CLM-01` (= SYN-CLASSROOM-01)
2. "Interview summaries also suggest that faster feedback may be offset by verification work" — backed by `CLM-02` (= SYN-INTERVIEW-02)
3. "The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence"

The user wants me to complete the verification — checking each draft claim against the supplied source summaries.

---

核查完成。

**Claim ↔ Source 核对结果**（所有 SYN-* 来源均为合成材料，无真实发表）：

| 稿内声明 | 来源 | 是否支撑 | 限定条件 |
|---|---|---|---|
| A. 结构化提示与更多提纲修改相关（CLM-01） | SYN-CLASSROOM-01 | ✓ 仅观察 | 无对照组、无验证量表、教师提供全部提示 |
| B. 反馈提速或被核查工作抵消（CLM-02） | SYN-INTERVIEW-02 | ✓ 仅观察 | 自报工作量、5 人便利样本、无时间日志 |
| C. "AI 减少工作量" 更强断言不被支撑（CLM-02） | SYN-INTERVIEW-02 | ✓ 否证 | 净减负从未被量化 |

**未引用的来源**：
- SYN-SURVEY-03 — 学生态度、可用于"学术诚信"段落
- SYN-POLICY-04 — 课程级披露规则、可用于"政策差异"缺失段落

**仍未补齐**：方法与证据局限、政策差异讨论、可替代解释、契合证据强度的结论。

笔记已写入 `work/researchspec-notes/writing-evidence.md`。无需 Gate/Decision；继续以独立文件工作进行。下一步由你决定：是按 (1) 接受当前校准并加短 Discussion，还是 (2) 进一步收窄范围。
