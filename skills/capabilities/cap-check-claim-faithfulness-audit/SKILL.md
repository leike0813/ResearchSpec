---
name: cap-check-claim-faithfulness-audit
description: "LLM-as-judge claim-source alignment audit."
metadata:
  capability_id: cap-check-claim-faithfulness-audit
  node_kind: checker
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Claim Faithfulness Audit

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `claim_audit_report` (claim-audit.v1)

## Knowledge

- Load knowledge ID `claim-audit-calibration` from `knowledge/claim-audit-calibration.md`.

## Procedure

# Procedure

Work from `manuscript_draft`, the resolved citation markers, `claim_intent_manifests[]`, and `literature_corpus[]`. Produce `claim_audit_report`.

## Role Definition

You are the L3 claim-faithfulness auditor. You evaluate every cited claim against the retrieved text of the cited reference, then route findings into the claim-audit aggregates. You audit; you do not arbitrate. You produce evidence-bound verdicts (SUPPORTED / UNSUPPORTED / AMBIGUOUS / RETRIEVAL_FAILED + defect stage) plus uncited, drift, and constraint-violation surfaces.

Experiment-backed claims are not yours to judge. A manifest claim carrying `planned_experiment_ids[]` is audited by the integrity gate, not here; never emit experiment-alignment rows and never route an experiment-only sentence into the citation path. Mixed-evidence claims get normal citation-path treatment for their cited portion.

## Audit-Side Discipline

- For each audited citation, cite the retrieved excerpt by section/page/quote in the rationale; never fabricate "the source says X" without a pointer.
- Include the specific text fragment that drove each defect-stage classification.
- Prefer AMBIGUOUS + LOW-WARN over forcing UNSUPPORTED.
- Distinguish stable access restriction (`failed` — paywall) from transient infrastructure outage (`audit_tool_failure`); never collapse them.
- Never simulate retrieval. Never claim to have read a paper the retrieval layer did not return.
- Never mutate `<!--ref:slug-->` or `<!--anchor:...-->` markers; read only.

## Differences from Integrity Verification

Integrity verification asks whether a reference exists and whether its metadata is correct. Claim-faithfulness audit asks whether the reference actually says what the draft claims. The two are complementary.

## Input contract

Read `claim_intent_manifests[]`, `literature_corpus[]`, resolved citation markers (both ref slug and anchor), and the draft sentence stream. Use the FULL uncited sentence set for constraint judging and the D4-c subset for uncited-assertion advisories. Each sentence carries `sentence_text`, `section_path`, and optional `adjacent_text`; constraint scope derives per sentence from the manifest mapping.

### Sampling behavior

When citation count exceeds `max_claims_per_paper`, emit exactly one `audit_sampling_summary` with `sampling_strategy=stratified_buckets_v1`: divide the citation list into k equal-ish buckets, pick the first index of each, sort ascending. Invariants: audited_count equals len(audited_indices); audited_count <= max and <= total; when sampled, the finalizer must emit `[CLAIM-AUDIT-SAMPLED — k/N audited]`; indices strictly ascending.

## Audit Pipeline (6 Steps)

### Step 1 — Anchor presence check

For every audited citation read the anchor. If `anchor_kind = none`, short-circuit with `RETRIEVAL_FAILED`, `audit_status=inconclusive`, `defect_stage=not_applicable`, `ref_retrieval_method=not_attempted`, and a rationale that MUST start with `v3.7.3 R-L3-1-A violation`. Skip Steps 2-6 for that citation.

### Step 2 — Reference retrieval

| ref_retrieval_method | Meaning | Next step |
|---|---|---|
| api | retrieval succeeded via DOI/API | Step 3 |
| manual_pdf | retrieval succeeded via user-uploaded PDF | Step 3 |
| failed | paywall / permanent access restriction | emit RETRIEVAL_FAILED + inconclusive + not_applicable; LOW-WARN |
| not_found | retrieval API reports reference does not exist | emit RETRIEVAL_FAILED + completed + retrieval_existence; HIGH-WARN |
| audit_tool_failure | transient outage or parse/cache corruption | emit RETRIEVAL_FAILED + inconclusive + not_applicable; rationale tagged with fault class; MED-WARN |

The discriminator between `failed` and `audit_tool_failure` is permanence.

### Step 3 — Cache lookup

After successful retrieval, compute the cache key from claim text hash, ref slug, anchor kind and value hash, retrieved excerpt hash, active constraints hash, judge model, and prompt version. Selection is scoped by `(scoped_manifest_id, claim_id)`, never bare claim_id. The prompt version is a content fingerprint; a declared-unknown version fails closed by disabling cross-run hits.

### Step 4 — Passage location

Use the anchor to locate the relevant passage inside the retrieved excerpt. Quote anchors use exact-substring match after decoding; page anchors scope to the named page(s); section and paragraph anchors scope accordingly. If quote location fails, fall back to the full excerpt with a `[anchor_quote_unlocated]` tag; never mark UNSUPPORTED on a locator miss alone.

For `manual_pdf` rows with page anchors, treat the page number as trustworthy only when the PDF preflight sidecar verdict is PASS. On missing/FAIL/UNAVAILABLE sidecars, locate by content instead and tag the rationale `[pdf_read_integrity_unverified]`.

### Step 5 — Judge invocation

Invoke the judge once per citation with the alignment question and active constraints together.

- STEP 0: decompose the claim into atomic sub-claims and judge each independently before choosing the citation-level verdict.
- Verdicts: SUPPORTED (supports every sub-claim and no constraint violated), UNSUPPORTED, AMBIGUOUS, PARTIAL (supports some but not others with no constraint violated), VIOLATED (violates an active constraint regardless of support).
- When PARTIAL, you MUST output a SUB_CLAIM_BREAKDOWN block, one line per sub-claim with `:: SUPPORTED|UNSUPPORTED|AMBIGUOUS :: evidence_pointer`.
- VIOLATED outranks PARTIAL and short-circuits alignment classification. Cited VIOLATED routes to a `claim_audit_result` row with `judgment=UNSUPPORTED`, `defect_stage=negative_constraint_violation`; uncited VIOLATED routes to `constraint_violations[]`.
- A malformed PARTIAL (missing breakdown, fewer than 2 lines, or not true-partial) is a `judge_parse_error`, routed as `audit_tool_failure`.

### Step 6 — Defect stage classification

| Judge verdict | Defect stage | When |
|---|---|---|
| SUPPORTED | null | reference directly supports the claim |
| AMBIGUOUS | source_description / citation_anchor / synthesis_overclaim / null | related but unclear |
| UNSUPPORTED | source_description | source describes a different population/method |
| UNSUPPORTED | metadata | author/year/title wrong |
| UNSUPPORTED | citation_anchor | anchor points to the wrong passage |
| UNSUPPORTED | synthesis_overclaim | draft over-strengthens the claim |
| UNSUPPORTED | negative_constraint_violation | VIOLATED on a cited claim |
| PARTIAL -> UNSUPPORTED | source_description | normalized; emits sub_claim_breakdown |
| RETRIEVAL_FAILED | retrieval_existence | not_found |
| RETRIEVAL_FAILED | not_applicable | anchor none, paywall, or tool failure |

Hint coercion: AMBIGUOUS hints outside its allowed set coerce to null; UNSUPPORTED hints outside their set coerce to source_description; VIOLATED ignores hints.

## Manifest Cross-Reference (D6)

Run a three-set diff:
- Intended = claim text across all claim-intent manifests.
- Emitted = claim text from every emitted citation in the draft, not just the audited subset. Emitted is a SET of claim_text values, so a multi-marker drifted claim produces one drift row.
- Supported = subset of audited emitted with SUPPORTED.

Diff streams:
- `EMITTED_NOT_INTENDED` -> `claim_drifts[]` LOW-WARN.
- `INTENDED_NOT_EMITTED` -> `claim_drifts[]` LOW-WARN with manifest_claim_id and scoped_manifest_id.
- Cited constraint violation -> `claim_audit_result` HIGH-WARN gate-refuse.
- Uncited constraint violation -> `constraint_violations[]` HIGH-WARN gate-refuse.

Precedence: negative-constraint violation absorbs drift within the same manifest only; `citation_anchor` is distinct from `source_description`; an uncited drifted sentence emits only into `uncited_assertions[]`.

## Uncited-Assertion Detector (D4-c)

A sentence becomes an uncited-assertion candidate when ALL THREE hold:
1. A quantifier or empirical-claim verb is present (numbers, percentages, `most`, `several`, `showed`, `demonstrated`, `observed`, `proved`, `confirmed`).
2. No ref-slug marker on the sentence or its adjacent clause.
3. Not a definitional sentence (`refers to`, `is defined as`, `we define`, `for the purposes of` are excluded).

Emit `uncited_assertions[]` LOW-WARN for candidates; constraint judging uses the FULL uncited sentence set so manifest negative constraints like "MUST NOT use causal language" are checked even when the D4-c detector filters a sentence out.

## Output Emission

Populate the six aggregates:

| Aggregate | Driver | Severity |
|---|---|---|
| claim_audit_results[] | one per audited citation | mixed, per defect-stage matrix |
| uncited_assertions[] | one per uncited-sentence finding | LOW-WARN |
| claim_drifts[] | one per manifest set-diff finding | LOW-WARN |
| constraint_violations[] | one per uncited VIOLATED finding | HIGH-WARN gate-refuse |
| audit_sampling_summaries[] | zero or one per run | annotation |
| uncited_audit_failures[] | one per uncited sentence x manifest judge failure | MED-WARN |

## Output Format

```markdown
## Claim Faithfulness Audit

- audited_count / total_citation_count: [k/N]
- sampling: [none | stratified_buckets_v1]
- aggregates: [claim_audit_results[], uncited_assertions[], claim_drifts[], constraint_violations[], audit_sampling_summaries[], uncited_audit_failures[]]

### Claim Audit Results
| claim_id | ref_slug | judgment | audit_status | defect_stage | ref_retrieval_method | rationale |
|---|---|---|---|---|---|---|

### Uncited Assertions
| sentence_id | section_path | trigger | rationale |
|---|---|---|---|

### Claim Drifts
| drift_kind | claim_text | manifest_claim_id | section_path |
|---|---|---|---|

### Constraint Violations
| constraint_id | sentence_id | rationale | scoped_manifest_id |
|---|---|---|---|

### Sampling Summary
[sampling_strategy and audited_indices, when sampled]

### Defect-Stage Histogram
[appendix histogram when at least 5 completed entries exist]
```

## Calibration Mode

When a gold-set path is configured, assert three tiers:
- T-C1: FNR < 0.15 AND FPR < 0.10 against the synthetic gold set; failure blocks merge.
- T-C2: FNR/FPR computed and surfaced per judgment class.
- T-C3: gold-set shape integrity; tuples must be `alignment` or `constraint` with the required conditional shape; NOT_VIOLATED constraint tuples MUST appear at least 3 times.

## Error Handling

| Surface | Aggregate / method | Rationale tag | Severity |
|---|---|---|---|
| Paywall / access restriction | claim_audit_results[] with failed | paywall detail | LOW-WARN |
| Transient outage on cited path | claim_audit_results[] with audit_tool_failure | fault class + detail | MED-WARN |
| Transient outage on uncited path | uncited_audit_failures[] | fault class + detail | MED-WARN |
| Fabricated reference | claim_audit_results[] with not_found | suspected fabrication | HIGH-WARN gate-refuse |

## Rules

- Never treat RETRIEVAL_FAILED as SUPPORTED.
- Never simulate retrieval or claim to have read unretrieved text.
- Never mutate citation or anchor markers.
- Do not judge experiment-backed claims and do not decide whether the paper passes.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
