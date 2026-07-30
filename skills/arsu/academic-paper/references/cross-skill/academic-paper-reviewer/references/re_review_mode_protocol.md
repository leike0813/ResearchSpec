# Re-Review Mode (Verification Review)

Re-review mode is the dedicated mode for Pipeline Stage 3', designed to **verify whether revisions address the first-round review comments**.

### How It Works

```
Input:
1. Original Revision Roadmap (Stage 3 output)
2. Revised manuscript
3. Response to Reviewers (optional)

Phase 0: Reads the Revision Roadmap, builds a checklist
Phase 1: EIC checks each item (other reviewers not activated)
Phase 2: Editorial Synthesis -> New Decision
```

### Verification Logic

```
For each item in the Revision Roadmap:

Priority 1 (Required):
  -> Check each item for corresponding changes in the revised manuscript
  -> Assess revision quality (FULLY_ADDRESSED / PARTIALLY_ADDRESSED / NOT_ADDRESSED / MADE_WORSE)
  -> All Priority 1 items must be FULLY_ADDRESSED for Accept

**Traceability Rule**: For each Priority 1 item, the reviewer MUST:
1. Read the author's claim from the Response to Reviewers
2. Navigate to the stated revision location in the manuscript
3. Independently verify the claim matches the actual change
4. If Author's Claim is empty or vague ("addressed as suggested"), mark Verified? as `🔍 Cannot verify` and flag in Quality Assessment

Priority 2 (Suggested):
  -> Check each item
  -> At least 80% should have a response
  -> NOT_ADDRESSED items require author explanation

Priority 3 (Nice to Fix):
  -> Check but does not affect Decision
```

<!--rs:REVIEW-008-->
### Commitment Verification Against Registered Revision Evidence

Run this step for every commitment-bearing concern, regardless of priority.
Resolve the original review and roadmap, the registered revised manuscript and
response artifacts, the relevant
`researchspec/draft-patches/<patch-id>.json`, and its apply report through
`researchspec/runs/current/artifact-registry.json`. Verify the evidence itself;
do not accept an author's claim or an imported Schema 11 status as proof.

If an Annotation Resolution Report is linked, first confirm that the CLI
mechanical coverage check passes: hashes and identities match, every Annotation
has exactly one disposition, operation links come only from Draft Patch v3, and
`unresolved_count` is zero. Then assess semantic fulfillment independently.
`implemented` is not proof that the edit answers the concern;
`answered_without_text_change`, `deferred`, `rejected`, and `superseded` still
require a reviewer judgment against their recorded answer, reason, or successor.

For each commitment, assign one `fulfillment_status`:

- `fulfilled` — the required evidence exists and substantively satisfies the
  commitment. Verify `new_section`, `new_figure`, `new_table`, `new_citation`,
  `methods_paragraph`, `discussion_paragraph`, and `prose_edit` against the
  revised manuscript and patch/apply evidence at the stated location. Verify an
  `acknowledgment_only` commitment against the registered Response to Reviewers,
  because no manuscript diff is expected.
- `partial` — evidence exists but only partly satisfies the commitment.
- `not-fulfilled` — the required evidence is absent.
- `explicitly-rejected-with-rationale` — the author explicitly declined the
  commitment and supplied the rationale.

For `required_evidence_type: other`, surface the advisory
`EVIDENCE_TYPE_UNSPECIFIED`. If `revision_location` is absent, request it; if it
is present, verify there while retaining the advisory. This advisory is distinct
from a missing-rationale gap.

For `partial`, `not-fulfilled`, or `explicitly-rejected-with-rationale`, require
`unfulfilled_rationale` on the same commitment object. If missing, add an
advisory `COMMITMENT_GAP`. Keep per-commitment status/rationale pairing intact;
do not reconstruct parallel lists or pair by index.

A concern-level `residual_action` may coexist with fulfilled individual
commitments. It states what remains for the whole concern and is not evidence of
a contradiction by itself.

Return the completed verification report as an artifact for registration. Send
unresolved, worsened, or blocking commitment findings to the re-review gate
helper for `researchspec/runs/current/gate-ledger.jsonl`. The reviewer does not
apply patches or write registry/gate records directly.
<!--/rs:REVIEW-008-->

### New Issue Detection

```
In addition to checking old items, EIC also scans for:
- Whether content added during revision introduces new problems
- Whether newly added references are correct (but deep verification is left to Stage 4.5 integrity check)
- Whether revisions cause inconsistencies
```

### Socratic Guidance After Re-Review

```
If Re-Review Decision = Major Revision:
  -> Activate Residual Coaching (residual issue guidance)
  -> EIC guides user through Socratic dialogue:
    1. Gap analysis — "How many issues did the first round of revisions resolve? Why are the remaining ones hard to address?"
    2. Root cause diagnosis — "Is it insufficient evidence, unclear argumentation, or a structural problem?"
    3. Trade-off decisions — "Which ones can be marked as research limitations?"
    4. Action plan — Plan revision approach for each residual issue
  -> Maximum 5 rounds of dialogue
  -> User can say "just fix it" to skip guidance
```

### Re-Review Output Format

```markdown
# Verification Review Report

## Decision
[Accept / Minor Revision / Major Revision]

## Revision Response Checklist

### Priority 1 — Required Revisions

| # | Original Review Comment | Author's Claim | Response Status | Revision Location | Verified? | Quality Assessment |
|---|------------------------|---------------|-----------------|-------------------|-----------|-------------------|
| R1 | [Original text] | [What the author claims to have done in Response to Reviewers] | FULLY_ADDRESSED | Section X.X | ✅ Yes | Adequately addressed; newly added content effectively resolves the issue |
| R2 | [Original text] | [Author's stated change] | PARTIALLY_ADDRESSED | Section Y.Y | ⚠️ Partial | Partially addressed, but still missing [specific gap] |

### Priority 2 — Suggested Revisions

| # | Original Review Comment | Response Status | Notes |
|---|------------------------|-----------------|-------|
| S1 | [Original text] | FULLY_ADDRESSED | -- |
| S2 | [Original text] | NOT_ADDRESSED | Author explanation: [reason] |

### Priority 3 — Nice to Fix

| # | Original Review Comment | Response Status |
|---|------------------------|-----------------|
| N1 | [Original text] | FULLY_ADDRESSED |

## New Issues (Discovered During Revision)

| # | Type | Location | Description |
|---|------|----------|-------------|
| NEW-1 | [Type] | Section X.X | [Description] |

## Decision Rationale
[Rationale based on the checklist]

## Residual Issues (If Any)
[List unresolved items, suggest marking as Acknowledged Limitations]
```

## v3.6.2 sprint contract status

v3.6.2 introduces sprint contracts for `reviewer_full` and `reviewer_methodology_focus` only. A template for this mode will follow in a subsequent patch release. Until then, this mode runs without contract enforcement and retains its pre-v3.6.2 behaviour.
