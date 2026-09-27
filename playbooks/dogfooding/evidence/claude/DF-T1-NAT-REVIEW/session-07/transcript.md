# 逐条分析

| 编号 | 审稿意见 | 是否需要修改 | 处理建议 |
|---|---|---|---|
| Major-1 | 在呈现发现前声明证据为本地合成 | ✅采纳 | 在 Introduction 末尾、紧贴 Preliminary findings 之前新增 evidence-scope 段落，交代4 份合成材料的本地性、非代表性 |
| Major-2 | `CLM-02` 措辞过强 | ✅ 采纳 | 改写为"反馈提速与新增验证工作并存"，删除"reduces workload"原句；可保留 CLM-02 编号但 strength 改为 `hypothesis_only` 或新增限定语 |
| Major-3 | `CLM-03` 未被直接检验 | ⚠️ 部分采纳（保留命题、去除因果措辞） | 改为 future-research hypothesis 表述，去掉 "associated with fewer"，改为 "may reduce, pending direct test" |
| Major-4 | 补 Methods + 说明因果不可得 | ✅ 采纳 | 新增 Methods 小节，说明4 份 source 的选择依据、缺失对照组与基础事实量，因此不可做因果推断 |
| Minor-1 | 术语"AI-assisted feedback"与"generative AI feedback"统一 | ✅ 采纳 |选定一个术语（建议用 "generative AI feedback"），全文统一 |
| Minor-2 | 局限性在 conclusion 也需可见 | ✅ 采纳 | 在 Conclusion 段落复述关键 limitations：单门课程、自报数据、无时间日志、当地政策变化中 |

---

# 给审稿人的回复（草稿）

> **说明**：本草稿基于 `benchmark/` 下的合成材料，所有数据、source ID、claim强度均为合成测试样本，不对应真实研究或真实审稿过程。

---

**Reply to Reviewers — Manuscript "Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits"**

We thank the editor for the major-revision recommendation and both reviewers for their careful reading. Below we address each comment in order. All changes are confined to what the supplied synthetic evidence supports; we have added no new data, participants, effect sizes, citations, or ethics approvals. Claim IDs (`CLM-01`–`CLM-03`) are preserved where possible to keep continuity for downstream readers.

**Major Comment 1 — Local and synthetic nature of evidence**

We agree. We have inserted an *Evidence scope* note immediately before the Preliminary findings paragraph stating that all four supplied sources (`SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`, `SYN-POLICY-04`) are local, synthetic, and not generalizable, and that no causal claims are intended. The note is short and appears before any finding is introduced, as suggested.

**Major Comment 2 — `CLM-02` is too strong**

We agree and have revised it. The original wording ("Generative AI reduces instructor workload") is replaced with a balanced formulation that reflects the trade-off reported in `SYN-INTERVIEW-02`: faster formative feedback alongside additional time spent verifying unsupported claims. The claim ID `CLM-02` is retained for traceability, but its strength is now annotated as *hypothesis_only* with the limits made explicit in both the claim record and the running text. We considered removing `CLM-02` entirely, but keeping it (weakened) preserves the link to the interview signal and lets the discussion contrast the speed gain with the new verification burden.

**Major Comment 3 — `CLM-03` is not directly tested**

We partially agree. We preserve the underlying idea that clearer disclosure guidance *may* reduce student uncertainty about acceptable AI use, because the reviewer is right that it is a useful hypothesis, but we have removed all causal wording. The revised `CLM-03` now reads as a future-research hypothesis and is marked *hypothesis_only* in the claim record, with the limitation that the supplied materials do not directly compare policy clarity with uncertainty. The conclusion frames it as an open question rather than a finding.

**Major Comment 4 — Add a Methods section on source selection and the absence of causal inference**

We agree. We have added a *Methods* section covering: (i) why the four supplied sources were selected (only sources available in the evidence corpus); (ii) the design type of each source (single-course observation, small convenience-sample interview, voluntary survey, single policy excerpt); (iii) why causal inference is unavailable — no comparison groups, no time logs, no validated writing-quality measure, and a policy change during the survey window. The Methods section also restates that no ethics review was completed for this synthetic exercise, to avoid implying otherwise.

**Minor Comment 1 — Terminology consistency**

We agree. The manuscript now uses "generative AI feedback" throughout; "AI-assisted feedback" has been replaced wherever it appeared. A short glossary-style note in the Methods section anchors the term on first use.

**Minor Comment 2 — Limitations in the conclusion**

We agree. The Conclusion now opens with a limitations paragraph that re-states, in plain language, the four key limits (single course; self-reported workload without time logs; voluntary survey with possible response bias; policy change during data collection) and explicitly defers any generalization beyond the local setting. The detailed limitations remain in Methods as well.

**What remains limited**

Even after revision, the manuscript does not — and cannot, on this evidence base — support claims about workload reduction, writing-quality gains, or policy effectiveness at scale. We have flagged these as future-research hypotheses rather than findings. We have not introduced new effect sizes, citations, or comparison data.

We hope these revisions address the reviewers' concerns and welcome any further guidance.

Sincerely,
[Author name]

---

需要我顺手把上述修改落到 `partial-manuscript.md` 与 `claims.yaml` 生成 `revised-manuscript.md` / `response-letter.md` 吗？两个新文件即可，不会改既有 fixture。
