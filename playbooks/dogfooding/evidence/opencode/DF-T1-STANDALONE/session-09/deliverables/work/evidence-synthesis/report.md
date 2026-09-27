# 生成式 AI 对高校写作教学的影响 —— 证据综合简报

> **范围声明**：本简报仅基于 `benchmark/` 提供的合成材料（`SYN-CLASSROOM-01`、`SYN-INTERVIEW-02`、`SYN-SURVEY-03`、`SYN-POLICY-04`）。这些是 ResearchSpec dogfooding 的合成测试样本，不对应真实研究、真实参与者或真实政策。报告中的所有发现都标注其证据强度与来源出处；任何综合判断均与原始发现分离。

---

## 0. 三类陈述的区分

为避免混淆观察与解释，本简报对每条陈述做如下标注：

- **[观察]**：直接出自某个 source 的 finding 字段，未做外推。
- **[解释]**：基于多个 source 的合理综合，但已超出任何单一 source 的直接陈述。
- **[未知]**：现有材料未覆盖、被来源 limits 排除或需要进一步研究的问题。

---

## 1. 文献矩阵（Literature Matrix）

| Source ID | 类型 | 范围 | 核心发现（一句话） | 关键限制 | 证据强度 |
|---|---|---|---|---|---|
| SYN-CLASSROOM-01 | 课堂观察总结 | 一门大一写作课，6 周 | 使用结构化 AI prompts 的学生做出更多大纲修订，最终评分变化大 | 无对照组；无验证写作改善测量；所有 prompts 由教师提供 | Emerging（单课程、无对照） |
| SYN-INTERVIEW-02 | 教师访谈总结 | 同一所机构 5 位教师 | 教师报告形成性反馈更快，但额外花时间检查无支持论断 | 自报工作量；小便利样本；无时间日志 | Emerging（自报、n=5） |
| SYN-SURVEY-03 | 学生问卷总结 | 84 份自愿回答 | 学生重视快速反馈；部分对允许使用与归属不确定 | 自愿反应偏差；态度非行为；数据收集期间本地政策变化 | Emerging（便利样本、横断面态度） |
| SYN-POLICY-04 | 机构政策摘录 | 一所合成大学 | 要求课程级披露，但可接受辅助由教师决定 | 文本不显示实施质量；不可跨机构推广 | Emerging（单点政策文本） |

证据强度统一为 **Emerging**，原因：所有 source 都存在便利样本、自报或范围限制；任何一条都不足以支撑强结论。

---

## 2. 关键主题（Key Themes）

### 主题 A：写作过程层面的影响

**[观察]** SYN-CLASSROOM-01 报告，使用结构化 AI prompts 的学生产生更多大纲修订。

**[解释]** 大纲修订频次增加本身并不等同于写作质量改善；同 source 注明最终评分变化大，意味着修订行为与最终成绩之间并不存在直接对应关系。

**[未知]**
- 这些大纲修订是更深入修改，还是只在表面措辞层面？
- 没有对照组，无法区分"使用 AI"与"接受结构化指导"两者的独立贡献（教师是 prompts 的来源）。
- 6 周观察之外，学生的写作能力如何演化？

### 主题 B：教师反馈工作量与质量权衡

**[观察]** SYN-INTERVIEW-02：教师报告形成性反馈更快，但额外花时间检查无支持论断。

**[解释]** 反馈提速与核查负担上升呈现一种典型的"工作流再平衡"：AI 加速初轮反馈，但把工作转移到事实验证环节。净工作量变化方向不明确——需要时间日志才能判断。

**[未知]**
- 实际净工作量增减（自报不等于测量）。
- 检查"无支持论断"的具体频次和典型来源。
- 不同学科、不同作业类型之间的差异。

### 主题 C：学生体验与归属不确定

**[观察]** SYN-SURVEY-03：84 名被调查者重视快速反馈；部分人对允许使用范围和归属规范不确定。

**[解释]** "重视快速反馈"与"对规则不确定"并存，说明学生并非简单抗拒或拥抱 AI，而是处于一种缺乏清晰边界的实用主义状态。这种状态会增加无意违规的风险。

**[未知]**
- 学生的实际使用行为（survey 是态度，不是行为）。
- 不确定感是否影响学习投入或成绩。
- 不同年级、专业之间的差异（样本未分层报告）。

### 主题 D：政策与课堂执行的落差

**[观察]** SYN-POLICY-04：要求课程级披露规则；可接受辅助由教师决定。

**[解释]** "披露 + 教师裁量"组合在文本层面是清晰的，但文本不显示实施质量。结合主题 C 的学生不确定感，提示存在政策→课堂→学生认知之间的传递落差。

**[未知]**
- 教师是否在课堂传达政策（policy 文本不显示实施质量）。
- 学生对披露要求的实际遵守率。
- 不同课程之间的规则一致性。

---

## 3. 矛盾与待解张力（Contradictions & Resolutions）

| 张力点 | 来源 A | 来源 B | 评估 | 处理 |
|---|---|---|---|---|
| 反馈"更快" vs 教师额外负担 | INTERVIEW-02：反馈更快 | INTERVIEW-02（同 source）：检查论断耗时↑ | 条件性差异，不矛盾 | 标注为"工作流再平衡"，**未解决**——需要时间日志数据 |
| 学生重视 AI vs 对规则不确定 | SURVEY-03：重视快速反馈 | SURVEY-03（同 source）：归属与允许使用不确定 | 不矛盾，共存状态 | 标注为"实用主义 + 规则模糊"并存 |
| 政策要求披露 vs 政策不显示实施 | POLICY-04：要求披露 | POLICY-04（同 source）：实施质量不可见 | 来源自身的限制 | 标注为"政策-执行落差" |

**Cross-Paper Tension Inventory**（按 `analysis-evidence-synthesis` 程序 Step 3b 规范）：

```yaml
cross_paper_tensions:
  - pair_id: CP-001
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-INTERVIEW-02
    candidate_basis: shared construct (process/fb change), opposite viewpoint axis
    overlap_topic: AI 对写作过程与反馈的影响方向
    a_finding: 学生层面，大纲修订频次增加
    a_evidence_pointer: SYN-CLASSROOM-01 finding
    b_finding: 教师层面，反馈提速但核查负担增加
    b_evidence_pointer: SYN-INTERVIEW-02 finding
    pair_assessment: conditional_difference
    resolution_status: flagged_unresolved
    resolution_pointer:
    scholar_confirmation: pending

  - pair_id: CP-002
    paper_a: SYN-SURVEY-03
    paper_b: SYN-POLICY-04
    candidate_basis: shared construct (policy clarity)
    overlap_topic: 学生对允许使用与归属规范的认知
    a_finding: 部分学生对允许使用与归属不确定
    a_evidence_pointer: SYN-SURVEY-03 finding
    b_finding: 政策要求课程级披露，但可接受辅助由教师决定
    b_evidence_pointer: SYN-POLICY-04 finding
    pair_assessment: conditional_difference
    resolution_status: flagged_unresolved
    resolution_pointer:
    scholar_confirmation: pending

  - pair_id: CP-003
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-SURVEY-03
    candidate_basis: agent-noted cross-cluster (process vs attitude)
    overlap_topic: 写作过程层面 AI 的接受度
    a_finding: 学生使用结构化 prompts 修订更多大纲
    a_evidence_pointer: SYN-CLASSROOM-01 finding
    b_finding: 学生重视快速反馈
    b_evidence_pointer: SYN-SURVEY-03 finding
    pair_assessment: no_material_conflict
    resolution_status: not_applicable
    resolution_pointer:
    scholar_confirmation: pending
```

**Coverage Note**：corpus = 4 份合成 source；候选对 = 3。**这是范围内建议性扫描，不构成完全成对的矛盾检测**。书目耦合仅作为纳入信号；低耦合不排除成对。学者的 `pending` 状态由其后续确认；本程序不自赋 `confirmed/disputed`。

---

## 4. 知识缺口（Knowledge Gaps）

| 缺口类型 | 描述 | 含义 |
|---|---|---|
| 经验性 | 全部 source 均无对照组或行为测量 | 无法判断因果；任何"AI 提升/损害"陈述都越界 |
| 方法论 | 只有访谈 + 自报问卷 + 单课程观察 | 缺乏随机化、纵向、行为数据 |
| 理论性 | 没有显式理论框架 | 缺乏机制解释（如修订为何增加却未带动分数） |
| 时间性 | 课堂观察 6 周、问卷横断面 | 缺长期效果与延时影响 |
| 地理性 | 单机构或单课程 | 不可跨机构推广 |
| 实施性 | 政策文本与课堂执行之间缺链 | 披露要求是否落地未知 |

未来研究方向（基于缺口）：
1. 引入对照组的设计（教师 prompts vs 无 prompts；AI 辅助 vs 人工辅助）。
2. 教师工作量的客观时间日志。
3. 学生实际使用行为（非自报）。
4. 多机构、跨学科的政策实施差异。
5. 长期效果与延时影响。

---

## 5. 证据收敛图（Evidence Convergence Map）

```
Strong:       [          ] (无)
Moderate:     [          ] (无)
Emerging:     [========  ] 写作过程影响 (CLASSROOM, n=1)
              [========  ] 反馈工作量权衡 (INTERVIEW, n=1)
              [========  ] 学生态度 (SURVEY, n=1)
              [========  ] 政策-执行落差 (POLICY, n=1)
Gap:          [==========] 对照组设计、长期效果、行为测量、跨机构比较
```

**没有任何主题达到 Moderate 以上**。所有命题目前都属"提示性"而非"证据性"。

---

## 6. 与可能理论框架的接口（理论整合）

**[解释]** 现有 source 不提供理论框架，但可标注与常见框架的潜在接口：

- **认知分配理论（cognitive offloading）**：学生把初稿组织/措辞工作外包给 AI，可能解释主题 A 的修订频次增加。
- **教学身份重构（teacher role shift）**：从反馈作者转向核查者，与主题 B 的"工作流再平衡"一致。
- **政策模糊与合规行为**：制度允许教师裁量 + 学生对规则不确定，与主题 D 的落差一致。

**[未知]** 这些都是潜在接口，未在 source 中被验证；不应当作结论使用。

---

## 7. 综合的局限（Synthesis Limitations）

- corpus 仅 4 份，**全部为合成材料**，不代表真实世界证据。
- 所有 source 都有便利样本、自报或范围限制。
- 没有任何 source 提供效应量、置信区间或统计检验。
- 没有伦理审批信息可引用。
- 跨主题综合属于推断而非证据，文中已用 [解释] 标注。
- **不可把上述"主题 A/B/C/D"的观察性陈述外推到普遍因果结论**（与 `benchmark/goal.md` 约束一致）。

---

## 8. 可核对结论清单（核对索引）

> 这一节是本简报的"可核对"部分：每条结论都能映射回具体 source 与具体字段，方便读者逐条核对。

| # | 结论 | 类型 | 来源 | 来源字段 |
|---|---|---|---|---|
| C1 | 使用结构化 AI prompts 的学生在 6 周课堂观察中产生更多大纲修订 | 观察 | SYN-CLASSROOM-01 | finding |
| C2 | 该课堂最终评分变化大，未呈现统一提升或下降 | 观察 | SYN-CLASSROOM-01 | finding |
| C3 | 课堂观察无对照组，所有 prompts 由教师提供 | 观察（限制） | SYN-CLASSROOM-01 | limits |
| C4 | 5 位教师报告形成性反馈更快 | 观察 | SYN-INTERVIEW-02 | finding |
| C5 | 同批教师额外花时间检查无支持论断 | 观察 | SYN-INTERVIEW-02 | finding |
| C6 | 教师工作量数据为自报、无时间日志 | 观察（限制） | SYN-INTERVIEW-02 | limits |
| C7 | 84 名学生重视快速反馈 | 观察 | SYN-SURVEY-03 | finding |
| C8 | 部分学生对允许使用与归属不确定 | 观察 | SYN-SURVEY-03 | finding |
| C9 | 问卷为自愿样本、态度非行为、数据收集期本地政策变化 | 观察（限制） | SYN-SURVEY-03 | limits |
| C10 | 该机构政策要求课程级披露 AI 使用 | 观察 | SYN-POLICY-04 | finding |
| C11 | 该机构政策把可接受辅助范围留给教师裁量 | 观察 | SYN-POLICY-04 | finding |
| C12 | 政策文本不显示实施质量、不可跨机构推广 | 观察（限制） | SYN-POLICY-04 | limits |
| C13 | 大纲修订频次与最终成绩之间不存在直接对应 | 解释 | 综合 C1+C2 | 本简报 §2.A |
| C14 | 教师反馈提速与核查负担上升属于"工作流再平衡"，净工作量方向未定 | 解释 | 综合 C4+C5+C6 | 本简报 §2.B |
| C15 | 学生处于"实用主义 + 规则模糊"并存状态 | 解释 | 综合 C7+C8+C9 | 本简报 §2.C |
| C16 | 政策-课堂-学生认知存在传递落差 | 解释 | 综合 C10+C11+C8 | 本简报 §2.D |
| C17 | 没有任何 source 达到 Moderate 证据强度 | 综合评估 | 所有 limits | 本简报 §5 |
| C18 | 全部命题目前属于"提示性"而非"证据性" | 综合评估 | 所有 source | 本简报 §5、§7 |

---

## 9. 一句话总结（保守版）

> 在 `benchmark/` 提供的合成材料范围内，生成式 AI 与高校写作教学的相互作用呈现四个**提示性**主题（写作过程修订增加、教师反馈工作流再平衡、学生实用主义态度与规则不确定、政策-执行落差），但**没有任何一条**能被现有材料确证为普遍因果结论；任何把短期课堂观察扩展为普适论断的做法均超出本简报的证据范围。
