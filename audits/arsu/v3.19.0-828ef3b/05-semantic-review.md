# ARSU Anchor Semantic Review — v3.19.0-828ef3b

> 本文件是 Agent 语义审阅记录，不替代脚本生成的数值审计。数值审计回答“覆盖多少”，本文件回答“语义是否真的被保留或有意改编”。

## 审阅范围

首锚点审阅覆盖：

- 上游 4 个 Skill、27 个 mode、42 个 agent 定义、90 个 reference、22 个 template。
- 119 个 extraction artifacts（47 capability + 72 knowledge-pack）。
- 47 个转换后 capability package（38 个 ARS-derived + 4 个 paper-humanizer + 5 个 review-response vendor-derived）。
- 5 个 graph profiles：minimal、research-main、academic-paper、academic-paper-reviewer、academic-pipeline。
- 三份人类审阅 HTML + parity report + gap semantic review。

## 逐项语义判定

| 上游语义 | 转换后承载 | 判定 | 证据 |
|---|---|---|---|
| FINER 研究问题评分 | `design-research-question-formulation` | preserved | procedure 保留 FINER 5 维与 3.0/2.0 阈值 |
| PRISMA 检索/筛选 | `discovery-literature-search-screening` | preserved | procedure 保留 two-pass screening、dedup、PRISMA 记录 |
| RoB 2 / ROBINS-I | `analysis-risk-of-bias-assessment` | preserved | 5/7 domains、aggregation、traffic-light 均在 |
| GRADE / 异质性 / forest plot | `analysis-meta-analysis` | preserved | GRADE 表与 I²/Q/tau² 完整 |
| Claim Intent Manifest | `analysis-evidence-synthesis` | preserved | 保留预承诺 manifest 与 cross-paper tension inventory |
| 双语摘要独立写作 | `generation-abstract-writing` | preserved | independent composition、独立性 red/green flags 保留 |
| Zero orphans / Retraction Watch | `check-citation-format-compliance` | preserved | orphan、DOI、撤稿协议均保留 |
| DA Strongest Counter-Argument | `judgment-devils-advocate-stress-test` + reviewer profile `da` 节点 | preserved | 输出块完整，profile 已接线为 specialist ∥ da → synthesis |
| Re-review verification | `check-pre-submission-self-check` Re-Review Verification Branch | adapted | Judge Record / checklist / commitment ledger / residual issues 已内聚到 checker 分支 |
| Rebuttal QA | `transform-revision-roadmap-parsing` Rebuttal-Audit Branch | adapted | coverage table / gap list / risk flags 已保留，advisory-only 边界显式 |
| Passport reset boundary | `check-passport-verifier` Reset Boundary Verification | adapted | awaiting_resume / consumes_hash / pending_decision / append-only 语义已写入 |
| Stage/Phase orchestration | graph profiles 与 Gates | intentionally removed from SKILL | `Stage 1 RESEARCH`、`FINAL INTEGRITY`、`Process Summary` 为流程锚点，引擎承担 |
| Ethics review 七维 | `check-compliance-check` Responsible-Use Review | adapted | disclosure/attribution/dual-use/fair representation/data ethics/COI/human subjects 已写入；overridable BLOCKED 保留 |
| Revision provisional response | `transform-revision-patching` | adapted | response_to_reviewers 输出角色 + addressed/declined/partial 状态 |

## 流程权威检查

- [x] 全部 capability SKILL 无 `next phase` / `proceed to <node>` / 上游 agent-team invocation。
- [x] 3 个流程锚点（Stage 1 RESEARCH、FINAL INTEGRITY、Process Summary）由 pipeline profile/Gate 承载，评估为 flow 而非 gap。
- [x] 27 个 mode 均在审阅工件中可见，无 orphan mode。

## 风险与遗留

- `check-compliance-check` 同时承载 PRISMA/RAISE 与 deep-research ethics review，语义边界靠输入 mode 区分；若后续出现独立 ethics capability 需求，应拆分。
- `check-pre-submission-self-check` 与 `transform-revision-roadmap-parsing` 采用分支扩展，而非独立 capability；可接受但需在增量维护中持续监控分支膨胀。
- `academic-pipeline:resume_from_passport` 通过 passport-verifier 与 terminal-policy-gate 守卫，尚无独立 graph entry/Decision；如正式支持该 mode，建议新增显式 resume decision 节点。

## 结论

### 2026-09-05 输入合同修复复核

本轮复核 `enforce-capability-input-contracts` 修改的八个能力清单与五个预设图。上游 commit
仍为 `828ef3b`，extraction 切片和知识包原文未修改。已读取本轮生成的三份审阅 HTML；
parity 仍为 47/47 operational，低于阈值、缺输出和流程残留列表均为空。以下判定以源文和
节点输入合同为依据，数量检查不替代语义判断。

| 修改对象 | 原文依据与当前承载 | 判定 |
|---|---|---|
| Writing intake | `01_writing_intake.md` 的 “Paper Configuration Interview”；配置访谈读取项目意图，`specs.project` 通过 stable_spec 解析 | adapted：修正来源，访谈正文保留 |
| Structure design | `02_manuscript_structure_design.md` 的 “map evidence to sections” 和 Literature Search Report；结构节点显式消费书目 | preserved：必需书目得到绑定 |
| Manuscript drafting | `04_drafting.ms-variant.md` 的 “outline and argument blueprint” 与文献材料检查；保留 argument_blueprint，并接入已有必需 synthesis_report | preserved：补齐图合同，不改变写作程序 |
| Review panel | `02_review_panel_config.md` 的 “Read the complete paper”；稿件允许 handoff 或明确上游输出 | adapted：两种文件交换来源显式化 |
| Editorial judgment | `03_editorial_judgment.reviewer-variant.md` 的 “Reviewer Configuration Card #1” 和 “Reading the full paper is expected”；绑定稿件与 panel 配置 | preserved：不再把 specialist_review 当作稿件替代 |
| Specialist review | `04_specialist_review.r3-variant.md` 的 “Reviewer Configuration Card #4”；配置成为必需声明，现有 panel 产出绑定保留 | preserved：清单与已有程序一致 |
| Devil's advocate | `05_devils_advocate.reviewer-variant.md` 允许读取 paper draft 和提供的 artifacts；保留稿件必需、配置可选，但配置绑定来源必须合法 | adapted：显式允许两种交换来源 |
| Format rendering | `03_format_rendering.md` 的 “Formats the final manuscript”；独立 format 入口通过 handoff 消费原稿 | adapted：保留独立入口的真实输入来源 |

Research quick/full 的 report 程序始终要求 synthesis 与 methodology，本轮保留该要求。
Minimal 复用六个研究能力，无 formal Gate；research-main 保留 RQ Gate，由研究问题产出后触发，
下游 methodology/literature 等待确认，研究问题节点自身不依赖该 Gate。Quick 路由从
单次简报标注调整为分阶段研究成本，属于用户已确认的图组合调整。Pipeline 显式传递
annotated_bibliography 与 synthesis_report 到 writing child，不从 report 文本猜测或抽取角色。

逐 mode 复核覆盖 deep-research quick/full、academic-paper full/format-convert、
academic-paper-reviewer full 和 academic-pipeline end-to-end。评估 HTML 的三个 flow 锚点
仍由图控制；gap review 中既有 ethics、rebuttal、re-review、passport 等观察延续前述判定，
本轮未借输入校验改变它们的能力程序或宣称新增语义覆盖。生成 Skill 的 Procedure 正文保留，
新角色只进入声明的 Inputs，完成后仍返回 ResearchSpec。

本轮结论：declared-fit-with-notes。输入存在、来源与映射是可验证合同，不证明论文质量；
后者仍由宿主 Agent 和用户负责。

declared-fit-with-notes。首锚点 ARS 语义覆盖达到审阅阈值，所有已知缺口已闭环；paper-humanizer 与 revision-master 均已按同一方法完成 capability 迁移，独立锚点审计在后续变更中归档。上述 notes 是后续增量维护的观察项，不阻塞当前锚点。
