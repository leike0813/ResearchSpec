# 草稿论断核查报告

> 适用对象：`benchmark/partial-manuscript.md`
> 核查依据：`benchmark/sources.yaml`、`benchmark/claims.yaml`、`benchmark/goal.md`、`benchmark/README.md`
> 基准性质：合成测试材料（README 明示 `synthetic: true`），所有 `SYN-*` source ID 仅用于离线核查；本报告同样只用于本地核对，不外传为真实引用。

## 一、核查范围与方法

- 比对 `partial-manuscript.md` 的 Introduction 与 Preliminary findings 中可被证据断句的论断；
- 对照 `sources.yaml` 中四条合成资料的 `finding` 与 `limits`；
- 对照 `claims.yaml` 中三条已登记 claim 的 wording、`support`、`strength`、`limits`；
- 不联网、不外推、不补造数据；任何越界陈述均标为「待补证」。

## 二、逐条核查结果

### 1. 引言：「本稿考察一套小规模合成证据集，以识别可用假设与设计约束，而非追求普遍因果效应」

- 结论：与材料一致。
- 依据：`goal.md` 明确限制「只使用本基准包提供的合成材料」「明确区分观察、解释与未知项」「不补造参与者信息、效应量、引用或伦理审批」；`README.md` 标记本目录为 dogfooding 合成材料。
- 强度判断：可保留为引言事实。

### 2. Preliminary findings 第一句：「结构化提示与某门导论课（`CLM-01`）更明显的大纲修订相伴出现」

- 结论：与 `SYN-CLASSROOM-01` 一致；但稿件写法「coincided with」属相关表述，未声明因果，符合「tentative」标记。
- 支持点：
  - `SYN-CLASSROOM-01.finding`：「Students using structured AI prompts produced more outline revisions …」
  - 范围一致：一门 first-year writing course、持续六周。
- 仍需补证 / 需在稿件中显式说明的限制：
  - 单课程、无对照组、无验证过的写作质量度量、提示均由教师提供（`SYN-CLASSROOM-01.limits`）；
  - 修订活动量不等于写作质量——稿件尚未在后文显式拆开这两点；
  - `CLM-01` 的 wording 已用「may」「some」限定，稿件正文宜保留这一保守语气，不要替换为更绝对的表述。

### 3. Preliminary findings 第二句：「访谈综述亦提示，更快的反馈可能被核实工作所抵消」

- 结论：与 `SYN-INTERVIEW-02` 一致。
- 支持点：
  - `SYN-INTERVIEW-02.finding`：「Instructors reported faster formative feedback but additional time spent checking unsupported claims.」
- 仍需补证 / 需在稿件中显式说明的限制：
  - 自我报告式工作量、5 人便利样本、无时间日志（同 source `limits`）；
  - 「核实工作抵消」是定性描述，不能直接推得总工作量上升或下降；稿件应避免用「net」或「reduce」之类量化措辞。

### 4. Preliminary findings 第三句：「更强表述『生成式 AI 降低教师工作量（`CLM-02`）』不被现有证据支持」

- 结论：与 `claims.yaml` 与 `SYN-INTERVIEW-02.limits` 一致；稿件本身已自我降级，处理正确。
- 支持点：
  - `claims.yaml` 对 `CLM-02` 标注 `strength: unsupported_as_written`；
  - `SYN-INTERVIEW-02` 报告「既有时间节省，也有核实开销」，没有测量过总工作量。
- 仍需补证 / 需在稿件中显式说明的限制：
  - 稿件未点名这一限定仅依赖单条访谈资料，且无时间日志；建议在正文明示「单一资料来源、自我报告」；
  - 若后续要修订此句措辞，必须先把「净工作量」的方向交由用户/作者决定，避免无证据地翻转（goal 限制）。

### 5. `claims.yaml` 中 `CLM-03`（披露指引清晰度 ↔ 学生不确定性）

- 结论：稿件目前没有在 Preliminary findings 中讨论 `CLM-03`，正文未出现矛盾；但 `claims.yaml` 已登记其 `strength: hypothesis_only`。
- 仍未处理的缺口：
  - `SYN-SURVEY-03` 报告了学生不确定感；`SYN-POLICY-04` 描述政策要求披露、未提供实施质量数据；二者并未直接做关联对照；
  - 任何后续小节若引入「披露指引越清晰，不确定性越低」的方向性表述，都必须显式标注为 hypothesis，并说明目前未做直接比较。

## 三、稿件中尚未涉及、但与现有证据存在直接关联的话题

- `SYN-POLICY-04`：「课程级披露规则被要求，但可接受辅助的判定交由任课教师」——这一政策结构性事实可支撑关于「教师裁量空间」的限定讨论，但稿件目前未引用，建议若加入政策一节须显式说明政策文本不展示实施质量。
- 「学生态度 ≠ 观察行为」「数据收集期间本地政策发生变更」——这两条限制可影响 `SYN-SURVEY-03` 的解释，但稿件未提及；引入调查类数据时建议同步点明。

## 四、仍需补证 / 仍待作者决定的事项

1. 是否在正文中把 `CLM-01` 的范围限制（单课、无对照组、无质量度量、教师统一供提示）显式列出，避免读者把「more outline revisions」读成质量提升。
2. 是否在 Discussion 中保留 `CLM-02` 的「unsupported_as_written」标签，而不是被改写成「部分支持」或反向表述；按 `goal.md`，任何修改 claim 强度都需要先让用户决定。
3. 是否新增一节处理 `CLM-03`（披露指引 ↔ 学生不确定感）；若新增，须按 `claims.yaml` 保持 hypothesis_only，并注明当前两份资料未做直接对照。
4. 是否把 `SYN-SURVEY-03` 的自愿样本偏差与数据收集期内政策变更这两条限制写进 Methods 或 Limitations。
5. Methods / Discussion / Conclusion 三个缺失段落：当前证据不足以支撑因果或普遍化结论，撰写时必须显式标注证据等级与范围，不可补造效应量、参与者信息或伦理审批。
6. 若任何后续小节需要引用 `SYN-*` 之外的资料，须先确认 `goal.md` 的「只使用本基准包提供的合成材料」限制是否放开，否则一律不外推。

## 五、核查结论

- 稿件目前的三句 Preliminary findings 中，前两句与 `sources.yaml` 描述一致，第三句已自我降级，三句均未越界表述。
- 主要风险不在「说错了」，而在「说少了」：`CLM-01`/`CLM-02`/`CLM-03` 的限定条件目前只出现在 `claims.yaml` 与 `sources.yaml` 的元数据里，正文与后续段落（Methods、Discussion、Conclusion）尚未把这些限定显式表达出来。
- 在补写缺失段落前，建议先与作者/委托方对齐：(a) `CLM-03` 是否进入正文；(b) 是否新增政策章节；(c) 是否允许使用 `SYN-*` 之外资料；(d) 结论的强度上限。这四项属于 `goal.md` 明示的「需用户决定」范围，不得在未确认前自行越权修改。