# ARS v3.22.2 增量吸纳记录

- date: 2026-09-30
- old anchor: v3.21.1-127ff85
- new anchor: v3.22.2-7de1c9d
- source: 127ff85e4bbfcdd10b95040537b6c6bd7ad17aeb -> 7de1c9dfb7af9c02a9b57750761323f35a743aa2
- scope: 353 files changed, 38237 insertions(+), 2998 deletions(-)
- release: https://github.com/Imbad0202/academic-research-skills/releases/tag/v3.22.2

采用正式发布标签；评估实验、installer、locale loader、provider transports、run ledger和acronym上游脚本保留审计语境。吸纳普通写作配置/语言角色、统一摘要regime、引文证据规则和advisory/consent边界；不引入依赖或新的工作流状态系统。公开命令及core schema不变。

## 提取增量

119 -> 120；39 updated（34正文、5元数据）、1 added、80 unchanged、0 removed。未变化80文件对Git HEAD逐字节比较通过；120来源slice均pass。

| action | artifact | path | source |
|---|---|---|---|
| updated body | CAP-M1-01 | `authoring/ars/m1-research/capabilities/01_literature_search_screening.ap-variant.md` | "vendor/ars/academic-paper/agents/literature_strategist_agent.md（全文）" |
| unchanged | CAP-M1-01 | `authoring/ars/m1-research/capabilities/01_literature_search_screening.dr-variant.md` | "vendor/ars/deep-research/agents/bibliography_agent.md（全文）" |
| unchanged | CAP-M1-02 | `authoring/ars/m1-research/capabilities/02_source_quality_grading.md` | "vendor/ars/deep-research/agents/source_verification_agent.md（全文）" |
| updated body | CAP-M1-03 | `authoring/ars/m1-research/capabilities/03_evidence_synthesis.md` | "vendor/ars/deep-research/agents/synthesis_agent.md（全文）" |
| unchanged | CAP-M1-04 | `authoring/ars/m1-research/capabilities/04_research_question_formulation.md` | "vendor/ars/deep-research/agents/research_question_agent.md（全文）" |
| unchanged | CAP-M1-05 | `authoring/ars/m1-research/capabilities/05_methodology_design.md` | "vendor/ars/deep-research/agents/research_architect_agent.md（全文）" |
| unchanged | KP-M1-01 | `authoring/ars/m1-research/knowledge/01_evidence_hierarchy.md` | "vendor/ars/deep-research/references/source_quality_hierarchy.md（全文）" |
| unchanged | KP-M1-02b | `authoring/ars/m1-research/knowledge/02_finer_framework_socratic_questions.md` | "vendor/ars/deep-research/agents/research_question_agent.md §FINER Guiding Questions（L154-180）" |
| unchanged | KP-M1-02 | `authoring/ars/m1-research/knowledge/02_finer_framework.md` | "vendor/ars/deep-research/agents/research_question_agent.md §FINER Framework（L35-46）" |
| unchanged | KP-M1-03 | `authoring/ars/m1-research/knowledge/03_prisma_documentation.md` | "vendor/ars/deep-research/agents/bibliography_agent.md §Search Documentation (PRISMA-style)（L143-158）" |
| unchanged | KP-M1-04 | `authoring/ars/m1-research/knowledge/04_corpus_iron_rules.md` | "vendor/ars/academic-pipeline/references/literature_corpus_consumers.md（全文）" |
| updated mapping | KP-M1-05 | `authoring/ars/m1-research/knowledge/05_claim_intent_manifest_emission.md` | "vendor/ars/deep-research/agents/synthesis_agent.md §Claim Intent Manifest Emission (v3.8) + §Experiment-backed claims (#260)（L319-372）" |
| unchanged | KP-M1-05b | `authoring/ars/m1-research/knowledge/05b_claim_intent_manifest_canonical.md` | "vendor/ars/shared/references/firm_rules.md §Claim Intent Manifest emission firm rules (R-CIM-*)（L58-82）" |
| updated mapping | KP-M1-06 | `authoring/ars/m1-research/knowledge/06_three_layer_citation.md` | "vendor/ars/deep-research/agents/synthesis_agent.md §Two-Layer Citation Emission (v3.7.1) + §Three-Layer Citation Emission (v3.7.3)（L269-317）" |
| unchanged | KP-M1-07 | `authoring/ars/m1-research/knowledge/07_apa7_style_guide.md` | "vendor/ars/deep-research/references/apa7_style_guide.md（全文）" |
| unchanged | KP-M1-08 | `authoring/ars/m1-research/knowledge/08_instruction_data_boundary.md` | "vendor/ars/deep-research/agents/bibliography_agent.md L41-49（canonical 块）"; "镜像：vendor/ars/deep-research/agents/source_verification_agent.md L42-50（逐字节相同）" |
| updated body | CAP-M2-01 | `authoring/ars/m2-writing/capabilities/01_writing_intake.md` | "vendor/ars/academic-paper/agents/intake_agent.md（全文）" |
| updated body | CAP-M2-02 | `authoring/ars/m2-writing/capabilities/02_manuscript_structure_design.md` | "vendor/ars/academic-paper/agents/structure_architect_agent.md（全文）" |
| unchanged | CAP-M2-03 | `authoring/ars/m2-writing/capabilities/03_argument_blueprint.md` | "vendor/ars/academic-paper/agents/argument_builder_agent.md（全文）" |
| updated body | CAP-M2-04 | `authoring/ars/m2-writing/capabilities/04_drafting.ms-variant.md` | "vendor/ars/academic-paper/agents/draft_writer_agent.md（全文）" |
| updated body | CAP-M2-04 | `authoring/ars/m2-writing/capabilities/04_drafting.rr-variant.md` | "vendor/ars/deep-research/agents/report_compiler_agent.md（全文）" |
| updated body | CAP-M2-05 | `authoring/ars/m2-writing/capabilities/05_abstract_writing.md` | "vendor/ars/academic-paper/agents/abstract_bilingual_agent.md（全文）" |
| updated body | CAP-M2-06 | `authoring/ars/m2-writing/capabilities/06_citation_format_compliance.md` | "vendor/ars/academic-paper/agents/citation_compliance_agent.md（全文）" |
| updated body | KP-M2-01 | `authoring/ars/m2-writing/knowledge/01_academic_writing_style.md` | "vendor/ars/academic-paper/references/academic_writing_style.md（全文）" |
| updated body | KP-M2-02 | `authoring/ars/m2-writing/knowledge/02_abstract_writing_guide.md` | "vendor/ars/academic-paper/references/abstract_writing_guide.md（全文）" |
| unchanged | KP-M2-03 | `authoring/ars/m2-writing/knowledge/03_anti_leakage_protocol.md` | "vendor/ars/academic-paper/references/anti_leakage_protocol.md（全文）" |
| unchanged | KP-M2-04 | `authoring/ars/m2-writing/knowledge/04_word_count_conventions.md` | "vendor/ars/shared/references/word_count_conventions.md（全文）" |
| updated body | KP-M2-05 | `authoring/ars/m2-writing/knowledge/05_citation_format_standards.md` | "vendor/ars/academic-paper/references/citation_format_switcher.md（全文）" |
| unchanged | KP-M2-06 | `authoring/ars/m2-writing/knowledge/06_style_calibration_protocol.md` | "vendor/ars/shared/style_calibration_protocol.md（全文）" |
| updated body | KP-M2-07 | `authoring/ars/m2-writing/knowledge/07_writing_quality_check.md` | "vendor/ars/academic-paper/references/writing_quality_check.md（全文）" |
| updated body | KP-M2-08 | `authoring/ars/m2-writing/knowledge/08_paper_structure_patterns.md` | "vendor/ars/academic-paper/references/paper_structure_patterns.md（全文）" |
| added | KP-M2-09 | `authoring/ars/m2-writing/knowledge/09_output_language_pair.md` | "vendor/ars/shared/output_language_pair.md（全文）" |
| updated body | CAP-M3-01 | `authoring/ars/m3-integrity-review/capabilities/01_reference_integrity_verification.md` | "vendor/ars/academic-pipeline/agents/integrity_verification_agent.md（全文）" |
| updated body | CAP-M3-02 | `authoring/ars/m3-integrity-review/capabilities/02_review_panel_config.md` | "vendor/ars/academic-paper-reviewer/agents/field_analyst_agent.md（全文）" |
| updated body | CAP-M3-03 | `authoring/ars/m3-integrity-review/capabilities/03_editorial_judgment.dr-variant.md` | "vendor/ars/deep-research/agents/editor_in_chief_agent.md（全文）" |
| unchanged | CAP-M3-03 | `authoring/ars/m3-integrity-review/capabilities/03_editorial_judgment.reviewer-variant.md` | "vendor/ars/academic-paper-reviewer/agents/eic_agent.md（全文）" |
| unchanged | CAP-M3-04 | `authoring/ars/m3-integrity-review/capabilities/04_specialist_review.r1-variant.md` | "vendor/ars/academic-paper-reviewer/agents/methodology_reviewer_agent.md（全文）" |
| unchanged | CAP-M3-04 | `authoring/ars/m3-integrity-review/capabilities/04_specialist_review.r2-variant.md` | "vendor/ars/academic-paper-reviewer/agents/domain_reviewer_agent.md（全文）" |
| unchanged | CAP-M3-04 | `authoring/ars/m3-integrity-review/capabilities/04_specialist_review.r3-variant.md` | "vendor/ars/academic-paper-reviewer/agents/perspective_reviewer_agent.md（全文）" |
| updated body | CAP-M3-05 | `authoring/ars/m3-integrity-review/capabilities/05_devils_advocate.dr-variant.md` | "vendor/ars/deep-research/agents/devils_advocate_agent.md（全文）" |
| unchanged | CAP-M3-05 | `authoring/ars/m3-integrity-review/capabilities/05_devils_advocate.reviewer-variant.md` | "vendor/ars/academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md（全文）" |
| updated body | CAP-M3-06 | `authoring/ars/m3-integrity-review/capabilities/06_review_synthesis.md` | "vendor/ars/academic-paper-reviewer/agents/editorial_synthesizer_agent.md（全文）" |
| unchanged | CAP-M3-07 | `authoring/ars/m3-integrity-review/capabilities/07_pre_submission_self_check.md` | "vendor/ars/academic-paper/agents/peer_reviewer_agent.md（全文）" |
| unchanged | KP-M3-01 | `authoring/ars/m3-integrity-review/knowledge/01_7mode_failure_checklist.md` | "vendor/ars/academic-pipeline/references/ai_research_failure_modes.md（全文）" |
| unchanged | KP-M3-02a | `authoring/ars/m3-integrity-review/knowledge/02a_quality_rubrics.md` | "vendor/ars/academic-paper-reviewer/references/quality_rubrics.md（全文）" |
| unchanged | KP-M3-02b | `authoring/ars/m3-integrity-review/knowledge/02b_review_criteria_framework.md` | "vendor/ars/academic-paper-reviewer/references/review_criteria_framework.md（全文）" |
| unchanged | KP-M3-03 | `authoring/ars/m3-integrity-review/knowledge/03_statistical_reporting_standards.md` | "vendor/ars/academic-paper-reviewer/references/statistical_reporting_standards.md（全文）" |
| unchanged | KP-M3-04 | `authoring/ars/m3-integrity-review/knowledge/04_editorial_decision_standards.md` | "vendor/ars/academic-paper-reviewer/references/editorial_decision_standards.md（全文）" |
| updated mapping | KP-M3-05a | `authoring/ars/m3-integrity-review/knowledge/05a_concession_threshold.dr.md` | "vendor/ars/deep-research/agents/devils_advocate_agent.md §Concession Threshold Protocol (v3.0)（L160-199）" |
| unchanged | KP-M3-05b | `authoring/ars/m3-integrity-review/knowledge/05b_attack_intensity_preservation.reviewer.md` | "vendor/ars/academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md §Attack Intensity Preservation Protocol (v3.0)（L399-443）" |
| updated body | KP-M3-06 | `authoring/ars/m3-integrity-review/knowledge/06_sprint_contract_protocol.md` | "vendor/ars/academic-paper-reviewer/references/sprint_contract_protocol.md（全文）" |
| updated body | KP-M3-07 | `authoring/ars/m3-integrity-review/knowledge/07_claim_verification_protocol.md` | "vendor/ars/academic-pipeline/references/claim_verification_protocol.md（全文）" |
| unchanged | KP-M3-08 | `authoring/ars/m3-integrity-review/knowledge/08_logical_fallacies.md` | "vendor/ars/deep-research/references/logical_fallacies.md（全文）" |
| unchanged | KP-M3-09 | `authoring/ars/m3-integrity-review/knowledge/09_integrity_review_protocol.md` | "vendor/ars/academic-pipeline/references/integrity_review_protocol.md（全文）" |
| unchanged | KP-M3-10 | `authoring/ars/m3-integrity-review/knowledge/10_top_journals_by_field.md` | "vendor/ars/academic-paper-reviewer/references/top_journals_by_field.md（全文）" |
| unchanged | KP-M3-11 | `authoring/ars/m3-integrity-review/knowledge/11_claim_strength_ladder.md` | "vendor/ars/shared/references/claim_strength_ladder.md（全文）" |
| unchanged | KP-M3-12 | `authoring/ars/m3-integrity-review/knowledge/12_plagiarism_detection_protocol.md` | "vendor/ars/academic-pipeline/references/plagiarism_detection_protocol.md（全文）" |
| updated body | CAP-M4-01 | `authoring/ars/m4-revision-finalize/capabilities/01_revision_roadmap_parsing.md` | "vendor/ars/academic-paper/agents/revision_coach_agent.md（全文）" |
| unchanged | CAP-M4-02 | `authoring/ars/m4-revision-finalize/capabilities/02_revision_patching_anchorize.py` | "vendor/ars/scripts/ars_anchorize_draft.py（全文）" |
| unchanged | CAP-M4-02 | `authoring/ars/m4-revision-finalize/capabilities/02_revision_patching_apply.py` | "vendor/ars/scripts/ars_apply_revision_patch.py（全文）" |
| updated body | CAP-M4-03 | `authoring/ars/m4-revision-finalize/capabilities/03_format_rendering.md` | "vendor/ars/academic-paper/agents/formatter_agent.md（全文）" |
| updated mapping | CAP-M4-04 | `authoring/ars/m4-revision-finalize/capabilities/04_terminal_policy_gate.finalizer.md` | "vendor/ars/academic-pipeline/agents/pipeline_orchestrator_agent.md §Cite-Time Provenance Finalizer（v3.7.1 → v3.10 extension，L1055-1286）" |
| updated mapping | CAP-M4-04 | `authoring/ars/m4-revision-finalize/capabilities/04_terminal_policy_gate.submission-gate.md` | "vendor/ars/academic-pipeline/agents/pipeline_orchestrator_agent.md §Submission-Package Terminal Gate (#394 slice 4 — Stage 5, post-formatter)（L1400-1426）" |
| unchanged | CAP-M4-05 | `authoring/ars/m4-revision-finalize/capabilities/05_temporal_lint.py` | "vendor/ars/scripts/check_v3_9_4_temporal_verification.py（全文）" |
| unchanged | CAP-M4-05 | `authoring/ars/m4-revision-finalize/capabilities/05_temporal_verifier.py` | "vendor/ars/scripts/temporal_integrity_audit.py（全文）" |
| updated body | KP-M4-01 | `authoring/ars/m4-revision-finalize/knowledge/01_revision_patch_protocol.md` | "vendor/ars/academic-paper/references/revision_patch_protocol.md（全文）" |
| unchanged | KP-M4-02 | `authoring/ars/m4-revision-finalize/knowledge/02_terminal_policy_firm_rules.md` | "vendor/ars/shared/references/firm_rules.md §Contamination advisory firm rules (R-L3-2-*)（L17-57）" |
| updated body | KP-M4-03 | `authoring/ars/m4-revision-finalize/knowledge/03_degradation_registry.json` | "vendor/ars/shared/contracts/degradation_registry.json（全文）" |
| unchanged | KP-M4-04 | `authoring/ars/m4-revision-finalize/knowledge/04_latex_template_reference.md` | "vendor/ars/academic-paper/references/latex_template_reference.md（全文）" |
| updated body | KP-M4-05 | `authoring/ars/m4-revision-finalize/knowledge/05_journal_submission_guide.md` | "vendor/ars/academic-paper/references/journal_submission_guide.md（全文）" |
| unchanged | KP-M4-06 | `authoring/ars/m4-revision-finalize/knowledge/06_credit_authorship_guide.md` | "vendor/ars/academic-paper/references/credit_authorship_guide.md（全文）" |
| unchanged | KP-M4-07 | `authoring/ars/m4-revision-finalize/knowledge/07_funding_statement_guide.md` | "vendor/ars/academic-paper/references/funding_statement_guide.md（全文）" |
| unchanged | CAP-M5-01 | `authoring/ars/m5-side-branches/capabilities/01_meta_analysis.md` | "vendor/ars/deep-research/agents/meta_analysis_agent.md（全文）" |
| updated body | CAP-M5-02 | `authoring/ars/m5-side-branches/capabilities/02_risk_of_bias_assessment.md` | "vendor/ars/deep-research/agents/risk_of_bias_agent.md（全文）" |
| unchanged | CAP-M5-03 | `authoring/ars/m5-side-branches/capabilities/03_socratic_mentoring.ap-variant.md` | "vendor/ars/academic-paper/agents/socratic_mentor_agent.md（全文）" |
| unchanged | CAP-M5-03 | `authoring/ars/m5-side-branches/capabilities/03_socratic_mentoring.dr-variant.md` | "vendor/ars/deep-research/agents/socratic_mentor_agent.md（全文）" |
| unchanged | CAP-M5-04 | `authoring/ars/m5-side-branches/capabilities/04_figure_generation.md` | "vendor/ars/academic-paper/agents/visualization_agent.md（全文）" |
| unchanged | CAP-M5-05 | `authoring/ars/m5-side-branches/capabilities/05_literature_monitoring.md` | "vendor/ars/deep-research/agents/monitoring_agent.md（全文）" |
| updated body | CAP-M5-06 | `authoring/ars/m5-side-branches/capabilities/06_claim_faithfulness_audit.md` | "vendor/ars/academic-pipeline/agents/claim_ref_alignment_audit_agent.md（全文）" |
| updated body | CAP-M5-07 | `authoring/ars/m5-side-branches/capabilities/07_compliance_check.md` | "vendor/ars/shared/agents/compliance_agent.md（全文）" |
| unchanged | CAP-M5-08 | `authoring/ars/m5-side-branches/capabilities/08_collaboration_depth_observer.md` | "vendor/ars/academic-pipeline/agents/collaboration_depth_agent.md（全文）" |
| unchanged | CAP-M5-09 | `authoring/ars/m5-side-branches/capabilities/09_submission_package_verifier.py` | "vendor/ars/scripts/verify_submission_package.py（全文）" |
| unchanged | CAP-M5-10 | `authoring/ars/m5-side-branches/capabilities/10_passport_verifier.py` | "vendor/ars/scripts/verify_passport.py（全文）" |
| unchanged | CAP-M5-11 | `authoring/ars/m5-side-branches/capabilities/11_citation_verification_gate.py` | "vendor/ars/scripts/verification_gate/__init__.py（全文）" |
| unchanged | CAP-M5-12 | `authoring/ars/m5-side-branches/capabilities/12_pdf_read_preflight.py` | "vendor/ars/scripts/pdf_read_preflight.py（全文）" |
| unchanged | CAP-M5-13 | `authoring/ars/m5-side-branches/capabilities/13_citation_verification_summary.py` | "vendor/ars/scripts/citation_verification_summary.py（全文）" |
| unchanged | CAP-M5-14 | `authoring/ars/m5-side-branches/capabilities/14_contamination_signals.py` | "vendor/ars/scripts/contamination_signals.py（全文）" |
| unchanged | KP-M5-01 | `authoring/ars/m5-side-branches/knowledge/01_systematic_review_protocol.md` | "vendor/ars/deep-research/references/systematic_review_protocol.md（全文）" |
| unchanged | KP-M5-02 | `authoring/ars/m5-side-branches/knowledge/02_systematic_review_toolkit.md` | "vendor/ars/deep-research/references/systematic_review_toolkit.md（全文）" |
| updated body | KP-M5-03 | `authoring/ars/m5-side-branches/knowledge/03_socratic_mode_protocol.md` | "vendor/ars/deep-research/references/socratic_mode_protocol.md（全文）" |
| unchanged | KP-M5-04 | `authoring/ars/m5-side-branches/knowledge/04_socratic_questioning_framework.md` | "vendor/ars/deep-research/references/socratic_questioning_framework.md（全文）" |
| unchanged | KP-M5-05 | `authoring/ars/m5-side-branches/knowledge/05_plan_mode_protocol.md` | "vendor/ars/academic-paper/references/plan_mode_protocol.md（全文）" |
| unchanged | KP-M5-06 | `authoring/ars/m5-side-branches/knowledge/06_statistical_visualization_standards.md` | "vendor/ars/academic-paper/references/statistical_visualization_standards.md（全文）" |
| unchanged | KP-M5-07 | `authoring/ars/m5-side-branches/knowledge/07_vlm_figure_verification.md` | "vendor/ars/academic-paper/references/vlm_figure_verification.md（全文）" |
| unchanged | KP-M5-08 | `authoring/ars/m5-side-branches/knowledge/08_literature_monitoring_strategies.md` | "vendor/ars/deep-research/references/literature_monitoring_strategies.md（全文）" |
| unchanged | KP-M5-09 | `authoring/ars/m5-side-branches/knowledge/09_claim_audit_calibration_protocol.md` | "vendor/ars/academic-pipeline/references/claim_audit_calibration_protocol.md（全文）" |
| unchanged | KP-M5-10 | `authoring/ars/m5-side-branches/knowledge/10_raise_framework.md` | "vendor/ars/shared/raise_framework.md（全文）" |
| unchanged | KP-M5-11 | `authoring/ars/m5-side-branches/knowledge/11_prisma_trAIce_protocol.md` | "vendor/ars/shared/prisma_trAIce_protocol.md（全文）" |
| updated body | KP-M5-12 | `authoring/ars/m5-side-branches/knowledge/12_collaboration_depth_rubric.md` | "vendor/ars/shared/collaboration_depth_rubric.md（全文）" |
| unchanged | KP-M5-13 | `authoring/ars/m5-side-branches/knowledge/13_calibration_mode_protocol.md` | "vendor/ars/academic-paper-reviewer/references/calibration_mode_protocol.md（全文）" |
| unchanged | KP-M5-14 | `authoring/ars/m5-side-branches/knowledge/14_guided_mode_protocol.md` | "vendor/ars/academic-paper-reviewer/references/guided_mode_protocol.md（全文）" |
| updated body | KP-M5-15 | `authoring/ars/m5-side-branches/knowledge/15_re_review_mode_protocol.md` | "vendor/ars/academic-paper-reviewer/references/re_review_mode_protocol.md（全文）" |
| unchanged | KP-M5-16 | `authoring/ars/m5-side-branches/knowledge/16_semantic_scholar_api_protocol.md` | "vendor/ars/deep-research/references/semantic_scholar_api_protocol.md（全文）" |
| unchanged | KP-M5-17 | `authoring/ars/m5-side-branches/knowledge/17_openalex_api_protocol.md` | "vendor/ars/deep-research/references/openalex_api_protocol.md（全文）" |
| unchanged | KP-M5-18 | `authoring/ars/m5-side-branches/knowledge/18_crossref_api_protocol.md` | "vendor/ars/deep-research/references/crossref_api_protocol.md（全文）" |
| unchanged | KP-M5-19 | `authoring/ars/m5-side-branches/knowledge/19_arxiv_api_protocol.md` | "vendor/ars/deep-research/references/arxiv_api_protocol.md（全文）" |
| unchanged | KP-M5-20 | `authoring/ars/m5-side-branches/knowledge/20_irb_decision_tree.md` | "vendor/ars/deep-research/references/irb_decision_tree.md（全文）" |
| unchanged | KP-M5-21 | `authoring/ars/m5-side-branches/knowledge/21_equator_reporting_guidelines.md` | "vendor/ars/deep-research/references/equator_reporting_guidelines.md（全文）" |
| unchanged | KP-M5-22 | `authoring/ars/m5-side-branches/knowledge/22_preregistration_guide.md` | "vendor/ars/deep-research/references/preregistration_guide.md（全文）" |
| unchanged | KP-M5-23 | `authoring/ars/m5-side-branches/knowledge/23_irb_terminology_glossary.md` | "vendor/ars/shared/references/irb_terminology_glossary.md（全文）" |
| unchanged | KP-M5-24 | `authoring/ars/m5-side-branches/knowledge/24_psychometric_terminology_glossary.md` | "vendor/ars/shared/references/psychometric_terminology_glossary.md（全文）" |
| unchanged | KP-M5-25 | `authoring/ars/m5-side-branches/knowledge/25_protected_hedging_phrases.md` | "vendor/ars/shared/references/protected_hedging_phrases.md（全文）" |
| unchanged | KP-M5-26 | `authoring/ars/m5-side-branches/knowledge/26_hei_domain_glossary.md` | "vendor/ars/academic-paper/references/hei_domain_glossary.md（全文）" |
| unchanged | KP-M5-27 | `authoring/ars/m5-side-branches/knowledge/27_domain_evidence_profiles.md` | "vendor/ars/academic-paper/references/domain_evidence_profiles.md（全文）" |
| updated body | KP-M5-28 | `authoring/ars/m5-side-branches/knowledge/28_apa7_chinese_citation_guide.md` | "vendor/ars/academic-paper/references/apa7_chinese_citation_guide.md（全文）" |
| unchanged | KP-M5-29 | `authoring/ars/m5-side-branches/knowledge/29_apa7_extended_guide.md` | "vendor/ars/academic-paper/references/apa7_extended_guide.md（全文）" |
| unchanged | KP-M5-30 | `authoring/ars/m5-side-branches/knowledge/30_intro_title_rhetoric_guide.md` | "vendor/ars/academic-paper/references/intro_title_rhetoric_guide.md（全文）" |
| updated body | KP-M5-31 | `authoring/ars/m5-side-branches/knowledge/31_failure_paths.md` | "vendor/ars/deep-research/references/failure_paths.md（全文）" |
| updated body | KP-M5-32 | `authoring/ars/m5-side-branches/knowledge/32_cross_model_verification.md` | "vendor/ars/shared/cross_model_verification.md（全文）" |
| unchanged | KP-M5-33 | `authoring/ars/m5-side-branches/knowledge/33_literature_matrix_template.md` | "vendor/ars/deep-research/templates/literature_matrix_template.md（全文）" |

## 验证记录

- extraction:index:check：120 pass。
- authoring repeated generation：两次全树字节一致；47 registry / 38 ARS保持operational。
- anchors：58 / 325 source files，runtime-policy：41 classified（18 adapt / 23 retain），checker closure 5。
- raw ARSU convert/check/idempotence：通过。
- packaged checker执行：七节点真实生成、advance消费、篡改报告拒绝、完成run；输出 PASS。临时执行目录 /tmp/researchspec-checker-package-sXUP2j。
- pnpm check / lint：通过；稳定产物上的最终全量测试412项全部通过（0失败）；具体命令与最终投影检查见05。
- 首轮全量测试412项：408 pass/4 fail，均为新增anchor owner、缺新manifest、运行时清单/提取数旧断言；后续聚焦发现一条缺显式not_checked与M2分项旧计数，已修正。失败信息保留为维护记录，不冒充最终通过。
- 第二轮全量测试410 pass/2 fail：主代理并行重跑authoring造成读者观察到截断文件/暂时hash不匹配。停止并行生成后，在稳定产物上重跑全量测试，412/412通过。该失败不来自计算或图状态逻辑，未为此新增重试或绕过校验。
- 独立语义复核：27mode，P1–P5已修复；实际判定与继承缺口见05。

## 新旧锚点机器差异

命令：`node scripts/arsu-maintenance.mjs diff v3.21.1-127ff85 v3.22.2-7de1c9d`。

```text
upstream.version: v3.21.1 -> v3.22.2
upstream.commit: 127ff85e4bbfcdd10b95040537b6c6bd7ad17aeb -> 7de1c9dfb7af9c02a9b57750761323f35a743aa2
extraction.artifact_count: 119 -> 120
conversion.capability_count: 47 -> 47
review.section_coverage: 0.9488786824825476 -> 0.9500398986473785
review.rule_coverage: 0.9445787997591882 -> 0.9508672263231532
```

覆盖率为静态指标；实际语义缺口与执行结果单独记录于05，不由分数推出。

## 全部上游变更文件

```text
M	.claude-plugin/marketplace.json
M	.claude-plugin/plugin.json
M	.claude/CLAUDE.md
M	.github/workflows/command-invariants.yml
M	.github/workflows/spec-consistency.yml
M	.gitignore
M	CHANGELOG.md
M	CITATION.cff
M	CONTRIBUTING.md
M	MODE_REGISTRY.md
M	POSITIONING.md
M	QUICKSTART.md
A	README.es-ES.md
M	README.ja-JP.md
M	README.ko-KR.md
M	README.md
M	README.zh-CN.md
M	README.zh-TW.md
M	academic-paper-reviewer/SKILL.md
M	academic-paper-reviewer/agents/editorial_synthesizer_agent.md
M	academic-paper-reviewer/agents/field_analyst_agent.md
M	academic-paper-reviewer/references/re_review_mode_protocol.md
M	academic-paper-reviewer/references/sprint_contract_protocol.md
M	academic-paper-reviewer/templates/editorial_decision_template.md
M	academic-paper/SKILL.md
M	academic-paper/agents/abstract_bilingual_agent.md
M	academic-paper/agents/citation_compliance_agent.md
M	academic-paper/agents/draft_writer_agent.md
M	academic-paper/agents/formatter_agent.md
M	academic-paper/agents/intake_agent.md
M	academic-paper/agents/literature_strategist_agent.md
M	academic-paper/agents/revision_coach_agent.md
M	academic-paper/agents/structure_architect_agent.md
M	academic-paper/references/abstract_writing_guide.md
M	academic-paper/references/academic_writing_style.md
M	academic-paper/references/apa7_chinese_citation_guide.md
M	academic-paper/references/citation_format_switcher.md
M	academic-paper/references/committee_correspondence_protocol.md
M	academic-paper/references/journal_submission_guide.md
M	academic-paper/references/mode_selection_guide.md
M	academic-paper/references/paper_structure_patterns.md
M	academic-paper/references/revision_patch_protocol.md
M	academic-paper/references/workflow_phase_details.md
M	academic-paper/references/writing_judgment_framework.md
M	academic-paper/references/writing_quality_check.md
M	academic-paper/templates/bilingual_abstract_template.md
M	academic-pipeline/SKILL.md
M	academic-pipeline/agents/claim_ref_alignment_audit_agent.md
M	academic-pipeline/agents/integrity_verification_agent.md
M	academic-pipeline/agents/pipeline_orchestrator_agent.md
M	academic-pipeline/agents/state_tracker_agent.md
M	academic-pipeline/references/claim_verification_protocol.md
M	academic-pipeline/references/pipeline_state_machine.md
M	agents/report_compiler_agent.md
M	agents/synthesis_agent.md
A	audits/harness-retirement-2026-09-model-update.md
A	audits/harness-retirement-2026-09-opus-5-5.md
A	audits/harness-retirement-2026-09.md
M	commands/ars-3w.md
M	commands/ars-abstract.md
M	commands/ars-citation-check.md
M	commands/ars-disclosure.md
M	commands/ars-format-convert.md
M	commands/ars-full.md
M	commands/ars-lit-review.md
M	commands/ars-outline.md
M	commands/ars-plan.md
M	commands/ars-rebuttal-audit.md
M	commands/ars-reviewer.md
M	commands/ars-revision-coach.md
M	commands/ars-revision.md
M	deep-research/SKILL.md
M	deep-research/agents/devils_advocate_agent.md
M	deep-research/agents/editor_in_chief_agent.md
M	deep-research/agents/ethics_review_agent.md
M	deep-research/agents/report_compiler_agent.md
M	deep-research/agents/risk_of_bias_agent.md
M	deep-research/agents/synthesis_agent.md
M	deep-research/agents/timeline_extraction_agent.md
M	deep-research/references/chinese_literature_api_protocol.md
M	deep-research/references/failure_paths.md
M	deep-research/references/socratic_mode_protocol.md
M	docs/ARCHITECTURE.md
M	docs/CONTROL_AVAILABILITY.md
M	docs/DATA_FLOWS.md
M	docs/PERFORMANCE.md
M	docs/PERFORMANCE.zh-TW.md
M	docs/RISK_REGISTER.md
M	docs/ROADMAP-v3.20.1-v3.22.md
M	docs/SETUP.md
M	docs/SETUP.zh-TW.md
M	docs/STAGE_CAPABILITY_MATRIX.md
A	docs/changelog-archive/es-ES.md
A	docs/changelog-archive/ja-JP.md
A	docs/changelog-archive/ko-KR.md
A	docs/changelog-archive/zh-CN.md
A	docs/changelog-archive/zh-TW.md
A	docs/design/2026-09-23-887-handoff-integrity-design.md
A	docs/design/2026-09-23-890-instruction-data-boundary-extension.md
A	docs/design/2026-09-24-894-instruction-data-boundary-tool-calls.md
M	evals/heldout/MEASUREMENT_CONTRACT.md
A	evals/heldout/reviewer_calibration/README.md
A	evals/heldout/reviewer_calibration/RUN_PLAN.md
A	evals/heldout/reviewer_calibration/adjudication_rubric.md
A	evals/heldout/reviewer_calibration/corpus/papers.json
A	evals/heldout/reviewer_calibration/corpus/pool_accepted_ids.txt
A	evals/heldout/reviewer_calibration/corpus/pool_rejected_ids.txt
A	evals/heldout/reviewer_calibration/manifests/gold_labels.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/model_probe.txt
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_AOUa1Ae9qg.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_CPxZClPMiy.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_CU5EHe1KUt.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_GDYaNzxt9T.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_If8O8CdCbi.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_KN2RD4fpnH.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_KqCU5rfcMm.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_OKUGAxu6Ww.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_SqQYMnfyLS.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_TIDaHgj0Yj.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_UbWy2QVmke.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_VVstc2W3RW.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_XrgZp1NFDT.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_ZumVIktGbt.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_nCEs0tSwc2.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_prompts.txt
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_qRTJWXentH.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_ssWi0rC3mx.json
A	evals/heldout/reviewer_calibration/runs/raw/contamination_probe/probe_xPEsxcO7F7.json
A	evals/heldout/reviewer_calibration/runs/raw/selection.json
M	evals/heldout/suite_registry.json
A	evals/heldout/unsupported_claim_recovery/README.md
A	evals/heldout/unsupported_claim_recovery/heldout_set.json
M	examples/showcase/README.md
M	pi/README.md
M	pi/wrapper.js
M	pi/wrapper.test.mjs
A	plugin-evals-citation-check/01-apa-en-misattribution/graders/content-caught.md
A	plugin-evals-citation-check/01-apa-en-misattribution/graders/format-caught.md
A	plugin-evals-citation-check/01-apa-en-misattribution/graders/honest-unverified.md
A	plugin-evals-citation-check/01-apa-en-misattribution/graders/no-false-positive.md
A	plugin-evals-citation-check/01-apa-en-misattribution/graders/no-overreach.md
A	plugin-evals-citation-check/01-apa-en-misattribution/graders/orphan-named.md
A	plugin-evals-citation-check/01-apa-en-misattribution/graders/skill-fired.md
A	plugin-evals-citation-check/01-apa-en-misattribution/prompt.md
A	plugin-evals-citation-check/02-apa-zh-mixed-overclaim/graders/agent-loaded.md
A	plugin-evals-citation-check/02-apa-zh-mixed-overclaim/graders/content-caught.md
A	plugin-evals-citation-check/02-apa-zh-mixed-overclaim/graders/format-caught.md
A	plugin-evals-citation-check/02-apa-zh-mixed-overclaim/graders/honest-unverified.md
A	plugin-evals-citation-check/02-apa-zh-mixed-overclaim/graders/locale-guide-loaded.md
A	plugin-evals-citation-check/02-apa-zh-mixed-overclaim/graders/no-false-positive.md
A	plugin-evals-citation-check/02-apa-zh-mixed-overclaim/graders/no-overreach.md
A	plugin-evals-citation-check/02-apa-zh-mixed-overclaim/graders/report-in-chinese.md
A	plugin-evals-citation-check/02-apa-zh-mixed-overclaim/graders/skill-fired.md
A	plugin-evals-citation-check/02-apa-zh-mixed-overclaim/prompt.md
A	plugin-evals-citation-check/03-ieee-en-prose/graders/content-caught.md
A	plugin-evals-citation-check/03-ieee-en-prose/graders/format-caught.md
A	plugin-evals-citation-check/03-ieee-en-prose/graders/honest-unverified.md
A	plugin-evals-citation-check/03-ieee-en-prose/graders/no-false-positive.md
A	plugin-evals-citation-check/03-ieee-en-prose/graders/no-overreach.md
A	plugin-evals-citation-check/03-ieee-en-prose/graders/orphan-named.md
A	plugin-evals-citation-check/03-ieee-en-prose/graders/skill-fired.md
A	plugin-evals-citation-check/03-ieee-en-prose/prompt.md
A	plugin-evals-citation-check/04-vancouver-en-terse-retraction/graders/content-caught.md
A	plugin-evals-citation-check/04-vancouver-en-terse-retraction/graders/format-caught.md
A	plugin-evals-citation-check/04-vancouver-en-terse-retraction/graders/honest-unverified.md
A	plugin-evals-citation-check/04-vancouver-en-terse-retraction/graders/no-false-positive.md
A	plugin-evals-citation-check/04-vancouver-en-terse-retraction/graders/no-overreach.md
A	plugin-evals-citation-check/04-vancouver-en-terse-retraction/graders/skill-fired.md
A	plugin-evals-citation-check/04-vancouver-en-terse-retraction/prompt.md
A	plugin-evals-citation-check/05-apa-es-locale/graders/content-caught.md
A	plugin-evals-citation-check/05-apa-es-locale/graders/format-caught.md
A	plugin-evals-citation-check/05-apa-es-locale/graders/honest-unverified.md
A	plugin-evals-citation-check/05-apa-es-locale/graders/locale-respected.md
A	plugin-evals-citation-check/05-apa-es-locale/graders/no-chinese-chars.md
A	plugin-evals-citation-check/05-apa-es-locale/graders/no-false-positive.md
A	plugin-evals-citation-check/05-apa-es-locale/graders/no-overreach.md
A	plugin-evals-citation-check/05-apa-es-locale/graders/orphan-named.md
A	plugin-evals-citation-check/05-apa-es-locale/graders/skill-fired.md
A	plugin-evals-citation-check/05-apa-es-locale/prompt.md
A	plugin-evals-citation-check/06-chicago-nb-en-footnotes/graders/content-caught.md
A	plugin-evals-citation-check/06-chicago-nb-en-footnotes/graders/format-caught.md
A	plugin-evals-citation-check/06-chicago-nb-en-footnotes/graders/honest-unverified.md
A	plugin-evals-citation-check/06-chicago-nb-en-footnotes/graders/no-false-positive.md
A	plugin-evals-citation-check/06-chicago-nb-en-footnotes/graders/no-overreach.md
A	plugin-evals-citation-check/06-chicago-nb-en-footnotes/graders/orphan-named.md
A	plugin-evals-citation-check/06-chicago-nb-en-footnotes/graders/skill-fired.md
A	plugin-evals-citation-check/06-chicago-nb-en-footnotes/prompt.md
A	plugin-evals-citation-check/07-neg-convert-apa-to-ieee/graders/is-conversion.md
A	plugin-evals-citation-check/07-neg-convert-apa-to-ieee/graders/not-audit-report.md
A	plugin-evals-citation-check/07-neg-convert-apa-to-ieee/graders/numbered-in-order.md
A	plugin-evals-citation-check/07-neg-convert-apa-to-ieee/prompt.md
A	plugin-evals-citation-check/08-neg-python-unused-imports/graders/code-level-answer.md
A	plugin-evals-citation-check/08-neg-python-unused-imports/graders/names-hashlib.md
A	plugin-evals-citation-check/08-neg-python-unused-imports/graders/names-os.md
A	plugin-evals-citation-check/08-neg-python-unused-imports/graders/skill-not-called.md
A	plugin-evals-citation-check/08-neg-python-unused-imports/prompt.md
A	plugin-evals-citation-check/README.md
A	plugin-evals-citation-locale/09-zh-stroke-inversion-two-authors/graders/agent-loaded.md
A	plugin-evals-citation-locale/09-zh-stroke-inversion-two-authors/graders/keep-two-authors.md
A	plugin-evals-citation-locale/09-zh-stroke-inversion-two-authors/graders/skill-fired.md
A	plugin-evals-citation-locale/09-zh-stroke-inversion-two-authors/graders/stroke-inversion.md
A	plugin-evals-citation-locale/09-zh-stroke-inversion-two-authors/prompt.md
A	plugin-evals-citation-locale/10-zh-disambiguation-preserve-authors/graders/agent-loaded.md
A	plugin-evals-citation-locale/10-zh-disambiguation-preserve-authors/graders/preserve-disambiguation.md
A	plugin-evals-citation-locale/10-zh-disambiguation-preserve-authors/graders/preserve-reference-authors.md
A	plugin-evals-citation-locale/10-zh-disambiguation-preserve-authors/graders/skill-fired.md
A	plugin-evals-citation-locale/10-zh-disambiguation-preserve-authors/prompt.md
A	plugin-evals-citation-locale/11-zh-venue-romanization-order/graders/agent-loaded.md
A	plugin-evals-citation-locale/11-zh-venue-romanization-order/graders/honor-venue-order.md
A	plugin-evals-citation-locale/11-zh-venue-romanization-order/graders/skill-fired.md
A	plugin-evals-citation-locale/11-zh-venue-romanization-order/prompt.md
A	plugin-evals-citation-locale/README.md
A	plugin-evals/01-journal-mixed-format-zh/graders/all-9-covered.md
A	plugin-evals/01-journal-mixed-format-zh/graders/no-rewrite.md
A	plugin-evals/01-journal-mixed-format-zh/graders/skill-fired.md
A	plugin-evals/01-journal-mixed-format-zh/prompt.md
A	plugin-evals/02-decision-letter-email-en/graders/all-covered.md
A	plugin-evals/02-decision-letter-email-en/graders/no-rewrite.md
A	plugin-evals/02-decision-letter-email-en/graders/pushback-flagged.md
A	plugin-evals/02-decision-letter-email-en/graders/skill-fired.md
A	plugin-evals/02-decision-letter-email-en/prompt.md
A	plugin-evals/03-iclr-rebuttal-en/graders/no-committee-branch.md
A	plugin-evals/03-iclr-rebuttal-en/graders/no-fabrication.md
A	plugin-evals/03-iclr-rebuttal-en/graders/pushback-per-reviewer.md
A	plugin-evals/03-iclr-rebuttal-en/graders/skill-fired.md
A	plugin-evals/03-iclr-rebuttal-en/prompt.md
A	plugin-evals/04-ethics-committee-letter-zh/graders/no-severity-words.md
A	plugin-evals/04-ethics-committee-letter-zh/graders/skill-fired.md
A	plugin-evals/04-ethics-committee-letter-zh/graders/tracker-covers-5.md
A	plugin-evals/04-ethics-committee-letter-zh/prompt.md
A	plugin-evals/05-terse-contradictory-zh/graders/contradiction-surfaced.md
A	plugin-evals/05-terse-contradictory-zh/graders/no-rewrite.md
A	plugin-evals/05-terse-contradictory-zh/graders/scope-creep-flagged.md
A	plugin-evals/05-terse-contradictory-zh/graders/skill-fired.md
A	plugin-evals/05-terse-contradictory-zh/prompt.md
A	plugin-evals/06-neg-existing-rebuttal-draft-zh/graders/missed-item-named.md
A	plugin-evals/06-neg-existing-rebuttal-draft-zh/graders/no-new-skeleton.md
A	plugin-evals/06-neg-existing-rebuttal-draft-zh/prompt.md
A	plugin-evals/07-neg-landlord-letter-zh/graders/helpful-reply.md
A	plugin-evals/07-neg-landlord-letter-zh/graders/no-reviewer-template.md
A	plugin-evals/07-neg-landlord-letter-zh/graders/skill-not-called.md
A	plugin-evals/07-neg-landlord-letter-zh/prompt.md
A	plugin-evals/README.md
M	requirements-dev.txt
A	scripts/_calibration_pdf_text.py
M	scripts/_ci_pytest_manifest.toml
M	scripts/_claim_audit_constants.py
M	scripts/_skill_lint.py
M	scripts/_text_similarity.py
M	scripts/adjudication_activity.py
M	scripts/announce-ars-loaded.sh
M	scripts/ars_mark_read.py
A	scripts/assemble_calibration_corpus.py
A	scripts/build_calibration_measurement_row.py
M	scripts/check_673_adjudication_activity.py
A	scripts/check_acronyms.py
A	scripts/check_command_skill_dispatch.py
M	scripts/check_degradation_registry.py
M	scripts/check_heldout_measurement_report.py
M	scripts/check_instruction_data_boundary.py
M	scripts/check_pipeline_boundary_semantics.py
M	scripts/check_reviewer_role_label.py
A	scripts/check_routing_core_sync.py
A	scripts/check_skill_description_length.py
A	scripts/check_skill_inventory_parity.py
M	scripts/check_spec_consistency.py
M	scripts/check_surface_form_parity.py
M	scripts/check_version_consistency.py
M	scripts/chinese_literature_client.py
M	scripts/claim_audit_pipeline.py
M	scripts/cross_model_codex_transport.py
M	scripts/cross_model_smoke_test.sh
A	scripts/cross_model_verification/openai_effort_guard.sh
A	scripts/dispatch_calibration_panel.py
M	scripts/dispatch_e4_panel.py
A	scripts/fetch_calibration_corpus.py
A	scripts/file_lock.py
M	scripts/inquiry_branch_ledger.py
M	scripts/review_criteria_binding.py
M	scripts/run_codex_audit.sh
A	scripts/run_ledger.py
A	scripts/score_calibration_run.py
M	scripts/test_adjudication_activity.py
M	scripts/test_ars_mark_read.py
A	scripts/test_assemble_calibration_corpus.py
A	scripts/test_build_calibration_measurement_row.py
M	scripts/test_build_submission_packet_manifest.py
A	scripts/test_check_acronyms.py
A	scripts/test_check_command_skill_dispatch.py
M	scripts/test_check_committee_correspondence.py
M	scripts/test_check_control_availability.py
M	scripts/test_check_cross_model_verification_sync.py
M	scripts/test_check_instruction_data_boundary.py
A	scripts/test_check_routing_core_sync.py
A	scripts/test_check_skill_description_length.py
A	scripts/test_check_skill_inventory_parity.py
M	scripts/test_check_spec_consistency.py
M	scripts/test_check_sprint_contract.py
M	scripts/test_check_surface_form_parity.py
M	scripts/test_chinese_literature_client.py
M	scripts/test_claim_audit_pipeline.py
M	scripts/test_cross_model_codex_transport.py
M	scripts/test_cross_model_verification_guards.py
M	scripts/test_crossref_client.py
A	scripts/test_dispatch_calibration_panel.py
M	scripts/test_dispatch_e4_panel.py
M	scripts/test_evidence_rows.py
A	scripts/test_file_lock.py
M	scripts/test_inquiry_branch_ledger.py
A	scripts/test_output_language_pair.py
M	scripts/test_reading_probe_lint.py
M	scripts/test_run_codex_audit_e2e.py
A	scripts/test_run_ledger.py
A	scripts/test_score_calibration_run.py
M	scripts/test_socratic_rq_non_generation_contract.py
M	scripts/test_text_similarity.py
M	scripts/test_v3_6_7_phase_6_6.py
M	scripts/venue_disclosure_contract_harness.py
M	shared/agents/compliance_agent.md
M	shared/collaboration_depth_rubric.md
M	shared/contracts/audit/audit_sidecar.schema.json
M	shared/contracts/capability/stage_capability_matrix.json
M	shared/contracts/degradation_registry.json
A	shared/contracts/passport/run_ledger.schema.json
M	shared/contracts/writer/full.json
M	shared/cross_model_verification.md
M	shared/ground_truth_isolation_pattern.md
M	shared/handoff_schemas.md
M	shared/model_tiering.md
A	shared/output_language_pair.md
M	shared/references/intent_clarification_protocol.md
A	shared/references/routing_core.md
M	shared/templates/codex_audit_multifile_template.md
A	tests/fake_msvcrt.py
A	tests/fixtures/acronym_check/expected.en.md
A	tests/fixtures/acronym_check/expected.json
A	tests/fixtures/acronym_check/expected.zh-TW.md
A	tests/fixtures/acronym_check/manuscript.md
A	tests/fixtures/issue_133_routing/11_spanish_revision_not_review/expected.yaml
A	tests/fixtures/issue_133_routing/11_spanish_revision_not_review/input.md
A	tests/fixtures/issue_133_routing/12_spanish_review_not_revision/expected.yaml
A	tests/fixtures/issue_133_routing/12_spanish_review_not_revision/input.md
A	tests/fixtures/issue_133_routing/CALIBRATION_LOG.md
M	tests/fixtures/issue_133_routing/README.md
A	tests/fixtures/output_language_pair/README.md
A	tests/fixtures/output_language_pair/default/expected.yaml
A	tests/fixtures/output_language_pair/default/input.md
A	tests/fixtures/output_language_pair/malformed/expected.yaml
A	tests/fixtures/output_language_pair/malformed/input.md
A	tests/fixtures/output_language_pair/omitted/expected.yaml
A	tests/fixtures/output_language_pair/omitted/input.md
A	tests/fixtures/output_language_pair/unsupported/expected.yaml
A	tests/fixtures/output_language_pair/unsupported/input.md
```
