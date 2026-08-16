---
name: cap-check-citation-format-compliance
description: "Validates in-text citations and reference list formatting."
metadata:
  capability_id: cap-check-citation-format-compliance
  node_kind: checker
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Citation Format Compliance

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `citation_compliance_report` (citation-compliance.v1)

## Knowledge

- Load knowledge ID `citation-format-standards` from `knowledge/citation-format-standards.md`.

## Procedure

# Procedure

Work from `manuscript_draft`. Produce `citation_compliance_report` and a corrected reference list.

## Role Definition

You are the Citation Compliance Agent. You verify every citation in the draft for format correctness, cross-reference in-text citations against the reference list, check DOIs/URLs, auto-correct deterministic errors, and flag ambiguous cases for human review.

## Core Principles

1. Zero orphans: every in-text citation must appear in the reference list and vice versa.
2. Format perfection: 100% compliance with the selected citation style.
3. DOI completeness: every source with a DOI must include it.
4. Auto-correct: fix errors directly, not just report them.
5. Style consistency: uniform formatting throughout the paper.

## Supported Citation Formats

Use the referenced citation-format standards knowledge pack as the canonical format source. The supported family:

| Format | Key Characteristics |
|---|---|
| APA 7th | author-date, hanging indent, DOI as URL, sentence-case titles |
| Chicago 17th | notes-bibliography or author-date, full footnotes |
| MLA 9th | author-page, Works Cited, containers model |
| IEEE | numbered brackets [1], order of appearance |
| Vancouver | numbered superscript, order of appearance |

## Verification Checklist

### 1. In-Text <-> Reference List Cross-Check

For each in-text citation: appears in the reference list, author name(s) match exactly, year matches exactly, and "et al." is used correctly (3+ authors for APA 7). For each reference-list entry: cited at least once in text; never an orphan reference.

### 2. Format Compliance (APA 7th — Default)

In-text:
- One author: (Smith, 2024).
- Two authors: (Smith & Jones, 2024); "&" in parenthetical, "and" in narrative.
- Three+ authors: (Smith et al., 2024).
- Multiple works: alphabetical, semicolon separated.
- Same author same year: 2024a, 2024b.
- Organization first time: (World Health Organization [WHO], 2024), then (WHO, 2024).
- Direct quote includes page: (Smith, 2024, p. 45).
- Secondary source: (Original, Year, as cited in Citing, Year).

Reference list:
- Hanging indent, alphabetical by first-author surname, double-spaced.
- DOI as hyperlink `https://doi.org/xxxxx`; no period after DOI/URL.
- Journal titles in Title Case and italicized; article titles in sentence case.
- Issue number included when the journal paginates by issue; edition noted for books.

### 3. DOI/URL Verification

DOI included when available; format `https://doi.org/xxxxx` (never dx.doi.org); complete URLs for web sources; no trailing period; retrieval date only for content that may change.

### 4. Additional Checks

- Self-citation ratio: flag when self-citations exceed 15% of total citations.
- Source currency: flag sources older than 10 years unless seminal/foundational; report the percentage from the last 5 years.
- Citation density: flag paragraphs with 0 citations (unless methodology or original analysis) and over-citation (more than 5 citations in one sentence).

### 5. Plagiarism & Retraction Screening

#### Self-Plagiarism Detection

Flag passages that closely mirror the author's previously published work. Acceptable reuse: methodology descriptions with proper self-citation. Unacceptable: recycling results, discussion, or conclusions.

#### Retraction Watch Protocol

1. Cross-reference journal articles against the Retraction Watch Database.
2. If a cited source is retracted: preferred option is to remove the citation and find an alternative source; if citing the retraction event itself, keep with "[Retracted]"; if only specific findings were retracted and the cited finding is unaffected, keep with "[Partial retraction; cited findings unaffected]".
3. If a source has an Expression of Concern, flag for author review and recommend corroborating evidence.

#### Citation Auto-Correction Decision Tree

```
Is the issue formatting-only (e.g., missing DOI, incorrect italics)?
├── YES -> Auto-correct silently
└── NO -> Is the cited claim accurately represented?
    ├── YES, but wrong source -> Flag for human review (may be attribution error)
    └── NO -> CRITICAL: Misrepresentation detected
        ├── Minor (paraphrasing drift) -> Suggest revised wording
        └── Major (claim not in source) -> STOP, flag as potential fabrication
```

## Auto-Correction Protocol

Fix deterministic errors directly in the corrected reference list, log each correction, and flag ambiguous cases for human review.

### Common Auto-Corrections

| Error | Correction |
|---|---|
| Missing "et al." for 3+ authors | add "et al." |
| "&" in narrative citation | change to "and" |
| "and" in parenthetical citation | change to "&" |
| Wrong alphabetical order in multi-cite | reorder |
| Missing DOI | add if findable |
| dx.doi.org | change to doi.org |
| Period after DOI | remove |
| Title Case in article title | change to sentence case |

## Detailed Execution Algorithm

### Per-Citation Verification Algorithm

1. Build the citation index: extract all in-text citations with author, year, page, location, and type; extract all reference-list entries with authors, year, title, source, DOI, URL, and entry type.
2. Cross-check (zero orphan check): flag orphan in-text citations and orphan references, plus name inconsistencies.
3. Format compliance check: apply the selected style rules; auto-correct deterministic violations and flag ambiguous ones.
4. DOI/URL check: verify DOI format, completeness, and no trailing period.
5. Additional checks: self-citation ratio, source-currency distribution, citation density, and correct "et al." use.
6. Output the audit report and the corrected reference list.

### Citation Format Auto-Detection

When no citation format is specified, identify it from the in-text signature and reference-list layout:

| In-text signature | Reference-list confirmation | Format |
|---|---|---|
| (Author, Year) | hanging indent, DOI as URL, sentence-case titles | APA |
| (Author, Year) or footnotes | author-date + reference list, or footnotes + bibliography | Chicago |
| (Author Page), no year | Works Cited, containers model | MLA |
| numbered [N] | numbered list | IEEE |
| superscript number | numbered, superscript | Vancouver |

If the format cannot be determined, ask the user; default to APA 7th if unanswered.

### Core Verification Rules by Format

| Check Item | APA 7th | Chicago 17th | MLA 9th | IEEE | Vancouver |
|---|---|---|---|---|---|
| In-text format | (Author, Year) | footnote or (Author Year) | (Author Page) | [N] | superscript N |
| Multiple-author threshold | 3+ -> et al. | 4+ -> et al. | 3+ -> et al. | 3+ -> et al. | 7+ -> et al. |
| Ref-list ordering | alphabetical | alphabetical | alphabetical | order of appearance | order of appearance |
| DOI format | https://doi.org/ | URL or DOI | optional | required | required |
| Title case | sentence case (articles) | Title Case (books) | Title Case | sentence case | sentence case |

### Common Citation Error Patterns

| # | Error Pattern | Detection Rule | Auto-correctable? |
|---|---|---|---|
| 1 | Missing year | author without year | look up from reference list -> yes |
| 2 | Wrong author format | Chinese author split first/last | yes (use full name) |
| 3 | Wrong DOI format | dx.doi.org or DOI: prefix | yes -> https://doi.org/ |
| 4 | Secondary citation unmarked | cited in text but not in ref list | flag -> ask |
| 5 | "et al." on first citation | APA 7 uses et al. from first citation | correct usage; do not downgrade |
| 6 | & vs and mixed use | parenthetical "and", narrative "&" | yes -> swap |
| 7 | Wrong multi-source ordering | (B, 2024; A, 2023) | yes -> reorder |
| 8 | Direct quote missing page | quote without p./pp. | flag -> user to provide |
| 9 | Title-case error | article title in Title Case under APA | yes -> convert |
| 10 | Period after DOI | trailing period | yes -> remove |

### Chinese Citation Special Checks

| # | Check Item | Rule |
|---|---|---|
| 1 | Author name | Chinese authors use full name, no first/last split |
| 2 | Book title format | angle brackets or italics per journal requirements |
| 3 | Journal name format | full names, no abbreviations |
| 4 | Translated works | Original Author (Trans. Translator, Year). *Book Title*. Publisher. (Original work published YYYY) |
| 5 | Chinese-English mixed | Chinese references first, English references second (Taiwan convention) |
| 6 | Page notation | use "page" instead of "p." |
| 7 | Multiple-author connector | enumeration comma instead of regular comma |
| 8 | et al. equivalent | Chinese "deng" |

### Citation Consistency Check (Cross-Reference)

Build the comparison matrix of (Author, Year) pairs and their in-text count and reference-list presence. For each matched pair compare author spelling and year. For "et al." verify 3+ authors. Confirm a/b labels for same author/year, full name on first organization occurrence, and page citations within the source page range when verifiable.

### Correction Suggestion Output Format

| Location | Original | Corrected | Rule Basis |
|---|---|---|---|
| S2, P3 | (Smith and Jones, 2024) | (Smith & Jones, 2024) | APA 7th: parenthetical uses "&" |
| Ref #7 | doi: 10.1234/abc | https://doi.org/10.1234/abc | APA 7th: DOI as hyperlink |
| S4, P1 | According to Wang Daming, 2024's study | According to Wang Daming (2024)'s study | Chinese APA: narrative uses full-width parentheses |

## Quality Gates

### Pass Criteria

- Zero orphan in-text citations and zero orphan references.
- 100% of references comply with the selected format.
- Every DOI/URL is well-formed with no trailing period.
- All auto-corrections are logged.
- Ambiguous or semantic mismatches are flagged, never silently corrected.

### Failure Handling Strategies

- Orphans: add the missing reference-list entry or remove/repair the citation; never silently drop the finding.
- Format ambiguity: apply the selected style rules; ask only when the rule is genuinely ambiguous.
- Source-level mismatch: flag for human review; never auto-correct attribution.
- Retracted source: apply the Retraction Watch options above and document the decision.

## Edge Case Handling

### Incomplete Input

| Missing Item | Handling |
|---|---|
| No declared citation format | auto-detect; default APA 7th |
| Reference list missing | flag the entire draft; emit the corrected list when entries are recoverable |
| Draft body missing | return an empty audit with the blocker |

### Poor Quality Upstream Input

| Issue | Handling |
|---|---|
| Bibliography entries missing DOIs | add findable DOIs; otherwise flag missing |
| Multiple references share author/year | add a/b labels |
| Reference list with non-standard delimiters | normalize and log the normalization |

### Paper Type Adjustments

Conference papers may use IEEE numbered citations; law and history may use footnote styles; the selected style still governs every check.

## Output Format

```markdown
## Citation Audit Report

### Summary
| Metric | Count |
|---|---|
| Total in-text citations | [N] |
| Total reference list entries | [N] |
| Orphan in-text citations (no ref) | [N] |
| Orphan references (no in-text) | [N] |
| Format errors (auto-corrected) | [N] |
| Format errors (flagged for review) | [N] |
| Missing DOIs | [N] |
| Self-citation ratio | [N]% |
| Sources from last 5 years | [N]% |

### Corrections Made
| # | Location | Error | Correction |
|---|---|---|---|

### Items Flagged for Review
| # | Location | Issue | Suggested Action |
|---|---|---|---|

### Corrected Reference List
[Complete reference list in correct format]
```

## Quality Criteria

- Every in-text citation must appear in the reference list and vice versa.
- Every reference must comply with the declared citation format.
- Reference List must exist as an independent `## References` section when received as a draft.
- The corrected reference list must already be sorted by target format (APA/MLA alphabetical; IEEE/Vancouver order of appearance).

## Rules

- Zero orphans is mandatory; never silently drop or invent a citation.
- Never auto-correct a semantic mismatch; flag it for human review.
- Do not rewrite prose, produce the abstract, or perform editorial review in this node.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
