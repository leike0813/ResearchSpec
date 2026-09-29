# ARSU Anchor Conversion — v3.21.1-127ff85

- registry SHA-256: `f3258a12943eef28b30faccdcb5092ea2556ef79a56210b9c95651462d6d42f4`
- packages tree SHA-256: `85b3073e831cb7198fd7f84d47511ec8a35baa430bb8c79d21464fbc1258a7a0`
- capability count: 47 · operational: 47

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `analysis-evidence-synthesis` | Evidence Synthesis | analysis | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `419520198bcb` |
| `analysis-meta-analysis` | Meta Analysis | analysis | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `4f85ae0de975` |
| `analysis-review-response-manuscript-analysis` | Review Response Manuscript Analysis | analysis | producer | mixed | none | operational | 1/1 | 4 | 1 | 36 | `b08bd884a9b6` |
| `analysis-risk-of-bias-assessment` | Risk of Bias Assessment | analysis | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `16e206a3550f` |
| `check-citation-existence-verification` | Citation Existence Verification | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `c0f42946364d` |
| `check-citation-format-compliance` | Citation Format Compliance | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `ca61584a0d09` |
| `check-citation-verification-summary` | Citation Verification Summary | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `9bae35c06bcf` |
| `check-claim-faithfulness-audit` | Claim Faithfulness Audit | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `1aaeaed8789c` |
| `check-collaboration-depth-observer` | Collaboration Depth Observer | verification | observer | llm | required | operational | 1/1 | 1 | 1 | 3 | `4e3a8f82f4b3` |
| `check-compliance-check` | Compliance Check | verification | observer | llm | required | operational | 1/2 | 2 | 1 | 4 | `6eed99da78d0` |
| `check-contamination-signals` | Contamination Signals | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `f51695040ee3` |
| `check-paper-humanization-review` | Paper Humanization Review | verification | checker | mixed | none | operational | 2/2 | 5 | 1 | 8 | `dd218c25ae65` |
| `check-paper-humanization-verification` | Paper Humanization Verification | verification | checker | mixed | none | operational | 2/1 | 3 | 1 | 6 | `608608b5185b` |
| `check-passport-verifier` | Passport Verifier | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `14321768d02c` |
| `check-pdf-read-preflight` | PDF Read Preflight | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `e6b46dab4a4a` |
| `check-pre-submission-self-check` | Pre-submission Self Check | verification | checker | llm | required | operational | 3/2 | 3 | 1 | 5 | `fa74fc2b9f87` |
| `check-reference-integrity-verification` | Reference Integrity Verification | verification | checker | llm | required | operational | 1/1 | 2 | 1 | 4 | `e0b5889cda7b` |
| `check-submission-package-verifier` | Submission Package Verifier | verification | checker | script | required | operational | 1/1 | 3 | 2 | 6 | `1207b10e7255` |
| `check-temporal-integrity-verification` | Temporal Integrity Verification | verification | checker | script | required | operational | 3/1 | 2 | 2 | 5 | `cabc9d37c90b` |
| `check-terminal-policy-gate` | Terminal Policy Gate | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `85178814a6d4` |
| `design-argument-blueprint` | Argument Blueprint | design | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `707cbd977421` |
| `design-manuscript-structure-design` | Manuscript Structure Design | design | producer | llm | required | operational | 2/1 | 1 | 1 | 3 | `2f5a403ccaa8` |
| `design-methodology-design` | Methodology Design | design | producer | llm | required | operational | 1/1 | 4 | 1 | 6 | `e38674ed7ae4` |
| `design-research-question-formulation` | Research Question Formulation | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `e0e89711f780` |
| `design-review-panel-config` | Review Panel Configuration | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `a1d8d194d769` |
| `design-review-response-intake` | Review Response Intake | design | producer | mixed | none | operational | 4/2 | 4 | 1 | 42 | `c1ed654755dc` |
| `design-review-response-workboard-planning` | Review Response Workboard Planning | design | producer | mixed | required | operational | 1/1 | 6 | 1 | 38 | `b8f6a997b26f` |
| `design-writing-intake` | Writing Intake | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `3d6ebdc8970f` |
| `discovery-literature-monitoring` | Literature Monitoring | discovery | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `5085f65eba27` |
| `discovery-literature-search-screening` | Literature Search And Screening | discovery | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `aa5b2dcbe921` |
| `discovery-source-quality-grading` | Source Quality Grading | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `9c3e45ae69c2` |
| `generation-abstract-writing` | Abstract Writing | generation | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `469dcdd4abb8` |
| `generation-figure-generation` | Figure Generation | generation | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `ac437d6da397` |
| `generation-format-rendering` | Format Rendering | generation | producer | mixed | required | operational | 1/1 | 2 | 1 | 4 | `4de907cf2302` |
| `generation-humanization-reference` | Paper Humanizer Reference Mode | generation | observer | llm | none | operational | 0/0 | 1 | 1 | 3 | `d1e6fba4efb4` |
| `generation-manuscript-drafting` | Manuscript Drafting | generation | producer | llm | required | operational | 2/1 | 3 | 1 | 5 | `f0a15abcbe53` |
| `generation-report-compilation` | Research Report Compilation | generation | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `77cc41f581c8` |
| `generation-review-response-round` | Review Response Round | generation | producer | mixed | required | operational | 1/4 | 7 | 1 | 42 | `6c0a1060e718` |
| `judgment-devils-advocate-stress-test` | Devil's Advocate Stress Test | judgment | checker | llm | required | operational | 2/1 | 2 | 1 | 4 | `a58e06c72f05` |
| `judgment-editorial-judgment` | Editorial Judgment | judgment | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `a04d8f827785` |
| `judgment-review-synthesis` | Review Synthesis | judgment | producer | llm | required | operational | 3/1 | 1 | 1 | 3 | `9ef1fa9a4a94` |
| `judgment-specialist-review` | Specialist Review | judgment | producer | llm | required | operational | 2/1 | 4 | 1 | 6 | `998139034297` |
| `transform-paper-humanization-revision` | Paper Humanization Revision | transformation | producer | mixed | required | operational | 2/2 | 4 | 1 | 7 | `761f2d2587ea` |
| `transform-review-response-comment-atomization` | Review Response Comment Atomization | transformation | producer | mixed | required | operational | 1/2 | 4 | 1 | 36 | `ba612aad074f` |
| `transform-revision-patching` | Revision Patching | transformation | checker | mixed | required | operational | 1/2 | 1 | 1 | 3 | `f983a82eca52` |
| `transform-revision-roadmap-parsing` | Revision Roadmap Parsing | transformation | producer | llm | required | operational | 2/2 | 1 | 1 | 3 | `639fd2fc139c` |
| `transform-socratic-mentoring` | Socratic Mentoring | transformation | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `670993299989` |

## Graph Profiles

### academic-paper

`academic-paper.yaml`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| intake | capability | design-writing-intake | — | — |
| structure | capability | design-manuscript-structure-design | intake | — |
| argument | capability | design-argument-blueprint | structure | — |
| draft | capability | generation-manuscript-drafting | argument | — |
| cite-check | capability | check-citation-format-compliance | draft | — |
| paper-gate | gate | — | cite-check | — |
| abstract | capability | generation-abstract-writing | paper-gate | paper-gate |
| format | capability | generation-format-rendering | — | — |

### academic-paper-reviewer

`academic-paper-reviewer.yaml`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| panel | capability | design-review-panel-config | — | — |
| specialist | capability | judgment-specialist-review | panel | — |
| da | capability | judgment-devils-advocate-stress-test | panel | — |
| editorial | capability | judgment-editorial-judgment | specialist | — |
| synthesis | capability | judgment-review-synthesis | editorial, da | — |

### academic-pipeline

`academic-pipeline.yaml`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| research | subgraph | research-main | — | — |
| research-gate | gate | — | research | — |
| write | subgraph | academic-paper | research-gate | research-gate |
| write-gate | gate | — | write | — |
| review | subgraph | academic-paper-reviewer | write-gate | write-gate |
| review-gate | gate | — | review | — |
| revision | subgraph | review-response | review-gate | review-gate |
| re-review | subgraph | academic-paper-re-reviewer | revision | — |
| round-outcome | decision | — | re-review | — |
| format | subgraph | academic-paper-format | round-outcome | — |
| final-integrity | capability | check-reference-integrity-verification | format | — |
| final-integrity-gate | gate | — | final-integrity | — |

### minimal

`minimal.yaml`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| rq | capability | design-research-question-formulation | — | — |
| methodology | capability | design-methodology-design | rq | — |
| literature | capability | discovery-literature-search-screening | methodology | — |
| grading | capability | discovery-source-quality-grading | literature | — |
| synthesis | capability | analysis-evidence-synthesis | grading | — |
| report | capability | generation-report-compilation | synthesis | — |

### paper-humanizer

`paper-humanizer.yaml`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| review | capability | check-paper-humanization-review | — | — |
| plan-gate | gate | — | review | — |
| plan-decision | decision | — | plan-gate | paper-humanizer-plan |
| revision | capability | transform-paper-humanization-revision | plan-decision | paper-humanizer-plan |
| verification | capability | check-paper-humanization-verification | revision | — |
| acceptance | decision | — | verification | — |
| exit-gate | gate | — | plan-decision | — |

### research-main

`research-main.yaml`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| research-question | capability | design-research-question-formulation | — | — |
| rq-gate | gate | — | research-question | — |
| methodology | capability | design-methodology-design | rq-gate | rq-gate |
| literature | capability | discovery-literature-search-screening | methodology | rq-gate |
| grading | capability | discovery-source-quality-grading | literature | — |
| synthesis | capability | analysis-evidence-synthesis | grading | — |
| report | capability | generation-report-compilation | synthesis | — |

### review-response

`review-response.yaml`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| intake | capability | design-review-response-intake | — | — |
| manuscript-analysis | capability | analysis-review-response-manuscript-analysis | intake | — |
| comment-atomization | capability | transform-review-response-comment-atomization | manuscript-analysis | — |
| comment-coverage-gate | gate | — | comment-atomization | — |
| workboard | capability | design-review-response-workboard-planning | comment-coverage-gate | review-response-comment-coverage |
| strategy-gate | gate | — | workboard | — |
| round | capability | generation-review-response-round | strategy-gate | review-response-strategy |
| evidence-gate | gate | — | round | — |
| response-coverage-gate | gate | — | round | — |
| final-assembly-gate | gate | — | round | — |
| outcome | decision | — | evidence-gate, response-coverage-gate, final-assembly-gate | review-response-evidence, review-response-response-coverage, review-response-final-assembly |

## Verification

Actual command outcomes and repeated-generation evidence are recorded by the
maintainer in `05-semantic-review.md`. This inventory does not execute those checks.
