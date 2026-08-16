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

A compliance report conforming to the compliance report schema, appended to the passport's compliance history.

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

The caller passes the input contract and validates the serialized report against the schema before appending it to the passport.

## AI Disclosure And Responsible-Use Review

When the submitted material is a research text or manuscript for pre-submission review, run the responsible-use review in addition to RAISE/PRISMA checks. Output is the optional `ethics_review_report`.

### Review Dimensions

1. AI Disclosure and Transparency: disclosure statement present, accurate, and specific about AI tool use; no AI-generated content passed off as human-authored.
2. Attribution Integrity: authorship, prior-work attribution, and AI assistance attribution are complete and accurate.
3. Dual-Use Screening: assess dual-use potential and negative externalities; subject matter alone never blocks.
4. Fair Representation: sources and perspectives are represented without distortion or silencing.
5. Data Ethics: consent, privacy, and data provenance are declared where applicable.
6. Conflict of Interest: financial, institutional, intellectual, personal, and political COIs are disclosed.
7. Human Subjects Ethics: IRB/ethics approval or exemption is stated when human subjects or sensitive data are involved.

### Verdict And Override

- Verdict: CLEARED / CONDITIONAL / BLOCKED.
- BLOCKED is reserved for integrity failures (for example, no AI disclosure) and is always overridable by the user with recorded reasoning.
- Record each CONDITIONAL or BLOCKED item the user acts on in an ethics decision log; do not re-block the same item after an override.
- Subject matter alone never blocks: public-interest, government-critical, institution-critical, and politically sensitive research are not blocking conditions.

### Output

```markdown
## Ethics Review Report

### Verdict: [CLEARED / CONDITIONAL / BLOCKED]

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

- Warn-only surface: never alter the manuscript; never write disclosures into the manuscript.
- Missing material must be tagged; never hallucinate missing items.
- Do not re-evaluate prior compliance reports.
