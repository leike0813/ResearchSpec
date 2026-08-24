# ARS 能力分类学盘点（Capability Taxonomy Inventory）

> 状态：**草案 v1**（2026-08，七项开放问题已逐项决策并记录于 §6）
> 目的：为 ResearchSpec 吸收 ARS 打底——把上游 39 个 agent 拆成**去重后的能力清单**，形成未来图引擎的节点词汇与知识包提取映射。
> 数据来源：`vendor/ars` 快照中 39 个 agent 文件的 Role Definition / 程序结构 / 输出格式的结构化提取，以及上游官方分类资产（`model_tiering_manifest.json`、`docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md`、ARCHITECTURE.md）。
> 本文档是盘点产物，**不是**吸收方案。吸收时的"提升 / 降级 / 丢弃"策展决策在下一阶段进行。

---

## 1. 分类框架

### 1.1 三个正交轴

每个能力用三个轴定位：

| 轴 | 取值 | 说明 |
| --- | --- | --- |
| **工作性质**（capability class） | 发现 / 设计 / 分析 / 生成 / 校验 / 评判 / 转化 / 编排 | 该能力在学术工作中的认知角色 |
| **执行类型**（execution type） | judgment / execution / script / mixed | 沿用上游官方 tier（26 判断 / 13 执行），补入"脚本确定性"与"混合"两类。script = 上游已由 Python 脚本确定性执行；mixed = LLM 发射 + 脚本强制校验 |
| **建议节点类型**（node kind） | producer / checker / gate / decision / observer / orchestration | 映射到未来图引擎。orchestration = 吸收进图引擎本身，不作为能力工具交付 |

### 1.2 上游官方分类资产（作为输入，不照搬）

| 资产 | 内容 | 对本盘点的作用 |
| --- | --- | --- |
| `model_tiering_manifest.json` | 39 agent 文件 → judgment/execution 冻结分类（26/13） | 执行类型的初始值 |
| v3.9.2 phase classification | 4-bucket：A=23（单阶段硬栅栏）/ B=4（多阶段）/ C=8（相位正交）/ D=4（跨阶段元角色） | 识别哪些 agent 是"流程内嵌物"（Bucket D/C 多属编排），哪些是真正的能力单元 |
| agent 文件内的显式边界表 | 如 DA×2 关系表、claim_audit vs integrity 差异表、ethics vs integrity 差异表 | 去重的直接证据 |
| ARCHITECTURE.md §3 阶段矩阵 | stage × skill × agent × artifact × gate 全矩阵 | 输入/输出 role 的溯源 |

### 1.3 去重判定规则

两个上游 agent 合并为一个能力，当且仅当满足**全部**三条：
1. **程序同构**：核心步骤（procedures）结构相同，仅靶标/模板/参数不同；
2. **知识包共享**：依赖同一组参考知识（rubric、标准、检查表）；
3. **上游已承认边界**：上游文件中有显式关系表/差异表，或两者在官方分类中被声明为同一角色的不同实例。

仅满足其中一两条 → 拆为两个能力并在"横切协议"中记录共享部分。

---

## 2. 能力目录（34 项）

> ID 命名：`<域>-<名>`。核心 capability 包不再带 `cap-` 前缀；插件扩展保留 `plugin-*` 前缀。来源 agent 用上游文件名（去 .md）。

### 2.1 发现域

#### discovery-literature-search-screening · 文献检索与筛选
- **定义**：系统化、可复现的文献检索：检索策略设计 → 数据库检索 → inclusion/exclusion 筛选 → 注释书目 → 检索文档化（PRISMA 风格）。含 v3.6.5 语料优先流程（corpus-first，4 铁律 + PRE-SCREENED 块）。
- **来源**：`bibliography_agent`（deep-research P2）、`literature_strategist_agent`（academic-paper P1）
- **去重结论**：**合并**。上游两处程序同构（检索策略、筛选标准、注释书目、语料优先流程完全相同），差异仅消费者（研究报告 vs 论文）与输出容器。显式证据：v3.9.2 分类表标注 literature_strategist "≈ deep-research Phase 2 work"。
- **输入 roles**：RQ Brief（Schema 1）、可选 `literature_corpus[]`
- **输出 roles**：Search Strategy Report（含 PRE-SCREENED 块）、Annotated Bibliography（Schema 2）、Literature Matrix
- **知识包**：APA 7.0 引用规范、PRISMA 检索文档化标准、corpus 协议（4 铁律）
- **执行类型**：execution（官方）；**节点类型**：producer
- **脚本化机会**：筛选清单管理、PRE-SCREENED 块生成可确定性化

#### discovery-source-quality-grading · 来源质量分级
- **定义**：对进入管道的每条证据做质量门：证据层级分级（Level I–VII）、掠食性期刊红旗筛查、利益冲突标记、时效性评估、来源质量矩阵。
- **来源**：`source_verification_agent`（deep-research P2）
- **去重结论**：独立能力。与引文存在性验证（v3.11 脚本）分层：本能力评"证据质量"，脚本验"文献存在"。
- **输入 roles**：Annotated Bibliography；**输出 roles**：Verified & Graded Sources、Source Quality Matrix
- **知识包**：证据层级（7 级）、掠食性期刊红旗清单、COI 框架
- **执行类型**：judgment；**节点类型**：checker（评级即门输入）
- **脚本化机会**：掠食性期刊黑名单比对可脚本化，层级判定保留 LLM

#### discovery-literature-monitoring · 文献监测（出版后）
- **定义**：研究完成后按领域节奏监测新出版、撤稿、矛盾发现，产出监测摘要与配置。
- **来源**：`monitoring_agent`（phase-orthogonal）
- **去重结论**：独立、可选、advisory。**节点类型**：producer（可选节点，不进主图）

### 2.2 设计域

#### design-research-question-formulation · 研究问题构建
- **定义**：模糊主题 → 精确可研究问题：FINER 评分、范围边界（in/out of scope）、2–5 子问题（含 #547 子问题绑定）。
- **来源**：`research_question_agent`（P1）
- **输入**：用户意图；**输出 roles**：RQ Brief（Schema 1）
- **知识包**：FINER 框架、措辞模式提示清单（Kong #257）
- **执行类型**：judgment；**节点类型**：producer（后接 gate：用户确认 RQ）

#### design-methodology-design · 方法论设计
- **定义**：范式选择（实证/解释/实用）、方法选择（质/量/混合）、数据策略、分析框架、效度与信度标准——保证方法选择与研究问题逻辑连贯。
- **来源**：`research_architect_agent`（P1）
- **输入**：RQ Brief；**输出 roles**：Methodology Blueprint
- **知识包**：方法论决策树
- **执行类型**：judgment；**节点类型**：producer（后接 gate）
- **备注**：v3.6.7 PATTERN PROTECTION 约束其措辞模式；#518 可选交叉模型盲态检查

#### design-manuscript-structure-design · 稿件结构设计
- **定义**：论文结构选择（IMRaD/学科适配）、逐节大纲、字数分配、证据到章节的映射。
- **来源**：`structure_architect_agent`（P2）
- **输入**：Paper Configuration Record、Bibliography；**输出 roles**：Paper Outline + Evidence Map
- **执行类型**：judgment；**节点类型**：producer（后接 gate：大纲批准，上游铁律）

#### design-argument-blueprint · 论证蓝图
- **定义**：中心论点、子论点、claim-evidence-reasoning（CER）链、反方论点处理、逻辑流设计。
- **来源**：`argument_builder_agent`（P3 + Plan Step 3）
- **输入**：Outline；**输出 roles**：Argument Blueprint
- **执行类型**：judgment；**节点类型**：producer

#### design-writing-intake · 写作配置访谈
- **定义**：结构化访谈确定论文写作全部参数（类型/学科/期刊/引文格式/语言/字数），并自动检测上游交接物（RQ Brief、Bibliography）跳过冗余步骤。
- **来源**：`intake_agent`（P0，Bucket D 元角色）
- **输出 roles**：Paper Configuration Record、Style Profile（Schema 10）
- **执行类型**：execution；**节点类型**：producer（后接 gate：配置确认，上游铁律 ①）
- **备注**：作为独立能力，但“自动检测交接物”的跳步逻辑吸收进图引擎的入度判定（Q5 已定：入口确认外壳归图引擎 entry 模式，两个 intake 不合并）

#### design-review-panel-config · 评审团配置
- **定义**：识别论文的学科定位、研究范式、方法类型、目标期刊层级、成熟度，动态生成 5 位审稿人配置卡（EIC/R1/R2/R3/DA 的具体人设与关注点）+ 目标期刊推荐。
- **来源**：`field_analyst_agent`（reviewer P0，Bucket D）
- **输出 roles**：Reviewer Configuration Cards ×5、Field Analysis
- **执行类型**：execution；**节点类型**：producer（后接 gate：用户确认评审团，可调整）
- **备注**：与 writing-intake 同构（“访谈/识别 → 配置卡片”），但领域知识不同（对话 vs 分析）。Q5 已定：两个 intake 保留为独立能力，共享的“产出配置契约 → 确认门 → 下游输入 role”骨架归图引擎入口模式

### 2.3 分析域

#### analysis-evidence-synthesis · 证据综合
- **定义**：跨来源主题综合、矛盾识别与消解、证据收敛/发散映射、知识缺口分析、理论框架整合。
- **来源**：`synthesis_agent`（P3）
- **输入**：Verified Sources；**输出 roles**：Synthesis Narrative + Gap Analysis（Schema 3）
- **执行类型**：judgment；**节点类型**：producer
- **备注**：内嵌 R-CIM-A 声明意图清单发射（横切协议 C-03）与三层引用发射（C-04）

#### analysis-meta-analysis · 定量综合
- **定义**：纳入研究的定量合成：可行性评估 → 效应量 → 异质性 → 森林图数据 → 亚组/敏感性分析；不可行时产结构叙事综合框架；GRADE 证据确定性。
- **来源**：`meta_analysis_agent`（SR P3）
- **执行类型**：judgment；**节点类型**：producer（仅 systematic-review 子图）
- **脚本化机会**：效应量/异质性计算可脚本化（上游已引用软件实现）

#### analysis-risk-of-bias-assessment · 偏倚风险评估
- **定义**：用验证工具评估纳入研究的偏倚风险：RoB 2（RCT）/ ROBINS-I（非随机），领域级评估 + 信号问题 + 红绿灯可视化。
- **来源**：`risk_of_bias_agent`（SR P2）
- **执行类型**：judgment；**节点类型**：checker（SR 子图内）

#### analysis-temporal-extraction · 时间事实提取
- **定义**：逐来源提取时间事实（出版日期、生效区间、替代链、版本族）+ 第一方引用溯源（Crossref issued + pdftotext 首页扫描）为侧车工件。
- **来源**：`timeline_extraction_agent`（P2，v3.9.4）
- **输出 roles**：timeline.yaml、citation_provenance.yaml、version_records.yaml（sidecar）
- **执行类型**：execution；**节点类型**：producer
- **脚本化机会**：Crossref/pdftotext 部分上游已脚本化（M6）

### 2.4 生成域

#### generation-manuscript-drafting · 论文草稿撰写
- **定义**：依大纲与论证蓝图逐节撰写完整草稿；修订轮输出 patch 文档（#390）而非全量重发。
- **来源**：`draft_writer_agent`（P4 / P6）
- **输入 roles**：Outline、Argument Blueprint、Synthesis Report、Style Profile
- **输出 roles**：Paper Draft（Schema 4）、Revision Patch（sidecar）
- **执行类型**：execution；**节点类型**：producer
- **备注**：内嵌反泄漏 [MATERIAL GAP]（C-05）、R-CIM-A（C-03）、三层引用（C-04）、时间铁律（C-06）；v3.6.6 四调用结构是其评审侧约束（C-07），不是它自己的程序

#### generation-report-compilation · 研究报告编译
- **定义**：把研究发现/综合叙事/方法蓝图编译为 APA 7.0 完整研究报告（标题页至附录）。
- **来源**：`report_compiler_agent`（P4 / P6）
- **去重结论**：与 manuscript-drafting **共享写作引擎**（风格指南、写作质量检查、三层引用、R-CIM、时间铁律全部相同），差异在文档结构模板（研究报告 vs 论文）。**Q1 已定**：合并为单一 drafting 能力，`document_template` 参数化，模板必须是 schema 绑定的数据（章节列表 + 输入 role 映射 + 字数约束），禁止 prose 模板。
- **执行类型**：execution；**节点类型**：producer

#### generation-abstract-writing · 双语摘要
- **定义**：英文 + 目标语言（zh-TW）摘要独立撰写（非互译）+ 各 5–7 关键词。
- **来源**：`abstract_bilingual_agent`（P5b）
- **执行类型**：execution；**节点类型**：producer
- **知识包**：摘要写作指南、双语摘要质量标准

#### generation-figure-generation · 图表代码生成
- **定义**：解析论文数据/统计结果 → 发表级图表代码（matplotlib/seaborn 或 ggplot2），APA 7.0、色盲安全配色、LaTeX 集成。
- **来源**：`visualization_agent`（P4/P7 并行）
- **执行类型**：execution；**节点类型**：producer
- **知识包**：统计可视化标准（图表类型决策树 + 代码模板）
- **备注**：生成侧与校验侧（VLM 10 项 APA 清单，C-08）是两个节点：producer + checker

#### generation-format-rendering · 格式渲染
- **定义**：终稿转换为目标格式（MD/DOCX via Pandoc/LaTeX/PDF via tectonic）、期刊格式规范应用、封面信生成、引文格式转换（APA 7/Chicago/MLA/IEEE/Vancouver）。
- **来源**：`formatter_agent`（P7）的**转换层**（其 REFUSE 门另立为 check-terminal-policy-gate）
- **执行类型**：execution + script（渲染本身可脚本化）；**节点类型**：producer
- **备注**：上游 formatter 是"producer + 硬门"复合体，吸收时**必须拆开**——生成归生成，拒绝归 checker，否则门逻辑又藏进 prose

### 2.5 校验域

#### check-citation-existence-verification · 引文存在性验证
- **定义**：确定性验证每条引文是否存在：arXiv resolver + 四索引矩阵（k=0..4）+ SQLite 持久缓存 + 统一 `lookup_verified` 三态（true / false / unresolvable）。
- **来源**：`scripts/verification_gate/`（v3.11，无独立 agent——**上游已经是脚本**）
- **去重结论**：与 source-quality-grading、reference-integrity 分层清晰（存在性 / 质量 / 完整性三层）。
- **执行类型**：script；**节点类型**：checker
- **知识包**：degradation registry 中 citation_resolver_outage 语义（断网 → unresolvable，绝不等于 false）

#### check-reference-integrity-verification · 完整性验证
- **定义**：提交前/修订后 100% 事实核查全部引用、引文来源与数据：逐条 WebSearch 交叉核对 + 7 模式失败清单（M1–M7）+ 数据溯源审计 + claim 抽样（预审：100% 高影响 + 10% 随机哨兵）。
- **来源**：`integrity_verification_agent`（Stage 2.5 / 4.5，Bucket C）
- **去重结论**：独立。与 claim-faithfulness-audit 的显式边界：本能力验"引用存在 + 书目元数据 + 数据"，不验"来源是否真支持该 claim"。
- **执行类型**：judgment；**节点类型**：checker + gate（2.5/4.5 门；门的人类确认部分是 gate 节点）
- **知识包**：7 模式失败清单（M1–M7 固定顺序）、数据溯源审计标准

#### check-claim-faithfulness-audit · Claim 忠实性审计
- **定义**：逐条被引 claim 对检索原文做 LLM-as-judge：SUPPORTED / UNSUPPORTED / AMBIGUOUS / RETRIEVAL_FAILED + defect_stage；另探测无出处断言与约束违反；8 行 finalizer 矩阵区分 paywall/fabricated/anchorless/tool_failure。
- **来源**：`claim_ref_alignment_audit_agent`（Stage 4→5，opt-in）
- **去重结论**：独立（上游显式差异表）。**节点类型**：checker（opt-in，默认关）
- **知识包**：校准协议（20 元组金标集，FNR<0.15 + FPR<0.10 验收门槛）
- **备注**：实验支撑的 claim 不属于它（#260 边界），由 integrity 验——这是上游边界规则，吸收为 checker 的输入分流规则

#### check-citation-format-compliance · 引文格式合规
- **定义**：验证草稿全部引文的格式正确性、文中引用与文献表交叉核对、DOI/URL 检查、自动纠正。
- **来源**：`citation_compliance_agent`（P5a）
- **去重结论**：与 citation-existence-verification 分层：本能力查"格式对不对"，脚本查"文献在不在"。与 formatter 的引文转换共享引文格式知识包（APA 7/Chicago/MLA/IEEE/Vancouver 规则）。
- **执行类型**：execution + 可脚本化；**节点类型**：checker
- **知识包**：五种引文格式规范（与 format-rendering 共享）

#### check-temporal-integrity-verification · 时间完整性验证
- **定义**：Phase 4→5 边界 5-pass 验证：P1 算术 / P2 时代错置 / P3 比较词 / P4 因果 / P5 指示词。
- **来源**：`scripts/`（v3.9.4 M2 5-pass verifier，**上游已是脚本**）；写入方铁律内嵌于 drafting 能力（C-06）
- **执行类型**：script；**节点类型**：checker

#### check-terminal-policy-gate · 终端策略拒绝门
- **定义**：终审输出前检查 unresolved 高危注解：REFUSE 规则 1–12（HIGH-WARN×5、HIGH-BLOCK 通用、citation_existence strict）。formatter 只做盖章检查（policy_hash 新鲜度），**finalizer 是唯一策略评估者**。
- **来源**：`pipeline_orchestrator_agent` 的 finalizer 逻辑 + `formatter_agent` 的 REFUSE 规则段
- **去重结论**：从两个上游位置抽取合并为一个能力（上游自身声明"finalizer 唯一评估者、formatter 盖章"）。
- **执行类型**：script（策略评估可脚本化，上游已是确定性矩阵）；**节点类型**：checker（硬门）
- **备注**：这是吸收价值最高的"拆分"之一——把藏在大 agent 里的确定性逻辑剥出来

#### check-ethics-review · 伦理自检
- **定义**：AI 辅助研究的伦理标准核查（6 维度：AI 披露、署名、双重用途、公平表述、负责任使用等）；Critical 问题拦停用户一次（可覆盖，绝不 veto）；BLOCKED 永远可被用户带理由覆盖。
- **来源**：`ethics_review_agent`（DR P5，Bucket A）
- **去重结论**：与 compliance-check 分层：伦理=研究伦理六维度；合规=PRISMA-trAIce+RAISE 方法学合规。
- **执行类型**：judgment；**节点类型**：checker + gate（覆盖需记录）

#### check-compliance-check · 合规检查
- **定义**：PRISMA-trAIce + RAISE 原则检查（warn-only，绝不阻断）；警告写入披露声明；180 天新鲜度阈值。
- **来源**：`compliance_agent`（shared，Bucket C）
- **执行类型**：judgment；**节点类型**：observer（advisory）
- **知识包**：RAISE 框架、PRISMA-trAIce 协议

#### check-pre-submission-self-check · 投稿前自检（Q4 决策产物）
- **定义**：轻量投稿前自检：五维 rubric 单一“作者自检”视角，产出 advisory/软门结论；**不产生修订循环、不产生编辑决定**。Q3 提升的盲态预承诺协议绑定到本节点对（先承诺标准 → 自检消费承诺）。
- **来源**：`peer_reviewer_agent`（academic-paper P6）的降格残值（Q4：外部评审团为唯一评审权威；P6 评审循环删除）
- **去重结论**：与外部评审团是**不同节点类型**（checker ≠ 评审团 producer+decision），共用 Q2 的评审 rubric 知识包族；旧 `academic-paper:full` 的“写作+自检”体验 = 写作链子图 + 可选自检节点的 profile 组合。
- **执行类型**：judgment；**节点类型**：checker（可选节点，软门）

### 2.6 评判域

#### judgment-editorial-judgment · 编辑评判
- **定义**：以期刊编辑视角评估：原创性、方法严谨、证据充分、论证连贯、写作质量 → Accept/Minor/Major/Reject + 可执行反馈。
- **来源**：`editor_in_chief_agent`（deep-research P5，靶标=研究报告）、`eic_agent`（reviewer P1，靶标=论文；另含 Socratic 修订辅导角色）
- **去重结论**：**合并**（程序同构、verdict scale 相同），靶标参数化。eic_agent 的"修订辅导"角色另归 transform-socratic-mentoring 的对话引擎。
- **执行类型**：judgment；**节点类型**：producer（输出接入 decision 节点：编辑决定是分支）

#### judgment-specialist-review · 专家评审（R1/R2/R3）
- **定义**：三个固定视角的专家评审——R1 方法学严谨性（设计、采样、统计、效应量、可复现）、R2 领域深度（文献覆盖、理论框架、贡献增量）、R3 跨学科视角（跨域关联、实际影响、另类解释）。
- **来源**：`methodology_reviewer_agent`、`domain_reviewer_agent`、`perspective_reviewer_agent`
- **去重结论**：三份文件共享同一评审协议骨架（Expertise Configuration / Review Protocol / Sprint Contract / Output Discipline 结构相同），差异在视角 rubric。判定：**一个能力 + 三个视角参数**（视角=知识包），吸收为一个评审能力族而非三个独立工具。
- **执行类型**：judgment；**节点类型**：producer（并行）
- **知识包**：方法学谬误清单、学科评审锚点、跨学科评审姿态、统计报告标准、各领域顶级期刊表

#### judgment-devils-advocate-stress-test · 反方压力测试
- **定义**：只攻击不评分的压力测试：找最脆弱点、最大逻辑缺口、最强反方论点；逻辑谬误检测 + 偏见检测框架 + 严重度分类 + 让步阈值协议（回评 <4/5 不让步）。
- **来源**：`devils_advocate_agent`（deep-research，3 checkpoints，靶标=RQ/方法论/综合/报告，输出 PASS/REVISE）、`devils_advocate_reviewer_agent`（reviewer，靶标=完整论文，输出问题清单+最强反方论点）
- **去重结论**：**合并**（上游显式关系表确认同构：差异仅 stage/靶标/深度/输出形态）。
- **执行类型**：judgment；**节点类型**：checker + producer（checkpoint 语义 = 阶段性 checker；评审轮 = producer）
- **知识包**：逻辑谬误清单、偏见检测框架、让步阈值协议、攻击强度保持协议

> 原 `judgment-internal-peer-review`（内置模拟评审）已按 **Q4 决策**重新定名为 `check-pre-submission-self-check`，移至 §2.5 校验域。

#### judgment-review-synthesis · 评审综合仲裁
- **定义**：把多份评审报告综合为统一编辑决定信 + Revision Roadmap：构建矩阵 → 面板相对量词评估 → 按严重度解决优先级（三步骤机械协议 + forbidden-ops：不得新增评审意见、不得事后改 rubric）。
- **来源**：`editorial_synthesizer_agent`（reviewer P2）
- **执行类型**：judgment（协议本身近机械）；**节点类型**：producer + decision（输出即编辑决定分支）
- **知识包**：编辑决定标准、Sprint Contract 综合方协议

### 2.7 转化域

#### transform-revision-roadmap-parsing · 评审意见结构化
- **定义**：任意格式的评审意见（邮件/PDF 粘贴/列表/段落）→ 结构化 Revision Roadmap：分类、映射、优先级排序，输出作者明确知道改什么、什么顺序、在哪里。
- **来源**：`revision_coach_agent`（standalone，Bucket C）
- **执行类型**：judgment；**节点类型**：producer
- **备注**：独立模式（revision-coach 可无前置管道运行）——吸收后即一个独立子图入口

#### transform-revision-patching · 修订补丁应用
- **定义**：anchorize → patch 文档 → 确定性两阶段 apply（fail-closed，未触碰块字节保持）→ 升级检查点（结构性改动需 MANDATORY 确认）。
- **来源**：`scripts/ars_anchorize_draft.py` + `ars_apply_revision_patch.py`（#390，**上游已是脚本**）
- **执行类型**：script；**节点类型**：checker + gate（升级路径）
- **知识包**：patch schema、升级语义（full_reemission_escalated 溯源戳）

#### transform-socratic-mentoring · 苏格拉底引导
- **定义**：分层提问引导（5 层提问模型）→ 用户自行发现洞察：INSIGHT 提取、对话健康指标、SCR 协议（内部机制，不向用户提及）、措辞模式提示（不代拟问题，Kong #257 边界）。
- **来源**：`socratic_mentor_agent` ×2（deep-research：Q1 期刊主编人设，靶标=研究问题；academic-paper：博士导师人设，靶标=逐章规划）
- **去重结论**：**合并**（上游两份文件明示"同一机制不同人设"）：一个对话引擎 + persona/主题域参数。
- **执行类型**：judgment；**节点类型**：producer（对话型，独立子图入口）
- **知识包**：5 层提问模型、4 类问题分类法、收敛信号、措辞模式提示清单
- **备注**：eic_agent 的修订辅导子阶段（3→4，≤8 轮）与遗留辅导（3'→4'，≤5 轮）使用同一对话引擎——吸收为"辅导对话"节点类型，persona=EIC

### 2.8 编排域（吸收进图引擎，不作为能力工具交付）

| 上游 agent | 实际职责 | 吸收去向 |
| --- | --- | --- |
| `pipeline_orchestrator_agent` 的**检测/推荐**步骤 | 意图检测 + 模式推荐 + 材料检测 | 图引擎的入口路由（navigate）+ profile entries |
| `pipeline_orchestrator_agent` 的**调度/转移**步骤 | 阶段 dispatch、checkpoint 管理、transition | 图引擎的 frontier/transition 评估（现有 workflow-control 扩展） |
| `pipeline_orchestrator_agent` 的 **finalizer** | 终端策略唯一评估者 | 已并入 check-terminal-policy-gate |
| `state_tracker_agent` | 阶段状态记录 + Progress Dashboard | 图引擎的状态投影（现有 status/read models） |
| `collaboration_depth_agent` | 4 维协作深度评分（advisory） | observer 节点（可选）；评分知识包 `collaboration_depth_rubric.md` 保留为知识包 |
| `field_analyst_agent` / `intake_agent` 的**交接物检测** | 自动检测上游材料跳步 | 图节点的入度/前置 role 判定（引擎逻辑） |

**编排域结论**：6 个上游 agent 中 4 个半（orchestrator 三步骤 + state_tracker）的职责被图引擎原生吸收；只有 2 个半保留为能力（field_analyst 的评审团配置、intake 的写作配置、collaboration_depth 的观察评分）。

---

## 3. 上游 Agent → 能力反向映射（39 文件 → 34 能力）

| 上游 agent 文件 | 能力 | 合并/拆分 |
| --- | --- | --- |
| `bibliography_agent` | discovery-literature-search-screening | 合并 |
| `literature_strategist_agent` | discovery-literature-search-screening | 合并 |
| `source_verification_agent` | discovery-source-quality-grading | 独立 |
| `monitoring_agent` | discovery-literature-monitoring | 独立 |
| `research_question_agent` | design-research-question-formulation | 独立 |
| `research_architect_agent` | design-methodology-design | 独立 |
| `structure_architect_agent` | design-manuscript-structure-design | 独立 |
| `argument_builder_agent` | design-argument-blueprint | 独立 |
| `intake_agent` | design-writing-intake（跳步逻辑→引擎） | 拆分 |
| `field_analyst_agent` | design-review-panel-config | 独立 |
| `synthesis_agent` | analysis-evidence-synthesis | 独立 |
| `meta_analysis_agent` | analysis-meta-analysis | 独立 |
| `risk_of_bias_agent` | analysis-risk-of-bias-assessment | 独立 |
| `timeline_extraction_agent` | analysis-temporal-extraction | 独立 |
| `draft_writer_agent` | generation-manuscript-drafting | 与 report-compilation 共享引擎 |
| `report_compiler_agent` | generation-report-compilation | 与 manuscript-drafting 共享引擎 |
| `abstract_bilingual_agent` | generation-abstract-writing | 独立 |
| `visualization_agent` | generation-figure-generation | 独立 |
| `formatter_agent`（转换层） | generation-format-rendering | 拆分 |
| `formatter_agent`（REFUSE 层） | check-terminal-policy-gate | 拆分 |
| `citation_compliance_agent` | check-citation-format-compliance | 独立 |
| `integrity_verification_agent` | check-reference-integrity-verification | 独立 |
| `claim_ref_alignment_audit_agent` | check-claim-faithfulness-audit | 独立 |
| `ethics_review_agent` | check-ethics-review | 独立 |
| `compliance_agent` | check-compliance-check | 独立 |
| `editor_in_chief_agent` | judgment-editorial-judgment | 合并 |
| `eic_agent`（评审角色） | judgment-editorial-judgment | 合并 |
| `eic_agent`（辅导角色） | transform-socratic-mentoring（persona=EIC） | 拆分 |
| `methodology_reviewer_agent` | judgment-specialist-review（视角=R1） | 合并 |
| `domain_reviewer_agent` | judgment-specialist-review（视角=R2） | 合并 |
| `perspective_reviewer_agent` | judgment-specialist-review（视角=R3） | 合并 |
| `devils_advocate_agent` | judgment-devils-advocate-stress-test | 合并 |
| `devils_advocate_reviewer_agent` | judgment-devils-advocate-stress-test | 合并 |
| `peer_reviewer_agent` | check-pre-submission-self-check（Q4 降格） | 降格 |
| `editorial_synthesizer_agent` | judgment-review-synthesis | 独立 |
| `revision_coach_agent` | transform-revision-roadmap-parsing | 独立 |
| `socratic_mentor_agent`（DR） | transform-socratic-mentoring（persona=主编） | 合并 |
| `socratic_mentor_agent`（AP） | transform-socratic-mentoring（persona=导师） | 合并 |
| `pipeline_orchestrator_agent` | 图引擎（路由/调度/转移）+ check-terminal-policy-gate（finalizer） | 拆分吸收 |
| `state_tracker_agent` | 图引擎（状态投影） | 吸收 |
| `collaboration_depth_agent` | observer 节点 + 知识包 | 吸收+保留 |
| （脚本）`verification_gate/` | check-citation-existence-verification | 独立 |
| （脚本）`ars_anchorize/apply` | transform-revision-patching | 独立 |
| （脚本）5-pass temporal verifier | check-temporal-integrity-verification | 独立 |

**合计**：39 个 agent 文件 → 34 个能力（含 4 个上游已是脚本的能力：引文存在性、时间验证、修订补丁、终端策略门）。其中 6 类合并（literature×2、editorial-judgment×2、specialist-review×3、DA×2、socratic×2、drafting×2）、3 处拆分（formatter、eic、orchestrator）；2 个 agent 整体吸收进图引擎（orchestrator 的路由/调度部分、state_tracker），3 个 agent 部分吸收（intake 与 field_analyst 的交接物检测、collaboration_depth 的评分保留为 observer 知识包）。

---

## 4. 横切协议清单（不属于任何单个能力的共享约束）

这些协议内嵌在多个能力中（上游在多个 agent 文件里逐字节镜像），吸收时必须单源化：

| ID | 协议 | 内嵌于 | 吸收建议 |
| --- | --- | --- | --- |
| C-01 | Handoff 校验（必填字段缺失 → HANDOFF_INCOMPLETE） | 全部消费方 | 图引擎入度校验（脚本） |
| C-02 | Sprint 盲态预承诺（blind Phase 1 → visible Phase 2） | 评审能力族 + self-check | checker 协议，评审能力族共享（序保证归图引擎，见 Q6 分层） |
| C-03 | R-CIM 声明意图清单（一次发射、不得后改） | synthesis、draft_writer、report_compiler | 写作能力的发射约束 + claim 审计输入 |
| C-04 | 三层引用发射 + locator（ref:slug + anchor:kind:value） | 上述三 agent | 写作能力约束（脚本 lint 可验证） |
| C-05 | 反泄漏 [MATERIAL GAP]（无支撑填充必须标记） | draft_writer 等生成能力 | checker（脚本可检测标记缺失） |
| C-06 | 时间完整性铁律（写入方） | drafting 能力 | checker check-temporal-integrity-verification 的写入侧 |
| C-07 | v3.6.6 四调用结构（4a/4b/6a/6b） | drafting + self-check | **Q3 已定**：提升“盲态预承诺”通用协议（图引擎承诺-执行序对），丢弃 lint 重试/abort 语义与版本锁定维度 |
| C-08 | VLM 图形验证（10 项 APA 清单，≤2 轮精修） | figure-generation 下游 | checker 节点 |
| C-09 | Style Calibration（用户文风学习） | intake → drafting | 知识包 + 输入 role |
| C-10 | 评分轨迹监测（修订倒退标记） | revision 循环 | checker（脚本可算） |
| C-11 | 语料优先 4 铁律 | literature-search-screening | 该能力的硬约束（知识包 + 脚本 lint） |
| C-12 | 让步阈值协议（<4/5 不让步） | DA 能力 | 该能力硬约束 |
| C-13 | Passport reset/resume 协议 | 编排 | 图引擎的 subflow 恢复机制对应物 |
| C-14 | 模型分层（economy/quality-boost） | 全部能力 | 交付层策略，不进能力契约 |

**Q6 已定的归属分层**（“不许存在只有 prose 的规则”）：
- **引擎原生**：C-01（输入 role/schema 校验）、C-13（subflow 恢复）、C-02/Q3 的承诺-执行序保证、C-10/C-12（确定性策略计算）；
- **checker 节点**：C-08（VLM 图形验证）及全部 check-* 语义验证；
- **能力内嵌 + 引擎侧验证器**：C-03、C-04、C-05、C-06 写入侧、C-11（发射纪律写在能力契约段，每条配一个确定性验证器，上游 64 个 check_* 脚本作为验证器资产吸收）；
- **其他**：C-09 = 知识包 + 输入 role；C-14 = 交付层。

---

## 5. 图节点候选清单（分类学 → 图引擎词汇）

按建议节点类型汇总：

| 节点类型 | 能力 | 数量 |
| --- | --- | --- |
| **producer** | literature-search-screening、literature-monitoring、research-question-formulation、methodology-design、manuscript-structure-design、argument-blueprint、writing-intake、review-panel-config、evidence-synthesis、meta-analysis、temporal-extraction、manuscript-drafting、report-compilation、abstract-writing、figure-generation、format-rendering、editorial-judgment、specialist-review（×3 视角并行）、revision-roadmap-parsing、socratic-mentoring（+ 双型：devils-advocate-stress-test、review-synthesis） | 22 |
| **checker** | source-quality-grading、risk-of-bias-assessment、pre-submission-self-check、citation-existence-verification、reference-integrity-verification、claim-faithfulness-audit、citation-format-compliance、temporal-integrity-verification、terminal-policy-gate、devils-advocate-stress-test（checkpoint 形态）（+ 双型：ethics-review、revision-patching） | 12 |
| **gate** | 各 producer 后的确认门（RQ/配置/大纲/评审团/编辑决定/修订/冻结/格式）、reference-integrity-verification 的 2.5/4.5 门、ethics-review 覆盖确认、revision-patching 升级确认 | 约 13 |
| **decision** | editorial-judgment 输出分支（Accept/Minor/Major/Reject）、review-synthesis 输出分支、revision 循环选项 | 3 |
| **observer** | compliance-check、collaboration-depth 评分 | 2 |

---

## 6. 决策记录（七项，2026-08 逐项确认）

| # | 议题 | 决策 | 要点 |
| --- | --- | --- | --- |
| Q1 | drafting 合并边界 | **A**：合并为单一能力 | `document_template` 数据化模板参数（schema 绑定：章节列表 + 输入 role 映射 + 字数约束）；禁止 prose 模板；新文档类型 = 新增模板文件，程序零改动 |
| Q2 | 专家评审视角参数化 | **A**：单能力 + 视角知识包 | `reviewer_perspective`（R1/R2/R3 封闭枚举）为节点输入 role；人设由 review-panel-config 配置卡注入；rubric 四段式（评估要点 / 不管清单 / Sprint 评分维度 / 报告模板）；并行由 profile `parallel_groups` 表达 |
| Q3 | v3.6.6 四调用结构 | **A'**：提升模式、丢弃细节 | 提升“盲态预承诺”通用协议（图引擎承诺-执行序对 + checker 验证承诺先于执行）；丢弃 lint 重试/abort、版本锁定维度、命名偏移；激活权交 profile；绑定 self-check 节点对 |
| Q4 | 双评审层 | **C**：唯一权威 + 自检降格 | 外部评审团为唯一评审权威（编辑决定分支、修订循环原样保留）；P6 内置评审循环删除，残值降格为 `check-pre-submission-self-check` checker 节点（无修订循环、无编辑决定）；旧 full 体验 = 子图组合 |
| Q5 | 两个 intake 合并 | **C**：保留两个 + 外壳归引擎 | writing-intake（对话式）与 review-panel-config（分析式）程序类别不同，不合并；共享的“产出配置契约 → 确认门 → 下游输入 role”骨架归图引擎入口模式（entry producer + gate） |
| Q6 | 横切协议执行归属 | **C**：三层分层 | 引擎原生（C-01/C-13/序保证/确定性策略）· checker 节点（C-08 及 check-*）· 能力内嵌约束 + 引擎侧确定性验证器（C-03/C-04/C-05/C-06/C-11）。铁律：**不许存在只有 prose 的规则**；上游 64 个 check_* 脚本作为验证器资产吸收 |
| Q7 | 知识包提取顺序 | **A+C**：主链先行五里程碑 | M1 研究段 → M2 写作段 → M3 完整性与评审段 → M4 修订与定稿段 → M5 支线；每段内共享度高的包先提；图引擎 schema 设计与 M1 并行（Q6 已定校验器分层，引擎扩展清单不再依赖后续决策） |

### 决策后的落地清单（下一步工作）

1. **图引擎 schema 扩展**（与 M1 并行）：能力级节点类型、`document_template` 与 `reviewer_perspective` 等实例参数、输出工件验证器（schema checker 挂到边界产出）、转移前置条件（可引用验证器结果）、承诺-执行序对、入口模式（entry producer + gate）；
2. **M1 研究段能力落地**：5 个能力 + 知识包提取（APA 7.0、证据层级、FINER、PRISMA、语料 4 铁律、R-CIM、三层引用）；
3. **吸收策展闸门**：每个能力落地时对上游版本化文本执行提升/降级/丢弃判定（本盘点已对 C-07、P6 做出第一批判定）。

---

## 附录：分类轴取值说明

- **执行类型** judgment = 上游 tier "judgment"（26 个）；execution = 上游 tier "execution"（13 个）；script = 上游已由 Python 脚本确定性执行；mixed = LLM 发射 + 脚本强制校验。
- **节点类型** producer = 生成语义工件；checker = 产出判定/验证结果；gate = 人类确认门；decision = 分支选择；observer = 仅建议不阻断；orchestration = 吸收进图引擎。
- 上游 agent 文件数 39 与官方"38 唯一 frontmatter name"的差异（socratic_mentor 同名两份）在本盘点中按文件计。
