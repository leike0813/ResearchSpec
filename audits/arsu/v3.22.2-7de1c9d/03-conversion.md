# ARSU Anchor Conversion — v3.22.2-7de1c9d

- registry SHA-256: `72a22ca042debd8403f97faffc0196584a7401e96d91169483ab633f0c7b6556`
- packages tree SHA-256: `ce38dfb5761d893f66ee97f8ac16bc1df126ce35a8abff951eef1f99a411a8fa`
- capability count: 47 · operational: 47

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `analysis-evidence-synthesis` | Evidence Synthesis | analysis | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `485bcc6c3cbb` |
| `analysis-meta-analysis` | Meta Analysis | analysis | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `4f85ae0de975` |
| `analysis-review-response-manuscript-analysis` | Review Response Manuscript Analysis | analysis | producer | mixed | none | operational | 1/1 | 6 | 1 | 38 | `eccbfd2ec9cc` |
| `analysis-risk-of-bias-assessment` | Risk of Bias Assessment | analysis | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `4a9eb17c4555` |
| `check-citation-existence-verification` | Citation Existence Verification | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `8e4f14ce39f8` |
| `check-citation-format-compliance` | Citation Format Compliance | verification | checker | llm | required | operational | 1/1 | 2 | 1 | 4 | `7a8b18181008` |
| `check-citation-verification-summary` | Citation Verification Summary | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `4755a27a9b9c` |
| `check-claim-faithfulness-audit` | Claim Faithfulness Audit | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `fe4a279da524` |
| `check-collaboration-depth-observer` | Collaboration Depth Observer | verification | observer | llm | required | operational | 1/1 | 1 | 1 | 3 | `d651c922357a` |
| `check-compliance-check` | Compliance Check | verification | observer | llm | required | operational | 1/2 | 2 | 1 | 4 | `ef13c2598520` |
| `check-contamination-signals` | Contamination Signals | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `6e256b4d8f67` |
| `check-paper-humanization-review` | Paper Humanization Review | verification | checker | mixed | none | operational | 2/2 | 5 | 1 | 8 | `9f736c43df89` |
| `check-paper-humanization-verification` | Paper Humanization Verification | verification | checker | mixed | none | operational | 2/1 | 3 | 1 | 6 | `608608b5185b` |
| `check-passport-verifier` | Passport Verifier | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `7f8079712fd7` |
| `check-pdf-read-preflight` | PDF Read Preflight | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `1f60ccfba06f` |
| `check-pre-submission-self-check` | Pre-submission Self Check | verification | checker | llm | required | operational | 3/2 | 3 | 1 | 5 | `e1356fe7e01e` |
| `check-reference-integrity-verification` | Reference Integrity Verification | verification | checker | llm | required | operational | 1/1 | 2 | 1 | 4 | `a2c01a2193d2` |
| `check-submission-package-verifier` | Submission Package Verifier | verification | checker | script | required | operational | 1/1 | 3 | 2 | 6 | `3ee4dd46845d` |
| `check-temporal-integrity-verification` | Temporal Integrity Verification | verification | checker | script | required | operational | 3/1 | 2 | 2 | 5 | `566664b38f07` |
| `check-terminal-policy-gate` | Terminal Policy Gate | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `85178814a6d4` |
| `design-argument-blueprint` | Argument Blueprint | design | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `06f17de0062d` |
| `design-manuscript-structure-design` | Manuscript Structure Design | design | producer | llm | required | operational | 2/1 | 3 | 1 | 5 | `8eeafa09704c` |
| `design-methodology-design` | Methodology Design | design | producer | llm | required | operational | 1/1 | 4 | 1 | 6 | `e38674ed7ae4` |
| `design-research-question-formulation` | Research Question Formulation | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `e0e89711f780` |
| `design-review-panel-config` | Review Panel Configuration | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `2b53b11f7c9e` |
| `design-review-response-intake` | Review Response Intake | design | producer | mixed | none | operational | 4/2 | 6 | 1 | 44 | `678e26990197` |
| `design-review-response-workboard-planning` | Review Response Workboard Planning | design | producer | mixed | required | operational | 1/1 | 12 | 1 | 44 | `c5e4b351f139` |
| `design-writing-intake` | Writing Intake | design | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `5d00e9a6c3f3` |
| `discovery-literature-monitoring` | Literature Monitoring | discovery | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `5085f65eba27` |
| `discovery-literature-search-screening` | Literature Search And Screening | discovery | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `aa5b2dcbe921` |
| `discovery-source-quality-grading` | Source Quality Grading | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `9c3e45ae69c2` |
| `generation-abstract-writing` | Abstract Writing | generation | producer | llm | required | operational | 2/1 | 3 | 1 | 5 | `c79b4e4d4c64` |
| `generation-figure-generation` | Figure Generation | generation | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `ac437d6da397` |
| `generation-format-rendering` | Format Rendering | generation | producer | mixed | required | operational | 1/1 | 2 | 1 | 4 | `139f4f22d5fc` |
| `generation-humanization-reference` | Paper Humanizer Reference Mode | generation | observer | llm | none | operational | 0/0 | 1 | 1 | 3 | `d1e6fba4efb4` |
| `generation-manuscript-drafting` | Manuscript Drafting | generation | producer | llm | required | operational | 3/1 | 5 | 1 | 7 | `d8cbee004bf7` |
| `generation-report-compilation` | Research Report Compilation | generation | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `8636f6ae3918` |
| `generation-review-response-round` | Review Response Round | generation | producer | mixed | required | operational | 1/4 | 13 | 1 | 51 | `25e11535f807` |
| `judgment-devils-advocate-stress-test` | Devil's Advocate Stress Test | judgment | checker | llm | required | operational | 2/1 | 2 | 1 | 4 | `43a784cef896` |
| `judgment-editorial-judgment` | Editorial Judgment | judgment | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `5d75c7bdd3c3` |
| `judgment-review-synthesis` | Review Synthesis | judgment | producer | llm | required | operational | 3/1 | 1 | 1 | 3 | `fdf1370dccb4` |
| `judgment-specialist-review` | Specialist Review | judgment | producer | llm | required | operational | 2/1 | 4 | 1 | 6 | `e4719c55d6ea` |
| `transform-paper-humanization-revision` | Paper Humanization Revision | transformation | producer | mixed | required | operational | 2/2 | 4 | 1 | 7 | `5aebe6e201f3` |
| `transform-review-response-comment-atomization` | Review Response Comment Atomization | transformation | producer | mixed | required | operational | 1/2 | 10 | 1 | 42 | `3d06238d4b4a` |
| `transform-revision-patching` | Revision Patching | transformation | checker | mixed | required | operational | 1/2 | 1 | 1 | 3 | `56143408255e` |
| `transform-revision-roadmap-parsing` | Revision Roadmap Parsing | transformation | producer | llm | required | operational | 2/2 | 1 | 1 | 3 | `9b74c5bc3a5e` |
| `transform-socratic-mentoring` | Socratic Mentoring | transformation | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `04a754562781` |

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
