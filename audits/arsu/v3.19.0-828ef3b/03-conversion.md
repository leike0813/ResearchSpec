# ARSU Anchor Conversion — v3.19.0-828ef3b

- registry SHA-256: `64e693f30a4bc82a021e593306bcc0cb1f205cde0a1a708729876f479813e831`
- packages tree SHA-256: `23fa6f85e5b9a12cc2bb4a785f7e54acdeed2ce33ecb761ec5808414e407c853`
- capability count: 38 · operational: 38

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `cap-analysis-evidence-synthesis` | Evidence Synthesis | analysis | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `3210eb689e93` |
| `cap-analysis-meta-analysis` | Meta Analysis | analysis | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `de5f2cd4633d` |
| `cap-analysis-risk-of-bias-assessment` | Risk of Bias Assessment | analysis | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `d395e9d809bf` |
| `cap-check-citation-existence-verification` | Citation Existence Verification | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `d0de7086e442` |
| `cap-check-citation-format-compliance` | Citation Format Compliance | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `4095c004ffb9` |
| `cap-check-citation-verification-summary` | Citation Verification Summary | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `2a01d08bff61` |
| `cap-check-claim-faithfulness-audit` | Claim Faithfulness Audit | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `2f5835218471` |
| `cap-check-collaboration-depth-observer` | Collaboration Depth Observer | verification | observer | llm | required | operational | 1/1 | 1 | 1 | 3 | `59e9def3781f` |
| `cap-check-compliance-check` | Compliance Check | verification | observer | llm | required | operational | 1/2 | 2 | 1 | 4 | `3e33654e24a9` |
| `cap-check-contamination-signals` | Contamination Signals | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `32f8518b1134` |
| `cap-check-passport-verifier` | Passport Verifier | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `95d22b675c1a` |
| `cap-check-pdf-read-preflight` | PDF Read Preflight | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `88b0e11121c8` |
| `cap-check-pre-submission-self-check` | Pre-submission Self Check | verification | checker | llm | required | operational | 3/2 | 1 | 1 | 3 | `36311b5a6db9` |
| `cap-check-reference-integrity-verification` | Reference Integrity Verification | verification | checker | llm | required | operational | 1/1 | 2 | 1 | 4 | `81e05f9c5c32` |
| `cap-check-submission-package-verifier` | Submission Package Verifier | verification | checker | script | required | operational | 1/1 | 2 | 2 | 5 | `d2d4434e4b0d` |
| `cap-check-temporal-integrity-verification` | Temporal Integrity Verification | verification | checker | script | required | operational | 1/1 | 1 | 2 | 4 | `dca7d5e82400` |
| `cap-check-terminal-policy-gate` | Terminal Policy Gate | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `c3efc88a54c5` |
| `cap-design-argument-blueprint` | Argument Blueprint | design | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `c6d0d0d27bce` |
| `cap-design-manuscript-structure-design` | Manuscript Structure Design | design | producer | llm | required | operational | 2/1 | 1 | 1 | 3 | `3f413c439eda` |
| `cap-design-methodology-design` | Methodology Design | design | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `ee5498407e60` |
| `cap-design-research-question-formulation` | Research Question Formulation | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `01140104f8d0` |
| `cap-design-review-panel-config` | Review Panel Configuration | design | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `39a537f78cad` |
| `cap-design-writing-intake` | Writing Intake | design | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `9a104de9a064` |
| `cap-discovery-literature-monitoring` | Literature Monitoring | discovery | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `430cace07c81` |
| `cap-discovery-literature-search-screening` | Literature Search And Screening | discovery | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `d4bd181b234b` |
| `cap-discovery-source-quality-grading` | Source Quality Grading | verification | checker | llm | required | operational | 1/1 | 1 | 1 | 3 | `22084bb387d9` |
| `cap-generation-abstract-writing` | Abstract Writing | generation | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `e0047a3e525b` |
| `cap-generation-figure-generation` | Figure Generation | generation | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `9246c9fc96e1` |
| `cap-generation-format-rendering` | Format Rendering | generation | producer | mixed | required | operational | 1/1 | 2 | 1 | 4 | `7c5257223c52` |
| `cap-generation-manuscript-drafting` | Manuscript Drafting | generation | producer | llm | required | operational | 2/1 | 3 | 1 | 5 | `5fa81411a2f7` |
| `cap-generation-report-compilation` | Research Report Compilation | generation | producer | llm | required | operational | 2/1 | 2 | 1 | 4 | `4851960f6dde` |
| `cap-judgment-devils-advocate-stress-test` | Devil's Advocate Stress Test | judgment | checker | llm | required | operational | 2/1 | 1 | 1 | 3 | `919731aa25bd` |
| `cap-judgment-editorial-judgment` | Editorial Judgment | judgment | producer | llm | required | operational | 1/1 | 1 | 1 | 3 | `342c84e05572` |
| `cap-judgment-review-synthesis` | Review Synthesis | judgment | producer | llm | required | operational | 3/1 | 1 | 1 | 3 | `c90991f83ee6` |
| `cap-judgment-specialist-review` | Specialist Review | judgment | producer | llm | required | operational | 1/1 | 3 | 1 | 5 | `aebadfebdbc9` |
| `cap-transform-revision-patching` | Revision Patching | transformation | checker | mixed | required | operational | 1/2 | 1 | 1 | 3 | `c0d7504118fc` |
| `cap-transform-revision-roadmap-parsing` | Revision Roadmap Parsing | transformation | producer | llm | required | operational | 2/2 | 1 | 1 | 3 | `366ab672884b` |
| `cap-transform-socratic-mentoring` | Socratic Mentoring | transformation | producer | llm | required | operational | 1/1 | 2 | 1 | 4 | `48151a999885` |

## Graph Profiles

### academic-paper-reviewer

`academic-paper-reviewer.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| panel | capability | cap-design-review-panel-config | — | — |

### academic-paper

`academic-paper.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| intake | capability | cap-design-writing-intake | — | — |

### academic-pipeline

`academic-pipeline.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| research | subgraph | research-main | — | — |

### minimal

`minimal.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| rq | capability | cap-design-research-question-formulation | — | — |
| report | capability | cap-generation-report-compilation | "rq" | — |

### research-main

`research-main.ts`

| node | kind | capability/subgraph | prerequisites | required gates |
|---|---|---|---|---|
| research-question | capability | cap-design-research-question-formulation | — | "rq-gate" |
| rq-gate | gate | — | "research-question" | — |
| methodology | capability | cap-design-methodology-design | "rq-gate" | "rq-gate" |
| literature | capability | cap-discovery-literature-search-screening | "methodology" | "rq-gate" |
| grading | capability | cap-discovery-source-quality-grading | "literature" | — |
| synthesis | capability | cap-analysis-evidence-synthesis | "grading" | — |
| report | capability | cap-generation-report-compilation | "synthesis" | — |

## Verification

- [x] `pnpm arsu:author` twice: byte-identical
- [x] `pnpm arsu:check`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
