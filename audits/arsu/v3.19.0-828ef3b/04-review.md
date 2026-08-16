# ARSU Anchor Review — v3.19.0-828ef3b

## Parity Summary

| metric | value |
|---|---|
| avg section coverage | 0.9513519147963746 |
| avg rule coverage | 0.9660287081339716 |
| below section threshold | 0 |
| below rule threshold | 0 |
| output missing | 0 |
| flow retained | 0 |

## Per-Mode Assessment

| route | mode | upstream required (docs/lines) | upstream optional (docs/lines) | converted (nodes/lines) | anchor preservation | semantic gaps | flow anchors |
|---|---|---|---|---|---|---|---|
| `deep-research:full` | Full research | 26 / 6,322 | 1 / 332 | 6 / 3,108 | 100% (6/6) | none | none |
| `deep-research:quick` | Quick research brief | 11 / 2,435 | 1 / 332 | 4 / 1,643 | 100% (4/4) | none | none |
| `deep-research:review` | Research text review | 8 / 1,652 | 0 / 0 | 3 / 1,378 | 100% (3/3) | none | none |
| `deep-research:lit-review` | Evidence literature review | 12 / 2,599 | 1 / 332 | 3 / 1,187 | 100% (4/4) | none | none |
| `deep-research:three-way-scan` | WHY/HOW/WHAT scan | 6 / 1,503 | 0 / 0 | 2 / 768 | 100% (4/4) | none | none |
| `deep-research:fact-check` | Claim fact-check | 6 / 1,191 | 4 / 331 | 2 / 973 | 100% (4/4) | none | none |
| `deep-research:socratic` | Socratic research planning | 10 / 2,667 | 0 / 0 | 3 / 1,278 | 100% (4/4) | none | none |
| `deep-research:systematic-review` | Systematic review | 28 / 6,838 | 1 / 332 | 8 / 4,003 | 100% (6/6) | none | none |
| `academic-paper:full` | Full manuscript drafting | 37 / 10,418 | 3 / 595 | 6 / 3,515 | 100% (7/7) | none | none |
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
| `academic-paper-reviewer:full` | Full peer review | 19 / 4,800 | 1 / 16 | 5 / 2,845 | 100% (6/6) | none | none |
| `academic-paper-reviewer:re-review` | Revision re-review | 9 / 2,264 | 0 / 0 | 3 / 1,271 | 100% (4/4) | none | none |
| `academic-paper-reviewer:quick` | Quick review | 5 / 1,049 | 0 / 0 | 1 / 425 | 100% (3/3) | none | none |
| `academic-paper-reviewer:methodology-focus` | Methodology-focused review | 7 / 1,792 | 0 / 0 | 1 / 947 | 100% (4/4) | none | none |
| `academic-paper-reviewer:guided` | Guided review | 12 / 3,062 | 0 / 0 | 3 / 1,996 | 100% (4/4) | none | none |
| `academic-paper-reviewer:calibration` | Reviewer calibration | 13 / 3,533 | 0 / 0 | 2 / 1,439 | 100% (4/4) | none | none |
| `academic-pipeline:end-to-end` | End-to-end pipeline | 26 / 8,082 | 1 / 136 | 17 / 9,468 | 40% (2/5) | none | Stage 1 RESEARCH, FINAL INTEGRITY, Process Summary |
| `academic-pipeline:resume_from_passport` | Resume from passport reset boundary | 9 / 4,501 | 1 / 136 | 19 / 9,836 | 100% (5/5) | none | none |

## Per-Package Parity

| capability_id | section coverage | rule coverage | skill lines | knowledge refs | output format | flow headings |
|---|---|---|---|---|---|---|
| `cap-analysis-evidence-synthesis` | 0.973 | 1.000 | 233 | 3 | yes | none |
| `cap-analysis-meta-analysis` | 0.848 | 1.000 | 207 | 1 | yes | none |
| `cap-analysis-risk-of-bias-assessment` | 0.946 | 1.000 | 202 | 1 | yes | none |
| `cap-check-citation-existence-verification` | 1.000 | 1.000 | 46 | 1 | yes | none |
| `cap-check-citation-format-compliance` | 0.950 | 1.000 | 293 | 1 | yes | none |
| `cap-check-citation-verification-summary` | 1.000 | 1.000 | 46 | 1 | yes | none |
| `cap-check-claim-faithfulness-audit` | 0.941 | 1.000 | 211 | 1 | yes | none |
| `cap-check-collaboration-depth-observer` | 1.000 | 1.000 | 145 | 1 | yes | none |
| `cap-check-compliance-check` | 0.917 | 1.000 | 200 | 2 | yes | none |
| `cap-check-contamination-signals` | 1.000 | 1.000 | 46 | 1 | yes | none |
| `cap-check-passport-verifier` | 1.000 | 1.000 | 67 | 1 | yes | none |
| `cap-check-pdf-read-preflight` | 1.000 | 1.000 | 45 | 1 | yes | none |
| `cap-check-pre-submission-self-check` | 0.940 | 0.909 | 355 | 1 | yes | none |
| `cap-check-reference-integrity-verification` | 0.947 | 0.879 | 309 | 2 | yes | none |
| `cap-check-submission-package-verifier` | 1.000 | 1.000 | 47 | 2 | yes | none |
| `cap-check-temporal-integrity-verification` | 1.000 | 1.000 | 55 | 1 | yes | none |
| `cap-check-terminal-policy-gate` | 1.000 | 1.000 | 83 | 1 | yes | none |
| `cap-design-argument-blueprint` | 0.941 | 1.000 | 246 | 3 | yes | none |
| `cap-design-manuscript-structure-design` | 0.933 | 1.000 | 263 | 1 | yes | none |
| `cap-design-methodology-design` | 0.960 | 0.818 | 162 | 3 | yes | none |
| `cap-design-research-question-formulation` | 0.923 | 1.000 | 148 | 2 | yes | none |
| `cap-design-review-panel-config` | 1.000 | 1.000 | 180 | 2 | yes | none |
| `cap-design-writing-intake` | 1.000 | 1.000 | 234 | 1 | yes | none |
| `cap-discovery-literature-monitoring` | 1.000 | 1.000 | 207 | 1 | yes | none |
| `cap-discovery-literature-search-screening` | 0.732 | 0.800 | 164 | 2 | yes | none |
| `cap-discovery-source-quality-grading` | 1.000 | 1.000 | 183 | 1 | yes | none |
| `cap-generation-abstract-writing` | 1.000 | 1.000 | 155 | 1 | yes | none |
| `cap-generation-figure-generation` | 0.763 | 0.667 | 210 | 2 | yes | none |
| `cap-generation-format-rendering` | 0.952 | 1.000 | 309 | 2 | yes | none |
| `cap-generation-manuscript-drafting` | 0.952 | 1.000 | 211 | 3 | yes | none |
| `cap-generation-report-compilation` | 0.952 | 1.000 | 251 | 2 | yes | none |
| `cap-judgment-devils-advocate-stress-test` | 0.923 | 1.000 | 218 | 1 | yes | none |
| `cap-judgment-editorial-judgment` | 1.000 | 1.000 | 188 | 1 | yes | none |
| `cap-judgment-review-synthesis` | 0.960 | 0.818 | 250 | 1 | yes | none |
| `cap-judgment-specialist-review` | 0.952 | 1.000 | 199 | 3 | yes | none |
| `cap-transform-revision-patching` | 1.000 | 1.000 | 73 | 1 | yes | none |
| `cap-transform-revision-roadmap-parsing` | 0.892 | 1.000 | 255 | 1 | yes | none |
| `cap-transform-socratic-mentoring` | 0.853 | 0.818 | 277 | 2 | yes | none |

## Artifact Hashes

| artifact | path | sha256 |
|---|---|---|
| parity report | `docs/capability-parity-report.json` | `0c9d95bfde9721b2268ebf1bbe3d0cb16cb41ad03fd5f868a3366674157c9931` |
| mode-capability review HTML | `audits/arsu/v3.19.0-828ef3b/artifacts/arsu-mode-capability-review.html` | `6f6547b2c8e313893f60645848b1582c37dc69909cee13567487b0aa04dc68d1` |
| graph-match assessment HTML | `audits/arsu/v3.19.0-828ef3b/artifacts/arsu-mode-graph-match-assessment.html` | `8930ff9639c2285ba6e7a0ea4b3655a990dcfd4b28e1bf33991aae9f64481e48` |
| gap semantic review HTML | `audits/arsu/v3.19.0-828ef3b/artifacts/arsu-mode-gap-semantic-review.html` | `37dc2895673c8d82a406a9aafd05f8b84a8a77e684a2c6d63a27418444ab3d13` |

## Human Confirmation

- [x] 27 modes 全部可见并可折叠审阅。
- [x] 上游指令 / references / templates 与转换后节点并列。
- [x] capability SKILL 不含 next-node / next-phase 指令。
- [x] 命名、registry、审阅工件、锚点 manifest 四层身份一致。
