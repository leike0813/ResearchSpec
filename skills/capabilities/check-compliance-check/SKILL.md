---
name: check-compliance-check
description: "PRISMA-trAIce and RAISE advisory compliance."
metadata:
  capability_id: check-compliance-check
  node_kind: observer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Compliance Check

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `compliance_report` (compliance.v1)
- `ethics_review_report` (ethics-review.v1)

## Knowledge

- Load knowledge ID `raise-framework` from `knowledge/raise-framework.md`.
- Load knowledge ID `prisma-traice` from `knowledge/prisma-traice.md`.

## Procedure

# Procedure

Work from `manuscript_draft`, methodology blueprint, bibliography, material passport, and user-provided AI tool metadata. Produce `compliance_report`.

## Scope

Reads: manuscript draft, methodology blueprint, bibliography, material passport, and user-provided AI-tool metadata. Writes nothing to the manuscript; output is a separate compliance report. Never hallucinate missing items: missing material -> `[MATERIAL GAP: <item_id>]` in the gap reason.

## Input Contract

```yaml
compliance_mode: "systematic_review" | "primary_research" | "other_evidence_synthesis"
stage: "2.5" | "4.5"
materials:
  manuscript_draft: <path or inline>
  methodology_blueprint: <path>
  bibliography: <path>
  material_passport: <payload>
user_metadata:
  intended_venue: <string or null>
  ai_tools_used:
    - {name, version, developer, stage, purpose, access_url_or_doi}
```

## Output Contract

A separate compliance report at the output path supplied by instructions. Exchange it through the owning run handoff; the supplied passport is read-only context.

## Dispatch Logic

- `systematic_review`: run the stage-specific PRISMA-trAIce item subset plus full RAISE (principles + 8-role matrix); block decisions respect tier semantics.
- `other_evidence_synthesis`: run PRISMA-trAIce in adaptation mode (items become Info) plus full RAISE; block decision capped at warn.
- `primary_research`: run RAISE principles only; PRISMA-trAIce is null; block decision capped at warn.

## Stage Behaviour

| Stage | PRISMA-trAIce items checked | RAISE focus |
|---|---|---|
| 2.5 | M1-M10 | human_oversight, fit_for_purpose |
| 4.5 | T1, A1, I1, R1, R2, D1, D2 | transparency, reproducibility (+ full 8-role matrix for SR) |

Items within a stage subset are independent and may be evaluated concurrently. Read prior compliance history only for auditability context; never re-evaluate prior reports.

## Tier to Decision Mapping (SR Mode)

| Tier | FAIL -> |
|---|---|
| Mandatory | block_decision = block |
| Highly Recommended | block_decision = warn |
| Recommended | block_decision = pass (info) |
| Optional | block_decision = pass (info) |

Aggregate multiple tier contributions using max severity.

### Mandatory-Block Surface Message

When a Mandatory-tier PRISMA-trAIce item triggers `block_decision = block`, the surfaced message MUST include the maturity note that PRISMA-trAIce is a foundational proposal (Holst et al. 2025, *JMIR AI*, doi:10.2196/80247) not yet empirically validated, alongside the gap reason and override-ladder reference. The note is informational; it never lowers block severity.

## Self-Check Protocol

Before finalizing, run four self-checks:

| ID | Question | On Fail |
|---|---|---|
| CA-1 | Am I quoting PRISMA-trAIce items from memory or from the protocol knowledge pack? | re-read the protocol and requote |
| CA-2 | Are block decisions anchored to each item's stated tier, not memory? | re-read tiers and correct drift |
| CA-3 | SR mode only: did all 17 items pass with empty evidence? (sycophancy risk) | re-check the three most-commonly-missed Mandatory items (M4, M6, M8) with explicit evidence paths |
| CA-4 | For each RAISE principle marked pass, is principle evidence non-empty? | downgrade to warn with `[WEAK EVIDENCE]` |

Document self-check pass/fail in the agent log, not in the compliance report.

## Error Behaviour

| Error | Handling |
|---|---|
| Missing input material | mark `[MATERIAL GAP]`; the item auto-FAILs; tier dictates block/warn; never hallucinate |
| Mode/context mismatch | refuse with `{decision: "abort", reason: "mode/context mismatch"}`; the caller must re-evaluate and re-invoke |
| Schema validation failure on own output | halt and surface the internal error; never append an invalid report to compliance history |
| Upstream drift | set `upstream_sync_status: "stale"`; non-blocking |

## Interaction with Existing Checks

- Runs after integrity verification; compliance extends integrity, never replaces it.
- Runs alongside failure-mode checks: failure-mode checks research validity; compliance checks reporting transparency.
- Output feeds the AI Self-Reflection Report compliance summary.

## Invocation Protocol

The caller supplies the materials and validates the serialized report before recording its external path through the ResearchSpec CLI handoff command.

## AI Disclosure And Responsible-Use Review

When the submitted material is a research text or manuscript for pre-submission review, run the responsible-use review in addition to RAISE/PRISMA checks. Output is the optional `ethics_review_report`.

### Review Dimensions

1. AI Disclosure and Transparency: disclosure statement present, accurate, and specific about AI tool use; no AI-generated content passed off as human-authored.
2. Attribution Integrity: authorship, prior-work attribution, and AI assistance attribution are complete and accurate.
3. Dual-Use Screening: assess dual-use potential and negative externalities; subject matter alone never blocks.
4. Fair Representation: sources and perspectives are represented without distortion or silencing.
5. Data Ethics: identify the actual actors, personal-data collection/access/disclosure flows, applicable authority and unresolved legal or institutional basis; consent alone is neither a universal nor sufficient basis.
6. Conflict of Interest: financial, institutional, intellectual, personal, and political COIs are disclosed.
7. Human Subjects Ethics: report administrative readiness separately from documented authorization. Use `institutional determination required` for the pathway; do not select an exemption or review level.

### Human-Subjects Administrative Status

Use only user-identified authority context and supplied institutional evidence. Do not infer jurisdiction or authority from language, affiliation or manuscript prose. Profile-dependent conclusions require exact context and evidence of the required replay validation; a schema-shaped document alone is insufficient. If that evidence is unavailable, report `submission_readiness: unresolved`, `profile_dependent_result_allowed: false` and `review_pathway: institutional determination required`.

When validated requirement rows are supplied, preserve requirement IDs, obligated actors, consumer scopes and source pointers. Assign a requirement only to its actual responsible actor; committee responsibilities remain external dependencies. Keep parallel authorities separate. Candidate pathway traces are display-only observations, never permission or a workflow input.

Report `authorization_status` independently as `documented`, `not_provided` or `cannot_verify`. Located packet structure and advisory content coverage do not prove adequacy, institutional acceptance or permission. Missing content is `not_checked`, not a fabricated negative finding. Do not claim to have executed an unavailable resolver or checker.

For journal-source retraction information, preserve the supplied citation-integrity result, including retracted, reinstated, disputed, stale and unresolved states. Do not infer it from an older generic retraction field or independently escalate its severity. Distinguish an author's declared legitimate use with a retraction notice from human judgment that the manuscript actually discusses that retraction.

### Verdict And Override

- Verdict: CLEARED / CONDITIONAL / BLOCKED for AI-assisted research integrity only; it never grants human-subjects authorization.
- BLOCKED is reserved for integrity failures (for example, no AI disclosure) and is always overridable by the user with recorded reasoning.
- Record each acted-on item and the user's stated reasoning in the external ethics report. A formal Gate override requires its own human-confirmed CLI action in the owning node; this report cannot grant it.
- Subject matter alone never blocks: public-interest, government-critical, institution-critical, and politically sensitive research are not blocking conditions.

### Output

```markdown
## Ethics Review Report

### AI-Assisted Research-Integrity Verdict: [CLEARED / CONDITIONAL / BLOCKED]

### Dimension Assessment
| Dimension | pass/warn/fail | Evidence |
|---|---|---|

### Issues Found
#### Critical (Blocks Delivery)
#### Conditional (Must Fix)
#### Advisory (Recommended)

### AI Disclosure Verification
[present and accurate?]

### Responsible Use Statement
[when dual-use risk is Moderate or above]

### Ethics Decision Log
[one row per CONDITIONAL or BLOCKED item the user acted on]

### Human-Subjects Administrative Status
- submission_readiness: gaps_located / no_listed_gaps_located / unresolved
- authorization_status: documented / not_provided / cannot_verify
- review_pathway: institutional determination required
- authority context and evidence: [explicit source or unavailable]
- profile_dependent_result_allowed: true / false

This output does not authorize recruitment, consent, access to identifiable data, intervention, or data collection.
```

## Output Format

```markdown
## Compliance Report

- compliance_mode: [...]
- stage: [...]
- upstream_sync_status: [...]
- block_decision: pass | warn | block
- prisma_trAIce_items:
  - item_id: [M1..M10 / T1 / A1 / I1 / R1 / R2 / D1 / D2]
    tier: [Mandatory / Highly Recommended / Recommended / Optional]
    result: [pass / fail / info]
    evidence: [...]
    gap_reason: [MATERIAL GAP when applicable]
- raise_principles:
  - principle: [name]
    result: [pass / warn / fail]
    principle_evidence: [...]
- disclosures_required: [...]
```

## Rules

- Report findings without altering the manuscript. Formal workflow outcomes remain with the owning graph and human-confirmed Gates.
- Missing material must be tagged; never hallucinate missing items.
- Do not re-evaluate prior compliance reports.


## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
