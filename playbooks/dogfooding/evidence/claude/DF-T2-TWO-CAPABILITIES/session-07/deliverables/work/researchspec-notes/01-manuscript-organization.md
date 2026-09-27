# Review Response — Step 1: Materials Organization

- Date: 2026-09-27
- Scope: organize the supplied manuscript and reviewer-response materials before any atomization
- Inputs read:
  - `benchmark/partial-manuscript.md`
  - `benchmark/review-comments.md`
  - `benchmark/revision-context.md`
  - `benchmark/claims.yaml`
  - `benchmark/sources.yaml`
  - `benchmark/goal.md`
- Output of this step: structured view of the entry. Step 2 will atomize reviewer comments against this view.

> All materials carry a `TEST FIXTURE — NOT A REAL …` banner. Synthetic content only; do not propagate as real citations.

---

## 1. Entry shape and project stance

- Manuscript type: short synthetic evidence piece (working title "Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits").
- Author stance (`revision-context.md`): accepts comments 1, 2, 4; for comment 3 wants to preserve the policy-clarity idea but relabel it as a hypothesis and remove causal wording. Comments 5 and 6 are not addressed in the author stance.
- Hard scope rules (`goal.md`):
  - use only the supplied synthetic materials;
  - keep observation / interpretation / unknown clearly separated;
  - do not fabricate participants, effect sizes, references, or ethics approval;
  - any change to research scope or claim strength must go back to the user first.

These rules bound every later decision in Step 2.

---

## 2. Manuscript section hierarchy

Sections are derived from the partial manuscript and the missing-sections list it already declares. Each section is labelled by function so later comment-to-location mapping is mechanical.

| # | Section | Function | State | Notes |
|---|---------|----------|-------|-------|
| 1 | Title | identification | present | working title only |
| 2 | Abstract / opener | synthesis, claim strength | **missing** | not in `partial-manuscript.md`; required for placement of synthetic-evidence notice (reviewer comment 1) |
| 3 | Introduction | problem definition | present (one short paragraph) | explicit but thin; should carry the synthetic-evidence framing per comment 1 |
| 4 | Methods and evidence-selection limitations | method stance | **missing** | explicitly listed as missing in partial manuscript; required by comment 4 |
| 5 | Preliminary findings | observation | present | two short sentences citing CLM-01; one sentence noting CLM-02 is unsupportable |
| 6 | Discussion of policy variation | interpretation | **missing** | explicitly listed as missing |
| 7 | Alternative explanations | interpretation | **missing** | explicitly listed as missing; required by comment 3 to reframe CLM-03 |
| 8 | Conclusion | synthesis, claim strength | **missing** | explicitly listed as missing; must surface limitations per comment 6 |
| 9 | Limitations (as a standalone section) | boundary | partial | limitations live inside CLM-01 wording only; comment 6 demands they also appear in the conclusion |

Structural truth: only Introduction and Preliminary findings currently exist as text. Everything else must be added. This makes the entire document a "high-risk modification area" until the missing sections are drafted.

---

## 3. Core claims and evidence links

Sourced verbatim from `claims.yaml`. Evidence links use the source IDs and kinds defined in `sources.yaml`.

| Claim ID | Wording (paraphrase of yaml) | Strength | Supporting evidence | Limits already declared |
|----------|------------------------------|----------|---------------------|-------------------------|
| CLM-01 | Structured AI use may increase visible revision activity in some introductory writing contexts. | tentative | SYN-CLASSROOM-01 | single course; revision activity ≠ writing quality |
| CLM-02 | Generative AI reduces instructor workload. | **unsupported_as_written** | SYN-INTERVIEW-02 | evidence shows time savings offset by verification work; no measured workload |
| CLM-03 | Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use. | **hypothesis_only** | SYN-SURVEY-03, SYN-POLICY-04 | materials do not directly compare policy clarity with uncertainty |

Two of three claims already carry non-trivial limits. CLM-02 and CLM-03 are the ones the reviewer attacks; CLM-01 stays as written.

---

## 4. Sources inventory

From `sources.yaml`. Each row identifies the kind, scope, finding, and intrinsic limits. These limits must travel with the claim wherever it appears.

| Source ID | Kind | Scope | Finding | Intrinsic limits |
|-----------|------|-------|---------|------------------|
| SYN-CLASSROOM-01 | classroom_observation_summary | one first-year writing course, six weeks | structured-AI users produced more outline revisions; final rubric scores varied | no comparison group; no validated improvement measure; instructor supplied all prompts |
| SYN-INTERVIEW-02 | instructor_interview_summary | five instructors at one institution | faster formative feedback offset by time checking unsupported claims | self-reported; small convenience sample; no time logs |
| SYN-SURVEY-03 | student_survey_summary | 84 voluntary responses | respondents valued rapid feedback; some unsure about permitted use and attribution | voluntary response bias; attitudes, not behavior; local policy changed during data collection |
| SYN-POLICY-04 | institutional_policy_excerpt | one synthetic university policy | course-level disclosure required; acceptable assistance left to instructors | text only; no implementation evidence; not generalizable |

All four sources are local and synthetic. The methods section must surface this collectively (comment 4) and the manuscript must say so up front (comment 1).

---

## 5. Reviewer threads (kept at original boundaries; not yet atomic)

Pulled from `review-comments.md`. Numbers are the author's original numbering. These become the raw input to Step 2.

### Editorial recommendation

- **E1**: Major revision.

### Major comments

- **M1**: "The manuscript should state that all evidence is local and synthetic before presenting findings."
- **M2**: "`CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it."
- **M3**: "The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis."
- **M4**: "Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable."

### Minor comments

- **m5**: "Use consistent terms for 'AI-assisted feedback' and 'generative AI feedback'."
- **m6**: "Make the limitations visible in the conclusion, not only in methods."

Thread numbering used in Step 2: `E1`, `M1`–`M4`, `m5`–`m6`.

---

## 6. Cross-reference: missing sections vs reviewer asks

This mapping pre-positions where each reviewer ask will land in the rewritten manuscript. It is a planning view, not a commitment yet.

| Reviewer ask | Target location | Reason |
|--------------|-----------------|--------|
| M1 (state synthetic + local before findings) | Abstract (new) + Introduction (first sentence) | abstract is the natural front matter; introduction already opens the document; comment says "before presenting findings" |
| M2 (reframe or remove CLM-02) | Preliminary findings, current CLM-02 sentence | text already says "is not supported"; reviewer requires the trade-off wording be explicit, not just the verdict |
| M3 (CLM-03 → hypothesis) | Preliminary findings + new Alternative-explanations section | the claim stays in the findings with a hypothesis label; the alternative-explanations section hosts the reasoning |
| M4 (methods + selection + causal limit) | new Methods section | section does not exist yet |
| m5 (consistent terms) | manuscript-wide sweep; flag once in Methods or Style note | terminology is a manuscript-wide property; one explicit callout suffices |
| m6 (limitations in conclusion) | new Conclusion section | section does not exist yet |

---

## 7. High-risk modification areas

Ranked by blast radius (how much downstream text changes if the area changes).

1. **Preliminary findings** — the only body section that exists. Any reframing of CLM-02 / CLM-03 happens here. Touching it forces the new Conclusion to restate the same limits.
2. **Introduction opener** — must carry the synthetic-evidence framing (M1). The single existing paragraph is short and absorbs the change cleanly.
3. **Methods section (new)** — required by M4. Sets up causal-inference boundary that all later sections must respect.
4. **Conclusion (new)** — required by M6. Must mirror the limitations language from CLM-01/CLM-02/CLM-03 plus the new methods-section limits.
5. **Alternative explanations (new)** — required by M3. Hosts the policy-clarity hypothesis.
6. **Discussion of policy variation (new)** — listed as missing in partial manuscript, but no reviewer thread targets it directly. Keep on the list; flagged as a candidate-only addition in Step 2's coverage report.

---

## 8. Open loops handed to Step 2

- The author stance does not address m5 or m6. Step 2 must surface this so the author can either confirm acceptance or reject before any drafting.
- M2 gives the author a choice ("revise … or remove"). The author stance implicitly chooses revise (the verdict in the manuscript already preserves CLM-02). Step 2 must record that choice so Step 3 (drafting) doesn't reopen it.
- The manuscript has no abstract. M1 placement choices (abstract vs introduction) are not yet decided. Step 2 should flag, not decide.
- "Discussion of policy variation" is in the partial-manuscript missing list but no reviewer thread targets it. Step 2 coverage check must flag whether to keep it on the docket or defer.

Step 2 file: `02-atomization-coverage.md`.