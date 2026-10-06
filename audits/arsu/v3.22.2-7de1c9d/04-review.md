# ARSU Anchor Review — v3.22.2-7de1c9d

## Parity Summary

| metric | value |
|---|---|
| avg section coverage | 0.9500714195299633 |
| avg rule coverage | 0.9579594249047135 |
| below section threshold | 0 |
| below rule threshold | 0 |
| output missing | 0 |
| flow retained | 0 |

## Per-Mode Assessment

| route | mode | upstream required (docs/lines) | upstream optional (docs/lines) | converted (nodes/lines) | anchor preservation | semantic gaps | flow anchors |
|---|---|---|---|---|---|---|---|
| `deep-research:full` | Full research | 28 / 7,553 | 1 / 332 | 6 / 3,998 | 100% (6/6) | none | none |
| `deep-research:quick` | Quick research brief | 13 / 3,109 | 1 / 332 | 4 / 1,906 | 100% (4/4) | none | none |
| `deep-research:review` | Research text review | 8 / 1,885 | 0 / 0 | 3 / 2,103 | 100% (3/3) | none | none |
| `deep-research:lit-review` | Evidence literature review | 14 / 3,263 | 1 / 332 | 3 / 1,399 | 100% (4/4) | none | none |
| `deep-research:three-way-scan` | WHY/HOW/WHAT scan | 6 / 1,615 | 0 / 0 | 2 / 962 | 100% (4/4) | none | none |
| `deep-research:fact-check` | Claim fact-check | 6 / 1,269 | 4 / 353 | 2 / 1,073 | 100% (4/4) | none | none |
| `deep-research:socratic` | Socratic research planning | 10 / 2,865 | 0 / 0 | 3 / 1,694 | 100% (4/4) | none | none |
| `deep-research:systematic-review` | Systematic review | 30 / 8,058 | 1 / 332 | 8 / 4,925 | 100% (6/6) | none | none |
| `academic-paper:full` | Full manuscript drafting | 37 / 10,862 | 3 / 608 | 7 / 6,975 | 100% (7/7) | none | none |
| `academic-paper:plan` | Guided paper planning | 15 / 3,733 | 3 / 608 | 4 / 3,635 | 100% (4/4) | none | none |
| `academic-paper:outline-only` | Outline only | 14 / 3,449 | 3 / 608 | 3 / 2,588 | 100% (4/4) | none | none |
| `academic-paper:revision` | Manuscript revision | 11 / 3,418 | 1 / 379 | 4 / 3,514 | 100% (4/4) | none | none |
| `academic-paper:revision-coach` | Revision coaching | 6 / 1,728 | 3 / 608 | 1 / 493 | 100% (4/4) | none | none |
| `academic-paper:abstract-only` | Abstract only | 8 / 1,958 | 1 / 379 | 1 / 816 | 100% (4/4) | none | none |
| `academic-paper:lit-review` | Manuscript literature review | 9 / 2,304 | 3 / 608 | 4 / 2,372 | 100% (4/4) | none | none |
| `academic-paper:format-convert` | Format conversion | 9 / 3,207 | 3 / 608 | 1 / 1,025 | 100% (4/4) | none | none |
| `academic-paper:citation-check` | Citation check | 6 / 1,939 | 1 / 379 | 2 / 2,141 | 100% (4/4) | none | none |
| `academic-paper:disclosure` | AI disclosure | 8 / 3,038 | 0 / 0 | 2 / 1,585 | 100% (3/3) | none | none |
| `academic-paper:rebuttal-audit` | Rebuttal audit | 4 / 1,387 | 3 / 608 | 1 / 493 | 100% (4/4) | none | none |
| `academic-paper-reviewer:full` | Full peer review | 22 / 6,475 | 1 / 16 | 5 / 3,955 | 83% (5/6) | converted_only:EIC Review Report | none |
| `academic-paper-reviewer:re-review` | Revision re-review | 9 / 2,681 | 0 / 0 | 3 / 2,117 | 100% (4/4) | none | none |
| `academic-paper-reviewer:quick` | Quick review | 5 / 1,250 | 0 / 0 | 1 / 774 | 67% (2/3) | converted_only:EIC Review Report | none |
| `academic-paper-reviewer:methodology-focus` | Methodology-focused review | 7 / 2,060 | 0 / 0 | 1 / 1,296 | 100% (4/4) | none | none |
| `academic-paper-reviewer:guided` | Guided review | 12 / 3,683 | 0 / 0 | 3 / 2,739 | 100% (4/4) | none | none |
| `academic-paper-reviewer:calibration` | Reviewer calibration | 13 / 4,371 | 0 / 0 | 2 / 2,346 | 25% (1/4) | gap:FNR, gap:FPR, gap:gold set | none |
| `academic-pipeline:end-to-end` | End-to-end pipeline | 26 / 9,858 | 1 / 136 | 24 / 35,921 | 80% (4/5) | none | Stage 1 RESEARCH |
| `academic-pipeline:resume_from_passport` | Resume from passport reset boundary | 9 / 5,703 | 1 / 136 | 26 / 36,788 | 40% (2/5) | gap:reset boundary, gap:awaiting_resume, gap:consumes_hash | none |

## Per-Package Parity

| capability_id | section coverage | rule coverage | skill lines | knowledge refs | output format | flow headings |
|---|---|---|---|---|---|---|
| `analysis-evidence-synthesis` | 0.974 | 0.933 | 249 | 3 | yes | none |
| `analysis-meta-analysis` | 0.848 | 1.000 | 223 | 1 | yes | none |
| `analysis-review-response-manuscript-analysis` | 0.933 | 1.000 | 118 | 6 | yes | none |
| `analysis-risk-of-bias-assessment` | 0.947 | 1.000 | 218 | 1 | yes | none |
| `check-citation-existence-verification` | 1.000 | 1.000 | 102 | 2 | yes | none |
| `check-citation-format-compliance` | 0.951 | 1.000 | 323 | 2 | yes | none |
| `check-citation-verification-summary` | 1.000 | 1.000 | 90 | 2 | yes | none |
| `check-claim-faithfulness-audit` | 0.944 | 1.000 | 229 | 1 | yes | none |
| `check-collaboration-depth-observer` | 1.000 | 1.000 | 161 | 1 | yes | none |
| `check-compliance-check` | 0.923 | 1.000 | 235 | 2 | yes | none |
| `check-contamination-signals` | 1.000 | 1.000 | 98 | 2 | yes | none |
| `check-paper-humanization-review` | 0.800 | 1.000 | 142 | 6 | yes | none |
| `check-paper-humanization-verification` | 1.000 | 1.000 | 124 | 4 | yes | none |
| `check-passport-verifier` | 1.000 | 1.000 | 101 | 2 | yes | none |
| `check-pdf-read-preflight` | 1.000 | 1.000 | 93 | 2 | yes | none |
| `check-pre-submission-self-check` | 0.909 | 0.833 | 264 | 3 | yes | none |
| `check-reference-integrity-verification` | 0.933 | 0.796 | 333 | 2 | yes | none |
| `check-submission-package-verifier` | 1.000 | 1.000 | 94 | 3 | yes | none |
| `check-temporal-integrity-verification` | 1.000 | 1.000 | 99 | 2 | yes | none |
| `check-terminal-policy-gate` | 1.000 | 1.000 | 99 | 1 | yes | none |
| `design-argument-blueprint` | 0.943 | 1.000 | 274 | 3 | yes | none |
| `design-manuscript-structure-design` | 0.957 | 1.000 | 314 | 3 | yes | none |
| `design-methodology-design` | 0.923 | 0.714 | 225 | 4 | yes | none |
| `design-research-question-formulation` | 0.923 | 1.000 | 178 | 2 | yes | none |
| `design-review-panel-config` | 1.000 | 1.000 | 198 | 2 | yes | none |
| `design-review-response-intake` | 1.000 | 1.000 | 121 | 6 | yes | none |
| `design-review-response-workboard-planning` | 1.000 | 1.000 | 122 | 12 | yes | none |
| `design-writing-intake` | 1.000 | 1.000 | 312 | 3 | yes | none |
| `discovery-literature-monitoring` | 1.000 | 1.000 | 223 | 1 | yes | none |
| `discovery-literature-search-screening` | 0.837 | 1.000 | 308 | 2 | yes | none |
| `discovery-source-quality-grading` | 1.000 | 1.000 | 199 | 1 | yes | none |
| `generation-abstract-writing` | 1.000 | 1.000 | 206 | 3 | yes | none |
| `generation-figure-generation` | 0.816 | 0.667 | 226 | 2 | yes | none |
| `generation-format-rendering` | 0.954 | 1.000 | 359 | 2 | yes | none |
| `generation-humanization-reference` | 0.981 | 1.000 | 220 | 1 | yes | none |
| `generation-manuscript-drafting` | 0.955 | 1.000 | 276 | 5 | yes | none |
| `generation-report-compilation` | 0.955 | 1.000 | 265 | 2 | yes | none |
| `generation-review-response-round` | 0.950 | 1.000 | 147 | 13 | yes | none |
| `judgment-devils-advocate-stress-test` | 0.878 | 0.889 | 237 | 2 | yes | none |
| `judgment-editorial-judgment` | 0.949 | 0.667 | 197 | 2 | yes | none |
| `judgment-review-synthesis` | 0.820 | 0.708 | 253 | 1 | yes | none |
| `judgment-specialist-review` | 0.956 | 1.000 | 228 | 4 | yes | none |
| `transform-paper-humanization-revision` | 1.000 | 1.000 | 96 | 4 | yes | none |
| `transform-review-response-comment-atomization` | 1.000 | 1.000 | 124 | 10 | yes | none |
| `transform-revision-patching` | 1.000 | 1.000 | 97 | 1 | yes | none |
| `transform-revision-roadmap-parsing` | 0.839 | 0.900 | 294 | 1 | yes | none |
| `transform-socratic-mentoring` | 0.855 | 0.917 | 295 | 2 | yes | none |

## Artifact Hashes

| artifact | path | sha256 |
|---|---|---|
| parity report | `artifacts/generated/capability-parity-report.json` | `bfa1711f330fa2fb4aaebe3394e1996dd659b03827c2e8bfe3e561b7a17ab024` |
| mode-capability review HTML | `audits/arsu/v3.22.2-7de1c9d/artifacts/arsu-mode-capability-review.html` | `709d31079c93014a6a40775087b56d685d042dde7dcb7deccb628ead56546b71` |
| graph-match assessment HTML | `audits/arsu/v3.22.2-7de1c9d/artifacts/arsu-mode-graph-match-assessment.html` | `c1ab7d03b74ebe95a684b34578f511a8d9d4df8827ce773f200ac2f97bbdc3b2` |
| gap semantic review HTML | `audits/arsu/v3.22.2-7de1c9d/artifacts/arsu-mode-gap-semantic-review.html` | `d5096e6a1a1d1e229fee2720a721ce9b4de88c1b9fea80a2e5bea3ae847458de` |

## Semantic Review

Mode coverage, flow authority and identity conclusions belong to
`05-semantic-review.md`; this generated table does not establish human confirmation.
