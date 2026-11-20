# ARS v3.24.4 来源比较与逐包审阅证据

- baseline: `v3.22.2-7de1c9d` (`7de1c9dfb7af9c02a9b57750761323f35a743aa2`)
- target: `v3.24.4-23807f9` (`23807f987024f2e038d12fd9e4e5d2a7cc228674`)
- source diff: 345 files, 26,056 insertions, 1,882 deletions.
- ARSU semantic source subset: 107 changed files under the five Skills, `agents/`, `shared/`, and `sr-screener/`; 6,796 insertions and 501 deletions. Upstream scripts, evals, tests, host installers and transport implementations were read only where needed to establish provenance or boundaries; they were not copied or executed.
- extraction comparison: 120 -> 131 entries; 11 added, 40 changed source/body or mapping hashes, 80 byte-identical, 0 removed.
- capability comparison: 47 -> 56 packages; 9 new, 33 existing manifest SHA-12 changes, 14 unchanged.
- authoring working-tree comparison: `git diff --name-only -- authoring/ars` returns 43 tracked paths; excluding `authoring/ars/extraction-index.json` leaves 42 modified files. The 40 changed-hash rows in the old/new 02 inventories all map to 40 of those files. The remaining two files, `knowledge/02_finer_framework_socratic_questions.md` and `knowledge/03_prisma_documentation.md`, only update source line coordinates and ledger metadata: their extracted-body SHA-256 values are identical in both 02 inventories. Separately, Git status shows 11 untracked new source files (four CAP and seven KP), matching the 11 added 02 rows.

The upstream comparison uses `git diff v3.22.2..v3.24.4` in `vendor/ars`. The authoring comparison uses the working-tree `git diff --name-only -- authoring/ars`, with the extraction index excluded from the file count. Extraction counts and hashes are compared from old/new `02-ingestion.md`; package status compares old/new `03-conversion.md` manifest hashes. Coverage numbers below are copied from the refreshed `04-review.md`; they are machine signals only.

Changed extraction rows (40): `CAP-M1-01` (two variants), `CAP-M1-02`, `CAP-M1-03`, `CAP-M1-04`, `CAP-M1-05`, `CAP-M2-01`, `CAP-M2-02`, `CAP-M2-04` (two variants), `CAP-M2-05`, `CAP-M2-06`, `KP-M2-05`, `CAP-M3-01`, `CAP-M3-02`, `CAP-M3-03` (two variants), `CAP-M3-04` (three variants), `CAP-M3-05`, `CAP-M3-06`, `CAP-M3-07`, `KP-M3-01`, `KP-M3-05b`, `KP-M3-06`, `KP-M3-07`, `CAP-M4-01`, `CAP-M4-03`, `CAP-M4-04` (two variants), `CAP-M4-05`, `KP-M4-01`, `KP-M4-03`, `CAP-M5-01`, `CAP-M5-02`, `CAP-M5-03`, `CAP-M5-07`, `KP-M5-15`, `KP-M5-32`. Added extraction rows (11): `CAP-M1-SR-01..04` and `KP-M1-SR-01..07`. The exact artifact paths and SHA-256 values remain in `02-ingestion.md`.

## Upstream source deltas reviewed

| Source area | Material changes read | Conversion obligation and disposition |
|---|---|---|
| `MODE_REGISTRY.md`, `sr-screener/**` | The 103-commit update increases catalog routes from 27 to 35 (33 modes and two pipeline entries) with eight screening modes. New Skill defines protocol, independent triage, pilot, TA/FT screening, adjudication, exclusion audit and PRISMA/corpus reporting. Its four role agents and seven references separate those contracts. | Eight routes are present in the generated source map. The quick route binds only `screening-quick`; staged routes bind only relevant profile nodes/capabilities. User protocol confirmation, reviewer blindness, unresolved/pending states, one ordered FT exclusion reason, advisory adjudication/audit, provisional counts and human verification remain explicit. Upstream helper scripts/workflow templates are evidence and are not available package tools. |
| `deep-research/**`, root `agents/**`, `shared/references/per_source_method_weaknesses.md` | Bibliography and synthesis instructions refine source-level limitations, provenance and evidence scope. | Adapted in source-quality grading, synthesis/reporting, and their knowledge references. Author-reported limitations stay distinct from reader inference; missing source coverage is disclosed and does not become a finding of absence. |
| `academic-paper/**`, shared language/abstract material | Intake, structure, drafting and abstract instructions refine language-pair carry-forward, separation of manuscript and abstract budgets, acronym handling, citation style switching and DOI retention. | Preserved/adapted in writing intake, structure, drafting, abstract and citation packages. Abstract regimes and language roles remain single-sourced in knowledge. Unknown style/locale or absent evidence does not justify silent conversion or fabrication. |
| `academic-paper-reviewer/**`, `shared/contracts/reviewer/**`, review examples/templates | Field analysis and reviewer instructions clarify stakeholder coverage, literature cutoff, role attribution, editorial attachments and consensus denominator. | Adapted in panel configuration, specialist review, editorial judgment and synthesis. DA evidence remains distinct from the four-seat consensus denominator; author-letter attachments do not become votes or review findings. The generated reviewer quick/full panels preserve the EIC role despite the upstream Journal-Fit Reviewer display name. |
| `academic-pipeline/**`, `shared/contracts/passport/**`, `shared/handoff_schemas.md` | Integrity verification adds language/version and experiment-provenance checks; pipeline/passport sources refine reset boundary, awaiting-resume, hash consumption and state-machine details. | Adapted through existing abstract/reference verification and frozen graph/run authority. The local run and exact selector govern continuation; no upstream passport replay or upstream workflow state is imported. Stage 1 RESEARCH remains graph flow, not a capability instruction. |
| Existing M1–M5 capability agents, selected references and procedures | 40 extraction entries changed; detailed IDs, paths and SHA-256 values are in `02-ingestion.md`. | 33 pre-existing package manifests changed; their package-level output and parity evidence appears below. Hash movement is not treated as proof of semantic coverage. |
| Upstream scripts, tests, evaluation corpora, plugin/host files and transport code | Present in the 345-file whole-repository diff; most are not extraction inputs. | Excluded from ResearchSpec runtime and package execution. Read-only source comparison does not certify upstream tests, host behavior or model results. |

## Package-by-package comparison

`Status` compares package manifest hash with the v3.22.2 anchor. `Section/rule` and line/reference counts are the v3.24.4 parity report values. Each changed package was checked against its linked changed extraction/source and its generated package entry point; inherited non-preserved findings are listed separately below.

| Capability | Status | Sections | Rules | SKILL lines | Knowledge refs | Output |
|---|---|---:|---:|---:|---:|---|
| analysis-evidence-synthesis | changed | 0.974 | 0.933 | 249 | 3 | yes |
| analysis-meta-analysis | changed | 0.848 | 1.000 | 223 | 1 | yes |
| analysis-review-response-manuscript-analysis | unchanged | 0.933 | 1.000 | 119 | 6 | yes |
| analysis-risk-of-bias-assessment | changed | 0.947 | 1.000 | 218 | 1 | yes |
| check-citation-existence-verification | changed | 1.000 | 1.000 | 104 | 2 | yes |
| check-citation-format-compliance | changed | 0.952 | 1.000 | 332 | 2 | yes |
| check-citation-verification-summary | changed | 1.000 | 1.000 | 90 | 2 | yes |
| check-claim-faithfulness-audit | unchanged | 0.944 | 1.000 | 229 | 1 | yes |
| check-collaboration-depth-observer | unchanged | 1.000 | 1.000 | 161 | 1 | yes |
| check-compliance-check | changed | 0.923 | 1.000 | 235 | 2 | yes |
| check-contamination-signals | changed | 1.000 | 1.000 | 98 | 2 | yes |
| check-paper-humanization-review | unchanged | 0.800 | 1.000 | 148 | 6 | yes |
| check-paper-humanization-verification | unchanged | 1.000 | 1.000 | 124 | 4 | yes |
| check-passport-verifier | changed | 1.000 | 1.000 | 101 | 2 | yes |
| check-pdf-read-preflight | changed | 1.000 | 1.000 | 93 | 2 | yes |
| check-pre-submission-self-check | changed | 0.893 | 0.833 | 264 | 3 | yes |
| check-reference-integrity-verification | changed | 0.903 | 0.816 | 339 | 2 | yes |
| check-submission-package-verifier | changed | 1.000 | 1.000 | 94 | 3 | yes |
| check-temporal-integrity-verification | changed | 1.000 | 1.000 | 99 | 2 | yes |
| check-terminal-policy-gate | changed | 1.000 | 1.000 | 99 | 1 | yes |
| design-argument-blueprint | unchanged | 0.943 | 1.000 | 274 | 3 | yes |
| design-manuscript-structure-design | changed | 0.957 | 1.000 | 314 | 3 | yes |
| design-methodology-design | changed | 0.923 | 0.714 | 225 | 4 | yes |
| design-research-question-formulation | changed | 0.923 | 1.000 | 178 | 2 | yes |
| design-review-panel-config | changed | 0.970 | 1.000 | 200 | 2 | yes |
| design-review-response-intake | unchanged | 1.000 | 1.000 | 122 | 6 | yes |
| design-review-response-workboard-planning | unchanged | 1.000 | 1.000 | 123 | 12 | yes |
| design-writing-intake | changed | 1.000 | 1.000 | 320 | 3 | yes |
| discovery-literature-monitoring | unchanged | 1.000 | 1.000 | 223 | 1 | yes |
| discovery-literature-search-screening | changed | 0.837 | 1.000 | 311 | 2 | yes |
| discovery-source-quality-grading | changed | 1.000 | 1.000 | 201 | 1 | yes |
| generation-abstract-writing | changed | 1.000 | 1.000 | 208 | 3 | yes |
| generation-figure-generation | unchanged | 0.816 | 0.667 | 226 | 2 | yes |
| generation-format-rendering | changed | 0.939 | 1.000 | 365 | 2 | yes |
| generation-humanization-reference | unchanged | 0.981 | 1.000 | 220 | 1 | yes |
| generation-manuscript-drafting | changed | 1.000 | 1.000 | 281 | 5 | yes |
| generation-report-compilation | changed | 0.955 | 1.000 | 267 | 2 | yes |
| generation-review-response-round | unchanged | 0.950 | 1.000 | 148 | 13 | yes |
| judgment-devils-advocate-stress-test | changed | 0.878 | 0.889 | 243 | 2 | yes |
| judgment-editorial-judgment | changed | 0.949 | 0.800 | 199 | 2 | yes |
| judgment-review-synthesis | changed | 0.843 | 0.731 | 268 | 1 | yes |
| judgment-specialist-review | changed | 0.956 | 1.000 | 232 | 4 | yes |
| screening-adjudicate | added | 0.833 | 1.000 | 86 | 2 | yes |
| screening-audit | added | 1.000 | 1.000 | 92 | 2 | yes |
| screening-ft-screen | added | 0.833 | 1.000 | 116 | 8 | yes |
| screening-pilot | added | 1.000 | 1.000 | 146 | 7 | yes |
| screening-protocol | added | 1.000 | 1.000 | 150 | 2 | yes |
| screening-quick | added | 0.833 | 1.000 | 114 | 2 | yes |
| screening-report | added | 1.000 | 1.000 | 110 | 7 | yes |
| screening-review-ballot | added | 0.833 | 1.000 | 133 | 3 | yes |
| screening-ta-screen | added | 0.833 | 1.000 | 113 | 8 | yes |
| transform-paper-humanization-revision | unchanged | 1.000 | 1.000 | 98 | 4 | yes |
| transform-review-response-comment-atomization | unchanged | 1.000 | 1.000 | 125 | 10 | yes |
| transform-revision-patching | changed | 1.000 | 1.000 | 97 | 1 | yes |
| transform-revision-roadmap-parsing | changed | 0.839 | 0.900 | 303 | 1 | yes |
| transform-socratic-mentoring | changed | 0.855 | 0.917 | 295 | 2 | yes |

All 56 packages report output-format preservation. The refreshed parity summary reports zero packages below either section or rule thresholds, zero missing outputs, and zero retained-flow headings. This lexical coverage result does not establish runtime behavior; the 9 new screening packages still require semantic and workflow acceptance against their source contracts.

Unchanged package IDs (14): `analysis-review-response-manuscript-analysis`, `check-claim-faithfulness-audit`, `check-collaboration-depth-observer`, `check-paper-humanization-review`, `check-paper-humanization-verification`, `design-argument-blueprint`, `design-review-response-intake`, `design-review-response-workboard-planning`, `discovery-literature-monitoring`, `generation-figure-generation`, `generation-humanization-reference`, `generation-review-response-round`, `transform-paper-humanization-revision`, `transform-review-response-comment-atomization`.

## Assessment findings and inherited gaps

| Finding | Classification and evidence |
|---|---|
| `academic-paper-reviewer:full` — `converted_only:EIC Review Report` | adapted; converted-only display anchor | Upstream `academic-paper-reviewer/agents/eic_agent.md` names the role Journal-Fit Reviewer. The converted `eic` role remains in `judgment-editorial-judgment`; the display text is not a missing deliverable or new authority. |
| `academic-paper-reviewer:quick` — `converted_only:EIC Review Report` | adapted; same role/display difference | The quick route uses the EIC agent and `judgment-editorial-judgment`; no source-only report contract is missing. |
| `academic-paper-reviewer:calibration` — `gap:FNR` | inherited semantic gap | No frozen gold set and no measured false-negative rate are available in the converted graph. Preserve `NOT_CALIBRATED`. |
| `academic-paper-reviewer:calibration` — `gap:FPR` | inherited semantic gap | No frozen gold set and no measured false-positive rate are available. Preserve `NOT_CALIBRATED`. |
| `academic-paper-reviewer:calibration` — `gap:gold set` | inherited semantic gap | No isolated, controlled gold-set experiment is implemented. Nearby review capabilities do not substitute for it; AUC text matching is not evidence of calibration. |
| `academic-pipeline:end-to-end` — `flow:Stage 1 RESEARCH` | adapted; flow carried by graph | `academic-pipeline` profile binds `research` to the `research-main` subgraph and its formal `research-gate`; flow does not belong in a capability SKILL. |
| `academic-pipeline:resume_from_passport` — `gap:reset boundary` | intentional removal/adaptation | ARS passport reset behavior is not implemented. Continue from the frozen ResearchSpec graph/run state. |
| `academic-pipeline:resume_from_passport` — `gap:awaiting_resume` | intentional removal/adaptation | ResearchSpec does not persist this upstream state label; exact `status` and node instructions determine whether the local run can continue. |
| `academic-pipeline:resume_from_passport` — `gap:consumes_hash` | intentional removal/adaptation | ResearchSpec does not replay or consume the ARS passport hash. Do not claim upstream hash-reset equivalence. |
| `sr-screener:protocol` — `gap:eligibility criteria` | adapted/preserved; text anchor false negative | `screening-protocol/SKILL.md` says stage-specific eligibility rules; `knowledge/protocol_template.md` defines ordered exclusions, TA/FT split and inclusion decision. |
| `sr-screener:protocol` — `missing:inclusion and exclusion` | adapted/preserved; phrase anchor false negative | `knowledge/protocol_template.md` explicitly lists include/unclear/exclude decisions and ordered exclusion codes; `knowledge/reviewer_roles.md` specifies criteria-order application and unclear handling. |

## Evidence and limits

- Checked-in sources read: `MODE_REGISTRY.md`; changed Skill agents/references identified in `git diff`; all nine generated `screening-*` SKILLs and their linked knowledge references; all 56 generated package summaries in `03-conversion.md`; 56 parity rows in `04-review.md`; both current HTML artifacts.
- Current checked-in HTML was re-read after refresh: all eight screening routes appear; quick is 1 package / 306 lines. The refreshed `04-review.md` covers 35 catalog routes, 56 package parity rows, zero below-threshold packages, zero missing outputs and zero flow-retained packages. Its only non-`none` mode rows are enumerated individually above.
- Static comparison used upstream scripts as source evidence only. Runtime acceptance separately exercised ResearchSpec’s packaged tools on synthetic materials and its seven packaged checker nodes. See the semantic review for scope.
- The semantic review records the acceptance decision and its limits.

## Incremental anchor diff

Final checks passed for extraction, conversion and byte-level regeneration, contract anchors, runtime policy, TypeScript, lint, OpenSpec and the maintenance manifest. The full test run recorded 605 passes, one failure in concurrent dead-owner recovery in the semantic search cache, and one unrelated patent DOCX skip because the environment lacked python-docx. The entire cache test file passed on isolated rerun (6/6). The four screening tests and the separate three-case run against the generated screening tools passed. This run did not establish reliable cache-lock recovery under full-suite load.

```text
upstream.version: v3.22.2 -> v3.24.4
upstream.commit: 7de1c9dfb7af9c02a9b57750761323f35a743aa2 -> 23807f987024f2e038d12fd9e4e5d2a7cc228674
extraction.artifact_count: 120 -> 131
conversion.capability_count: 47 -> 56
review.section_coverage: 0.9510385375183579 -> 0.9428335729865457
review.rule_coverage: 0.9579594249047135 -> 0.9678619707956442
```
