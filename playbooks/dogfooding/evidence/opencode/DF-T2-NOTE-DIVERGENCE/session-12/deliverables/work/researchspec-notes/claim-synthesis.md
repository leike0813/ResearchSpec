# Claim × Source Synthesis

> 基于合成材料。`SYN-*` 来源仅用于离线核查，不指向真实出版物。
> 目的：把 `benchmark/partial-manuscript.md` 中的现有论点与 `benchmark/sources.yaml` 中的来源逐条对齐，分清支持、部分支持、不支持与未知。

## 1. Introduction 中的背景陈述

> Universities are experimenting with generative AI in writing courses while instructors and students negotiate new expectations for feedback, authorship, and disclosure.

- 涉及来源：SYN-POLICY-04、SYN-SURVEY-03、SYN-INTERVIEW-02
- 对齐情况：
  - SYN-POLICY-04 直接说"课程层面披露规则被要求，但可接受的辅助由教师决定"，支持"教师/学生在 disclosure 与 authorship 上存在协商"。
  - SYN-SURVEY-03 显示学生对"被允许的用途与署名"感到不确定，支持"学生层面的协商"。
  - SYN-INTERVIEW-02 提到教师反馈更快但需要额外核查时间，是"反馈期望"被重塑的间接证据。
- 判定：**作为上下文成立**，但"negotiate"在合成材料中没有作为直接动词出现；属于由三份来源拼出的合理归纳，不能等同于因果或制度结论。
- 限定：四份来源均来自同一所合成高校或同一批对象，外推到其他机构没有依据。

## 2. CLM-01：结构化提示与提纲修订

> Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`).

- 直接来源：SYN-CLASSROOM-01
- 引用片段：Students using structured AI prompts produced more outline revisions, while final rubric scores varied widely.
- 判定：**支持**，且来源与论点逐字对应。
- 已知范围限制（来源自带）：
  - 没有对照组（no comparison group）
  - 没有写作提升的已验证度量（no validated measure of writing improvement）
  - 所有提示均由教师提供（instructor supplied all prompts）
- 因此陈述应当收紧为"在一门入门课程、六周观察窗内、且提示由教师设计的前提下，相关性可见"，不可外推为"结构化提示普遍提升提纲修订"。

## 3. 关于"反馈速度 vs. 核查负担"的隐含陈述

> Interview summaries also suggest that faster feedback may be offset by verification work.

- 直接来源：SYN-INTERVIEW-02
- 引用片段：Instructors reported faster formative feedback but additional time spent checking unsupported claims.
- 判定：**支持为教师自报经验**，与论点吻合。
- 已知范围限制：
  - 自报式工作量（self-reported workload）
  - 便利样本，五位教师（small convenience sample）
  - 没有时间日志（no time logs）
- 因此论点的强度应当是"教师描述中存在这种权衡"，而不是"生成式 AI 净减少/增加教师工作量"。

## 4. CLM-02：生成式 AI 减少工作量

> The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence.

- 候选来源：无
- 反向证据：SYN-INTERVIEW-02 中的"additional time spent checking unsupported claims"提示存在**额外的**核查负担，而非减少。
- 判定：**不支持**。草稿本身已正确标注此点。
- 建议措辞：在结论与摘要中继续保留"现有材料不支持减负结论"这一显式声明；若之后引入新来源（如时间日志或对照实验）再调整强度。

## 5. 草稿尚未覆盖、合成材料也未直接回答的部分

- "Methods and evidence-selection limitations"：可用 SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 / SYN-POLICY-04 自带的 limits 字段填充，但需要单独成段并标明每条限制所属来源。
- "Discussion of policy variation"：仅有 SYN-POLICY-04 一所合成高校的政策文本，材料不足以讨论跨机构差异。建议保留为开放议题而不是补写。
- "Explicit treatment of alternative explanations"：缺少对照组、缺少教师特征差异、缺少课程类型差异等替代解释在材料中没有量化信息；可在讨论章节以"已知未知"列出。
- "Conclusion calibrated to the supplied evidence"：在 CLM-02 已显式声明不支持的前提下，结论应避免任何"普遍减负""普遍提质"等强表述。

## 6. 暂时没有事实基础、需用户决定后再写的项

- 是否把 CLM-01 收紧为"相关性可见、不足以推断因果"是措辞选择。
- 是否将"faster feedback offset by verification work"升级为单独的次级论点 CLM-03（需要用户先决定 claim 强度）。
- 是否补写"alternative explanations"章节（涉及范围扩展，需用户先确认）。

## 证据强度小结

| 论点 | 证据来源 | 强度 | 关键限制 |
|---|---|---|---|
| 上下文：高校在协商反馈/署名/披露 | POL-04 + SUR-03 + INT-02 | 归纳级 | 同一所合成高校 |
| CLM-01：结构化提示与提纲修订 | CLASS-01 | 直接证据 | 单课程、无对照、无验证度量、教师提供提示 |
| 反馈速度与核查负担并存 | INT-02 | 自报证据 | 五位教师、无时间日志 |
| CLM-02：生成式 AI 减少工作量 | 无 | 不支持 | INT-02 提示反向 |