# Re-Review Mode (Verification Review)

Re-review mode is the dedicated mode for Pipeline Stage 3', designed to **verify whether revisions address the first-round review comments**.

### How It Works

```
Input:
1. Original Revision Roadmap (Stage 3 output)
2. Revised manuscript
3. Response to Reviewers (optional)
4. Editorial Decision Letter (optional, #539 — its Review Panel Provenance block feeds the Judge Record's Round-1 provenance; absent → "unknown (provenance block absent)")

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

### Judge Independence (#539)

The re-review judges revisions on the same model family that drove them — an analogous correlated-judge configuration to the one Ren et al. (2026, arXiv:2607.13104 §8.1.2) warn about (their warning addresses the identical evaluation operator driving updates AND reporting final results; here the correlation is family-level), with the same failure direction: the revision loop can converge on "what this judge likes" instead of quality.

### Host-native alternate-model review

Use the current session model by default. If an independent model could improve
this run and node, the main Agent may propose one model that the host already exposes
through its native subagent mechanism. Before dispatch, obtain a separate user
confirmation covering the proposed model, the category of content that will be
shared, and the expected cost. This consent applies only to the current run and node;
every child, branch, and revision round asks again. Do not store the consent in a
stable spec, control, handoff, or model configuration file.

Freeze the main Agent's judgment before dispatch. Send only the minimum
de-anchored material needed for the check, without the main judgment, scores, or
reasoning. Treat disagreement as a reason for targeted review. Do not vote,
average results, or let the subagent silently rewrite the frozen judgment. If
the host cannot dispatch the confirmed model or the result is structurally
invalid, disclose the limitation and continue with a single-model result.

**When not active** (or the pass came back `unavailable`): the re-review proceeds single-family and the Re-Review Output carries the disclosure line verbatim (it is part of the output template below): "This verification round ran on the same model family that drove the revisions; over-optimization to this judge's latent biases is possible (Ren et al. 2026, arXiv:2607.13104 §8.1.2)." Never omit it in single-family runs.

**Judge identity recording (both cases):** the Re-Review Output's Judge Record block (below) records the judge configuration — the verification judge's family/id (the running session knows its own), the Round-1 panel provenance copied seat-level from the Editorial Decision Letter's Review Panel Provenance block (#540; carried into Stage 3' with the letter — no per-seat model id is invented), the prompt/rubric surfaces used, the evidence the judge saw, and the judging budget noted separately from generation. Schema 6 carries these as the optional `judge_record` field.

<!--rs:REVIEW-008-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-008` for `academic-paper-reviewer`.

### Commitment verification against revision evidence

Run this step for every commitment-bearing concern. Resolve the original review,
roadmap, current revised manuscript, response, and any optional patch or
annotation evidence from explicit inputs and the producer's `handoff.md`. An
ARSU patch must conform to
`assets/shared/contracts/patch/revision_patch.schema.json`, but schema validity
or a successful mechanical application is not proof of academic fulfillment.

For each commitment, assign one `fulfillment_status`:

- `fulfilled` — the required evidence exists and substantively satisfies it;
- `partial` — evidence exists but only partly satisfies it;
- `not-fulfilled` — required evidence is absent;
- `explicitly-rejected-with-rationale` — the author declined it with reasons.

For a non-fulfilled status, preserve the corresponding rationale. Verify prose,
citations, figures, tables, methods, and acknowledgments against their actual
boundary files rather than a framework-managed apply or resolution report. Return
the verification report through this run's `handoff.md`; a human records
the formal Gate verdict in the owning node state.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
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

## Judge Record (#539)

### Host-native alternate-model review

Use the current session model by default. If an independent model could improve
this run and node, the main Agent may propose one model that the host already exposes
through its native subagent mechanism. Before dispatch, obtain a separate user
confirmation covering the proposed model, the category of content that will be
shared, and the expected cost. This consent applies only to the current run and node;
every child, branch, and revision round asks again. Do not store the consent in a
stable spec, control, handoff, or model configuration file.

Freeze the main Agent's judgment before dispatch. Send only the minimum
de-anchored material needed for the check, without the main judgment, scores, or
reasoning. Treat disagreement as a reason for targeted review. Do not vote,
average results, or let the subagent silently rewrite the frozen judgment. If
the host cannot dispatch the confirmed model or the result is structurally
invalid, disclose the limitation and continue with a single-model result.

[Single-family runs: include the disclosure line verbatim here — "This verification round ran on the same model family that drove the revisions; over-optimization to this judge's latent biases is possible (Ren et al. 2026, arXiv:2607.13104 §8.1.2)."]

## Decision
[Accept / Minor Revision / Major Revision]

## Revision Response Checklist

### Priority 1 — Required Revisions

### Host-native alternate-model review

Use the current session model by default. If an independent model could improve
this run and node, the main Agent may propose one model that the host already exposes
through its native subagent mechanism. Before dispatch, obtain a separate user
confirmation covering the proposed model, the category of content that will be
shared, and the expected cost. This consent applies only to the current run and node;
every child, branch, and revision round asks again. Do not store the consent in a
stable spec, control, handoff, or model configuration file.

Freeze the main Agent's judgment before dispatch. Send only the minimum
de-anchored material needed for the check, without the main judgment, scores, or
reasoning. Treat disagreement as a reason for targeted review. Do not vote,
average results, or let the subagent silently rewrite the frozen judgment. If
the host cannot dispatch the confirmed model or the result is structurally
invalid, disclose the limitation and continue with a single-model result.

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
