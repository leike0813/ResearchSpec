<!--
══════════════════════════════════════════════
ARS 提取工件（Extraction Artifact）— M1 研究段
══════════════════════════════════════════════
工件类型: knowledge-pack
能力/包 ID: KP-M1-05b claim-intent-manifest（firm_rules canonical 块）
提取日期: 2026-08-15
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/ars/shared/references/firm_rules.md §Claim Intent Manifest emission firm rules (R-CIM-*)（L53-77）
变更台账（ledger）:
    1. [保留] 原文逐字节保留。
    2. [标注] 上游声明本块是 single source of truth，镜像按 ID 引用；authoring 阶段以此为准。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

## Claim Intent Manifest emission firm rules (R-CIM-*)

> Renamed from `R-L3-2-A/B/C` in v3.10 PR-A to remove the ID collision with the contamination rules above. The three writing-stage agents emit a claim intent manifest; the only difference between mirrors is the agent's self-reference noun ("synthesis agent" / "compiler" / "writer"), which the sync lint normalizes before comparison.

<!-- canonical:R-CIM-A -->
- **R-CIM-A (one-shot pre-commitment):** Emit exactly ONE manifest entry per <AGENT> invocation, BEFORE the first prose block. No later mutation, no append, no re-emission within the same invocation. Drafting that introduces a claim not in the manifest produces a `claim_drifts[]` entry with `drift_kind=EMITTED_NOT_INTENDED` downstream — that detection is the design intent (drift is surfaced, not silenced). The manifest is the pre-commitment artifact the audit diffs against; rewriting it mid-draft would hide the signal.
<!-- /canonical:R-CIM-A -->

<!-- canonical:R-CIM-B -->
- **R-CIM-B (no audit responsibility):** The <AGENT> emits manifests; it does NOT detect drift, re-judge supported / unsupported, or read other manifests. The §"Manifest cross-reference (D6)" set-diff lives in `claim_ref_alignment_audit_agent.md`. Mirrors the v3.6.7 partial-inversion discipline: narrative-side emits, audit-side reads.
<!-- /canonical:R-CIM-B -->

<!-- canonical:R-CIM-C -->
- **R-CIM-C (no frontmatter reading):** Generate `claim_text`, `intended_evidence_kind`, `planned_refs`, and any `negative_constraints[].rule` values from the corpus + prompt context already provided. You MUST NOT read entry frontmatter to discover candidate claims — the same partial-inversion rule that gates anchor selection in v3.7.3 R-L3-1-C. The orchestrator allocates a fresh `manifest_id` per invocation (M-INV-4); never copy a `manifest_id` from a sibling manifest.
<!-- /canonical:R-CIM-C -->

**Mirrored in (claim-manifest rules):**

- `deep-research/agents/synthesis_agent.md` (`<AGENT>` = "synthesis agent")
- `deep-research/agents/report_compiler_agent.md` (`<AGENT>` = "compiler"; R-CIM-B carries an extra standalone-mode sentence — see prompt)
- `academic-paper/agents/draft_writer_agent.md` (`<AGENT>` = "writer")
- `shared/contracts/passport/claim_intent_manifest.schema.json` — references `R-CIM-A` by ID in the `claims` field description.

---

