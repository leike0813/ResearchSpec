



---

Now I have a clear picture. The task is to verify the claims in `partial-manuscript.md` against the supplied `sources.yaml`. Let me carefully cross-check each main assertion.

---

Now I have a complete picture. Let me also check the skill navigation hint:

---

Now I have full understanding. Let me cross-check each main assertion in the manuscript against the supplied sources. I'll perform a careful, line-by-line check.

**Manuscript's main claims:**
1. Introduction statement: "small synthetic evidence set" — matches README/goal (synthetic fixture).
2. CLM-01 wording: "Structured use of generative AI may increase visible revision activity in some introductory writing contexts" — supported by SYN-CLASSROOM-01 (outlines + revisions; "one first-year writing course").
3. CLM-02 wording: "Generative AI reduces instructor workload" — manuscript already self-flags as not supported; matches SYN-INTERVIEW-02 limits (both savings + verification).
4. Interview observation: "faster feedback may be offset by verification work" — matches SYN-INTERVIEW-02 (faster feedback + checking claims).
5. CLM-03 wording: "Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use" — supported only as hypothesis; SYN-SURVEY-03 reports uncertainty, SYN-POLICY-04 requires disclosure but is text-only.
6. Missing sections list — that's structural, not a factual claim.

Let me also confirm a couple of subtle points: the manuscript says "structured AI prompts" (CLM-01) — sources say "structured AI prompts" → match. The manuscript says "more visible outline revisions" — sources say "more outline revisions" → match. The manuscript says "faster formative feedback" — sources say "faster formative feedback" → match.

Now let me write the verification report.

---

核查报告已写入 `benchmark/claims-verification.md`。要点摘要：

- **Introduction** 关于「synthetic evidence set, not general causal」—与 `goal.md`、`README.md` 一致，可保留。
- **Preliminary findings 第一句**（`CLM-01`：结构化提示 ↔ 更明显的大纲修订）—与 `SYN-CLASSROOM-01` 一致；但 `limits`（单课、无对照组、无质量度量、教师统一供提示）尚未在正文显式列出。
- **第二句**（更快反馈被核实工作抵消）—与 `SYN-INTERVIEW-02` 一致；但需显式说明该结论基于自我报告、5 人便利样本、无时间日志。
- **第三句**（`CLM-02`：工作量下降 unsupported）—稿件已自我降级；建议正文同步点出「单一来源、自我报告」以避免读者误读为多源结论。
- **尚未触及的论断**：登记的 `CLM-03`（披露指引 ↔ 学生不确定感）在正文未出现；`SYN-POLICY-04`（课程级披露要求、教师裁量空间）也未被引用。
- **待用户决定**（按 `goal.md`「如需改变研究范围或 claim 强度，必须先让用户决定」）：是否把 `CLM-03` 引入正文、是否新增政策章节、是否允许 `SYN-*` 之外资料、结论强度上限；Methods/Discussion/Conclusion 三个缺失段落不得在确认前自行补造效应量或参与者信息。
