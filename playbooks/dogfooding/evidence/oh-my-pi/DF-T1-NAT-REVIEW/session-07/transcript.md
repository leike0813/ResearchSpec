



---



逐条对照审稿意见与现有稿件，结论如下：

| 意见编号 | 类别 | 是否需要修改稿件 | 处置 |
|---|---|---|---|
| Major-1 | 证据性质声明 | 是 | 在 Introduction 或 Methods 开头加入"本稿基于本地合成证据，仅供方法学探讨"的显式声明 |
| Major-2 | CLM-02 措辞过强 | 是 | 改写为反映"加速反馈与新增核查工作并存"的 trade-off，strength 标签保持 `unsupported_as_written`，并在结论中点名其证据限度 |
| Major-3 | CLM-03 因果性过强 | 是 | 移除或改写为未来研究假设（hypothesis_only），加入"未直接检验"的限定语，保留 policy-clarity 思路 |
| Major-4 | 缺 Methods 段 | 是 | 新增 Methods 段，说明四份合成材料的来源与选择标准，并明示"无对照组、无随机化、无时间日志 → 不可作因果推断" |
| Minor-1 | 术语一致 | 是 | 全文统一为"AI-generated feedback"（或按稿件原选词固定一个），杜绝两词混用 |
| Minor-2 | 局限性要进结论 | 是 | 在 Conclusion 段重复一次证据范围与 claim 强度限制，不要只放在 Methods |

`benchmark/revision-context.md` 已记录作者立场：接受1/2/4，对 3 保留思路但同意降级为假设。因此 Major-3 的处置与作者意图一致，不必再向用户确认。

---

**给审稿人的回复（草案，中文）**

> 尊敬的审稿人：
>
> 感谢您细致而建设性的审稿意见。本稿基于一份本地合成证据集（仅含 4 份来源材料），所有结论均限定在该范围内。我们逐条回应如下。
>
> **Major 1：在呈现发现前先声明证据为本地合成**
> 完全接受。在 Introduction末段与新增的 Methods 段开头均已加入显式声明，原文为："All evidence discussed below is drawn from a local synthetic corpus supplied for methodological exercise; it represents no real participants, courses, or institutions, and supports no causal claim." 此声明位于任何"finding"句之前。
>
> **Major 2：`CLM-02` 措辞过强**
> 完全接受。我们已将原文"Generative AI reduces instructor workload"删除，并替换为反映速度—核查权衡的表述："Faster formative feedback in the interview summaries (`SYN-INTERVIEW-02`) was accompanied by additional instructor time spent verifying AI-suggested claims; net workload change is not measured." claim ID `CLM-02` 仍保留，strength 标签保持 `unsupported_as_written`，措辞已无"reduces"类的方向性动词。该 claim 现以 trade-off 形式呈现，未量化净效应，亦未声明因果方向。
>
> **Major 3：`CLM-03` 的关系未被直接检验**
> 接受关于措辞的批评，但保留这一研究方向。具体改动：(a) 措辞改为"Clear disclosure guidance *may* be associated with fewer student uncertainties, but this relationship is not directly tested in the supplied evidence"；(b) `CLM-03` 的 strength 标签保持 `hypothesis_only`；(c) 在 Discussion 与 Conclusion 中将其归入"future research hypothesis"小节，并列出需要回答的问题（policy clarity 的操作化度量、学生不确定性的可重复测量、跨机构比较）。我们没有移除 policy-clarity 这条思路，因为它在教育实践中具有讨论价值；但稿件已不再对其作因果性表述。
>
> **Major 4：补 Methods 段并解释为何无法因果推断**
> 完全接受。新增 Methods 段，说明：(a) 4 份来源（`SYN-CLASSROOM-01`、`SYN-INTERVIEW-02`、`SYN-SURVEY-03`、`SYN-POLICY-04`）由研究团队在限定主题"生成式 AI 对高校写作教学的影响"下预先选定；(b) 选择标准为"覆盖教学过程、反馈、教师工作量、学生态度与机构政策"五个维度，每维度至少一份来源；(c) 因果推断不可用的原因：无对照组、无随机化、自陈式数据、便利样本、政策在数据收集期内变化——已逐条列出。该段同时声明所有材料为合成且不涉及真实参与者，无需 IRB 审批。
>
> **Minor 1：术语统一**
> 已接受。全文统一使用 "AI-generated feedback"，删除 "AI-assisted feedback" 这一异称，并在首次出现处给出定义。
>
> **Minor 2：局限性也要进入 Conclusion**
> 已接受。Conclusion 段不再只总结发现，而是以三句重申证据范围（本地、单课程/单机构、合成）、claim 强度（tentative / unsupported_as_written / hypothesis_only）与外推禁区。
>
> **未做改动的部分**
> 我们未补造任何参与者信息、效应量、引用或伦理审批；未尝试将 `SYN-*` 来源当作真实文献引用；未对原稿中"structured prompting coincided with more outline revisions"（`CLM-01`）做实质性改写，因为该 claim 在 Methods 限定下已属 tentative 表述。
>
> 再次感谢审稿人的意见，期待您的进一步判断。
>
> 此致
> 作者

---

**未修改稿件文件**：本任务只要求逐条分析与起草回复，未触碰 `partial-manuscript.md` 或 `claims.yaml`。若需要我按上述路线图落地稿件改动，请明确授权，我会同步更新 Methods段、三条 claim 措辞、术语统一与 Conclusion 补写，并保留 `CLM-01/02/03` ID 不变。
