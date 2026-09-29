# ARSU Anchor Analysis — v3.21.1-127ff85

- generated: 2026-09-29T10:45:05.655Z
- upstream: https://github.com/Imbad0202/academic-research-skills @ v3.21.1 (127ff85e4bbfcdd10b95040537b6c6bd7ad17aeb)
- maintenance skill SHA-256: `b0097664e5eebf76a5af772f4cef4beab9434314ce87a128adb5fa7adaada590`

## Upstream Inventory

- total files: 2580
- tree SHA-256: `ad2bfe110775737c12062aee4187f0e11d18c4b30206f26df74f0b2cecb863ec`
- agents: 39 · references: 102 · templates: 22

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
| README.ja-JP.md | 1 |
| README.ko-KR.md | 1 |
| README.md | 1 |
| README.zh-CN.md | 1 |
| README.zh-TW.md | 1 |
| SECURITY.md | 1 |
| THIRD_PARTY.md | 1 |
| academic-paper | 63 |
| academic-paper-reviewer | 28 |
| academic-pipeline | 30 |
| agents | 3 |
| audits | 13 |
| commands | 16 |
| deep-research | 53 |
| docs | 117 |
| evals | 1103 |
| examples | 45 |
| hooks | 2 |
| package.json | 1 |
| pi | 4 |
| pyproject.toml | 1 |
| requirements-dev.txt | 1 |
| requirements-pdf-content-classifier.txt | 1 |
| scripts | 597 |
| shared | 148 |
| tests | 305 |
| tools | 6 |

| extension | files |
|---|---|
| (none) | 11 |
| .bib | 7 |
| .cff | 1 |
| .empty | 1 |
| .html | 8 |
| .jq | 5 |
| .js | 1 |
| .json | 558 |
| .jsonl | 15 |
| .log | 302 |
| .md | 977 |
| .mjs | 1 |
| .pdf | 16 |
| .py | 428 |
| .sh | 8 |
| .stderr | 1 |
| .tex | 3 |
| .toml | 4 |
| .txt | 32 |
| .xml | 2 |
| .yaml | 184 |
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
| `revision-coach` | Balanced | Reviewer path: Revision Roadmap + Response Letter Skeleton. Explicit real-committee variant: source-accounted concern tracker + placeholder response skeleton | Medium | "parse reviews", "I got reviewer comments", "track these committee comments" |
| `abstract-only` | Fidelity | Bilingual abstract (zh-TW + EN) + keywords | Medium | "write abstract" |
| `lit-review` | Fidelity | Annotated bibliography in paper format | Medium | "literature review paper", "write a lit review" |
| `format-convert` | Fidelity | Formatted document (LaTeX/DOCX-via-Pandoc/PDF/MD) | Low | "convert to LaTeX", "convert citations to [format]" |
| `citation-check` | Fidelity | Citation error report | Low | "check citations", "verify references" |
| `disclosure` | Fidelity | Default venue path: applicability/status bundle; policy-anchor path: anchor-specific render | Low | "AI disclosure for [venue]", "generate AI usage statement" |
| `rebuttal-audit` | Fidelity | Advisory QA of an existing rebuttal draft (per-comment coverage + gaps + risk flags); no generation; no Schema 11 emission | Low | "audit my response", "check my rebuttal", "did I miss any reviewer comment" |
| `full` | Balanced | 5 review reports + Editorial Decision + Revision Roadmap | High | "review paper", "peer review", "manuscript review" |
| `re-review` | Fidelity | Revision verification checklist + residual issues | Medium | "check revisions", "verification review" |
| `quick` | Fidelity | Journal-Fit Reviewer quick assessment + key issues list | Low | "quick review", "quick look" |
| `methodology-focus` | Fidelity | In-depth methodology review | Medium | "check methodology", "focus on methods" |
| `guided` | Originality | Socratic issue-by-issue dialogue | Very High | "guide me to improve", "walk me through issues" |
| `calibration` | Fidelity | Explicit 3-paper directional readout or default full Calibration Report + tier-scoped disclosure | Medium | "calibrate reviewer", "measure reviewer accuracy" |
| `resume_from_passport=<hash>` | Fidelity | Resume a prior pipeline run from a Material Passport reset boundary. Opt-in (`ARS_PASSPORT_RESET=1`). See `academic-pipeline/references/passport_as_reset_boundary.md`. | High | "resume from passport", "continue pipeline from reset boundary" |

## Impact Mapping

Detailed per-mode upstream instruction lists and converted graph nodes are embedded in
`audits/arsu/v3.21.1-127ff85/artifacts/arsu-mode-capability-review.html`; the matching audit is
`audits/arsu/v3.21.1-127ff85/artifacts/arsu-mode-graph-match-assessment.html`. This record freezes their hashes in the
manifest so any regeneration is auditable.

## Decisions

- [x] 以 `v3.21.1 @ 127ff85e4bbfcdd10b95040537b6c6bd7ad17aeb` 作为当前锚点。
- [x] extraction index 固定为 119 artifacts。
- [x] capability package 命名采用 kebab-case，并由 manifest/registry schema 强制。
- [x] 上游 phase/orchestration 文本只进入审计与分析，不进入 capability SKILL 节点内指令。
