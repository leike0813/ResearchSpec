# ARSU Anchor Review — v3.19.0-828ef3b

## Parity Summary

| metric | value |
|---|---|
| avg section coverage | 0.9503128956509691 |
| avg rule coverage | 0.9654416505480335 |
| below section threshold | 0 |
| below rule threshold | 0 |
| output missing | 0 |
| flow retained | 0 |

## Per-Mode Assessment

| route | mode | upstream required (docs/lines) | upstream optional (docs/lines) | converted (nodes/lines) | anchor preservation | semantic gaps | flow anchors |
|---|---|---|---|---|---|---|---|
| `deep-research:full` | Full research | 26 / 6,322 | 1 / 332 | 6 / 3,108 | 100% (6/6) | none | none |
| `deep-research:quick` | Quick research brief | 11 / 2,435 | 1 / 332 | 4 / 1,643 | 100% (4/4) | none | none |
| `deep-research:review` | Research text review | 8 / 1,652 | 0 / 0 | 3 / 1,379 | 100% (3/3) | none | none |
| `deep-research:lit-review` | Evidence literature review | 12 / 2,599 | 1 / 332 | 3 / 1,187 | 100% (4/4) | none | none |
| `deep-research:three-way-scan` | WHY/HOW/WHAT scan | 6 / 1,503 | 0 / 0 | 2 / 768 | 100% (4/4) | none | none |
| `deep-research:fact-check` | Claim fact-check | 6 / 1,191 | 4 / 331 | 2 / 973 | 100% (4/4) | none | none |
| `deep-research:socratic` | Socratic research planning | 10 / 2,667 | 0 / 0 | 3 / 1,278 | 100% (4/4) | none | none |
| `deep-research:systematic-review` | Systematic review | 28 / 6,838 | 1 / 332 | 8 / 4,003 | 100% (6/6) | none | none |
| `academic-paper:full` | Full manuscript drafting | 37 / 10,418 | 3 / 595 | 7 / 4,489 | 100% (7/7) | none | none |
| `academic-paper:plan` | Guided paper planning | 15 / 3,531 | 3 / 595 | 4 / 2,544 | 100% (4/4) | none | none |
| `academic-paper:outline-only` | Outline only | 14 / 3,233 | 3 / 595 | 3 / 1,394 | 100% (4/4) | none | none |
| `academic-paper:revision` | Manuscript revision | 11 / 3,171 | 1 / 368 | 4 / 1,901 | 100% (4/4) | none | none |
| `academic-paper:revision-coach` | Revision coaching | 5 / 1,312 | 3 / 595 | 1 / 339 | 100% (4/4) | none | none |
| `academic-paper:abstract-only` | Abstract only | 8 / 1,707 | 1 / 368 | 1 / 343 | 100% (4/4) | none | none |
| `academic-paper:lit-review` | Manuscript literature review | 9 / 2,123 | 3 / 595 | 4 / 1,591 | 100% (4/4) | none | none |
| `academic-paper:format-convert` | Format conversion | 9 / 2,907 | 3 / 595 | 1 / 974 | 100% (4/4) | none | none |
| `academic-paper:citation-check` | Citation check | 6 / 1,792 | 1 / 368 | 2 / 749 | 100% (4/4) | none | none |
| `academic-paper:disclosure` | AI disclosure | 8 / 2,407 | 0 / 0 | 2 / 1,498 | 100% (3/3) | none | none |
| `academic-paper:rebuttal-audit` | Rebuttal audit | 4 / 1,246 | 3 / 595 | 1 / 339 | 100% (4/4) | none | none |
| `academic-paper-reviewer:full` | Full peer review | 19 / 4,800 | 1 / 16 | 5 / 2,847 | 100% (6/6) | none | none |
| `academic-paper-reviewer:re-review` | Revision re-review | 9 / 2,264 | 0 / 0 | 3 / 1,271 | 100% (4/4) | none | none |
| `academic-paper-reviewer:quick` | Quick review | 5 / 1,049 | 0 / 0 | 1 / 426 | 100% (3/3) | none | none |
| `academic-paper-reviewer:methodology-focus` | Methodology-focused review | 7 / 1,792 | 0 / 0 | 1 / 948 | 100% (4/4) | none | none |
| `academic-paper-reviewer:guided` | Guided review | 12 / 3,062 | 0 / 0 | 3 / 1,998 | 100% (4/4) | none | none |
| `academic-paper-reviewer:calibration` | Reviewer calibration | 13 / 3,533 | 0 / 0 | 2 / 1,440 | 100% (4/4) | none | none |
| `academic-pipeline:end-to-end` | End-to-end pipeline | 26 / 8,082 | 1 / 136 | 24 / 17,833 | 80% (4/5) | none | Stage 1 RESEARCH |
| `academic-pipeline:resume_from_passport` | Resume from passport reset boundary | 9 / 4,501 | 1 / 136 | 26 / 18,201 | 100% (5/5) | none | none |

## Per-Package Parity

| capability_id | section coverage | rule coverage | skill lines | knowledge refs | output format | flow headings |
|---|---|---|---|---|---|---|
| `analysis-evidence-synthesis` | 0.973 | 1.000 | 233 | 3 | yes | none |
| `analysis-meta-analysis` | 0.848 | 1.000 | 207 | 1 | yes | none |
| `analysis-review-response-manuscript-analysis` | 0.933 | 1.000 | 111 | 4 | yes | none |
| `analysis-risk-of-bias-assessment` | 0.946 | 1.000 | 202 | 1 | yes | none |
| `check-citation-existence-verification` | 1.000 | 1.000 | 46 | 1 | yes | none |
| `check-citation-format-compliance` | 0.950 | 1.000 | 293 | 1 | yes | none |
| `check-citation-verification-summary` | 1.000 | 1.000 | 46 | 1 | yes | none |
| `check-claim-faithfulness-audit` | 0.941 | 1.000 | 211 | 1 | yes | none |
| `check-collaboration-depth-observer` | 1.000 | 1.000 | 145 | 1 | yes | none |
| `check-compliance-check` | 0.917 | 1.000 | 200 | 2 | yes | none |
| `check-contamination-signals` | 1.000 | 1.000 | 46 | 1 | yes | none |
| `check-paper-humanization-review` | 0.800 | 1.000 | 122 | 3 | yes | none |
| `check-paper-humanization-verification` | 1.000 | 1.000 | 117 | 3 | yes | none |
| `check-passport-verifier` | 1.000 | 1.000 | 67 | 1 | yes | none |
| `check-pdf-read-preflight` | 1.000 | 1.000 | 45 | 1 | yes | none |
| `check-pre-submission-self-check` | 0.940 | 0.909 | 355 | 1 | yes | none |
| `check-reference-integrity-verification` | 0.947 | 0.879 | 309 | 2 | yes | none |
| `check-submission-package-verifier` | 1.000 | 1.000 | 47 | 2 | yes | none |
| `check-temporal-integrity-verification` | 1.000 | 1.000 | 55 | 1 | yes | none |
| `check-terminal-policy-gate` | 1.000 | 1.000 | 83 | 1 | yes | none |
| `design-argument-blueprint` | 0.941 | 1.000 | 246 | 3 | yes | none |
| `design-manuscript-structure-design` | 0.933 | 1.000 | 263 | 1 | yes | none |
| `design-methodology-design` | 0.960 | 0.818 | 162 | 3 | yes | none |
| `design-research-question-formulation` | 0.923 | 1.000 | 148 | 2 | yes | none |
| `design-review-panel-config` | 1.000 | 1.000 | 180 | 2 | yes | none |
| `design-review-response-intake` | 1.000 | 1.000 | 114 | 4 | yes | none |
| `design-review-response-workboard-planning` | 1.000 | 1.000 | 103 | 4 | yes | none |
| `design-writing-intake` | 1.000 | 1.000 | 234 | 1 | yes | none |
| `discovery-literature-monitoring` | 1.000 | 1.000 | 207 | 1 | yes | none |
| `discovery-literature-search-screening` | 0.732 | 0.800 | 164 | 2 | yes | none |
| `discovery-source-quality-grading` | 1.000 | 1.000 | 183 | 1 | yes | none |
| `generation-abstract-writing` | 1.000 | 1.000 | 155 | 1 | yes | none |
| `generation-figure-generation` | 0.763 | 0.667 | 210 | 2 | yes | none |
| `generation-format-rendering` | 0.952 | 1.000 | 309 | 2 | yes | none |
| `generation-humanization-reference` | 0.980 | 0.667 | 196 | 1 | yes | none |
| `generation-manuscript-drafting` | 0.952 | 1.000 | 211 | 3 | yes | none |
| `generation-report-compilation` | 0.952 | 1.000 | 251 | 2 | yes | none |
| `generation-review-response-round` | 0.800 | 1.000 | 126 | 5 | yes | none |
| `judgment-devils-advocate-stress-test` | 0.923 | 1.000 | 218 | 1 | yes | none |
| `judgment-editorial-judgment` | 1.000 | 1.000 | 189 | 1 | yes | none |
| `judgment-review-synthesis` | 0.960 | 0.818 | 250 | 1 | yes | none |
| `judgment-specialist-review` | 0.952 | 1.000 | 200 | 3 | yes | none |
| `transform-paper-humanization-revision` | 1.000 | 1.000 | 86 | 2 | yes | none |
| `transform-review-response-comment-atomization` | 1.000 | 1.000 | 109 | 4 | yes | none |
| `transform-revision-patching` | 1.000 | 1.000 | 73 | 1 | yes | none |
| `transform-revision-roadmap-parsing` | 0.892 | 1.000 | 255 | 1 | yes | none |
| `transform-socratic-mentoring` | 0.853 | 0.818 | 277 | 2 | yes | none |

## Artifact Hashes

| artifact | path | sha256 |
|---|---|---|
| parity report | `artifacts/generated/capability-parity-report.json` | `95d4f39c9b0bb22260e0960e022b64d3bebe769c46b0168f6a5a1ec1d68d39e1` |
| mode-capability review HTML | `audits/arsu/v3.19.0-828ef3b/artifacts/arsu-mode-capability-review.html` | `cd0fca95ab62810ad2281edad07fcd4b346f5ab90018891616b5bde4fcdca6d2` |
| graph-match assessment HTML | `audits/arsu/v3.19.0-828ef3b/artifacts/arsu-mode-graph-match-assessment.html` | `a2902149f8060a711cb56c7bab596b35207d9e1a373cb5bb425c82c255663aff` |
| gap semantic review HTML | `audits/arsu/v3.19.0-828ef3b/artifacts/arsu-mode-gap-semantic-review.html` | `6f7394a0f73db7bc2fc738304251528dbb7e6f1ed53405e07e3e6bbc851f760c` |

## Human Confirmation

- [x] 27 modes 全部可见并可折叠审阅。
- [x] 上游指令 / references / templates 与转换后节点并列。
- [x] capability SKILL 不含 next-node / next-phase 指令。
- [x] 命名、registry、审阅工件、锚点 manifest 四层身份一致。
