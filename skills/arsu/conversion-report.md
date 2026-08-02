# ARSU Conversion Report

- Output kind: `final`
- Source: `vendor/ars`
- Source commit: `828ef3b613b0e8b91830da3328a1e33d4eb5ab4c`
- Output: `skills/arsu`
- Generated at: `2026-08-02T15:42:56Z`
- Validation: pass

## Source Checkout

- Root: `vendor/ars`
- Branch: ``
- Remote: `https://github.com/Imbad0202/academic-research-skills`
- Dirty: `false`

## Generated Skill Groups

- `academic-paper`
- `academic-paper-reviewer`
- `academic-pipeline`
- `deep-research`

## Contract Integration

- Manifest: `researchspec-contracts.json`
- Profile: `researchspec-preflight-v10`
- Full matrix injection: `false`
- Anchor replacement profile: `researchspec-anchor-replacement-v4`
- Anchor replacement coverage: 54/54 replaceable anchors
- Diagnostic anchors matched: 2/2
- Human replacement report: `anchor-replacement-report.md`
- Runtime policy catalog: `ars-v3.19.0-agent-neutral-runtime`
- Runtime policy coverage: 33 classified sources
- Runtime policy report: `runtime-policy-report.md`

## Routing Catalog

- Path: `routing-catalog.json`
- Catalog ID: `arsu-routing-v0.1`
- Skills: 4
- Mode routes: 25
- Entry routes: 2

## Anchor Replacement Semantics

- `boundary_deliverable_contract`: 6
- `boundary_deliverable_provenance`: 4
- `control_decision_record`: 2
- `gate_policy`: 6
- `generator_evaluator_contract`: 10
- `handoff_projection`: 3
- `review_handoff_tracking`: 4
- `revision_patch_protocol`: 4
- `stable_claim_contract`: 3
- `stable_source_contract`: 3
- `subflow_control_boundary`: 9

## File Summary

- Output files: 510
- Excluded source files: 529
- Unclassified source files: 358
- Risk findings: 1472

## Risk Findings

- `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md` line 33: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md` line 33: platform_term `hook`
- `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md` line 153: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md` line 239: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md` line 250: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md` line 254: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md` line 264: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md` line 302: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/domain_reviewer_agent.md` line 32: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/domain_reviewer_agent.md` line 32: platform_term `hook`
- `academic-paper-reviewer/agents/domain_reviewer_agent.md` line 193: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/editorial_synthesizer_agent.md` line 31: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/editorial_synthesizer_agent.md` line 31: platform_term `hook`
- `academic-paper-reviewer/agents/editorial_synthesizer_agent.md` line 57: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/editorial_synthesizer_agent.md` line 118: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/editorial_synthesizer_agent.md` line 122: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/editorial_synthesizer_agent.md` line 131: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/editorial_synthesizer_agent.md` line 417: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/eic_agent.md` line 31: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/eic_agent.md` line 31: platform_term `hook`
- `academic-paper-reviewer/agents/methodology_reviewer_agent.md` line 32: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/methodology_reviewer_agent.md` line 32: platform_term `hook`
- `academic-paper-reviewer/agents/perspective_reviewer_agent.md` line 32: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/agents/perspective_reviewer_agent.md` line 32: platform_term `hook`
- `academic-paper-reviewer/examples/hei_paper_review_example.md` line 52: history_term `previously`
- `academic-paper-reviewer/examples/subclaim_decomposition_example.md` line 3: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/examples/subclaim_decomposition_example.md` line 70: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/calibration_mode_protocol.md` line 6: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/calibration_mode_protocol.md` line 83: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/calibration_mode_protocol.md` line 94: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/calibration_mode_protocol.md` line 148: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/changelog.md` line 1: history_term `Changelog`
- `academic-paper-reviewer/references/changelog.md` line 9: version_marker `version marker`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 42: platform_term `hook`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 180: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 284: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 371: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 437: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 490: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 557: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 571: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 602: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 628: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 663: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 671: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 676: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md` line 689: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/formatter_agent.md` line 26: issue_reference `issue_or_pr_reference`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/formatter_agent.md` line 26: platform_term `hook`
- `academic-paper-reviewer/references/cross-skill/academic-paper/agents/formatter_agent.md` line 103: issue_reference `issue_or_pr_reference`
- ... 1422 more findings in `conversion-manifest.json`

## Validation

- No blocking errors.
