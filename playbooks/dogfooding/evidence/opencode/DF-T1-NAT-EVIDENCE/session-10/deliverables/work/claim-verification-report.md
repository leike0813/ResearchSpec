# 草稿论断核查报告

- 核查对象：`benchmark/partial-manuscript.md`
- 证据池：`benchmark/sources.yaml`（SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 / SYN-POLICY-04）
- 既有论断表：`benchmark/claims.yaml`（CLM-01 / CLM-02 / CLM-03）
- 报告范围：仅就草稿正文实际出现的论断进行核查；不修改合成夹具，也不补造参与者信息、效应量或外部引用。
- 核查口径：「草稿语句」↔「claim 条目」↔「对应来源 finding 与 limits」三方比对。

## 一、草稿中的主要论断及核查结果

| # | 草稿语句（节选） | 对应 claim | 主要支撑来源 | 核查结论 | 依据 |
|---|---|---|---|---|---|
| 1 | 「Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`)」 | CLM-01 | SYN-CLASSROOM-01 | **SUPPORTED（措辞可信）** | 来源 finding：「Students using structured AI prompts produced more outline revisions」；scope 与「one introductory course」一致。草稿用 `coincided with` 而非 `caused`，与 `limits: No comparison group` 相容。 |
| 2 | 「Interview summaries also suggest that faster feedback may be offset by verification work」 | （隐含 CLM-02 的反向证据） | SYN-INTERVIEW-02 | **SUPPORTED（措辞可信）** | 来源 finding：「faster formative feedback but additional time spent checking unsupported claims」。`may be offset` 准确转述了「时间节省 + 验证负担」并存的双向效应，未把净效应说死。 |
| 3 | 「The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence」 | CLM-02 | SYN-INTERVIEW-02 | **SUPPORTED（自检合格）** | 来源 limits 明确指出：「No measured workload data」「Evidence reports both time savings and new verification work」。草稿主动拒斥该过度表述，与证据一致。 |
| 4 | 引言段：「Universities are experimenting with generative AI in writing courses while instructors and students negotiate new expectations for feedback, authorship, and disclosure」 | 无显式 claim | SYN-INTERVIEW-02、SYN-SURVEY-03、SYN-POLICY-04 共同背景 | **AMBIGUOUS（背景叙述）** | 三条来源均提及实验 / 协商 / 披露，但每条都带样本局限（5 人 / 84 份自选问卷 / 单校政策）。草稿没有标注这些边界，需在限定语句下使用。 |

合计：3 条显式论断均按证据强度得到忠实呈现，无 UNSUPPORTED；1 条背景性叙述需在使用时附样本边界。

## 二、claim 表中存在但草稿尚未覆盖的论断

| Claim | 草稿是否提及 | 风险 |
|---|---|---|
| **CLM-03**「Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use」（strength: hypothesis_only） | **未提及** | 草稿「Missing sections」中已列入「Discussion of policy variation」，但 CLM-03 本身未在正文出现。SYN-SURVEY-03 与 SYN-POLICY-04 的 finding 都被忽略——草稿因此放弃了来源池中约一半的素材。 |
| SYN-SURVEY-03 finding：「Respondents valued rapid feedback; some reported uncertainty about permitted use and attribution」 | 仅在背景句里间接提到「disclosure」，未引用具体 finding | 学生侧的「不确定性 / 归因模糊」观点完全缺位。 |
| SYN-POLICY-04 finding：「Course-level disclosure rules are required, but acceptable assistance is left to instructors」 | 未引用 | 政策结构（要求披露 + 判定权下放教师）这一关键背景缺失，会让 CLM-02 / CLM-03 缺乏制度语境。 |

## 三、仍需补证 / 进一步澄清的清单

按优先级排列；以下条目均为「当前 `sources.yaml` 不足以闭环」，而非要求联网或造数据。

1. **CLM-03 的因果方向**
   - 现状：claim 标 `hypothesis_only`，来源 limits 写明「supplied materials do not directly compare policy clarity with uncertainty」。
   - 缺证：缺少把「政策清晰度」与「学生不确定性」做对照的实证；当前两条来源只能拼出关联假设，不能写成「associated with fewer uncertainties」之类方向性更强的句子。
   - 建议补证方向：跨校政策文本 + 学生行为数据（不是态度问卷）；或针对同一学校政策变更前后做面板比较。

2. **CLM-02 的净工作量效应**
   - 现状：SYN-INTERVIEW-02 仅是 5 人自报、无时间日志（limits: Self-reported workload; Small convenience sample; No time logs）。
   - 缺证：净时间增减、任务切换成本、批改质量变化均无测量。
   - 建议补证方向：教师侧时间日志 / 任务抽样 + 学生侧作业回合时长对照；至少覆盖一个完整学期而非 6 周。

3. **写作质量的代理变量**
   - 现状：SYN-CLASSROOM-01 注明「No validated measure of writing improvement」「final rubric scores varied widely」。
   - 缺证：可见的「outline revisions」只是过程指标，不能等同写作质量。
   - 建议补证方向：rubric 信效度报告、inter-rater 一致性、或盲评前后对照。

4. **学生态度 → 行为的桥接**
   - 现状：SYN-SURVEY-03 是 84 份自选问卷（Voluntary response bias; Attitudes rather than observed behavior），且「Local policy changed during data collection」。
   - 缺证：态度波动期内的实际使用 / 披露行为；政策变化如何与态度同步演化。
   - 建议补证方向：行为日志 + 时间窗口固定的二次调查。

5. **政策的可推广性**
   - 现状：SYN-POLICY-04 是单校合成政策，「Not generalizable across institutions」。
   - 缺证：跨校政策的差异维度（披露门槛、可接受辅助范围、违规处置）。
   - 建议补证方向：多校政策文本对照表 + 实施访谈。

6. **替代解释 / 反例**
   - 现状：草稿「Missing sections」自列「Explicit treatment of alternative explanations」，正文目前完全没有。
   - 缺证：例如课堂层面的修订增加可能来自提示词设计而非 AI；教师自报的「更快反馈」可能受课程结构影响。
   - 建议补证方向：对每个 finding 至少给出一条可竞争的解释，并标注当前材料能否排除。

7. **样本与伦理边界**
   - 现状：所有来源都明示样本极小（1 节课 / 5 位教师 / 84 份问卷 / 1 校政策），且为合成材料。
   - 缺证：方法节缺位，使得任何「初步发现」都难以与正式论文的因果语气区分开。
   - 建议补证方向：补写「Methods and evidence-selection limitations」节，公开样本限制与是否需要伦理审批。

## 四、给草稿作者的具体修订建议（不代写）

- 把 `CLM-03` 显式纳入正文，并保留 `hypothesis_only` 强度；若提升为「associated with」，必须先补证项 1。
- 引言段（论断 #4）加一句样本边界，例如「within a single institution / small convenience samples」。
- 在「Preliminary findings」之后新增短段，引用 SYN-SURVEY-03 与 SYN-POLICY-04 的 finding，避免读者只看到课堂观察与教师访谈两侧。
- 「Missing sections」中列出的四项（Methods、policy variation、alternative explanations、conclusion）需要至少填写 Methods 与 alternative explanations 两节，否则现有论断的强度仍可能被读者高估。
- 维持对 CLM-02 的拒斥措辞；现有写法与证据一致，不应放宽。

## 五、核查过程留痕

- 比对方式：逐句提取 partial-manuscript.md 主张 → 映射到 claims.yaml / sources.yaml 的 finding + limits。
- 未做：未调用 `procedure:check-claim-faithfulness-audit`，因为该 procedure 要求 `manuscript-draft.v1` / `literature_corpus[]` 等结构化输入，超出本次合成夹具的形态；本报告以人工对照形式完成。
- 未触碰：`benchmark/*` 合成夹具、`researchspec/` 工作流状态。