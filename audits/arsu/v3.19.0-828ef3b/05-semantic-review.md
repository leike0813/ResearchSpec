# ARSU Anchor Semantic Review — v3.19.0-828ef3b

> 本文件是 Agent 语义审阅记录，不替代脚本生成的数值审计。数值审计回答“覆盖多少”，本文件回答“语义是否真的被保留或有意改编”。

## 审阅范围

首锚点审阅覆盖：

- 上游 4 个 Skill、27 个 mode、42 个 agent 定义、90 个 reference、22 个 template。
- 119 个 extraction artifacts（47 capability + 72 knowledge-pack）。
- 42 个转换后 capability package（38 个 ARS-derived + 4 个 paper-humanizer vendor-derived）。
- 5 个 graph profiles：minimal、research-main、academic-paper、academic-paper-reviewer、academic-pipeline。
- 三份人类审阅 HTML + parity report + gap semantic review。

## 逐项语义判定

| 上游语义 | 转换后承载 | 判定 | 证据 |
|---|---|---|---|
| FINER 研究问题评分 | `cap-design-research-question-formulation` | preserved | procedure 保留 FINER 5 维与 3.0/2.0 阈值 |
| PRISMA 检索/筛选 | `cap-discovery-literature-search-screening` | preserved | procedure 保留 two-pass screening、dedup、PRISMA 记录 |
| RoB 2 / ROBINS-I | `cap-analysis-risk-of-bias-assessment` | preserved | 5/7 domains、aggregation、traffic-light 均在 |
| GRADE / 异质性 / forest plot | `cap-analysis-meta-analysis` | preserved | GRADE 表与 I²/Q/tau² 完整 |
| Claim Intent Manifest | `cap-analysis-evidence-synthesis` | preserved | 保留预承诺 manifest 与 cross-paper tension inventory |
| 双语摘要独立写作 | `cap-generation-abstract-writing` | preserved | independent composition、独立性 red/green flags 保留 |
| Zero orphans / Retraction Watch | `cap-check-citation-format-compliance` | preserved | orphan、DOI、撤稿协议均保留 |
| DA Strongest Counter-Argument | `cap-judgment-devils-advocate-stress-test` + reviewer profile `da` 节点 | preserved | 输出块完整，profile 已接线为 specialist ∥ da → synthesis |
| Re-review verification | `cap-check-pre-submission-self-check` Re-Review Verification Branch | adapted | Judge Record / checklist / commitment ledger / residual issues 已内聚到 checker 分支 |
| Rebuttal QA | `cap-transform-revision-roadmap-parsing` Rebuttal-Audit Branch | adapted | coverage table / gap list / risk flags 已保留，advisory-only 边界显式 |
| Passport reset boundary | `cap-check-passport-verifier` Reset Boundary Verification | adapted | awaiting_resume / consumes_hash / pending_decision / append-only 语义已写入 |
| Stage/Phase orchestration | graph profiles 与 Gates | intentionally removed from SKILL | `Stage 1 RESEARCH`、`FINAL INTEGRITY`、`Process Summary` 为流程锚点，引擎承担 |
| Ethics review 七维 | `cap-check-compliance-check` Responsible-Use Review | adapted | disclosure/attribution/dual-use/fair representation/data ethics/COI/human subjects 已写入；overridable BLOCKED 保留 |
| Revision provisional response | `cap-transform-revision-patching` | adapted | response_to_reviewers 输出角色 + addressed/declined/partial 状态 |

## 流程权威检查

- [x] 全部 capability SKILL 无 `next phase` / `proceed to <node>` / 上游 agent-team invocation。
- [x] 3 个流程锚点（Stage 1 RESEARCH、FINAL INTEGRITY、Process Summary）由 pipeline profile/Gate 承载，评估为 flow 而非 gap。
- [x] 27 个 mode 均在审阅工件中可见，无 orphan mode。

## 风险与遗留

- `cap-check-compliance-check` 同时承载 PRISMA/RAISE 与 deep-research ethics review，语义边界靠输入 mode 区分；若后续出现独立 ethics capability 需求，应拆分。
- `cap-check-pre-submission-self-check` 与 `cap-transform-revision-roadmap-parsing` 采用分支扩展，而非独立 capability；可接受但需在增量维护中持续监控分支膨胀。
- `academic-pipeline:resume_from_passport` 通过 passport-verifier 与 terminal-policy-gate 守卫，尚无独立 graph entry/Decision；如正式支持该 mode，建议新增显式 resume decision 节点。

## 结论

declared-fit-with-notes。首锚点 ARS 语义覆盖达到审阅阈值，所有已知缺口已闭环；paper-humanizer 已按同一方法完成 capability 迁移，其独立锚点审计在后续变更中归档。上述 notes 是后续增量维护的观察项，不阻塞当前锚点。
