# 生成式 AI 对高校写作教学的影响：合成材料证据综合简报

> 范围说明：本综合仅基于 `benchmark/sources.yaml` 中的 4 份合成材料（`SYN-*` IDs，dogfooding 专用，**非真实研究**，无 DOI、出版物或外部对应文献）。所有可见引用均为合成 ID，不可在外部渠道复用或推断作者出处。合成材料有意保留证据强弱差异与已知冲突；本报告据此区分**观察**（材料直陈 finding）、**解释**（跨来源综合推断）与**未知**（材料未覆盖或显式 limits）。

## Claim Intent Manifest（一次性前置声明）

```json
{
  "manifest_version": "1.0",
  "manifest_id": "M-2026-09-27T00:00:00Z-evsyn01",
  "emitted_by": "synthesis_agent",
  "emitted_at": "2026-09-27T00:00:00Z",
  "claims": [
    {
      "claim_id": "C-001",
      "claim_text": "结构化 AI 提示可观察到学生在写作过程（提纲修改次数）上的可见变化，但最终评分结果不稳定且无对照。",
      "intended_evidence_kind": "empirical",
      "planned_refs": ["SYN-CLASSROOM-01"],
      "negative_constraints": [
        {"constraint_id": "NC-C001-1", "rule": "不得将该课堂观察推断为对学生写作能力的因果结论。"}
      ]
    },
    {
      "claim_id": "C-002",
      "claim_text": "教师层面的工作量呈现两向变化：形成性反馈加快，但核查 AI 未支持论断的负担加重，且证据为自报、无计时数据。",
      "intended_evidence_kind": "empirical",
      "planned_refs": ["SYN-INTERVIEW-02"],
      "negative_constraints": [
        {"constraint_id": "NC-C002-1", "rule": "不得把自报工作量变化表述为可量化效应。"}
      ]
    },
    {
      "claim_id": "C-003",
      "claim_text": "学生认可 AI 反馈速度，但对允许范围与署名规范存在不确定性；证据为态度而非行为。",
      "intended_evidence_kind": "empirical",
      "planned_refs": ["SYN-SURVEY-03"],
      "negative_constraints": [
        {"constraint_id": "NC-C003-1", "rule": "不得把态度数据外推为实际使用行为或违规率。"}
      ]
    },
    {
      "claim_id": "C-004",
      "claim_text": "机构层政策强制课程级披露，但把"可接受辅助"的实质判定下放给教师；政策文本与实施质量之间存在已知缺口。",
      "intended_evidence_kind": "descriptive",
      "planned_refs": ["SYN-POLICY-04"],
      "negative_constraints": [
        {"constraint_id": "NC-C004-1", "rule": "不得把单一机构政策扩展为高校普遍现状。"}
      ]
    },
    {
      "claim_id": "C-005",
      "claim_text": "跨来源整合显示：过程层面观察到增益，负担层面观察到向教师的再分配，机构层面政策—实施存在缺口；学习成果、长期影响与对照证据仍为空白。",
      "intended_evidence_kind": "interpretive",
      "planned_refs": ["SYN-CLASSROOM-01", "SYN-INTERVIEW-02", "SYN-SURVEY-03", "SYN-POLICY-04"],
      "negative_constraints": [
        {"constraint_id": "NC-C005-1", "rule": "不得使用因果语言描述该整合结论。"}
      ]
    }
  ],
  "manifest_negative_constraints": [
    {"constraint_id": "MNC-1", "rule": "不使用未经合成的效应量、p 值或置信区间——本批材料未提供。"},
    {"constraint_id": "MNC-2", "rule": "不补造参与者人数、机构名称或 IRB/伦理审批信息。"},
    {"constraint_id": "MNC-3", "rule": "不将 SYN-* 合成 ID 呈现为真实同行评议研究的引用。"},
    {"constraint_id": "MNC-4", "rule": "每个结论需同时标注【依据】与【不确定】；缺一不可。"}
  ]
}
```

## Synthesis Report

### Literature Matrix

| 来源 ID | 类型 | 范围 | 主题 A：过程与反馈增益 | 主题 B：负担再分配与核查成本 | 主题 C：政策—实施缺口 | 方法/证据等级 |
|---|---|---|---|---|---|---|
| SYN-CLASSROOM-01 <!--ref:syn-classroom-01--><!--anchor:quote:Students%20using%20structured%20AI%20prompts%20produced%20more%20outline%20revisions%2C%20while%20final%20rubric%20scores%20varied%20widely--> | 课堂观察摘要 | 1 门大一写作课，6 周 | 支持（提纲修改次数↑）；评分变异性大 | 未覆盖 | 未覆盖 | 单组前后观察，无对照（Level VI / Emerging） |
| SYN-INTERVIEW-02 <!--ref:syn-interview-02--><!--anchor:quote:Instructors%20reported%20faster%20formative%20feedback%20but%20additional%20time%20spent%20checking%20unsupported%20claims--> | 教师访谈摘要 | 1 所院校 5 位教师 | 支持（反馈加速） | 支持（核查未支持论断的时间↑） | 未直接覆盖（提及教师成为判定者） | 便利样本，自报（Level VI / Emerging） |
| SYN-SURVEY-03 <!--ref:syn-survey-03--><!--anchor:quote:Respondents%20valued%20rapid%20feedback%3B%20some%20reported%20uncertainty%20about%20permitted%20use%20and%20attribution--> | 学生问卷摘要 | 84 份自愿回应 | 支持（学生重视反馈速度） | 未直接覆盖 | 部分支持（数据收集期间本校政策变更） | 自愿样本，态度而非行为（Level VI / Emerging） |
| SYN-POLICY-04 <!--ref:syn-policy-04--><!--anchor:quote:Course-level%20disclosure%20rules%20are%20required%2C%20but%20acceptable%20assistance%20is%20left%20to%20instructors--> | 机构政策节选 | 1 所合成大学政策 | 未直接覆盖 | 间接支持（把"可接受"判定留给教师） | 支持（政策文本明确，但不显示实施质量） | 单一政策文本（Level VII / Descriptive） |

> 等级口径：本综合采用简化的 7 级体系，I = 系统综述/Meta，II = RCT，III = 队列，IV = 案例对照，V = 横断调查，VI = 定性/观察/自报，VII = 政策文本/规范性文献。`SYN-*` 全部落在 VI–VII 区间。

### Key Themes

#### 主题 1：写作过程层面观察到增益，但终点指标不稳定
**Evidence Strength**：Moderate（收敛于过程指标；终点指标来源分散且受限）
**Sources**：2（SYN-CLASSROOM-01、间接来自 SYN-INTERVIEW-02 的反馈加速自报）
**Synthesis**：在结构化提示条件下，学生层面可观察到"提纲修改次数增加"等过程性变化（SYN-CLASSROOM-01 <!--ref:syn-classroom-01--><!--anchor:quote:Students%20using%20structured%20AI%20prompts%20produced%20more%20outline%20revisions-->），与教师"形成性反馈更快"的主观体验方向一致（SYN-INTERVIEW-02 <!--ref:syn-interview-02--><!--anchor:quote:Instructors%20reported%20faster%20formative%20feedback-->）。但课堂观察同时记录"最终评分变异性大"（SYN-CLASSROOM-01 limits：无对照、无效度验证、提示由教师单方提供），说明过程增益尚未稳定传导到终点质量。
- **依据**：2 份来源对"过程/反馈加速"方向一致；评分结果在同份课堂观察中已自带变异提示。
- **不确定**：① 无对照，无法区分提示设计、AI 使用或学生原有水平差异；② "提纲修改次数"是否等价于写作能力提升，未在材料中得到验证；③ 时间窗口仅 6 周，长期迁移未观测。

#### 主题 2：负担从学生向教师再分配，核查未支持论断成为新成本
**Evidence Strength**：Moderate（教师侧集中证据；学生侧仅态度数据）
**Sources**：2（SYN-INTERVIEW-02、SYN-SURVEY-03 的态度间接侧证）
**Synthesis**：教师自报在 AI 辅助下获得反馈加速，但花费额外时间核查学生提交中的未支持论断（SYN-INTERVIEW-02 <!--ref:syn-interview-02--><!--anchor:quote:additional%20time%20spent%20checking%20unsupported%20claims-->）。学生侧对此并非"无感"——他们同时报告"对允许范围与署名规范的不确定"（SYN-SURVEY-03 <!--ref:syn-survey-03--><!--anchor:quote:some%20reported%20uncertainty%20about%20permitted%20use%20and%20attribution-->），而政策将"可接受辅助"判定下放给教师（SYN-POLICY-04 <!--ref:syn-policy-04--><!--anchor:quote:acceptable%20assistance%20is%20left%20to%20instructors-->），使教师承担事实上的判定与核查双重角色。
- **依据**：教师自报与政策文本对"判定责任"的方向一致；学生不确定性与教师新增核查负担在角色链上互补。
- **不确定**：① 教师自报，无计时数据，无法量化"净"工作量（增益是否抵消核查成本未知）；② 小样本便利抽样（5 位、1 校）使结论无法外推；③ 学生报告的"不确定性"是否真实影响其提交行为，材料未给出观察数据。

#### 主题 3：机构政策—课堂实施之间存在显式缺口
**Evidence Strength**：Moderate（政策文本明确，但实施证据缺失）
**Sources**：2（SYN-POLICY-04 显式陈述；SYN-SURVEY-03 通过"政策在数据收集期间变更"间接印证）
**Synthesis**：政策要求课程级披露，但把"何种辅助可接受"的实质判断留给任课教师（SYN-POLICY-04 <!--ref:syn-policy-04--><!--anchor:quote:Course-level%20disclosure%20rules%20are%20required-->），且政策文本本身不显示实施质量（SYN-POLICY-04 limits）。当政策本身在学期内发生变化（SYN-SURVEY-03 limits：当地政策在数据收集期间变更），学生与教师对边界的感知进一步错位。
- **依据**：政策条款与 limit 自我声明均指向实施侧证据不足；学生问卷中的不确定性提供了态度侧的间接侧证。
- **不确定**：① 政策→课堂的传导链未在本批材料中被观察；② "披露要求"的合规率、披露内容的形式与质量均无数据；③ 单一机构政策无法代表更广院校系统。

### Contradictions & Resolutions

| Claim A | Claim B | Resolution |
|---|---|---|
| SYN-CLASSROOM-01：使用结构化提示后学生产出更多提纲修改 → 可解读为"AI 提升写作投入" | SYN-INTERVIEW-02：教师花更多时间核查学生未支持论断 → 可解读为"AI 削弱了学生独立论证质量" | **可调和（条件性差异）**：两份材料指向不同行动者（学生 vs 教师）与不同阶段（过程性投入 vs 论证可信度）。综合解读是**过程可见增益 + 论证可信度下降**同时存在，二者并不互斥。证据强度都较弱，方向有待对照研究确认。 |
| SYN-INTERVIEW-02：教师反馈"加速" | SYN-INTERVIEW-02 同条：教师新增"核查未支持论断"的时间 | **同一来源内互补陈述**：非矛盾，是工作量结构变化的两个侧面。综合理解为净效应未明，需计时数据。 |

#### Cross-Paper Tension Inventory

```yaml
cross_paper_tensions:
  - pair_id: CP-001
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-INTERVIEW-02
    candidate_basis: shared RQ subtopic (writing process under AI assistance)
    overlap_topic: AI 辅助下写作过程是否改善
    a_finding: 学生提纲修改次数增加；评分结果变异性大
    a_evidence_pointer: SYN-CLASSROOM-01 finding + limits
    b_finding: 教师反馈加快，但新增核查负担
    b_evidence_pointer: SYN-INTERVIEW-02 finding + limits
    pair_assessment: conditional_difference
    resolution_status: resolved_in_synthesis
    resolution_pointer: Synthesis Report > Contradictions & Resolutions, ¶1
    scholar_confirmation: pending
  - pair_id: CP-002
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-SURVEY-03
    candidate_basis: shared construct (student-side writing experience)
    overlap_topic: 学生视角下的写作体验与 AI 价值
    a_finding: 课堂观察层面学生过程性产出增加
    a_evidence_pointer: SYN-CLASSROOM-01 finding
    b_finding: 学生重视反馈速度；对允许范围与署名不确定
    b_evidence_pointer: SYN-SURVEY-03 finding
    pair_assessment: no_material_conflict
    resolution_status: not_applicable
    scholar_confirmation: pending
  - pair_id: CP-003
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-POLICY-04
    candidate_basis: weak shared theme (course-level AI use)
    overlap_topic: 课堂层面 AI 使用规则
    a_finding: 课堂观察未触及政策层
    a_evidence_pointer: SYN-CLASSROOM-01 scope
    b_finding: 政策仅要求披露，可接受辅助由教师定
    b_evidence_pointer: SYN-POLICY-04 finding
    pair_assessment: insufficient_overlap
    resolution_status: not_applicable
    scholar_confirmation: pending
  - pair_id: CP-004
    paper_a: SYN-INTERVIEW-02
    paper_b: SYN-SURVEY-03
    candidate_basis: shared construct (feedback quality & acceptability)
    overlap_topic: 反馈体验与可接受使用边界
    a_finding: 教师反馈加速、核查负担增加
    a_evidence_pointer: SYN-INTERVIEW-02 finding
    b_finding: 学生重视反馈速度；对允许范围不确定
    b_evidence_pointer: SYN-SURVEY-03 finding
    pair_assessment: conditional_difference
    resolution_status: resolved_in_synthesis
    resolution_pointer: Synthesis Report > Key Themes > 主题 2
    scholar_confirmation: pending
  - pair_id: CP-005
    paper_a: SYN-INTERVIEW-02
    paper_b: SYN-POLICY-04
    candidate_basis: shared construct (acceptable-use judgement)
    overlap_topic: 谁来判定"可接受"
    a_finding: 教师在事实上承担核查与判定
    a_evidence_pointer: SYN-INTERVIEW-02 finding + limits
    b_finding: 政策把"可接受辅助"留给教师
    b_evidence_pointer: SYN-POLICY-04 finding
    pair_assessment: conditional_difference
    resolution_status: resolved_in_synthesis
    resolution_pointer: Synthesis Report > Key Themes > 主题 2
    scholar_confirmation: pending
  - pair_id: CP-006
    paper_a: SYN-SURVEY-03
    paper_b: SYN-POLICY-04
    candidate_basis: opposite-direction signal (policy certainty vs student uncertainty)
    overlap_topic: 政策边界与学生认知
    a_finding: 学生对允许范围与署名不确定
    a_evidence_pointer: SYN-SURVEY-03 finding
    b_finding: 政策已有披露要求
    b_evidence_pointer: SYN-POLICY-04 finding
    pair_assessment: conditional_difference
    resolution_status: resolved_in_synthesis
    resolution_pointer: Synthesis Report > Key Themes > 主题 3
    scholar_confirmation: pending
```

**Coverage Note**：4 篇文献；候选配对 6 对（穷举式全配对）。本清单是限定范围的咨询性扫描，不声称已完整识别所有跨来源张力。受检配对类型：共享 RQ 子题、共享构念/结果指标、方向性差异。所有配对的"学者确认"字段均设为 `pending`，未自行赋予 `confirmed`/`disputed`。

### Knowledge Gaps

1. **Empirical gap**：无长期学习成果或写作迁移证据。现有材料仅覆盖 6 周窗口与单门课程（SYN-CLASSROOM-01），无法回答"AI 辅助是否提升/损害学生后续课程或职场写作能力"。
2. **Methodological gap**：SYN-CLASSROOM-01 无对照；SYN-SURVEY-03 仅测态度而非行为；SYN-INTERVIEW-02 无计时数据。**没有一份材料**采用可比较的写作质量度量。
3. **Theoretical gap**：4 份材料均未引入明确的写作教学理论框架（如过程写作、写作迁移理论、支架教学）。现象观察缺少概念锚点。
4. **Temporal gap**：SYN-POLICY-04 提示政策处于演变期，SYN-SURVEY-03 报告期内政策变更。材料的时效性可能在数月内被新政策覆盖。
5. **Geographic/institutional gap**：所有材料均来自单一机构（且为合成机构），不可外推到不同类型高校（研究型/教学型/社区学院）、不同学科写作训练或不同语言环境。

### Evidence Convergence Map

```
Strong:      [          ] (0 themes; 仅有 ≥3 来源且高质量证据的主题尚不存在)
Moderate:    [======    ] 主题 1 过程与反馈增益     (2 sources, Level VI)
Moderate:    [======    ] 主题 2 负担再分配与核查   (2 sources, Level VI)
Moderate:    [======    ] 主题 3 政策—实施缺口      (2 sources, Levels VI–VII)
Emerging:    [===       ] 长期学习成果             (0 sources; 仅在材料未覆盖区)
Emerging:    [===       ] 跨机构/跨学科普适性      (0 sources; 仅在材料未覆盖区)
Gap:         [          ] 对照组写作质量度量       (0 sources)
```

### Theoretical Integration

本批合成材料未显式引用理论框架。如将现象映射到既有写作教学概念，可作如下连接（**注：此为综合侧的解读建议，非材料自述**）：
- 主题 1 的"过程增益 + 终点不稳定"与"过程写作法"对过程指标的强调一致，但终点变异提示尚未建立有效的支架—撤除（fading）机制。
- 主题 2 的"负担再分配"在"分布式认知/认知外包"视角下可解读为部分写作责任由 AI 接管，但随之产生的核查责任并未被既有理论显式处理。
- 主题 3 的"政策—实施缺口"与"教学实施差距"（implementation gap）文献同向，但本批材料无法支持量化估计。

### Synthesis Limitations

- 所有材料为 ResearchSpec dogfooding 合成数据，不构成真实研究证据；不得在外部语境作为真实引用传播。
- 仅 4 份来源，且全部来自单一合成机构，无法支撑跨机构、跨学科或跨语言的外推。
- 证据等级集中在 VI–VII（观察/自报/政策文本），缺乏量化与对照证据，所有主题的"Moderate"评级应被理解为**信号性**而非**结论性**。
- 综合过程未读取任何外部资源，仅依赖 `benchmark/sources.yaml` 中已声明的 finding/limits 字段；任何对长期、跨机构或行为层证据的论断均属未知。
- 跨来源张力的处理为限定范围咨询性扫描，6 对候选配对已穷举；不声明已识别全部潜在矛盾。
- 引用层使用合成 ID 作为 slug，所有引用点已附 `quote:` 锚点（≤25 词原文摘录，URL 编码），未使用 `page:` 锚点（本批材料无 PDF 与页码）；不存在 PDF 读取完整性问题，故无 PDF-integrity 警示行。