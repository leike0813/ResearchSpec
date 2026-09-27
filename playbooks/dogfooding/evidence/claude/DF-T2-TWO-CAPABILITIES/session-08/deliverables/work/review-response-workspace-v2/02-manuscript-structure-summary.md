<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: template
能力/包 ID: RM-ASSET-12 manuscript-structure-summary.md
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/assets/templates/manuscript-structure-summary.md.j2（全文）
变更台账（ledger）:
    1. [保留] 上游文件全文逐字节保留。
    2. [标注] 流程权威（stage 推进、Gate、状态机）在 authoring 阶段移交 graph engine。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# view.manuscript_summary.title

view.manuscript_summary.intro

## view.manuscript_summary.project_summary

| table.field | table.value |
| --- | --- |
| `main_entry` | partial-manuscript.md |
| `project_shape` | single_tex |

## view.manuscript_summary.sections

| view.manuscript_summary.section_id | view.manuscript_summary.section_title | view.manuscript_summary.purpose_in_manuscript | view.manuscript_summary.key_files_or_locations |
| --- | --- | --- | --- |
| sec:introduction | Introduction | problem_definition | partial-manuscript.md##Introduction |
| sec:missing-sections | Missing sections | gap_declaration | partial-manuscript.md##Missing sections — methods / policy / alternatives / conclusion |
| sec:preliminary-findings | Preliminary findings | results_and_discussion | partial-manuscript.md##Preliminary findings — references CLM-01 and CLM-02 |
| sec:working-title | Working title | header | partial-manuscript.md##Working title |

## view.manuscript_summary.core_claims

| view.manuscript_summary.claim_id | view.manuscript_summary.core_claim | view.manuscript_summary.main_evidence | view.manuscript_summary.supporting_section_ids | view.manuscript_summary.risk_level |
| --- | --- | --- | --- | --- |
| CLM-01 | Structured use of generative AI may increase visible revision activity in some introductory writing contexts. | SYN-CLASSROOM-01 (one first-year writing course, six weeks; structured AI prompts coincided with more visible outline revisions). | sec:preliminary-findings | tentative |
| CLM-02 | Generative AI reduces instructor workload. | SYN-INTERVIEW-02 (five instructors; reported faster formative feedback but additional verification time). | sec:preliminary-findings | unsupported_as_written |
| CLM-03 | Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use. | SYN-SURVEY-03 + SYN-POLICY-04 (84 voluntary responses; institutional policy mandates disclosure but leaves acceptable assistance to instructors). | sec:missing-sections | hypothesis_only |

## view.manuscript_summary.high_risk_areas

view.manuscript_summary.high_risk_intro

| view.manuscript_summary.zone_id | view.manuscript_summary.description |
| --- | --- |
| Z1 | Preliminary findings (states CLM-01 / CLM-02 verbatim and needs hedging); Missing sections (Methods and evidence-selection limitations must be added before claims can be justified); Conclusion (must be calibrated to the supplied evidence rather than restating claims); Claim wording (CLM-02 overstates the evidence; CLM-03 is not directly tested in the supplied materials). |
