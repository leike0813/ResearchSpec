# ARSU Anchor Conversion — v3.19.0-828ef3b

- registry SHA-256: `71a2923ff1330785908ec212c6c7c92c22ae404b89a3937d740609d3d2c1f63a`
- packages tree SHA-256: `6f554076528f00abdda6529c7745096c2596f248edfbafb5c73d242de508bc24`
- capability count: 47 · operational: 47

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `analysis-evidence-synthesis` | Evidence Synthesis | analysis | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `3263c31096f9` |
| `analysis-meta-analysis` | Meta Analysis | analysis | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `2aa082d13c77` |
| `analysis-review-response-manuscript-analysis` | Review Response Manuscript Analysis | analysis | producer | mixed | none | operational | 1/1 | 4 | 1 | 36 | `636d11915f2b` |
| `analysis-risk-of-bias-assessment` | Risk of Bias Assessment | analysis | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `1312c91f2027` |
| `check-citation-existence-verification` | Citation Existence Verification | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `177028f869db` |
| `check-citation-format-compliance` | Citation Format Compliance | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `45453671f816` |
| `check-citation-verification-summary` | Citation Verification Summary | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `05473eaaab9f` |
| `check-claim-faithfulness-audit` | Claim Faithfulness Audit | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `311e0372b376` |
| `check-collaboration-depth-observer` | Collaboration Depth Observer | verification | observer | llm | required | operational | 1/1 | 1 | 1 | 3 | `cc8fefdfa7cd` |
| `check-compliance-check` | Compliance Check | verification | observer | llm | required | operational | 1/2 | 2 | 1 | 4 | `03bdd8a68489` |
| `check-contamination-signals` | Contamination Signals | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `bb7491f88bbf` |
| `check-paper-humanization-review` | Paper Humanization Review | verification | checker | mixed | none | operational | 2/2 | 3 | 1 | 6 | `ef9780d14bb0` |
| `check-paper-humanization-verification` | Paper Humanization Verification | verification | checker | mixed | none | operational | 2/1 | 3 | 1 | 6 | `3b395ddb76db` |
| `check-passport-verifier` | Passport Verifier | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `0e8c9bc1a705` |
| `check-pdf-read-preflight` | PDF Read Preflight | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `ff660a2b7db6` |
| `check-pre-submission-self-check` | Pre-submission Self Check | verification | checker | llm | required | operational | 3/2 | 1 | 1 | 3 | `a909b0709c35` |
| `check-reference-integrity-verification` | Reference Integrity Verification | verification | checker | llm | required | operational | 1/1 | 2 | 1 | 4 | `48938a5d8cf2` |
| `check-submission-package-verifier` | Submission Package Verifier | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `6daad7e09681` |
| `check-temporal-integrity-verification` | Temporal Integrity Verification | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `b24b6efbf32c` |
| `check-terminal-policy-gate` | Terminal Policy Gate | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `92fe90127957` |
| `design-argument-blueprint` | Argument Blueprint | design | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `814a5a9c6cee` |
| `design-manuscript-structure-design` | Manuscript Structure Design | design | producer | llm | required | operational | 2/1 | 1 | 1 | 3 | `b7249171166c` |
| `design-methodology-design` | Methodology Design | design | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `705b3630e542` |
| `design-research-question-formulation` | Research Question Formulation | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `7de2ba5e7666` |
| `design-review-panel-config` | Review Panel Configuration | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `c1e5c8e6463d` |
| `design-review-response-intake` | Review Response Intake | design | producer | mixed | none | operational | 4/2 | 4 | 1 | 38 | `5d630feb1f67` |
| `design-review-response-workboard-planning` | Review Response Workboard Planning | design | producer | mixed | required | operational | 1/1 | 4 | 1 | 36 | `2a185071f942` |
| `design-writing-intake` | Writing Intake | design | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `1ff4f9e4a615` |
| `discovery-literature-monitoring` | Literature Monitoring | discovery | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `608ed89c8ff1` |
| `discovery-literature-search-screening` | Literature Search And Screening | discovery | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `49583d56158b` |
| `discovery-source-quality-grading` | Source Quality Grading | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `87482b4446b4` |
| `generation-abstract-writing` | Abstract Writing | generation | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `f6cc154069e6` |
| `generation-figure-generation` | Figure Generation | generation | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `a7a3c36b7976` |
| `generation-format-rendering` | Format Rendering | generation | producer | mixed | required | operational | 1/1 | 2 | 1 | 4 | `44a723990680` |
| `generation-humanization-reference` | Paper Humanizer Reference Mode | generation | observer | llm | none | operational | 0/0 | 1 | 1 | 3 | `ce0fe3b3eef6` |
| `generation-manuscript-drafting` | Manuscript Drafting | generation | producer | llm | required | operational | 2/1 | 3 | 1 | 5 | `516b74872dab` |
| `generation-report-compilation` | Research Report Compilation | generation | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `74a136f89eed` |
| `generation-review-response-round` | Review Response Round | generation | producer | mixed | required | operational | 1/4 | 5 | 1 | 40 | `9400c053e331` |
| `judgment-devils-advocate-stress-test` | Devil's Advocate Stress Test | judgment | checker | llm | required | operational | 2/1 | 1 | 1 | 3 | `1428a211daee` |
| `judgment-editorial-judgment` | Editorial Judgment | judgment | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `2ad9c73e1f00` |
| `judgment-review-synthesis` | Review Synthesis | judgment | producer | llm | required | operational | 3/1 | 1 | 1 | 3 | `3d446d10e7ed` |
| `judgment-specialist-review` | Specialist Review | judgment | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `60b70f07072e` |
| `transform-paper-humanization-revision` | Paper Humanization Revision | transformation | producer | mixed | required | operational | 2/2 | 2 | 1 | 5 | `68fb272a60f4` |
| `transform-review-response-comment-atomization` | Review Response Comment Atomization | transformation | producer | mixed | required | operational | 1/2 | 4 | 1 | 36 | `7a4fa94febd7` |
| `transform-revision-patching` | Revision Patching | transformation | checker | mixed | required | operational | 1/2 | 1 | 1 | 3 | `a99241fbaef9` |
| `transform-revision-roadmap-parsing` | Revision Roadmap Parsing | transformation | producer | llm | required | operational | 2/2 | 1 | 1 | 3 | `abf850301e3e` |
| `transform-socratic-mentoring` | Socratic Mentoring | transformation | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `e00fb9912008` |

## Graph Profiles

### academic-paper-reviewer

`academic-paper-reviewer.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| panel | capability | design-review-panel-config | — | — |

### academic-paper

`academic-paper.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| intake | capability | design-writing-intake | — | — |

### academic-pipeline

`academic-pipeline.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| research | subgraph | research-main | — | — |

### minimal

`minimal.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| rq | capability | design-research-question-formulation | — | — |
| report | capability | generation-report-compilation | "rq" | — |

### paper-humanizer

`paper-humanizer.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| review | capability | check-paper-humanization-review | — | — |
| plan-gate | gate | — | "review" | — |
| plan-decision | decision | — | "plan-gate" | "paper-humanizer-plan" |
| revision | capability | transform-paper-humanization-revision | "plan-decision" | "paper-humanizer-plan" |
| verification | capability | check-paper-humanization-verification | "revision" | — |
| acceptance | decision | — | "verification" | — |
| exit-gate | gate | — | "plan-decision" | — |

### research-main

`research-main.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| research-question | capability | design-research-question-formulation | — | "rq-gate" |
| rq-gate | gate | — | "research-question" | — |
| methodology | capability | design-methodology-design | "rq-gate" | "rq-gate" |
| literature | capability | discovery-literature-search-screening | "methodology" | "rq-gate" |
| grading | capability | discovery-source-quality-grading | "literature" | — |
| synthesis | capability | analysis-evidence-synthesis | "grading" | — |
| report | capability | generation-report-compilation | "synthesis" | — |

### review-response

`review-response.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| intake | capability | design-review-response-intake | — | — |
| manuscript-analysis | capability | analysis-review-response-manuscript-analysis | "intake" | — |
| comment-atomization | capability | transform-review-response-comment-atomization | "manuscript-analysis" | — |
| comment-coverage-gate | gate | — | "comment-atomization" | — |
| workboard | capability | design-review-response-workboard-planning | "comment-coverage-gate" | "review-response-comment-coverage" |
| strategy-gate | gate | — | "workboard" | — |
| round | capability | generation-review-response-round | "strategy-gate" | "review-response-strategy" |
| evidence-gate | gate | — | "round" | — |
| response-coverage-gate | gate | — | "round" | — |
| final-assembly-gate | gate | — | "round" | — |
| outcome | decision | — | "evidence-gate", "response-coverage-gate", "final-assembly-gate" | "review-response-evidence", "review-response-response-coverage", "review-response-final-assembly" |

## Verification

- [x] `pnpm arsu:author` twice: byte-identical
- [x] `pnpm arsu:check`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
