<!--
══════════════════════════════════════════════
ARS 提取工件（Extraction Artifact）— M4 修订与定稿段
══════════════════════════════════════════════
工件类型: knowledge-pack
能力/包 ID: KP-M4-02 terminal-policy-firm-rules（终端策略 canonical 规则 R-L3-2-*）
提取日期: 2026-08-15
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/ars/shared/references/firm_rules.md §Contamination advisory firm rules (R-L3-2-*)（L17-52）
变更台账（ledger）:
    1. [保留] 原文逐字节保留（含 R-L3-2-A 默认 advisory + opt-in strict 扩展、R-L3-2-B/C/D/E、镜像清单）。
    2. [标注] 决策清单 M4 知识包之一（终端策略语义）的 canonical 源；finalizer（CAP-M4-04）与 formatter REFUSE 门按此语义执行。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

## Contamination advisory firm rules (R-L3-2-*)

> **Canonical wording note:** R-L3-2-A carries the **v3.10 PR-B broad form** (default-advisory + opt-in strict extension across contamination AND temporal namespaces; temporal strict not yet wired). This block is the single source of truth for the wording; the contamination mirrors below are intentionally *by-ID references*, not full-block copies (see the "Mirrored in (contamination rules)" note).

<!-- canonical:R-L3-2-A -->
- **R-L3-2-A (default-advisory + opt-in strict extension):** By default, contamination and temporal-integrity signals never block emission on their own; in a namespace that accepts a `strict` value, a user-enabled strict terminal policy may promote that namespace's specified signals to non-acknowledgeable terminal blockers. v3.10 accepts a strict value for `contamination_triangulation` only; `temporal_integrity` accepts `advisory` only (no temporal strict path exists yet). This follows the v3.5 Collaboration Depth Observer + v3.6.8 LOW-WARN precedent: hard-gating contamination by default would amount to refusing to cite mid-2024+ preprints en masse, which is too coarse — so the terminal promotion is opt-in (off by default), scoped to the namespace's accepted-strict signals, and surfaced via the §formatter terminal gate, never silently.
<!-- /canonical:R-L3-2-A -->

<!-- canonical:R-L3-2-B -->
- **R-L3-2-B (no retroactive computation):** bibliography_agent computes contamination_signals at ingest time, not at audit time. Re-running the check post-hoc on existing entries is a separate batch operation (deferred to user invocation; not part of the cite-time finalizer).
<!-- /canonical:R-L3-2-B -->

<!-- canonical:R-L3-2-C -->
- **R-L3-2-C (triangulation count over present fields):** k is computed over `*_unmatched` fields that are present. Absent fields are excluded from the count and do not default to either `true` or `false`. k_max reflects how many lookups were successfully run; the (k, k_max) pair together determines the annotation tier.
<!-- /canonical:R-L3-2-C -->

<!-- canonical:R-L3-2-D -->
- **R-L3-2-D (no API-inferred classification):** OpenAlex's `primary_location.source.type` and Crossref's `type` fields, even when returned by the APIs for matched entries, MUST NOT be used to derive any classification (venue_type, scope category, hard-block eligibility). The k=3 case makes those classifications structurally unavailable; including them in any classification logic creates fake precision.
<!-- /canonical:R-L3-2-D -->

<!-- canonical:R-L3-2-E -->
- **R-L3-2-E (gate refusal list unchanged by advisory tiers; terminal blocks ride a separate generic rule):** All triangulation *annotations* are advisory. The terminal gate **refusal list** is NOT extended by any advisory marker shape. The gate's **advisory pass-through allowlist** MUST be extended in lockstep with any new advisory suffix so that new advisory suffixes are not accidentally routed through a refusal rule. The fix for a new advisory suffix is pass-through-list expansion, not refusal-list change. v3.10 adds a *generic* terminal-refusal rule (formatter rule 11) that fires on any unresolved `severity=HIGH-BLOCK` token inside a `<!--ref:...-->` marker — it is NOT a per-suffix refusal entry, so the advisory suffix table and pass-through allowlist stay unchanged when a strict policy promotes a signal. The formatter is STAMP-CHECK ONLY: it compares each marker's `policy_hash` against the passport's current `terminal_policies` (freshness guard) and never re-runs policy logic; the finalizer is the sole policy evaluator.
<!-- /canonical:R-L3-2-E -->

**Mirrored in (contamination rules):**

- `academic-paper/agents/formatter_agent.md` — R-L3-2-A + R-L3-2-E (in the contamination pass-through paragraph).
- `deep-research/references/crossref_api_protocol.md` — R-L3-2-A (user-discretion reference).
- `deep-research/references/openalex_api_protocol.md` — R-L3-2-A reference.
- `academic-pipeline/agents/pipeline_orchestrator_agent.md` — R-L3-2-C / R-L3-2-D / R-L3-2-E (finalizer logic).
- `deep-research/agents/bibliography_agent.md` — R-L3-2-B (ingest-time computation).

> These mirrors are **intentionally by-ID prose references**, not full-block copies (e.g. crossref's "the user retains discretion per R-L3-2-A", the formatter's "advisory per ... R-L3-2-A + R-L3-2-E"). The wording lives in exactly one place — the canonical block above — so the single-source goal (D3) is met without duplicating the full rule text into five files. The v3.10 PR-B reword therefore changes ONLY the canonical block, not the mirrors. Because the mirrors are by-ID references, the sync lint does NOT wording-check them; it (1) ID-guards the contamination side (no contamination context reuses an `R-CIM-*` ID, no claim-manifest surface reuses an `R-L3-2-*` ID), and (2) **contradiction-guards** the contamination mirrors against phrasing that would contradict the broad reword — a by-ID reference's surrounding prose MUST NOT assert an unqualified "advisory only" / "never block" / "cannot block" / "must not block" / "non-blocking" claim, since a strict terminal policy can now block (see `check_firm_rules_sync.py` contradiction guard). (Wording-sync IS enforced for the `R-CIM-*` blocks below, whose mirrors ARE full-block copies.)

---

