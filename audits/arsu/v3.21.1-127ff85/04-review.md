# ARSU Anchor Review — v3.21.1-127ff85

## Parity Summary

| metric | value |
|---|---|
| avg section coverage | 0.9453378676060703 |
| avg rule coverage | 0.9463518494045783 |
| below section threshold | 0 |
| below rule threshold | 0 |
| output missing | 0 |
| flow retained | 0 |

## Per-Mode Assessment

| route | mode | upstream required (docs/lines) | upstream optional (docs/lines) | converted (nodes/lines) | anchor preservation | semantic gaps | flow anchors |
|---|---|---|---|---|---|---|---|
| `deep-research:full` | Full research | 28 / 7,433 | 1 / 332 | 6 / 3,885 | 100% (6/6) | none | none |
| `deep-research:quick` | Quick research brief | 13 / 3,056 | 1 / 332 | 4 / 1,824 | 100% (4/4) | none | none |
| `deep-research:review` | Research text review | 8 / 1,798 | 0 / 0 | 3 / 2,048 | 100% (3/3) | none | none |
| `deep-research:lit-review` | Evidence literature review | 14 / 3,208 | 1 / 332 | 3 / 1,353 | 100% (4/4) | none | none |
| `deep-research:three-way-scan` | WHY/HOW/WHAT scan | 6 / 1,576 | 0 / 0 | 2 / 932 | 100% (4/4) | none | none |
| `deep-research:fact-check` | Claim fact-check | 6 / 1,230 | 4 / 353 | 2 / 1,043 | 100% (4/4) | none | none |
| `deep-research:socratic` | Socratic research planning | 10 / 2,804 | 0 / 0 | 3 / 1,638 | 100% (4/4) | none | none |
| `deep-research:systematic-review` | Systematic review | 30 / 7,925 | 1 / 332 | 8 / 4,782 | 100% (6/6) | none | none |
| `academic-paper:full` | Full manuscript drafting | 37 / 10,570 | 3 / 606 | 7 / 4,999 | 100% (7/7) | none | none |
| `academic-paper:plan` | Guided paper planning | 15 / 3,673 | 3 / 606 | 4 / 3,008 | 100% (4/4) | none | none |
| `academic-paper:outline-only` | Outline only | 14 / 3,368 | 3 / 606 | 3 / 1,984 | 100% (4/4) | none | none |
| `academic-paper:revision` | Manuscript revision | 11 / 3,277 | 1 / 379 | 4 / 2,587 | 100% (4/4) | none | none |
| `academic-paper:revision-coach` | Revision coaching | 6 / 1,638 | 3 / 606 | 1 / 468 | 100% (4/4) | none | none |
| `academic-paper:abstract-only` | Abstract only | 8 / 1,804 | 1 / 379 | 1 / 344 | 100% (4/4) | none | none |
| `academic-paper:lit-review` | Manuscript literature review | 9 / 2,225 | 3 / 606 | 4 / 2,152 | 100% (4/4) | none | none |
| `academic-paper:format-convert` | Format conversion | 9 / 3,137 | 3 / 606 | 1 / 1,009 | 100% (4/4) | none | none |
| `academic-paper:citation-check` | Citation check | 6 / 1,836 | 1 / 379 | 2 / 1,644 | 100% (4/4) | none | none |
| `academic-paper:disclosure` | AI disclosure | 8 / 2,968 | 0 / 0 | 2 / 1,554 | 100% (3/3) | none | none |
| `academic-paper:rebuttal-audit` | Rebuttal audit | 4 / 1,305 | 3 / 606 | 1 / 468 | 100% (4/4) | none | none |
| `academic-paper-reviewer:full` | Full peer review | 22 / 6,388 | 1 / 16 | 5 / 3,855 | 83% (5/6) | converted_only:EIC Review Report | none |
| `academic-paper-reviewer:re-review` | Revision re-review | 9 / 2,620 | 0 / 0 | 3 / 2,045 | 100% (4/4) | none | none |
| `academic-paper-reviewer:quick` | Quick review | 5 / 1,205 | 0 / 0 | 1 / 754 | 67% (2/3) | converted_only:EIC Review Report | none |
| `academic-paper-reviewer:methodology-focus` | Methodology-focused review | 7 / 2,015 | 0 / 0 | 1 / 1,276 | 100% (4/4) | none | none |
| `academic-paper-reviewer:guided` | Guided review | 12 / 3,622 | 0 / 0 | 3 / 2,678 | 100% (4/4) | none | none |
| `academic-paper-reviewer:calibration` | Reviewer calibration | 13 / 4,290 | 0 / 0 | 2 / 2,304 | 25% (1/4) | gap:FNR, gap:FPR, gap:gold set | none |
| `academic-pipeline:end-to-end` | End-to-end pipeline | 26 / 9,568 | 1 / 136 | 24 / 20,197 | 80% (4/5) | none | Stage 1 RESEARCH |
| `academic-pipeline:resume_from_passport` | Resume from passport reset boundary | 9 / 5,584 | 1 / 136 | 26 / 20,983 | 40% (2/5) | gap:reset boundary, gap:awaiting_resume, gap:consumes_hash | none |

## Per-Package Parity

| capability_id | section coverage | rule coverage | skill lines | knowledge refs | output format | flow headings |
|---|---|---|---|---|---|---|
| `analysis-evidence-synthesis` | 0.973 | 1.000 | 234 | 3 | yes | none |
| `analysis-meta-analysis` | 0.848 | 1.000 | 208 | 1 | yes | none |
| `analysis-review-response-manuscript-analysis` | 0.933 | 1.000 | 111 | 4 | yes | none |
| `analysis-risk-of-bias-assessment` | 0.946 | 1.000 | 203 | 1 | yes | none |
| `check-citation-existence-verification` | 1.000 | 1.000 | 87 | 2 | yes | none |
| `check-citation-format-compliance` | 0.950 | 1.000 | 294 | 1 | yes | none |
| `check-citation-verification-summary` | 1.000 | 1.000 | 75 | 2 | yes | none |
| `check-claim-faithfulness-audit` | 0.941 | 1.000 | 212 | 1 | yes | none |
| `check-collaboration-depth-observer` | 1.000 | 1.000 | 146 | 1 | yes | none |
| `check-compliance-check` | 0.917 | 1.000 | 220 | 2 | yes | none |
| `check-contamination-signals` | 1.000 | 1.000 | 83 | 2 | yes | none |
| `check-paper-humanization-review` | 0.800 | 1.000 | 122 | 3 | yes | none |
| `check-paper-humanization-verification` | 1.000 | 1.000 | 117 | 3 | yes | none |
| `check-passport-verifier` | 1.000 | 1.000 | 86 | 2 | yes | none |
| `check-pdf-read-preflight` | 1.000 | 1.000 | 78 | 2 | yes | none |
| `check-pre-submission-self-check` | 0.909 | 0.917 | 248 | 3 | yes | none |
| `check-reference-integrity-verification` | 0.932 | 0.792 | 318 | 2 | yes | none |
| `check-submission-package-verifier` | 1.000 | 1.000 | 79 | 3 | yes | none |
| `check-temporal-integrity-verification` | 1.000 | 1.000 | 84 | 2 | yes | none |
| `check-terminal-policy-gate` | 1.000 | 1.000 | 84 | 1 | yes | none |
| `design-argument-blueprint` | 0.943 | 1.000 | 259 | 3 | yes | none |
| `design-manuscript-structure-design` | 0.957 | 1.000 | 295 | 1 | yes | none |
| `design-methodology-design` | 0.923 | 0.714 | 210 | 4 | yes | none |
| `design-research-question-formulation` | 0.923 | 1.000 | 163 | 2 | yes | none |
| `design-review-panel-config` | 1.000 | 1.000 | 183 | 2 | yes | none |
| `design-review-response-intake` | 1.000 | 1.000 | 114 | 4 | yes | none |
| `design-review-response-workboard-planning` | 1.000 | 1.000 | 103 | 4 | yes | none |
| `design-writing-intake` | 1.000 | 1.000 | 285 | 2 | yes | none |
| `discovery-literature-monitoring` | 1.000 | 1.000 | 208 | 1 | yes | none |
| `discovery-literature-search-screening` | 0.837 | 1.000 | 293 | 2 | yes | none |
| `discovery-source-quality-grading` | 1.000 | 1.000 | 184 | 1 | yes | none |
| `generation-abstract-writing` | 1.000 | 1.000 | 156 | 1 | yes | none |
| `generation-figure-generation` | 0.763 | 0.667 | 211 | 2 | yes | none |
| `generation-format-rendering` | 0.953 | 1.000 | 344 | 2 | yes | none |
| `generation-humanization-reference` | 0.980 | 0.667 | 196 | 1 | yes | none |
| `generation-manuscript-drafting` | 0.952 | 1.000 | 244 | 3 | yes | none |
| `generation-report-compilation` | 0.952 | 1.000 | 252 | 2 | yes | none |
| `generation-review-response-round` | 0.800 | 1.000 | 126 | 5 | yes | none |
| `judgment-devils-advocate-stress-test` | 0.902 | 0.833 | 222 | 2 | yes | none |
| `judgment-editorial-judgment` | 0.949 | 0.600 | 182 | 2 | yes | none |
| `judgment-review-synthesis` | 0.816 | 0.609 | 233 | 1 | yes | none |
| `judgment-specialist-review` | 0.956 | 1.000 | 213 | 4 | yes | none |
| `transform-paper-humanization-revision` | 1.000 | 1.000 | 86 | 2 | yes | none |
| `transform-review-response-comment-atomization` | 1.000 | 1.000 | 109 | 4 | yes | none |
| `transform-revision-patching` | 1.000 | 1.000 | 80 | 1 | yes | none |
| `transform-revision-roadmap-parsing` | 0.833 | 0.889 | 275 | 1 | yes | none |
| `transform-socratic-mentoring` | 0.841 | 0.792 | 278 | 2 | yes | none |

## Artifact Hashes

| artifact | path | sha256 |
|---|---|---|
| parity report | `artifacts/generated/capability-parity-report.json` | `8fae41dc975e35722c9d00488033742714d7b37546717d9b28c3569eea878a6f` |
| mode-capability review HTML | `audits/arsu/v3.21.1-127ff85/artifacts/arsu-mode-capability-review.html` | `fb14f4bd4cec586d1f91376e19beb3342d4ae0d7acd7d5f40696471e3b414f29` |
| graph-match assessment HTML | `audits/arsu/v3.21.1-127ff85/artifacts/arsu-mode-graph-match-assessment.html` | `5b518d7310ea03ec18679fa3c9abbdc8a9c98675253f422d1e15f264c03dca4b` |
| gap semantic review HTML | `audits/arsu/v3.21.1-127ff85/artifacts/arsu-mode-gap-semantic-review.html` | `151e1c8860f677f28a31e53a0d1eccfd5bdddccd65276ac197d14253724469c7` |

## Semantic Review

Mode coverage, flow authority and identity conclusions belong to
`05-semantic-review.md`; this generated table does not establish human confirmation.
