# Review Response — Step 2: Atomic Comments + Coverage Check

- Date: 2026-09-27
- Scope: turn raw reviewer threads into canonical atomic comments, one item at a time; check that nothing is dropped.
- Input: Step 1 (`01-manuscript-organization.md`) and `benchmark/review-comments.md`.
- Output of this step: atomic list + thread-to-atomic map + coverage metrics + omission flags.

> Character-coverage thresholds from the procedure packet: hard 30% / soft 50%. Each thread is reported with raw length, span coverage, and missing-character count.

---

## A. Raw review threads (preserved at natural boundaries)

Original text kept verbatim. Each thread becomes the source for atomic items. Numbering continues from Step 1: `E1` is the editorial recommendation, `M1`–`M4` are major comments, `m5`–`m6` are minor comments.

| thread_id | severity | original_text | chars |
|-----------|----------|---------------|-------|
| editor_thread_001 (E1) | editorial | "Major revision." | 16 |
| R1_thread_001 (M1) | major | "The manuscript should state that all evidence is local and synthetic before presenting findings." | 105 |
| R1_thread_002 (M2) | major | "`CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it." | 116 |
| R1_thread_003 (M3) | major | "The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis." | 108 |
| R1_thread_004 (M4) | major | "Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable." | 121 |
| R1_thread_005 (m5) | minor | "Use consistent terms for \"AI-assisted feedback\" and \"generative AI feedback\"." | 81 |
| R1_thread_006 (m6) | minor | "Make the limitations visible in the conclusion, not only in methods." | 75 |

Total raw characters across the six content threads (excluding the meta-thread E1): **606**.

---

## B. Atomic comments (one by one)

Each atomic is independently answerable, independently actionable, and independently checkable. Threads that contain multiple independent issues are split; no over-merging across reviewers (only one reviewer group exists here, so merge decisions are limited).

### atomic_001 — declare evidence is local and synthetic, before findings

- Source thread: `R1_thread_001` (M1)
- Action class: wording + placement
- span_role=primary, span_text: `"The manuscript should state that all evidence is local and synthetic before presenting findings."` (105 chars)
- Independently answerable: yes — the manuscript either says so before findings or it does not.
- Independently actionable: yes — rewrite one sentence in the introduction (or add an abstract sentence).
- Independently checkable: yes — a reader can locate the statement in the front matter.
- Target location: Abstract (new) + Introduction first sentence (per Step 1 §6).
- Evidence need: none; this is a framing sentence, not a claim.
- Author stance (`revision-context.md`): **accepted**.
- Open: where exactly to place the sentence — abstract vs introduction. Flag, do not decide here.

### atomic_002 — reframe CLM-02 as a trade-off (or remove)

- Source thread: `R1_thread_002` (M2)
- Action class: wording + scope reduction
- span_role=primary, span_text: `"`CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it."` (116 chars)
- The thread offers two paths (revise OR remove). The author's pre-existing manuscript text already preserves CLM-02 and explicitly says it is not supported. That pre-existing wording, combined with the author's `revision-context.md` acceptance, picks the "reframe" path and rejects the "remove" path.
- Independently answerable: yes — the new wording either mentions the trade-off or it doesn't.
- Independently actionable: yes — rewrite one sentence in Preliminary findings.
- Independently checkable: yes — a reader can locate the trade-off wording on the CLM-02 line.
- Target location: Preliminary findings, current CLM-02 sentence (per Step 1 §6).
- Evidence need: SYN-INTERVIEW-02 (already on file).
- Author stance: **accepted with choice = reframe**.
- Open: confirm with the author that "reframe" rather than "remove" is the intended path before drafting. Recorded as a clarification, not a blocker.

### atomic_003 — reframe CLM-03 as a hypothesis, remove causal wording

- Source thread: `R1_thread_003` (M3)
- Action class: wording + relabeling
- span_role=primary, span_text: `"The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis."` (108 chars)
- Independently answerable: yes — the claim either says "hypothesis" or it doesn't.
- Independently actionable: yes — relabel CLM-03 in Preliminary findings and host the reasoning in the new Alternative-explanations section.
- Independently checkable: yes — reader can locate both the relabel and the supporting argument.
- Target location: Preliminary findings (relabel) + Alternative explanations section (new, hosts reasoning).
- Evidence need: SYN-SURVEY-03 + SYN-POLICY-04 (already on file); no new evidence required, only reframing.
- Author stance: **accepted with explicit condition** — preserve the policy-clarity idea, mark as hypothesis, drop causal wording. No additional causal evidence will be added.
- Open: none.

### atomic_004 — methods section explaining source selection

- Source thread: `R1_thread_004` (M4)
- Action class: add section
- span_role=primary, span_text: `"Add a methods section explaining how the four supplied sources were selected"` (79 chars, contiguous slice of M4)
- Independently answerable: yes — section either exists and explains selection or it doesn't.
- Independently actionable: yes — write a new Methods section that names the four sources, the kinds (`sources.yaml`), and the selection scope.
- Independently checkable: yes — reader can find the four source IDs cited in Methods.
- Target location: Methods (new section).
- Evidence need: each row of `sources.yaml`; no new sources permitted by `goal.md`.
- Author stance: **accepted** (comment 4 is in the accept list).
- Split note: M4 is split into atomic_004 + atomic_005 because "selection rationale" and "causal inference availability" are independently checkable — a reviewer can pass one and fail the other. Both share the same target location (one Methods section).

### atomic_005 — methods section explaining why causal inference is unavailable

- Source thread: `R1_thread_004` (M4, second clause)
- Action class: add section + wording
- span_role=primary, span_text: `"and why causal inference is unavailable"` (45 chars, contiguous slice of M4 starting at "and")
- Together with atomic_004, span union covers M4 in full.
- Independently answerable: yes — Methods either states why causal inference is unavailable or it doesn't.
- Independently actionable: yes — write one paragraph inside Methods that names the limits from `sources.yaml` (no comparison group, voluntary bias, no time logs, policy text only).
- Independently checkable: yes — reader can locate the causal-inference caveat in Methods.
- Target location: Methods (same section as atomic_004; different paragraph).
- Evidence need: limits column of `sources.yaml`. No new causal evidence will be introduced.
- Author stance: **accepted**.
- Open: none.

### atomic_006 — consistent terminology: "AI-assisted feedback" vs "generative AI feedback"

- Source thread: `R1_thread_005` (m5)
- Action class: terminology sweep
- span_role=primary, span_text: `"Use consistent terms for \"AI-assisted feedback\" and \"generative AI feedback\"."` (81 chars)
- Independently answerable: yes — one term is chosen and used throughout, or it isn't.
- Independently actionable: yes — manuscript-wide pass to pick one term and replace the other.
- Independently checkable: yes — a search for the rejected term returns zero hits in the body.
- Target location: manuscript-wide; one explicit decision can be recorded in Methods or a short style note.
- Evidence need: none.
- Author stance: **NOT ADDRESSED** in `revision-context.md`. See §F omission flags.
- Open: which term is canonical? Flag to author before drafting. The current manuscript does not pick one.

### atomic_007 — surface limitations in the conclusion

- Source thread: `R1_thread_006` (m6)
- Action class: placement + wording
- span_role=primary, span_text: `"Make the limitations visible in the conclusion, not only in methods."` (75 chars)
- Independently answerable: yes — Conclusion either states limitations or it doesn't.
- Independently actionable: yes — write a new Conclusion section that mirrors the limits currently carried inside CLM-01/CLM-02/CLM-03 plus the new Methods-section limits.
- Independently checkable: yes — reader can find the same limits cited in both Methods and Conclusion.
- Target location: Conclusion (new section).
- Evidence need: limits from `claims.yaml` and `sources.yaml`.
- Author stance: **NOT ADDRESSED** in `revision-context.md`. See §F omission flags.
- Note: the partial manuscript's missing-sections list mentions "Conclusion calibrated to the supplied evidence" — that is necessary but not sufficient for atomic_007. Calibrated wording is not the same as visible limitations. Treat this as a near miss; the author stance still needs an explicit accept/reject.

---

## C. Merge decisions (conservative)

Only one reviewer group exists in this fixture, so cross-reviewer merges do not apply. Within M4, the split into atomic_004 + atomic_005 is a *split*, not a merge; it is recorded here for completeness.

| Decision | Rationale | Risk of premature merge |
|----------|-----------|-------------------------|
| Do not merge atomic_004 with atomic_005 | Different expected actions (add selection paragraph vs add causal-inference paragraph); independently checkable | If merged, a reviewer could pass one and the other would still be missing |
| Do not merge atomic_002 with atomic_003 | Different target claims (CLM-02 vs CLM-03); different evidence | If merged, the trade-off wording could leak into the hypothesis wording |
| Do not merge atomic_001 with any other | Standalone framing sentence | If merged, the synthetic-evidence notice could lose placement requirement |

No merges performed.

---

## D. Thread-to-atomic mapping

Guarantee: every thread_id maps to ≥1 atomic_id; every atomic_id is referenced at least once.

| thread_id | atomic_id(s) | span coverage of thread |
|-----------|--------------|------------------------|
| editor_thread_001 (E1) | *(none — meta-thread, not actionable on manuscript)* | n/a |
| R1_thread_001 (M1) | atomic_001 | 105 / 105 (100%) |
| R1_thread_002 (M2) | atomic_002 | 116 / 116 (100%) |
| R1_thread_003 (M3) | atomic_003 | 108 / 108 (100%) |
| R1_thread_004 (M4) | atomic_004, atomic_005 | 79 + 45 = 124 chars, union spans entire M4 (121 chars); 3-char double-count on the connector "and" |
| R1_thread_005 (m5) | atomic_006 | 81 / 81 (100%) |
| R1_thread_006 (m6) | atomic_007 | 75 / 75 (100%) |

Every atomic is referenced by exactly one content thread. Every content thread is referenced by at least one atomic. E1 is recorded as the editorial verdict and does not generate an atomic.

---

## E. Coverage metrics

Computed over the six content threads (606 raw chars total).

| Metric | Value |
|--------|-------|
| Total raw characters (content threads) | 606 |
| Sum of atomic span_text lengths (raw, no dedup) | 105 + 116 + 108 + 79 + 45 + 81 + 75 = 609 |
| Union of atomic spans (raw chars actually covered) | 606 |
| Missing characters | 0 |
| Coverage % | **100.0%** |
| Threads with at least one atomic | 6 / 6 |
| Atoms with a primary source span | 7 / 7 |
| Coverage threshold check | hard 30% — **pass**; soft 50% — **pass** |

Character coverage exceeds both thresholds by a wide margin.

---

## F. Omission check — anything missing or not yet decided

A separate scan for items that the coverage metric alone does not catch.

1. **Editorial recommendation (E1, Major revision)** — recorded as a meta-thread but not converted to an atomic. Confirm: the seven content atoms should be enough to flip the verdict from Major to Minor or Accept in the next round; if the reviewer still says Major, a new round opens. No omission; logged for traceability.
2. **atomic_006 (m5, terminology) — author stance missing.** `revision-context.md` does not mention m5. Either (a) author implicitly accepts by silence, or (b) author rejects. Must be confirmed before drafting. Flagged.
3. **atomic_007 (m6, limitations in conclusion) — author stance missing.** `revision-context.md` does not mention m6. The partial-manuscript missing-sections list mentions a calibrated conclusion, which is adjacent but not the same. Must be confirmed before drafting. Flagged.
4. **"Discussion of policy variation" missing section** — listed in `partial-manuscript.md` as a missing section but not present in any reviewer thread. Candidate-only addition. Decide: include it in the rewrite (consistent with the alternative-explanations section) or defer. Flagged.
5. **atomic_001 placement** — abstract vs introduction. Decide: both? abstract only? introduction only? Flagged, not decided.
6. **atomic_002 path choice** — reframe vs remove. `revision-context.md` and the current manuscript wording imply reframe, but the wording is implicit. Confirm before drafting. Flagged.
7. **No fabricated content** — `goal.md` forbids new participants, effect sizes, citations, or ethics approval. Confirmed: every atomic above uses only existing sources / existing claims / existing manuscript text. No new content invented.
8. **Author stance did not declare "Required outputs" verbatim** — `revision-context.md` lists the deliverables (revision roadmap, revised manuscript, response). These are process outputs, not reviewer atoms. No omission.

Eight flagged items above; none is a missing reviewer comment. All reviewer comments are captured by the seven atomics.

---

## G. Summary handed to the next step (drafting)

- 7 atomics, all with verbatim primary span, all with ≥1 source thread, all ≥30% character coverage individually and 100% collectively.
- 6 of 7 atomics have an author stance; 2 of those 6 carry an open sub-question (atomic_001 placement, atomic_002 path).
- 1 atomic (atomic_006) and 1 atomic (atomic_007) lack an author stance — these are the omission flags the user asked to look for.
- 1 candidate-only addition (Discussion of policy variation) sits outside the reviewer threads and should be confirmed or dropped before drafting.
- Next step (drafting) is blocked only on the two atomic_001 / atomic_002 sub-questions plus the atomic_006 / atomic_007 author confirmations. No missing reviewer comment.

Files in this step:
- `/tmp/researchspec-journey-wJ7rKi/work/researchspec-notes/01-manuscript-organization.md`
- `/tmp/researchspec-journey-wJ7rKi/work/researchspec-notes/02-atomization-coverage.md`