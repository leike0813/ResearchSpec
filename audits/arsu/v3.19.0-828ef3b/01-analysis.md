# ARSU Anchor Analysis — v3.19.0-828ef3b

- generated: 2026-08-25T07:39:23.598Z
- upstream: https://github.com/Imbad0202/academic-research-skills @ v3.19.0 (828ef3b613b0e8b91830da3328a1e33d4eb5ab4c)
- maintenance skill SHA-256: `3a3d57eadd2d21e413fc34bfcd9dc928ec961affe7c403cb26cd3f23046f8f61`

## Upstream Inventory

- total files: 1121
- tree SHA-256: `ea01623b69e9ee35f82135675961a3d6cfa6e686fb3c6230e4876034ecebbd81`
- agents: 39 · references: 90 · templates: 22

| top-level area | files |
|---|---|
| .claude | 2 |
| .claude-plugin | 2 |
| .command-invariants.toml | 1 |
| .git | 1 |
| .gitattributes | 1 |
| .github | 17 |
| .gitignore | 1 |
| .gitleaks.toml | 1 |
| CHANGELOG.md | 1 |
| CITATION.cff | 1 |
| CONTRIBUTING.md | 1 |
| LICENSE | 1 |
| MODE_REGISTRY.md | 1 |
| NOTICE.md | 1 |
| POSITIONING.md | 1 |
| QUICKSTART.md | 1 |
| README.ja-JP.md | 1 |
| README.ko-KR.md | 1 |
| README.md | 1 |
| README.zh-CN.md | 1 |
| README.zh-TW.md | 1 |
| SECURITY.md | 1 |
| THIRD_PARTY.md | 1 |
| academic-paper | 62 |
| academic-paper-reviewer | 26 |
| academic-pipeline | 30 |
| agents | 3 |
| audits | 6 |
| commands | 16 |
| deep-research | 52 |
| docs | 83 |
| evals | 75 |
| examples | 21 |
| hooks | 2 |
| pyproject.toml | 1 |
| requirements-dev.txt | 1 |
| scripts | 331 |
| shared | 60 |
| tests | 305 |
| tools | 6 |

| extension | files |
|---|---|
| (none) | 9 |
| .bib | 7 |
| .cff | 1 |
| .html | 6 |
| .jq | 5 |
| .json | 145 |
| .jsonl | 4 |
| .md | 460 |
| .pdf | 16 |
| .py | 249 |
| .sh | 6 |
| .tex | 2 |
| .toml | 4 |
| .txt | 7 |
| .xml | 2 |
| .yaml | 183 |
| .yml | 15 |

## Mode Registry (26 rows)

| mode | spectrum | output | oversight | triggers |
|---|---|---|---|---|
| `full` | Balanced | APA 7.0 report, 3,000-8,000 words | High | "research [topic]", "deep research", "academic analysis" |
| `quick` | Fidelity | Research brief, 500-1,500 words | Medium | "quick brief", "30 minute summary", "quick research" |
| `review` | Balanced | Reviewer report on provided text | High | "review this paper", "evaluate this paper", "assess this source" |
| `lit-review` | Fidelity | Annotated bibliography + synthesis | Medium | "literature review", "annotated bibliography" |
| `three-way-scan` | Fidelity | WHY/HOW/WHAT paper shortlist + cross-paper synthesis | Low | "WHY HOW WHAT papers", "3W literature scan", "compare these papers" |
| `fact-check` | Fidelity | Claim-by-claim verification report | Medium | "verify claims", "fact-check", "evidence verification" |
| `socratic` | Originality | Research Plan Summary + INSIGHT collection | Very High | "guide my research", "help me think through", "I'm not sure what to research" |
| `systematic-review` | Fidelity | PRISMA 2020 report, 5,000-15,000 words | Medium | "systematic review", "meta-analysis", "PRISMA" |
| `full` | Balanced | Complete paper draft (IMRaD or domain-appropriate) | High | "write a paper", "academic paper", "research paper" |
| `plan` | Originality | Chapter Plan + INSIGHT collection (Socratic) | Very High | "guide my paper", "help me plan", "step by step paper" |
| `outline-only` | Balanced | Detailed outline + evidence map | High | "paper outline", "just need an outline" |
| `revision` | Fidelity | Revised draft + point-by-point R&R responses | High | "revise paper", "incorporate reviewer feedback" |
| `revision-coach` | Balanced | Revision Roadmap + Response Letter Skeleton | Medium | "parse reviews", "I got reviewer comments" |
| `abstract-only` | Fidelity | Bilingual abstract (zh-TW + EN) + keywords | Medium | "write abstract" |
| `lit-review` | Fidelity | Annotated bibliography in paper format | Medium | "literature review paper", "write a lit review" |
| `format-convert` | Fidelity | Formatted document (LaTeX/DOCX-via-Pandoc/PDF/MD) | Low | "convert to LaTeX", "convert citations to [format]" |
| `citation-check` | Fidelity | Citation error report | Low | "check citations", "verify references" |
| `disclosure` | Fidelity | Venue-specific AI-usage disclosure statement | Low | "AI disclosure for [venue]", "generate AI usage statement" |
| `rebuttal-audit` | Fidelity | Advisory QA of an existing rebuttal draft (per-comment coverage + gaps + risk flags); no generation; no Schema 11 emission | Low | "audit my response", "check my rebuttal", "did I miss any reviewer comment" |
| `full` | Balanced | 5 review reports + Editorial Decision + Revision Roadmap | High | "review paper", "peer review", "manuscript review" |
| `re-review` | Fidelity | Revision verification checklist + residual issues | Medium | "check revisions", "verification review" |
| `quick` | Fidelity | EIC quick assessment + key issues list | Low | "quick review", "quick look" |
| `methodology-focus` | Fidelity | In-depth methodology review | Medium | "check methodology", "focus on methods" |
| `guided` | Originality | Socratic issue-by-issue dialogue | Very High | "guide me to improve", "walk me through issues" |
| `calibration` | Fidelity | Calibration Report (FNR/FPR/AUC) + confidence disclosure | Medium | "calibrate reviewer", "measure reviewer accuracy" |
| `resume_from_passport=<hash>` | Fidelity | Resume a prior pipeline run from a Material Passport reset boundary. Opt-in (`ARS_PASSPORT_RESET=1`). See `academic-pipeline/references/passport_as_reset_boundary.md`. | High | "resume from passport", "continue pipeline from reset boundary" |

## Impact Mapping

Detailed per-mode upstream instruction lists and converted graph nodes are embedded in
`audits/arsu/v3.19.0-828ef3b/artifacts/arsu-mode-capability-review.html`; the matching audit is
`audits/arsu/v3.19.0-828ef3b/artifacts/arsu-mode-graph-match-assessment.html`. This record freezes their hashes in the
manifest so any regeneration is auditable.

## Decisions

- [x] 以 `v3.19.0 @ 828ef3b613b0e8b91830da3328a1e33d4eb5ab4c` 作为当前锚点。
- [x] extraction index 固定为 119 artifacts。
- [x] capability package 命名采用 kebab-case，并由 manifest/registry schema 强制。
- [x] 上游 phase/orchestration 文本只进入审计与分析，不进入 capability SKILL 节点内指令。
