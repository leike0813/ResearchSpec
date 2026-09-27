我先核对了一下文件：评论与稿件均为合成 dogfooding fixture，但既然你的练习是按真实审稿流程走，下面就当作真实一轮 major revision 来分析 + 起草回复。注：所有引用与数据严格沿用 `claims.yaml` / `sources.yaml`，不补造。

## 意见逐条处理判断

| # | 类型 | 是否需要修改 | 在当前稿件中的对应位置 | 处理建议 |
|---|---|---|---|---|
| Major-1 | 证据为本地 + 合成的声明前置 | 部分已做，需补强 | 现有 Intro 已出现"synthetic evidence set"一句，但位于 Preliminary findings **之前**的引导段过短 | 新增一段 "Scope and evidence base"，置于 Findings 标题下方，重复声明并明确只产出假设与设计约束 |
| Major-2 | `CLM-02` 措辞过强 | 需要重写（作者已接受） | Preliminary findings 已用 "not supported"，但仍隐含"被否证"的二元结论；`claims.yaml` 中 strength 标为 `unsupported_as_written` | 重写为"`generative AI assistance was associated with faster formative feedback but also with additional instructor verification work; net workload effect is not measured (CLM-02)`"。ID 保留，strength 改为 tentative |
| Major-3 | `CLM-03` 未直接测试 | 需要新增并降级（作者保留想法） | 当前稿件 **完全没有** `CLM-03`，需要从零加入 | 以 hypothesis 形式新增到 Findings 与 Discussion；措辞改为"may reduce / is proposed as a forward-looking research hypothesis / not directly tested in the supplied evidence"，去掉任何因果意味 |
| Major-4 | 新增 Methods 节 | 需要新增（作者已接受） | 已列在"Missing sections"中 | 新增 "Methods and evidence limitations" 节，说明四个来源是固定供应的合成证据库、选择由语料决定而非研究设计、缺乏对照组与随机化、所有结论均为本地观察，不支持因果推断 |
| Minor-1 | 术语统一 ("AI-assisted feedback" vs "generative AI feedback") | 需要统一 | 当前稿件使用 "generative AI" 一致；修订稿中如出现 "AI-assisted" 需替换 | 全文统一为 "generative AI feedback"，仅在指代更广工具族时保留 "AI-assisted" |
| Minor-2 | Limitations 在结论中也需可见 | 需要在结论节复述 | 当前稿件无 Conclusion | 新增 Conclusion，重复证据本地 + 合成的边界，逐条点名 source 的 limits（无对照组、自报、便利样本、单一机构政策等），把贡献定位为 hypothesis + design constraints |

无阻塞性歧义。Major 1 / 4 的处理互有重叠，合并到同一段 Scope note 里写最省力；CLM-02 与 CLM-03 的措辞改动严格遵循 `claims.yaml` 中已声明的 strength 与 limits，没有引入新事实。

---

## 给审稿人的回复（草稿）

> **Subject: Response to reviewers — Major revision**
> 
> Dear Editor and Reviewers,
> 
> We thank the editor and reviewers for the close reading and constructive comments. Below we respond to each point in turn. Claim IDs (`CLM-01`, `CLM-02`, `CLM-03`) are preserved, and all revisions stay within the supplied evidence base — no data, sources, or effect sizes have been added. A tracked-changes manuscript is provided alongside this letter.
> 
> **Major comments**
> 
> **1. State that all evidence is local and synthetic before presenting findings.**
> 
> Addressed. We have added a short **"Scope and evidence base"** paragraph immediately under the Findings heading. It states that the four supplied sources are local and synthetic, and that the manuscript reports observations to support hypothesis generation and design constraints rather than generalizable effects. The sentence in the Introduction that already names the synthetic evidence set remains; the new paragraph makes the boundary explicit at the point where findings appear.
> 
> **2. `CLM-02` is too strong; revise to reflect the trade-off or remove it.**
> 
> Addressed by revising, not removing — we believe the underlying observation is worth retaining. The claim now reads:
> 
> > *Generative AI assistance was associated with faster formative feedback but also with additional instructor time spent verifying AI-suggested claims; the net effect on instructor workload is not measured in the supplied evidence (`CLM-02`).*
> 
> This wording preserves the trade-off noted in `SYN-INTERVIEW-02` and removes the unsupported net-effect claim. The Preliminary Findings paragraph was rewritten accordingly. We have also moved `CLM-02` from `unsupported_as_written` to `tentative` in the claims register to reflect the rebalanced statement.
> 
> **3. The relationship in `CLM-03` is not directly tested; treat it as a hypothesis.**
> 
> Addressed. We agree that the supplied policy and survey sources do not jointly compare policy clarity with student uncertainty. The claim is reframed as a forward-looking hypothesis:
> 
> > *Clear institutional disclosure guidance may reduce student uncertainty about acceptable AI use; this association is not directly tested in the supplied evidence and is proposed here as a hypothesis for future research (`CLM-03`).*
> 
> `CLM-03` is now introduced only in the Discussion as a hypothesis-only item; no causal wording remains. The strength label in the register remains `hypothesis_only`.
> 
> **4. Add a Methods section explaining source selection and the unavailability of causal inference.**
> 
> Addressed. A new **"Methods and evidence limitations"** section now precedes the Findings. It documents that (i) the four sources are the entire supplied evidence base and were not sampled from a wider population by us; (ii) selection was determined by the corpus rather than by a pre-specified research design; (iii) there are no comparison groups, no random assignment, and no pre-registered outcomes; and (iv) the conclusions therefore must remain local and hypothesis-generating. The section then itemises the per-source limits (`SYN-CLASSROOM-01`–`SYN-POLICY-04`).
> 
> **Minor comments**
> 
> - **Consistent terminology for "AI-assisted feedback" and "generative AI feedback".** Addressed. The manuscript now uses *"generative AI feedback"* consistently in Findings, Discussion, and Conclusion; *"AI-assisted"* is retained only where a broader family of tools is meant.
> - **Surface limitations in the Conclusion.** Addressed. The new Conclusion opens with the local and synthetic nature of the evidence base, restates that contributions are hypotheses and design constraints, and names the most consequential limits of each source.
> 
> We believe these revisions address the editors' recommendation of major revision. We are happy to make further adjustments if anything remains insufficiently clear.
> 
> Sincerely,
> [Authors]

---

下一步通常是把这份回复对应的正式修订稿（带 Methods、Scope note、改写后的 CLM-02 / 新增 CLM-03、新 Conclusion）写出来。要我接着起草那一份修订稿吗？因为涉及 claim 强度的最终定稿，按 `goal.md` 的约束应当先让你确认两点：(a) CLM-02 改写是否落到上述措辞；(b) CLM-03 假设化是否完全去掉政策因果意味。
