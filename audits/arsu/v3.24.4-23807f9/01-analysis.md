# ARSU Anchor Analysis — v3.24.4-23807f9

- generated: 2026-11-23T14:54:13.015Z
- upstream: https://github.com/Imbad0202/academic-research-skills @ v3.24.4 (23807f987024f2e038d12fd9e4e5d2a7cc228674)
- maintenance skill SHA-256: `64376b16717570647942e654fcc087e65f8ff54dffcab25a3acd09a352ce28a2`

## Upstream Inventory

- total files: 2880
- tree SHA-256: `c4d1effefdbe694a06fb87cd093cd3f7137f3ce6ed6b75eaced6e00a521c4e90`
- agents: 43 · references: 112 · templates: 27

| top-level area | files |
|---|---|
| .claude | 2 |
| .claude-plugin | 2 |
| .command-invariants.toml | 1 |
| .gitattributes | 1 |
| .github | 17 |
| .gitignore | 1 |
| .gitleaks.toml | 1 |
| .gitleaksignore | 1 |
| CHANGELOG.md | 1 |
| CITATION.cff | 1 |
| CONTRIBUTING.md | 1 |
| GOVERNANCE.md | 1 |
| LICENSE | 1 |
| MODE_REGISTRY.md | 1 |
| NOTICE.md | 1 |
| POSITIONING.md | 1 |
| QUICKSTART.md | 1 |
| README.es-ES.md | 1 |
| README.ja-JP.md | 1 |
| README.ko-KR.md | 1 |
| README.md | 1 |
| README.pt-BR.md | 1 |
| README.zh-CN.md | 1 |
| README.zh-TW.md | 1 |
| SECURITY.md | 1 |
| THIRD_PARTY.md | 1 |
| academic-paper | 63 |
| academic-paper-reviewer | 29 |
| academic-pipeline | 30 |
| agents | 4 |
| audits | 18 |
| commands | 16 |
| deep-research | 53 |
| docs | 125 |
| evals | 1146 |
| examples | 45 |
| hooks | 2 |
| package.json | 1 |
| pi | 5 |
| plugin-evals | 38 |
| plugin-evals-citation-check | 61 |
| plugin-evals-citation-locale | 15 |
| pyproject.toml | 1 |
| requirements-dev.txt | 1 |
| requirements-pdf-content-classifier.txt | 1 |
| scripts | 654 |
| shared | 155 |
| sr-screener | 25 |
| tests | 342 |
| tools | 6 |

| extension | files |
|---|---|
| (none) | 10 |
| .bib | 7 |
| .cff | 1 |
| .empty | 1 |
| .html | 8 |
| .jq | 5 |
| .js | 3 |
| .json | 590 |
| .jsonl | 15 |
| .log | 302 |
| .md | 1159 |
| .mjs | 2 |
| .pdf | 16 |
| .py | 490 |
| .sh | 9 |
| .stderr | 1 |
| .tex | 3 |
| .toml | 4 |
| .txt | 36 |
| .xml | 2 |
| .yaml | 201 |
| .yml | 15 |

## Mode Registry (35 rows)

| skill | mode | spectrum | output | oversight | triggers |
|---|---|---|---|---|---|
| deep-research | `full` | Balanced | APA 7.0 report, 3,000-8,000 words | High | "research [topic]", "deep research", "academic analysis" |
| deep-research | `quick` | Fidelity | Research brief, 500-1,500 words | Medium | "quick brief", "30 minute summary", "quick research" |
| deep-research | `review` | Balanced | Reviewer report on provided text | High | "review this paper", "evaluate this paper", "assess this source" |
| deep-research | `lit-review` | Fidelity | Annotated bibliography + synthesis | Medium | "literature review", "annotated bibliography" |
| deep-research | `three-way-scan` | Fidelity | WHY/HOW/WHAT paper shortlist + cross-paper synthesis | Low | "WHY HOW WHAT papers", "3W literature scan", "compare these papers" |
| deep-research | `fact-check` | Fidelity | Claim-by-claim verification report | Medium | "verify claims", "fact-check", "evidence verification" |
| deep-research | `socratic` | Originality | Research Plan Summary + INSIGHT collection | Very High | "guide my research", "help me think through", "I'm not sure what to research" |
| deep-research | `systematic-review` | Fidelity | PRISMA 2020 report, 5,000-15,000 words | Medium | "systematic review", "meta-analysis", "PRISMA" |
| academic-paper | `full` | Balanced | Complete paper draft (IMRaD or domain-appropriate) | High | "write a paper", "academic paper", "research paper" |
| academic-paper | `plan` | Originality | Chapter Plan + INSIGHT collection (Socratic) | Very High | "guide my paper", "help me plan", "step by step paper" |
| academic-paper | `outline-only` | Balanced | Detailed outline + evidence map | High | "paper outline", "just need an outline" |
| academic-paper | `revision` | Fidelity | Revised draft + point-by-point R&R responses | High | "revise paper", "incorporate reviewer feedback" |
| academic-paper | `revision-coach` | Balanced | Reviewer path: Revision Roadmap + Response Letter Skeleton. Explicit research-ethics-review variant: source-accounted concern tracker + placeholder response skeleton | Medium | "parse reviews", "I got reviewer comments", "track these committee comments" |
| academic-paper | `abstract-only` | Fidelity | Bilingual abstract (zh-TW + EN) + keywords | Medium | "write abstract" |
| academic-paper | `lit-review` | Fidelity | Annotated bibliography in paper format | Medium | "literature review paper", "write a lit review" |
| academic-paper | `format-convert` | Fidelity | Formatted document (LaTeX/DOCX-via-Pandoc/PDF/MD) | Low | "convert to LaTeX", "convert citations to [format]" |
| academic-paper | `citation-check` | Fidelity | Citation error report | Low | "check citations", "verify references" |
| academic-paper | `disclosure` | Fidelity | Default venue path: applicability/status bundle; policy-anchor path: anchor-specific render | Low | "AI disclosure for [venue]", "generate AI usage statement" |
| academic-paper | `rebuttal-audit` | Fidelity | Advisory QA of an existing rebuttal draft (per-comment coverage + gaps + risk flags); no generation; no Schema 11 emission | Low | "audit my response", "check my rebuttal", "did I miss any reviewer comment" |
| academic-paper-reviewer | `full` | Balanced | 5 review reports + Editorial Decision + Revision Roadmap | High | "review paper", "peer review", "manuscript review" |
| academic-paper-reviewer | `re-review` | Fidelity | Revision verification checklist + residual issues | Medium | "check revisions", "verification review" |
| academic-paper-reviewer | `quick` | Fidelity | Journal-Fit Reviewer quick assessment + key issues list | Low | "quick review", "quick look" |
| academic-paper-reviewer | `methodology-focus` | Fidelity | In-depth methodology review | Medium | "check methodology", "focus on methods" |
| academic-paper-reviewer | `guided` | Originality | Socratic issue-by-issue dialogue | Very High | "guide me to improve", "walk me through issues" |
| academic-paper-reviewer | `calibration` | Fidelity | Explicit 3-paper directional readout or default full Calibration Report + tier-scoped disclosure | Medium | "calibrate reviewer", "measure reviewer accuracy" |
| academic-pipeline | `(pipeline)` | Balanced | 10-stage orchestrated workflow | Very High | "academic pipeline", "research to paper", "full paper workflow" |
| academic-pipeline | `resume_from_passport=<hash>` | Fidelity | Resume a prior pipeline run from a Material Passport reset boundary. Opt-in (`ARS_PASSPORT_RESET=1`). See `academic-pipeline/references/passport_as_reset_boundary.md`. | High | "resume from passport", "continue pipeline from reset boundary" |
| sr-screener | `protocol` | Fidelity | `screening_protocol.md` + `screening_config.json`, confirmed by the user | Very High | "turn my proposal into a screening protocol", "screening criteria" |
| sr-screener | `quick` | Fidelity | Decision table in chat, labelled single-reviewer triage | Medium | "is this abstract eligible", "screen these abstracts" |
| sr-screener | `pilot` | Fidelity | Calibration report (seeds, agreement, conflicts) + agreed protocol clarifications | High | "pilot the screening", "calibrate screening" |
| sr-screener | `ta-screen` | Fidelity | Dual-review title/abstract decisions, screening log, RIS groups, PRISMA counts, methods draft | High | "title/abstract screening", "screen these papers" |
| sr-screener | `ft-screen` | Fidelity | Full-text decisions with one reason per exclusion (page and section) | High | "full-text screening", "full-text eligibility" |
| sr-screener | `adjudicate` | Fidelity | Advisory third-reviewer suggestions for a human screening set's conflicts | Medium | "resolve screening conflicts", "adjudicate Rayyan conflicts" |
| sr-screener | `audit` | Fidelity | Exclusions a senior reviewer would advance, advisory | Medium | "audit my exclusions", "double-check excluded records" |
| sr-screener | `report` | Fidelity | PRISMA 2020 counts, methods draft, RIS exports, `literature_corpus[]` handoff | Medium | "PRISMA flow numbers", "methods paragraph for the screening" |

## Impact Mapping

Detailed per-mode upstream instruction lists and converted graph nodes are embedded in
`audits/arsu/v3.24.4-23807f9/artifacts/arsu-mode-capability-review.html`; the matching audit is
`audits/arsu/v3.24.4-23807f9/artifacts/arsu-mode-graph-match-assessment.html`. This record freezes their hashes in the
manifest so any regeneration is auditable.

## Decisions

- [x] 以 `v3.24.4 @ 23807f987024f2e038d12fd9e4e5d2a7cc228674` 作为当前锚点。
- [x] extraction index 固定为 131 artifacts。
- [x] capability package 命名采用 kebab-case，并由 manifest/registry schema 强制。
- [x] 上游 phase/orchestration 文本只进入审计与分析，不进入 capability SKILL 节点内指令。
