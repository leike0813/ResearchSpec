<!-- ResearchSpec patent contract: role and schema reference catalog for patent stages -->

# 专利角色与 schema 目录 (Patent role and schema catalog, v1)

每个阶段的输入 / 输出角色都引用一个版本化 `schema_ref`。文件型角色的
`source_policy` 允许 `handoff` 与 `node_output`；只有
`policy_request` 这类按调用参数传入的角色用 `parameter`。可选角色允许不绑定，
但凡绑定的角色都要解析成功。

`index_kind` 列是规范文件索引的 `kind`，取值只有
`case`、`corpus`、`disclosure`、`application`、`notes`、`response` 六个，
其余为 `—` 的角色按普通文件或普通 JSON 交付。索引结构见
`contracts/patent-file-index.v1.md`；`schema_ref` 与 `index_kind` 是不同的
标识，不要互换。

| role | schema_ref | index_kind | 方向 | 必需 | 含义 |
|------|------------|------------|------|------|------|
| technical_materials | technical-materials.v1 | — | 输入 | 是 | 发明人材料与项目目录 |
| research_report | research-report.v1 | — | 输入 | 否 | 研究阶段既有报告 |
| graded_sources | graded-sources.v1 | — | 输入 | 否 | 学术来源分级（既有 schema，学术证据等级） |
| synthesis_report | synthesis-report.v1 | — | 输入 / 输出 | 否 / 是 | 学术综合报告（既有 schema，正文文件） |
| patent_case | patent-case.v1 | case | 输出 / 输入 | 是 | 案件边界与类型索引 |
| invention_brief | invention-brief.v1 | — | 输出 / 输入 | 是 | 候选专利点与问题 - 手段 - 效果 |
| search_request | search-request.v1 | — | 输出 / 输入 | 是 | 检索请求（类型、词、线索） |
| search_results | search-results.v1 | — | 输出 / 输入 | 是 | 著录检索结果清单 |
| patent_corpus | patent-corpus.v1 | corpus | 输入 | 是 | 待解读的公开号 / PDF / 全文集合 |
| patent_notes | patent-notes.v1 | notes | 输出 / 输入 | 是 | 通俗解读笔记索引 |
| claim_features | claim-features.v1 | — | 输出 / 输入 | 是 | 独权与从权特征行 |
| prior_art_report | prior-art-report.v1 | — | 输出 / 输入 | 是 | 查新说明、D1 / D2、Fk 表、门禁 |
| disclosure_bundle | disclosure-bundle.v1 | disclosure | 输出 / 输入 | 是 | 交底书与附件索引（可修订版本） |
| disclosure_review | disclosure-review.v1 | — | 输出 | 是 | 交底自检结论与残留项 |
| application_bundle | application-bundle.v1 | application | 输出 / 输入 | 是 | 四件套索引（可修订版本） |
| application_review | application-review.v1 | — | 输出 | 是 | 一致性对照与问题清单 |
| docket_review | docket-review.v1 | — | 输出 | 是 | 问题清单处置与残留项 |
| claim_chart | claim-chart.v1 | — | 输出 / 输入 | 是 | 权项对照矩阵与场景页 |
| chart_evidence | chart-evidence.v1 | — | 输出 | 是 | 对照证据与出处索引 |
| comparison_materials | comparison-materials.v1 | — | 输入 | 是 | 对照对象（专利 / 产品 / 标准） |
| protection_plan | protection-plan.v1 | — | 输出 | 是 | 保护型 1+N 立项说明与校验 |
| patent_map | patent-map.v1 | — | 输出 | 是 | 地图页面地址与取数来源 |
| office_action | office-action.v1 | — | 输入 | 是 | 审查意见通知书 |
| oa_response | oa-response.v1 | response | 输出 / 输入 | 是 | 审查答复草稿 |
| oa_review | oa-review.v1 | — | 输出 | 是 | 答复复核与驳回映射结论 |
| policy_request | policy-request.v1 | — | 输入 | 否 | 政策简报范围请求（`parameter`） |
| policy_brief | policy-brief.v1 | — | 输出 | 是 | 政策简报 |
| annotated_bibliography | annotated-bibliography.v1 | — | 输入 / 输出 | 否 / 是 | 既有学术参考文献接口（正文文件） |

`graded_sources` 是**学术**证据分级，只在研究侧产生、只在组合里传入。它评估的是
来源可信度，不是专利方案的完整度，也不进入交底书、申请文件或对照表。

## 修订角色复用同一 schema_ref

`transform-patent-docket-revision` 重新产出 `disclosure_bundle` 与
`application_bundle`，`schema_ref` 与首次成文相同，区别只在文件是新的时间戳
版本。消费方按 `metadata.round` 区分轮次，不新增 schema。

## 交接说明

非索引角色用普通交接说明列出实际路径与 `limitations`，不写 run、节点、Gate 或
Decision 字段。本目录只声明合同，不新增公共命令，也不改变既有 schema 版本。
