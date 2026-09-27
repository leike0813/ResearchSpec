# 简短综述：生成式 AI 对高校写作教学的影响

> 由 `analysis-evidence-synthesis`（standalone 模式）执行。素材仅取自本基准包 `benchmark/sources.yaml` 的 4 条 SYN-* 合成材料，不补造参与者、效应量或外部引用。

## Claim Intent Manifest（一次性前置承诺）

```yaml
manifest_version: "1.0"
manifest_id: M-2026-09-27T-evidence-synthesis
emitted_by: synthesis_agent
emitted_at: 2026-09-27
intended_claims:
  - claim_id: C-001
    claim_text: "结构化 AI 提示可使提纲修订次数增加，但与最终评分之间的因果关系未被当前证据支持。"
    intended_evidence_kind: empirical
    planned_refs: [SYN-CLASSROOM-01]
    negative_constraints:
      - "不得将单课程、无对照、无效度检验的观察表述为普遍因果结论。"
  - claim_id: C-002
    claim_text: "教师报告的形成性反馈加速与核实无依据陈述耗时增加并存，工作量净效应未定。"
    intended_evidence_kind: empirical
    planned_refs: [SYN-INTERVIEW-02]
    negative_constraints:
      - "不得报告具体工时变化量；原始材料仅含自评与定性描述。"
  - claim_id: C-003
    claim_text: "学生在 AI 使用边界与署名规范上表达不确定，与现行政策把'可接受协助'留给任课教师的做法一致。"
    intended_evidence_kind: empirical
    planned_refs: [SYN-SURVEY-03, SYN-POLICY-04]
manifest_negative_constraints:
  - MNC-1: "全文不得使用'普遍证明''显著提升''因果表明'等强因果表述。"
  - MNC-2: "每条结论必须显式指出其依据来源与未定项；不得隐去限制条件。"
```

## 文献矩阵

| 来源 | 类型 | 范围 | 质量等级 | 主题：写作过程 | 主题：反馈质量 | 主题：教师工作量 | 主题：学术诚信 |
|---|---|---|---|---|---|---|---|
| SYN-CLASSROOM-01 | 课堂观察 | 1 门大一写作课，6 周 | VI（无对照、无效度） | 支持（提纲修订↑） | — | — | — |
| SYN-INTERVIEW-02 | 教师访谈 | 1 所学校，5 位教师 | VI（小样本、自评） | — | 支持（更快）+ 反对（核实成本） | 支持（含混净效应） | — |
| SYN-SURVEY-03 | 学生问卷 | 84 份自愿回答 | V（自愿偏差、态度≠行为） | — | 支持（看重速度） | — | 支持（边界与署名不确定） |
| SYN-POLICY-04 | 制度文本 | 1 所合成大学的政策 | V（文本不含执行证据） | — | — | — | 支持（披露要求；协助定义下放） |

## 关键主题

### 主题 1：学生写作过程的影响
**证据强度**：Emerging（仅 1 条来源，且为描述性观察）。
**合成**：SYN-CLASSROOM-01 显示，使用结构化 AI 提示的学生在 6 周内出现更多提纲修订活动，但最终按评分量表给出的分数差异很大。**依据**：单一课堂观察、无对照组、教师本人提供提示。**未定项**：是否构成"写作能力"的提升、提纲修订是否等同深度修订、不同提示设计之间的差异——均未被当前材料回答。

### 主题 2：反馈质量与节奏
**证据强度**：Emerging（2 条来源，证据方向一致但测量维度不同）。
**合成**：教师在访谈中报告形成性反馈更省时（SYN-INTERVIEW-02），学生在问卷中将"快速反馈"列为看重项（SYN-SURVEY-03）。**依据**：自评工作量 + 自愿样本态度数据。**未定项**：速度提升是否伴随准确性下降、AI 生成反馈的内部效度、学生对"快"与"准"的相对权重。

### 主题 3：教师工作量
**证据强度**：Emerging（1 条来源，混合方向）。
**合成**：访谈记录到反馈耗时下降，但核实学生未给出引用支撑的陈述耗时上升，二者方向相反且无时间日志。**依据**：5 位教师的小样本自评。**未定项**：净工时变化、培训与教研层面的成本、规模化班级下的外推性——材料均不支持结论。

### 主题 4：学术诚信与制度模糊
**证据强度**：Moderate（1 条态度证据 + 1 条制度文本，方向相互呼应）。
**合成**：学生在 SYN-SURVEY-03 中表达对"可使用范围与署名规范"不确定；SYN-POLICY-04 要求课程层面披露，但把"可接受协助"的判定留给任课教师。**依据**：自愿问卷 + 单校政策文本。**未定项**：制度执行质量、跨校一致性、学生实际行为（态度≠行为）、政策在中途发生变化（SYN-SURVEY-03 自承的局限）。

## 矛盾与处理

| 命题 A | 命题 B | 处理 |
|---|---|---|
| SYN-CLASSROOM-01：结构化提示带来更多提纲修订活动 | SYN-INTERVIEW-02：教师更多精力花在核实无依据陈述 | **条件差异**，非真矛盾：前者描述过程活动，后者描述产出端质量担忧。可在同一课堂同时成立；以"修订频次≠修订质量"为调和框架。 |
| SYN-SURVEY-03：学生看重快速反馈 | SYN-INTERVIEW-02：教师担忧准确性与核实成本 | **条件差异**：视角不同（接收 vs 供给）。当前材料无法区分"快而准"与"快而松"两类情形。**标为未解**。 |
| SYN-POLICY-04：要求课程级披露 | SYN-SURVEY-03：学生对边界与署名不确定 | **可调和**：政策把"可接受协助"留给任课教师，因此学生不确定与制度本身的去中心化一致，不构成矛盾。**调和依据**：政策文本明示下放。 |

### 跨材料张力清单

```yaml
cross_paper_tensions:
  - pair_id: CP-001
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-INTERVIEW-02
    candidate_basis: shared outcome (process / quality of writing with AI assistance)
    overlap_topic: AI 协助下的写作产出与教师核验负担
    a_finding: 结构化提示增加提纲修订活动
    a_evidence_pointer: SYN-CLASSROOM-01.finding
    b_finding: 教师更多时间核实无引用支撑的陈述
    b_evidence_pointer: SYN-INTERVIEW-02.finding
    pair_assessment: conditional_difference
    resolution_status: resolved_in_synthesis
    resolution_pointer: 矛盾与处理表，第 1 行
    scholar_confirmation: pending
  - pair_id: CP-002
    paper_a: SYN-SURVEY-03
    paper_b: SYN-POLICY-04
    candidate_basis: shared construct (permitted AI use / attribution)
    overlap_topic: 学生对 AI 使用边界的认知与制度安排
    a_finding: 学生对允许范围与署名不确定
    a_evidence_pointer: SYN-SURVEY-03.finding
    b_finding: 课程级披露被强制，"可接受协助"下放任课教师
    b_evidence_pointer: SYN-POLICY-04.finding
    pair_assessment: no_material_conflict
    resolution_status: not_applicable
    resolution_pointer: ~
    scholar_confirmation: pending
  - pair_id: CP-003
    paper_a: SYN-SURVEY-03
    paper_b: SYN-INTERVIEW-02
    candidate_basis: shared construct (feedback quality)
    overlap_topic: 反馈速度 vs 准确性
    a_finding: 学生看重快速反馈
    a_evidence_pointer: SYN-SURVEY-03.finding
    b_finding: 教师担忧核实成本上升
    b_evidence_pointer: SYN-INTERVIEW-02.finding
    pair_assessment: conditional_difference
    resolution_status: flagged_unresolved
    resolution_pointer: ~
    scholar_confirmation: pending
coverage_note:
  paper_count: 4
  candidate_pairs_considered: 3
  classes_not_exhaustively_checked: ["跨制度对照", "跨学生群体对照", "跨学科课程对照"]
  recall_limitation: 本扫描为召回有限的咨询性扫描，并非穷尽成对矛盾检测；书目耦合仅作为纳入信号。
```

## 知识缺口

1. **实证缺口**：尚无对"AI 辅助写作是否能提升写作能力"的效度化测量——SYN-CLASSROOM-01 自承无验证测量。
2. **方法学缺口**：4 条来源中无任何定量对照或预注册设计，无法支持因果或效应量陈述。
3. **理论缺口**：缺少界定"AI 可接受协助"的概念框架；现有政策（SYN-POLICY-04）将该判定下放，缺乏统一学术诚信理论支撑。
4. **时间缺口**：SYN-SURVEY-03 自承数据收集期间校内政策发生变化；该领域工具迭代速度快，单时点观察的时效有限。
5. **地理/机构缺口**：4 条来源各自限于单一机构，外推至其他类型高校（研究型、文理、社区学院）缺乏基础。

## 证据收敛图

```
Strong:      [          ] （0 主题 ≥3 条来源）
Moderate:    [====      ] 学术诚信与制度模糊（2 条：SYN-SURVEY-03 + SYN-POLICY-04）
Emerging:    [========  ] 反馈质量与节奏（2 条，方向一致）
Emerging:    [====      ] 学生写作过程（1 条，描述性）
Emerging:    [====      ] 教师工作量（1 条，方向混合）
Gap:         [          ] 写作能力的效度化测量、跨机构对照、长期追踪
```

## 综合局限

- 全部材料为合成基准，证据等级普遍偏低（V–VI 级），不宜外推为高校写作教学的总体趋势。
- 主题结构按用户关注领域划分，而非按材料自行浮现的维度——可能在描述上把单点观察放大为"主题"。
- 张力清单为咨询性扫描，未做穷尽配对；所标"已解"项系基于现有材料的最小调和，未必经得起更多数据检验。
- 未触发任何外部文献检索、未联网、未安装插件；未产生 DOI 或真实作者归属。

---

## 用户视角的执行汇报

- 模式：standalone（按 navigate 路由：用户请求为有界综述，无需 Gates/Decisions/并行）。
- 程序：`procedure:analysis-evidence-synthesis`，content_sha256=268afaf8b8adacc10d5324ccdb8f3932dfd7bd6a7b5c7538f9b7b72dc3baadaf。
- 输出：`work/researchspec-notes/evidence-synthesis-2026-09-27.md`（ordinary project file，按 standalone 权限放在 `researchspec/` 外）。
- 未变更：未创建任何 run / node / Gate / Decision / handoff；未修改 `researchspec/specs/` 或 `researchspec/runs/`。
- 未定项留待用户决定：
  - 是否把"反馈质量"主题暂标 Moderate 视为过强——证据方向一致但测量维度不同，可改 Emerging。
  - 是否要把 CP-003 暂标 flagged_unresolved 升级为强行调和——当前材料不支持。