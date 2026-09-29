# ARSU Anchor Review — v3.21.1-127ff85

## Parity Summary

| metric | value |
|---|---|
| avg section coverage | 0.9456871931208453 |
| avg rule coverage | 0.9445787997591882 |
| below section threshold | 0 |
| below rule threshold | 0 |
| output missing | 0 |
| flow retained | 0 |

## Per-Mode Assessment

| route | mode | upstream required (docs/lines) | upstream optional (docs/lines) | converted (nodes/lines) | anchor preservation | semantic gaps | flow anchors |
|---|---|---|---|---|---|---|---|
| `deep-research:full` | Full research | 28 / 7,433 | 1 / 332 | 6 / 3,897 | 100% (6/6) | none | none |
| `deep-research:quick` | Quick research brief | 13 / 3,056 | 1 / 332 | 4 / 1,832 | 100% (4/4) | none | none |
| `deep-research:review` | Research text review | 8 / 1,798 | 0 / 0 | 3 / 2,054 | 100% (3/3) | none | none |
| `deep-research:lit-review` | Evidence literature review | 14 / 3,208 | 1 / 332 | 3 / 1,359 | 100% (4/4) | none | none |
| `deep-research:three-way-scan` | WHY/HOW/WHAT scan | 6 / 1,576 | 0 / 0 | 2 / 936 | 100% (4/4) | none | none |
| `deep-research:fact-check` | Claim fact-check | 6 / 1,230 | 4 / 353 | 2 / 1,047 | 100% (4/4) | none | none |
| `deep-research:socratic` | Socratic research planning | 10 / 2,804 | 0 / 0 | 3 / 1,644 | 100% (4/4) | none | none |
| `deep-research:systematic-review` | Systematic review | 30 / 7,925 | 1 / 332 | 8 / 4,798 | 100% (6/6) | none | none |
| `academic-paper:full` | Full manuscript drafting | 37 / 10,570 | 3 / 606 | 7 / 5,013 | 100% (7/7) | none | none |
| `academic-paper:plan` | Guided paper planning | 15 / 3,673 | 3 / 606 | 4 / 3,016 | 100% (4/4) | none | none |
| `academic-paper:outline-only` | Outline only | 14 / 3,368 | 3 / 606 | 3 / 1,990 | 100% (4/4) | none | none |
| `academic-paper:revision` | Manuscript revision | 11 / 3,277 | 1 / 379 | 4 / 2,595 | 100% (4/4) | none | none |
| `academic-paper:revision-coach` | Revision coaching | 6 / 1,638 | 3 / 606 | 1 / 470 | 100% (4/4) | none | none |
| `academic-paper:abstract-only` | Abstract only | 8 / 1,804 | 1 / 379 | 1 / 346 | 100% (4/4) | none | none |
| `academic-paper:lit-review` | Manuscript literature review | 9 / 2,225 | 3 / 606 | 4 / 2,160 | 100% (4/4) | none | none |
| `academic-paper:format-convert` | Format conversion | 9 / 3,137 | 3 / 606 | 1 / 1,011 | 100% (4/4) | none | none |
| `academic-paper:citation-check` | Citation check | 6 / 1,836 | 1 / 379 | 2 / 1,648 | 100% (4/4) | none | none |
| `academic-paper:disclosure` | AI disclosure | 8 / 2,968 | 0 / 0 | 2 / 1,558 | 100% (3/3) | none | none |
| `academic-paper:rebuttal-audit` | Rebuttal audit | 4 / 1,305 | 3 / 606 | 1 / 470 | 100% (4/4) | none | none |
| `academic-paper-reviewer:full` | Full peer review | 22 / 6,388 | 1 / 16 | 5 / 3,865 | 83% (5/6) | converted_only:EIC Review Report | none |
| `academic-paper-reviewer:re-review` | Revision re-review | 9 / 2,620 | 0 / 0 | 3 / 2,051 | 100% (4/4) | none | none |
| `academic-paper-reviewer:quick` | Quick review | 5 / 1,205 | 0 / 0 | 1 / 756 | 67% (2/3) | converted_only:EIC Review Report | none |
| `academic-paper-reviewer:methodology-focus` | Methodology-focused review | 7 / 2,015 | 0 / 0 | 1 / 1,278 | 100% (4/4) | none | none |
| `academic-paper-reviewer:guided` | Guided review | 12 / 3,622 | 0 / 0 | 3 / 2,684 | 100% (4/4) | none | none |
| `academic-paper-reviewer:calibration` | Reviewer calibration | 13 / 4,290 | 0 / 0 | 2 / 2,308 | 25% (1/4) | gap:FNR, gap:FPR, gap:gold set | none |
| `academic-pipeline:end-to-end` | End-to-end pipeline | 26 / 9,568 | 1 / 136 | 24 / 23,116 | 80% (4/5) | none | Stage 1 RESEARCH |
| `academic-pipeline:resume_from_passport` | Resume from passport reset boundary | 9 / 5,584 | 1 / 136 | 26 / 23,906 | 40% (2/5) | gap:reset boundary, gap:awaiting_resume, gap:consumes_hash | none |

## Per-Package Parity

| capability_id | section coverage | rule coverage | skill lines | knowledge refs | output format | flow headings |
|---|---|---|---|---|---|---|
| `analysis-evidence-synthesis` | 0.973 | 1.000 | 236 | 3 | yes | none |
| `analysis-meta-analysis` | 0.848 | 1.000 | 210 | 1 | yes | none |
| `analysis-review-response-manuscript-analysis` | 0.933 | 1.000 | 114 | 4 | yes | none |
| `analysis-risk-of-bias-assessment` | 0.946 | 1.000 | 205 | 1 | yes | none |
| `check-citation-existence-verification` | 1.000 | 1.000 | 89 | 2 | yes | none |
| `check-citation-format-compliance` | 0.950 | 1.000 | 296 | 1 | yes | none |
| `check-citation-verification-summary` | 1.000 | 1.000 | 77 | 2 | yes | none |
| `check-claim-faithfulness-audit` | 0.941 | 1.000 | 214 | 1 | yes | none |
| `check-collaboration-depth-observer` | 1.000 | 1.000 | 148 | 1 | yes | none |
| `check-compliance-check` | 0.917 | 1.000 | 222 | 2 | yes | none |
| `check-contamination-signals` | 1.000 | 1.000 | 85 | 2 | yes | none |
| `check-paper-humanization-review` | 0.800 | 1.000 | 131 | 5 | yes | none |
| `check-paper-humanization-verification` | 1.000 | 1.000 | 120 | 3 | yes | none |
| `check-passport-verifier` | 1.000 | 1.000 | 88 | 2 | yes | none |
| `check-pdf-read-preflight` | 1.000 | 1.000 | 80 | 2 | yes | none |
| `check-pre-submission-self-check` | 0.909 | 0.833 | 250 | 3 | yes | none |
| `check-reference-integrity-verification` | 0.932 | 0.792 | 320 | 2 | yes | none |
| `check-submission-package-verifier` | 1.000 | 1.000 | 81 | 3 | yes | none |
| `check-temporal-integrity-verification` | 1.000 | 1.000 | 86 | 2 | yes | none |
| `check-terminal-policy-gate` | 1.000 | 1.000 | 86 | 1 | yes | none |
| `design-argument-blueprint` | 0.943 | 1.000 | 261 | 3 | yes | none |
| `design-manuscript-structure-design` | 0.957 | 1.000 | 297 | 1 | yes | none |
| `design-methodology-design` | 0.923 | 0.714 | 212 | 4 | yes | none |
| `design-research-question-formulation` | 0.923 | 1.000 | 165 | 2 | yes | none |
| `design-review-panel-config` | 1.000 | 1.000 | 185 | 2 | yes | none |
| `design-review-response-intake` | 1.000 | 1.000 | 117 | 4 | yes | none |
| `design-review-response-workboard-planning` | 1.000 | 1.000 | 112 | 6 | yes | none |
| `design-writing-intake` | 1.000 | 1.000 | 287 | 2 | yes | none |
| `discovery-literature-monitoring` | 1.000 | 1.000 | 210 | 1 | yes | none |
| `discovery-literature-search-screening` | 0.837 | 1.000 | 295 | 2 | yes | none |
| `discovery-source-quality-grading` | 1.000 | 1.000 | 186 | 1 | yes | none |
| `generation-abstract-writing` | 1.000 | 1.000 | 158 | 1 | yes | none |
| `generation-figure-generation` | 0.789 | 0.667 | 213 | 2 | yes | none |
| `generation-format-rendering` | 0.953 | 1.000 | 346 | 2 | yes | none |
| `generation-humanization-reference` | 0.980 | 0.667 | 199 | 1 | yes | none |
| `generation-manuscript-drafting` | 0.952 | 1.000 | 246 | 3 | yes | none |
| `generation-report-compilation` | 0.952 | 1.000 | 254 | 2 | yes | none |
| `generation-review-response-round` | 0.800 | 1.000 | 135 | 7 | yes | none |
| `judgment-devils-advocate-stress-test` | 0.878 | 0.833 | 224 | 2 | yes | none |
| `judgment-editorial-judgment` | 0.949 | 0.600 | 184 | 2 | yes | none |
| `judgment-review-synthesis` | 0.816 | 0.609 | 235 | 1 | yes | none |
| `judgment-specialist-review` | 0.956 | 1.000 | 215 | 4 | yes | none |
| `transform-paper-humanization-revision` | 1.000 | 1.000 | 95 | 4 | yes | none |
| `transform-review-response-comment-atomization` | 1.000 | 1.000 | 112 | 4 | yes | none |
| `transform-revision-patching` | 1.000 | 1.000 | 82 | 1 | yes | none |
| `transform-revision-roadmap-parsing` | 0.833 | 0.889 | 277 | 1 | yes | none |
| `transform-socratic-mentoring` | 0.855 | 0.792 | 280 | 2 | yes | none |

## Artifact Hashes

| artifact | path | sha256 |
|---|---|---|
| parity report | `artifacts/generated/capability-parity-report.json` | `e08d861c593495f2f48d2839239ae032952fda264a01aa4009b8a3338784d537` |
| mode-capability review HTML | `audits/arsu/v3.21.1-127ff85/artifacts/arsu-mode-capability-review.html` | `7399b5a9b8577b15466e8501febba6ceb83fcf16b1eefe7c7ed48be1ec3c45a6` |
| graph-match assessment HTML | `audits/arsu/v3.21.1-127ff85/artifacts/arsu-mode-graph-match-assessment.html` | `bb267f5941a76199df96e066b5c85d1fee2d22f1f8044b24289832cf6b944c9f` |
| gap semantic review HTML | `audits/arsu/v3.21.1-127ff85/artifacts/arsu-mode-gap-semantic-review.html` | `05dbdf5ae0926de47ca8d67874505e660a3b5fe97edd21ee75cc7074d5eb6ef2` |

## Semantic Review

Mode coverage, flow authority and identity conclusions belong to
`05-semantic-review.md`; this generated table does not establish human confirmation.
