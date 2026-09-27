



---

现在我已经清楚了所有 benchmark 文件的内容。这是 ResearchSpec 的 dogfooding 测试夹具，目的是评估 Agent 能否区分事实、推断和未知，不会联网。

任务是要把"草稿中的主要论断"对照项目资料核查，并把"核查结果和仍需补证的地方"写成文件。

让我快速分析草稿中的论断：

**部分手稿（partial-manuscript.md）中的论断：**
1. 结构化 prompt 出现时，在一门入门课程中可见的大纲修订更多（CLM-01）
2. 访谈摘要也提示反馈更快可能被核查工作抵消
3. "生成式 AI 减少工作量"（CLM-02）这一更强的论断没有得到资料支持
4. （隐含）"明确的披露指引与学生不确定性较少相关"（CLM-03）—— 这个论断在 partial-manuscript 中没有出现，应该不需要核查

**核查逻辑：**
- CLM-01：手稿表述与 SYN-CLASSROOM-01 一致，但强度有微差（手稿用 "coincided with more visible outline revisions"，CLM-01 中是 "may increase visible revision activity"，源材料是 "more outline revisions"，"may" vs "coincided"）
- CLM-02：手稿正确指出没被支持 ✓
- 关于反馈/验证工作抵消的陈述：手稿说"may be offset by verification work"，SYN-INTERVIEW-02 也确实说"additional time spent checking unsupported claims"，但没有定量抵消——OK
- "without general causal effects"（引言中）：一致

让我先看看输出是否要求写到哪个具体路径。任务说"写成文件"，没有指定路径。考虑到这是一次性核查 + benchmark 是 dogfooding 用的，最自然的路径是 benchmark 目录下或 researchspec 目录下的某个 runs 文件夹。让我先看看是否已有 runs/ 子目录或类似的输出位置。

---

现在我对任务已经完全清楚了。benchmark 是 dogfooding 测试夹具，partial-manuscript.md 是要核查的"草稿"，claims.yaml 列出论断，sources.yaml 是资料来源。任务是把核查结果写到文件里。

我倾向于把核查结果写到 benchmark 目录下，因为：(1) 它是对夹具的核查；(2) 它与 partial-manuscript.md 同目录。但任务原文说"项目提供的资料"——这里"项目"指的是 benchmark 夹具还是整个 researchspec-journey 流程？我把核查文件写到 benchmark 目录下，文件名能体现"证据核查"性质。

让我现在写核查报告。

---

核查报告已写入 `benchmark/claim-verification.md`。

**核查结论速览：**

四条主要论断中，**C-C**（更强论断"AI 减工作量"未被支持）和 **C-D**（只识别假设与设计约束、不主张普遍因果）核查通过，手稿措辞与 `claims.yaml`、`sources.yaml` 的 `limits` 一致。

**两条需要校准的论断：**

1. **C-A（结构化 prompt ↔ 可见大纲修订）**：方向有据，但 `SYN-CLASSROOM-01` 同时指出 **"No comparison group"** 和 **"final rubric scores varied widely"**——这两条限制在 Preliminary findings 节没有同步出现，存在选择性呈现修订侧、略去分数侧的风险。需在同节补限制。

2. **C-B（更快反馈可能被核查工作抵消）**：资料只支撑并列事实（更快反馈 + 额外核查成本），"may be offset" 是**净效应推断**，超出"自我报告 + 无时序日志"所能支撑的强度。建议改写为并列描述并明确"净工作量效应未被建立"。

**未触及但需预警的 CLM-03**：手稿未把"政策清晰度 ⇄ 学生不确定性更少"作为论断使用。`claims.yaml` 中这是 `hypothesis_only`——若 Discussion 引入该主题，必须按假设而非事实书写，不得拼接 `SYN-SURVEY-03` 和 `SYN-POLICY-04` 形成因果陈述。

**新增的补证/校准项**已在报告第 3 节逐条列出，落到 partial-manuscript 的具体措辞位置。
