# Stable Anchor ID Allocation

Initial allocation for the 52 v2 anchor occurrences. Ordering is by domain,
normalized source path, then existing upstream occurrence order. Assigned ids
are permanent and must not be reused.

| Stable id | Name | Severity | Source path |
| --- | --- | --- | --- |
| `ARTIFACT-001` | `pipeline.state-tracker.version-passport` | `recommended` | `academic-pipeline/agents/state_tracker_agent.md` |
| `ARTIFACT-002` | `deep.timeline.sidecar-runtime` | `recommended` | `deep-research/agents/timeline_extraction_agent.md` |
| `ARTIFACT-003` | `shared.artifact-reproducibility-passport` | `diagnostic` | `shared/artifact_reproducibility_pattern.md` |
| `ARTIFACT-004` | `shared.style-profile-carry` | `diagnostic` | `shared/style_calibration_protocol.md` |
| `CLAIM-001` | `paper.draft-writer.claim-intent-passport` | `required` | `academic-paper/agents/draft_writer_agent.md` |
| `CLAIM-002` | `deep.report-compiler.claim-intent-passport` | `required` | `deep-research/agents/report_compiler_agent.md` |
| `CLAIM-003` | `deep.synthesis.claim-intent-passport` | `required` | `deep-research/agents/synthesis_agent.md` |
| `DECISION-001` | `paper.intake.terminal-policy-passport` | `required` | `academic-paper/agents/intake_agent.md` |
| `DECISION-002` | `shared.compliance.runtime-boundary` | `recommended` | `shared/compliance_checkpoint_protocol.md` |
| `GATE-001` | `pipeline.claim-audit.output-contract` | `required` | `academic-pipeline/agents/claim_ref_alignment_audit_agent.md` |
| `GATE-002` | `pipeline.orchestrator.submission-package-gate` | `recommended` | `academic-pipeline/agents/pipeline_orchestrator_agent.md` |
| `GATE-003` | `shared.compliance-agent.output-passport` | `required` | `shared/agents/compliance_agent.md` |
| `GATE-004` | `shared.ground-truth-isolation` | `recommended` | `shared/ground_truth_isolation_pattern.md` |
| `GATE-005` | `shared.ground-truth-gate-verdict` | `recommended` | `shared/ground_truth_isolation_pattern.md` |
| `GATE-006` | `shared.handoff.invariants` | `required` | `shared/handoff_schemas.md` |
| `HANDOFF-001` | `pipeline.orchestrator.schema-handoff-table` | `required` | `academic-pipeline/agents/pipeline_orchestrator_agent.md` |
| `HANDOFF-002` | `pipeline.team-handoff.passport-checklist` | `recommended` | `academic-pipeline/references/team_collaboration_protocol.md` |
| `HANDOFF-003` | `shared.handoff.schema-convention` | `required` | `shared/handoff_schemas.md` |
| `IO-001` | `paper.draft-writer.phase-boundary` | `recommended` | `academic-paper/agents/draft_writer_agent.md` |
| `IO-002` | `pipeline.skill.phase-boundary-enforcement` | `recommended` | `academic-pipeline/SKILL.md` |
| `IO-003` | `deep.agent.phase-boundary` | `recommended` | `deep-research/agents/bibliography_agent.md` |
| `PATCH-001` | `paper.skill.revision-patch-mode` | `required` | `academic-paper/SKILL.md` |
| `PATCH-002` | `paper.draft-writer.patch-emission` | `required` | `academic-paper/agents/draft_writer_agent.md` |
| `PATCH-003` | `paper.revision-patch-reference` | `required` | `academic-paper/references/revision_patch_protocol.md` |
| `PATCH-004` | `pipeline.orchestrator.revision-patch-toolchain` | `required` | `academic-pipeline/agents/pipeline_orchestrator_agent.md` |
| `REVIEW-001` | `reviewer.skill.rereview-schema11` | `required` | `academic-paper-reviewer/SKILL.md` |
| `REVIEW-002` | `reviewer.skill.sprint-contract` | `required` | `academic-paper-reviewer/SKILL.md` |
| `REVIEW-003` | `reviewer.agent.devils_advocate_reviewer.sprint-contract-phase-model` | `recommended` | `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md` |
| `REVIEW-004` | `reviewer.agent.sprint-contract-phase-model` | `recommended` | `academic-paper-reviewer/agents/domain_reviewer_agent.md` |
| `REVIEW-005` | `reviewer.agent.eic.sprint-contract-phase-model` | `recommended` | `academic-paper-reviewer/agents/eic_agent.md` |
| `REVIEW-006` | `reviewer.agent.methodology_reviewer.sprint-contract-phase-model` | `recommended` | `academic-paper-reviewer/agents/methodology_reviewer_agent.md` |
| `REVIEW-007` | `reviewer.agent.perspective_reviewer.sprint-contract-phase-model` | `recommended` | `academic-paper-reviewer/agents/perspective_reviewer_agent.md` |
| `REVIEW-008` | `reviewer.reference.rereview-commitment-verification` | `required` | `academic-paper-reviewer/references/re_review_mode_protocol.md` |
| `REVIEW-009` | `reviewer.reference.sprint-contract-protocol` | `required` | `academic-paper-reviewer/references/sprint_contract_protocol.md` |
| `REVIEW-010` | `paper.skill.generator-evaluator-contract` | `required` | `academic-paper/SKILL.md` |
| `REVIEW-011` | `paper.skill.rebuttal-audit-boundary` | `recommended` | `academic-paper/SKILL.md` |
| `REVIEW-012` | `paper.draft-writer.generator-contract-runtime` | `required` | `academic-paper/agents/draft_writer_agent.md` |
| `REVIEW-013` | `paper.peer-reviewer.evaluator-contract-runtime` | `required` | `academic-paper/agents/peer_reviewer_agent.md` |
| `REVIEW-014` | `paper.revision-coach.commitment-ledger` | `required` | `academic-paper/agents/revision_coach_agent.md` |
| `REVIEW-015` | `shared.handoff.schema11-commitments` | `required` | `shared/handoff_schemas.md` |
| `SOURCE-001` | `paper.literature-strategist.corpus-passport` | `required` | `academic-paper/agents/literature_strategist_agent.md` |
| `SOURCE-002` | `pipeline.reference.literature-consumer-runtime` | `required` | `academic-pipeline/references/literature_corpus_consumers.md` |
| `SOURCE-003` | `deep.bibliography.corpus-passport` | `required` | `deep-research/agents/bibliography_agent.md` |
| `STATE-001` | `paper.skill.material-passport-state` | `required` | `academic-paper/SKILL.md` |
| `STATE-002` | `pipeline.skill.resume-from-passport` | `required` | `academic-pipeline/SKILL.md` |
| `STATE-003` | `pipeline.skill.orchestrator-state-tracking` | `required` | `academic-pipeline/SKILL.md` |
| `STATE-004` | `pipeline.orchestrator.reset-boundary-ledger` | `required` | `academic-pipeline/agents/pipeline_orchestrator_agent.md` |
| `STATE-005` | `pipeline.orchestrator.resume-runtime` | `required` | `academic-pipeline/agents/pipeline_orchestrator_agent.md` |
| `STATE-006` | `pipeline.state-tracker.runtime-owner` | `required` | `academic-pipeline/agents/state_tracker_agent.md` |
| `STATE-007` | `pipeline.reference.passport-reset-protocol` | `required` | `academic-pipeline/references/passport_as_reset_boundary.md` |
| `STATE-008` | `deep.skill.material-passport-state` | `required` | `deep-research/SKILL.md` |
| `STATE-009` | `shared.handoff.schema9-material-passport` | `required` | `shared/handoff_schemas.md` |

## Allocation Rules

- The stable id is the only anchor identity and generated marker identity in v3.
- `name` is descriptive metadata and may be corrected without changing the id.
- New anchors take the next unused number in their domain; deleted ids remain reserved.
- Retain decisions are coverage decisions, not anchors, and are not assigned anchor ids.
