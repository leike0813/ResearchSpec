# ARSU Anchor Conversion — v3.19.0-828ef3b

- registry SHA-256: `e4722ac6792c3f8116ee8b5883587c7485565df28a646ef390d046f51863ab59`
- packages tree SHA-256: `ed9780a049e0f451ac4d4d9becfe82d003ae87297a8d9bf1a9636c58dd076c8c`
- capability count: 47 · operational: 47

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `analysis-evidence-synthesis` | Evidence Synthesis | analysis | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `392c9d0fabeb` |
| `analysis-meta-analysis` | Meta Analysis | analysis | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `4f85ae0de975` |
| `analysis-review-response-manuscript-analysis` | Review Response Manuscript Analysis | analysis | producer | mixed | none | operational | 1/1 | 4 | 1 | 36 | `b08bd884a9b6` |
| `analysis-risk-of-bias-assessment` | Risk of Bias Assessment | analysis | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `16e206a3550f` |
| `check-citation-existence-verification` | Citation Existence Verification | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `d55fa6020cab` |
| `check-citation-format-compliance` | Citation Format Compliance | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `ca61584a0d09` |
| `check-citation-verification-summary` | Citation Verification Summary | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `bf81605aadd3` |
| `check-claim-faithfulness-audit` | Claim Faithfulness Audit | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `1aaeaed8789c` |
| `check-collaboration-depth-observer` | Collaboration Depth Observer | verification | observer | llm | required | operational | 1/1 | 1 | 1 | 3 | `4e3a8f82f4b3` |
| `check-compliance-check` | Compliance Check | verification | observer | llm | required | operational | 1/2 | 2 | 1 | 4 | `176799f47000` |
| `check-contamination-signals` | Contamination Signals | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `49d23572647b` |
| `check-paper-humanization-review` | Paper Humanization Review | verification | checker | mixed | none | operational | 2/2 | 3 | 1 | 6 | `c0779f5cf35a` |
| `check-paper-humanization-verification` | Paper Humanization Verification | verification | checker | mixed | none | operational | 2/1 | 3 | 1 | 6 | `608608b5185b` |
| `check-passport-verifier` | Passport Verifier | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `f5279f58832e` |
| `check-pdf-read-preflight` | PDF Read Preflight | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `3745e1cdc250` |
| `check-pre-submission-self-check` | Pre-submission Self Check | verification | checker | llm | required | operational | 3/2 | 1 | 1 | 3 | `5740ec31471e` |
| `check-reference-integrity-verification` | Reference Integrity Verification | verification | checker | llm | required | operational | 1/1 | 2 | 1 | 4 | `39d73e77e3cc` |
| `check-submission-package-verifier` | Submission Package Verifier | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `af6514b39aa2` |
| `check-temporal-integrity-verification` | Temporal Integrity Verification | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `02dda9c3c007` |
| `check-terminal-policy-gate` | Terminal Policy Gate | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `0bf5b47bf254` |
| `design-argument-blueprint` | Argument Blueprint | design | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `854a8df551c3` |
| `design-manuscript-structure-design` | Manuscript Structure Design | design | producer | llm | required | operational | 2/1 | 1 | 1 | 3 | `98a9783bbf2b` |
| `design-methodology-design` | Methodology Design | design | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `88375ac11462` |
| `design-research-question-formulation` | Research Question Formulation | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `f55708315799` |
| `design-review-panel-config` | Review Panel Configuration | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `a3c7dcd54f3d` |
| `design-review-response-intake` | Review Response Intake | design | producer | mixed | none | operational | 4/2 | 4 | 1 | 38 | `c1ed654755dc` |
| `design-review-response-workboard-planning` | Review Response Workboard Planning | design | producer | mixed | required | operational | 1/1 | 4 | 1 | 36 | `18c82a15ea84` |
| `design-writing-intake` | Writing Intake | design | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `50011baa6562` |
| `discovery-literature-monitoring` | Literature Monitoring | discovery | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `5085f65eba27` |
| `discovery-literature-search-screening` | Literature Search And Screening | discovery | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `308c1c966a59` |
| `discovery-source-quality-grading` | Source Quality Grading | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `9c3e45ae69c2` |
| `generation-abstract-writing` | Abstract Writing | generation | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `469dcdd4abb8` |
| `generation-figure-generation` | Figure Generation | generation | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `ac437d6da397` |
| `generation-format-rendering` | Format Rendering | generation | producer | mixed | required | operational | 1/1 | 2 | 1 | 4 | `6e17fdbdb735` |
| `generation-humanization-reference` | Paper Humanizer Reference Mode | generation | observer | llm | none | operational | 0/0 | 1 | 1 | 3 | `d1e6fba4efb4` |
| `generation-manuscript-drafting` | Manuscript Drafting | generation | producer | llm | required | operational | 2/1 | 3 | 1 | 5 | `c6147a0e46ed` |
| `generation-report-compilation` | Research Report Compilation | generation | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `77cc41f581c8` |
| `generation-review-response-round` | Review Response Round | generation | producer | mixed | required | operational | 1/4 | 5 | 1 | 40 | `23f40e806588` |
| `judgment-devils-advocate-stress-test` | Devil's Advocate Stress Test | judgment | checker | llm | required | operational | 2/1 | 1 | 1 | 3 | `8e1a3626578c` |
| `judgment-editorial-judgment` | Editorial Judgment | judgment | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `715dce70dfaf` |
| `judgment-review-synthesis` | Review Synthesis | judgment | producer | llm | required | operational | 3/1 | 1 | 1 | 3 | `03d12f06d114` |
| `judgment-specialist-review` | Specialist Review | judgment | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `9d1145517a9d` |
| `transform-paper-humanization-revision` | Paper Humanization Revision | transformation | producer | mixed | required | operational | 2/2 | 2 | 1 | 5 | `530ce33b99fe` |
| `transform-review-response-comment-atomization` | Review Response Comment Atomization | transformation | producer | mixed | required | operational | 1/2 | 4 | 1 | 36 | `ba612aad074f` |
| `transform-revision-patching` | Revision Patching | transformation | checker | mixed | required | operational | 1/2 | 1 | 1 | 3 | `a9edae08d0c8` |
| `transform-revision-roadmap-parsing` | Revision Roadmap Parsing | transformation | producer | llm | required | operational | 2/2 | 1 | 1 | 3 | `f20acf746ad9` |
| `transform-socratic-mentoring` | Socratic Mentoring | transformation | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `ad0a6e783f47` |

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
| report | capability | generation-report-compilation | rq | — |

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
| research-question | capability | design-research-question-formulation | — | rq-gate |
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

- [x] `pnpm arsu:author` twice: byte-identical
- [x] `pnpm arsu:check`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
