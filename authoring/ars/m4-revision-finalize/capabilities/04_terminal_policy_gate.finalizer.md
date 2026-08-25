<!--
══════════════════════════════════════════════
ARS 提取工件（Extraction Artifact）— M4 修订与定稿段
══════════════════════════════════════════════
工件类型: capability
能力/包 ID: CAP-M4-04 terminal-policy-gate（finalizer：唯一策略评估者）
提取日期: 2026-08-15
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/ars/academic-pipeline/agents/pipeline_orchestrator_agent.md §Cite-Time Provenance Finalizer（v3.7.1 → v3.10 extension，L684-903）
变更台账（ledger）:
    1. [保留] 原文逐字节保留（四代 finalizer：5-cell 矩阵、污染注解、三角测量层、终端策略层）。
    2. [标注] 上游声明"finalizer 是唯一策略评估者、formatter 只盖章"——本段是终端策略门的评估侧，与 formatter REFUSE 段（盖章侧）配对；分类学已将此逻辑从 orchestrator 拆出（orchestrator 其余职责吸收进图引擎）。
    3. [标注] 策略语义以 KP-M4-02（R-L3-2-* canonical）与 KP-M4-03（降级注册表）为准。
    4. [保留-待定] 版本标记文字保留；authoring 阶段按当前状态策略处置。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

## Cite-Time Provenance Finalizer (v3.7.1)

When `academic-pipeline` mode is active, the orchestrator runs the **Cite-Time Provenance Finalizer** at every Stage 4 → Stage 5 transition (and on every revision loop pass back through Stage 4) to resolve the two-layer citation markers emitted by `synthesis_agent`, `draft_writer_agent`, and `report_compiler_agent` per Step 3a.

**Trigger boundary:** Stage transition from drafting (Stage 4) to formatting (Stage 5), mirroring the v3.6.7 Step 6 audit_artifact gate. The finalizer runs BEFORE `formatter_agent`'s hard-gate check.

**Inputs (read-only):**

- The current draft markdown containing `<!--ref:slug-->` HTML-comment markers (one per emitted citation, per Step 3a's two-layer form).
- The Material Passport `literature_corpus[]` entries (each carries `citation_key`, `source_acquired`, `source_verified_against_original`).
- The peer-file `<session>_human_read_log.yaml` (path computed as `<passport-path-parent>/<passport-stem>_human_read_log.yaml` per §3.6 round-5 R5-003 amend) — provides `human_read_source: true` for every `citation_key` the user has explicitly marked via `/ars-mark-read`.

**Join semantics:** for each `<!--ref:slug-->` marker, the finalizer dereferences `slug` against `literature_corpus[]` to obtain `(source_acquired, source_verified_against_original)`, then joins on `citation_key` against the read-log to derive `human_read_source`. The `literature_corpus[]` schema is NOT mutated (per §3.6 firm rule #1: derived keys are not stored).

**4-cell resolution matrix (from spec §3.3 lines 174-179):**

| `source_acquired` | `source_verified_against_original` | `human_read_source` | Resolution |
|-------------------|-----------------------------------|---------------------|------------|
| false             | —                                  | —                   | **HIGH WARN**: cite has no original source on file. Replace `<!--ref:slug-->` with `[UNVERIFIED CITATION — NO ORIGINAL]<!--ref:slug-->` |
| true              | false                             | —                   | **MED WARN**: PDF in repo but AI has not cross-checked (regardless of whether the user has read it; AI verification is the gating condition). Replace with `[UNVERIFIED CITATION — AI HAS NOT CROSS-CHECKED]<!--ref:slug-->` |
| true              | true                              | false               | **LOW WARN**: AI cross-checked, user has not. Replace with `<!--ref:slug LOW-WARN-->`; also append the slug to a per-section pre-finalization checklist artifact for the user. |
| true              | true                              | true                | **OK**: replace with `<!--ref:slug ok-->` |

**Idempotency:** the finalizer pass is idempotent on the join of `(literature_corpus[]` row, read-log row`)` for each slug — re-running on a resolved marker with byte-identical input evidence yields byte-identical output. The matrix is re-applied to every `<!--ref:slug ...-->` on every pass; resolution tracks the current evidence, not a sticky historical state. Concretely:

- When the joined evidence (`source_acquired`, `source_verified_against_original`, derived `human_read_source`, and — #513 — the governing mark's `read_scope` attestation together with the citation's own `<!--anchor:<kind>:<value>-->`, since scope-aware promotion is a function of the anchor too: a revision that moves an anchor from a covered to an uncovered locator re-resolves the marker even when corpus and ledger are unchanged) is unchanged between passes, the marker's resolved form is byte-identical to the prior pass.
- When the joined evidence changes between passes (user acquires / verifies the source, runs `/ars-mark-read <refcode>`, or runs `/ars-unmark-read <refcode>` to rescind a prior mark), the next finalizer pass re-applies the matrix from the new triple and re-emits the resolved form. Promotion (e.g. `LOW-WARN` → `ok` after `/ars-mark-read`) and demotion (e.g. `ok` → `LOW-WARN` after `/ars-unmark-read`, since spec §3.6 line 325/340 makes the most recent timestamped event win) are both possible.

In other words: the resolved status is a pure function of the current input triple; user-facing remediation and rescind affordances both round-trip through the matrix.

**Revision loops:** on revision loops (Stage 4 → reviewer → Stage 4 revise; or `academic-paper` Phase 6 → Phase 4 loops), the finalizer re-runs against the current draft, resolves any newly-emitted bare `<!--ref:slug-->` comments introduced in the revision pass, and re-applies the matrix to existing resolved markers per the idempotency rule above. Resolved markers **do not invalidate** in the sense that nothing about the revision-loop mechanism itself perturbs them — only a change in the joined evidence (acquire / verify / `/ars-mark-read` / `/ars-unmark-read`, or — #513 — a revision editing the citation's anchor under a partial-coverage attestation) can move a marker. When evidence is unchanged across a revision pass, every marker is preserved byte-identical.

**LOW-WARN promotion:** when the user runs `/ars-mark-read <refcode>` between finalizer passes, the next pass observes `human_read_source: true` for that slug via the read-log join and resolves the marker to row 4 (`<!--ref:slug ok-->`). The finalizer does not delete the LOW-WARN entry from the per-section checklist artifact; that artifact is informational and the user clears it manually (or it falls out at the next checklist regeneration).

**Read-scope-aware promotion (#513).** The mark consumed by the row-3 → row-4 promotion may carry an optional `read_scope` attestation (`{level, locators[], note}`, schema `shared/contracts/passport/human_read_log.schema.json`). The governing signal follows the SAME latest-timestamped-event-wins rule as the binary case (spec §3.6): promotion is considered only when the slug's latest event overall is a mark — a latest rescind keeps row 3 regardless of any older non-rescinded marks — and the `read_scope` consulted is the one carried by that latest mark. Promotion then consults the attestation against the citation's own `<!--anchor:<kind>:<value>-->`: `level` absent or `unknown` promotes exactly as before (legacy marks impose no migration); `full_text` promotes; `abstract_only` / `toc_only` does NOT promote — the marker resolves to `<!--ref:slug LOW-WARN-PARTIAL-COVERAGE-->` (a draft-visible acknowledged-partial state, distinguishable from an unacknowledged `LOW-WARN`) and the per-section checklist entry gains an explicit coverage note (e.g. `read_scope abstract_only does not cover anchor page:12`); `sections` promotes ONLY when a `page` / `section` / `paragraph` anchor value falls unambiguously within a declared locator (locators are free text — promote on a clear containment match only; any ambiguity or no match resolves to `LOW-WARN-PARTIAL-COVERAGE` + coverage note), and `quote` anchors promote only under `full_text` or `unknown` (with partial coverage the finalizer cannot vouch that the quoted passage lies in a read section). `LOW-WARN-PARTIAL-COVERAGE` behaves as `LOW-WARN` for every downstream mechanism that keys on the base status (contamination suffixes attach the same way; severity tier unchanged; never a hard gate) — the formatter treats it as an acknowledged LOW-WARN variant and passes it with the coverage advisory surfaced. The degradation is always this retained LOW-WARN-tier state with a note — never a new severity, never below the pre-mark state. This paragraph refines WHEN row 3 promotes to row 4; the matrix rows and the join are unchanged, and the idempotency rule's evidence enumeration above explicitly includes the governing mark's attestation — a `read_scope` change between passes is an evidence change and re-resolves the marker.

**Hard-gate handoff:** the finalizer never blocks pipeline progress on its own. It mutates the draft in place, then the orchestrator advances to Stage 5 where `formatter_agent` carries the hard-gate refusal rule (any `[UNVERIFIED CITATION ...]` literal or any unresolved `<!--ref:slug-->` whose status is neither `ok`, LOW-WARN-acknowledged, nor `LOW-WARN-PARTIAL-COVERAGE` (#513 acknowledged-partial — passes, never refused) forces a refusal at format time per spec §3.3 line 185).

**Audit trail:** the finalizer's per-pass resolution counts (HIGH WARN / MED WARN / LOW WARN / OK / unresolved) are logged via `state_tracker` for the pipeline audit trail and surface in the Stage 4.5 integrity-check report.

## Cite-Time Provenance Finalizer — v3.7.3 extension (5-cell + contamination annotation)

Extends the v3.7.1 4-cell matrix above with two additive checks. External motivation: Zhao et al. arXiv:2605.07723 (2026-05). Spec: `docs/design/2026-05-12-ars-v3.7.3-claim-faithfulness-and-contaminated-source-spec.md` §3.1 + §3.2.

### Precedence-zero check: locator presence (L3-1)

Before applying the 4-cell matrix on `(source_acquired, source_verified_against_original, human_read_source)`, the finalizer inspects the trailing `<!--anchor:<kind>:<value>-->` comment that follows each ref marker. **The ref marker matches all 0/1/2-token shapes** — the bare pre-resolution form `<!--ref:slug-->`, the v3.7.1 finalizer-resolved forms `<!--ref:slug ok-->` / `<!--ref:slug LOW-WARN-->`, AND the v3.7.3 contamination-annotated forms `<!--ref:slug ok CONTAMINATED-PREPRINT-->` / `<!--ref:slug LOW-WARN CONTAMINATED-PREPRINT+UNMATCHED-->`. The finalizer must NOT match only the bare pre-resolution shape, because revision-loop reruns re-apply the matrix to already-resolved markers (per the v3.7.1 idempotency clause above); a re-run that only recognizes the bare shape would miss the anchor pairing on previously-resolved citations and treat them as locator-less. v3.7.3 codex round-7 F16 closure.

**Optional whitespace and newlines between the ref marker and the anchor marker are allowed and consumed** — the finalizer regex matches `<!--ref:slug [0-2 status tokens]-->\s*<!--anchor:...-->` (where `\s` covers space, tab, and newline). An LLM that emits the two markers across lines must not be treated as having no anchor; the finalizer pairs them by adjacency-modulo-whitespace, not strict adjacency. v3.7.3 gemini review F2 closure.

- If the citation has no `<!--anchor:...-->` marker at all (legacy v3.7.1 Two-Layer prose, or contract violation), the finalizer treats it as `<!--anchor:none:-->`.
- If `<kind>` = `none`, the finalizer resolves the citation to **MED-WARN-NO-LOCATOR** regardless of the underlying trust state. Replace the marker pair with `[UNVERIFIED CITATION — NO QUOTE OR PAGE LOCATOR]<!--ref:slug--><!--anchor:none:-->`.
- If `<kind>` ∈ `{quote, page, section, paragraph}`, the finalizer proceeds to the 4-cell matrix above.

NO-LOCATOR is MED severity (not HIGH) because the citation may still point at a real verified source — only the claim-anchor is missing. Treating it as HIGH would conflate two distinct defects (no source vs no anchor). The fix is locator emission by re-running the upstream agent or manual editing, not source acquisition.

**`/ars-mark-read` does NOT clear NO-LOCATOR.** The precedence-zero rule stops BEFORE applying the trust-state matrix on `(source_acquired, source_verified_against_original, human_read_source)`. Acknowledgment via `/ars-mark-read` only affects `human_read_source`, which is part of the 4-cell matrix that NO-LOCATOR bypasses. The only remediation is re-emitting the citation with a valid (`<kind>` ≠ `none`) anchor. This asymmetry is intentional: a locator is a structural property of the prose, not an evidence-state property of the source. v3.7.3 codex review P2-2 closure.

### Contamination annotation (L3-2)

After the 4-cell matrix resolves a citation to `ok` or `LOW-WARN`, the finalizer reads the entry's `contamination_signals` object from `literature_corpus[]` (if present) and appends an annotation suffix. (#513: `LOW-WARN-PARTIAL-COVERAGE` behaves as `LOW-WARN` throughout this section's — and the v3.9.0/v3.10/v3.11 extensions' — `ok`/`LOW-WARN` base-status enumerations: suffixes attach the same way, `policy_hash` stamping applies the same way, and `scripts/check_v3_10_policy.py` recognizes it as a base status.)

| Base resolution | contamination_signals state | Annotated marker |
|---|---|---|
| `ok` or `LOW-WARN` | object absent OR both fields false / missing | unchanged (`<!--ref:slug ok-->` or `<!--ref:slug LOW-WARN-->`) |
| `ok` or `LOW-WARN` | `preprint_post_llm_inflection: true` only | append `CONTAMINATED-PREPRINT` |
| `ok` or `LOW-WARN` | `semantic_scholar_unmatched: true` only | append `CONTAMINATED-UNMATCHED` |
| `ok` or `LOW-WARN` | both fields true | append `CONTAMINATED-PREPRINT+UNMATCHED` |

Example: `<!--ref:smith2024 LOW-WARN CONTAMINATED-PREPRINT-->` or `<!--ref:smith2024 ok CONTAMINATED-PREPRINT+UNMATCHED-->`.

**Advisory by default.** The contamination annotation SUFFIX does not change the gate decision: `ok CONTAMINATED-...` passes the formatter hard-gate and `LOW-WARN CONTAMINATED-...` is acknowledgeable via `/ars-mark-read <slug>` exactly like plain LOW-WARN. The suffix surfaces the signal so the user can verify the source or remove the citation. (v3.10 adds an OPT-IN terminal channel: when the passport's `terminal_policies.contamination_triangulation` is `strict` / `strict_articles_only`, a k=3 signal additionally co-emits a `TERMINAL-BLOCK` token that the formatter refuses on — see § Cite-Time Provenance Finalizer — v3.10 extension. The advisory suffix itself stays advisory; the terminal block is a separate, additional token.)

The contamination annotation does NOT apply to HIGH-WARN / MED-WARN / MED-WARN-NO-LOCATOR rows — those already block at the gate and the user must address the higher-severity problem before contamination becomes relevant.

### Updated 5-cell + annotation resolution order

For each `<!--ref:slug--><!--anchor:<kind>:<value>-->` marker pair:

1. **Precedence-zero (L3-1):** if `<kind>` = `none`, resolve to MED-WARN-NO-LOCATOR. Stop.
2. **4-cell matrix (v3.7.1):** apply the existing trust-state matrix on `(source_acquired, source_verified_against_original, human_read_source)`. Get base resolution: HIGH-WARN / MED-WARN-NOT-CROSS-CHECKED / LOW-WARN / OK.
3. **Contamination annotation (L3-2):** if base resolution is `ok` or `LOW-WARN`, look up `contamination_signals` on the entry; append `CONTAMINATED-...` suffix if any field is true.

### Audit trail (v3.7.3 update)

Per-pass resolution counts gain ten new columns: NO-LOCATOR (precedence-zero hits, v3.7.3 §3.1), CONTAMINATED-PREPRINT (v3.7.3 §3.2), CONTAMINATED-UNMATCHED (v3.7.3 §3.2 legacy single-S2 case), CONTAMINATED-PREPRINT+UNMATCHED (v3.7.3 §3.2 legacy combination), CONTAMINATED-COVERAGE-NOISE (v3.9.0 §3.3 k=1 k_max≥2 OR k=1 k_max=1 with non-S2 single index), CONTAMINATED-PREPRINT+COVERAGE-NOISE (v3.9.0 composition), CONTAMINATED-PARTIAL-UNMATCH (v3.9.0 §3.3 k=2), CONTAMINATED-PREPRINT+PARTIAL-UNMATCH (v3.9.0 composition), CONTAMINATED-TRIANGULATION-UNMATCHED (v3.9.0 §3.3 k=3), CONTAMINATED-PREPRINT+TRIANGULATION-UNMATCHED (v3.9.0 composition). All ten surface in the Stage 4.5 integrity-check report alongside the existing HIGH / MED / LOW / OK counts. Compatibility note: the v3.7.3 CONTAMINATED-BOTH column is renamed to CONTAMINATED-PREPRINT+UNMATCHED for naming consistency with v3.9.0 composition order.

## Cite-Time Provenance Finalizer — v3.9.0 extension (triangulation tiers)

Spec: `docs/design/2026-05-17-ars-v3.9.0-cross-index-triangulation-measurement-spec.md` §3.3.

v3.9.0 extends the v3.7.3 contamination annotation channel with three new lookup-derived suffix shapes. The base 5-cell matrix is unchanged. The annotation rule expands as follows:

**Trigger:** annotation fires when (base resolution ∈ {`ok`, `LOW-WARN`}) AND (`preprint_post_llm_inflection` is true OR any of `semantic_scholar_unmatched` / `openalex_unmatched` / `crossref_unmatched` / `arxiv_unmatched` is true). Entries with `contamination_signals` present but all fields false (computed-clean) produce no suffix — v3.7.3 behavior preserved.

**Compute k (triangulation count):** k = count of `*_unmatched` fields with value `true`, over fields that are present. Absent fields are excluded (per spec R-L3-2-C: absent ≠ false). k_max = count of `*_unmatched` fields that are present (0-4 — the v3.10/v3.11 Delta-1 `arxiv_unmatched` field is the fourth index; `arxiv_unmatched` is absent on citations with no arXiv ID, so k_max stays ≤ 3 for those, per the v3.9.0 absent≠false rule).

**Suffix shape table:**

| Base | preprint flag | k | k_max | Present field if k_max=1 | Suffix |
|---|---|---|---|---|---|
| `ok` / `LOW-WARN` | false / absent | 0 | any | — | (no suffix) |
| `ok` / `LOW-WARN` | true | 0 | any | — | `CONTAMINATED-PREPRINT` |
| `ok` / `LOW-WARN` | false / absent | 1 | 1 | `semantic_scholar_unmatched` | `CONTAMINATED-UNMATCHED` (v3.7.3 legacy) |
| `ok` / `LOW-WARN` | true | 1 | 1 | `semantic_scholar_unmatched` | `CONTAMINATED-PREPRINT+UNMATCHED` (v3.7.3 legacy) |
| `ok` / `LOW-WARN` | false / absent | 1 | 1 | `arxiv_unmatched` | `CONTAMINATED-ARXIV-UNMATCHED` (v3.10/v3.11 Delta-1) |
| `ok` / `LOW-WARN` | true | 1 | 1 | `arxiv_unmatched` | `CONTAMINATED-PREPRINT+ARXIV-UNMATCHED` (v3.10/v3.11 Delta-1) |
| `ok` / `LOW-WARN` | false / absent | 1 | 1 | `openalex_unmatched` or `crossref_unmatched` | `CONTAMINATED-COVERAGE-NOISE` |
| `ok` / `LOW-WARN` | true | 1 | 1 | `openalex_unmatched` or `crossref_unmatched` | `CONTAMINATED-PREPRINT+COVERAGE-NOISE` |
| `ok` / `LOW-WARN` | false / absent | 1 | 2-4 | — | `CONTAMINATED-COVERAGE-NOISE` |
| `ok` / `LOW-WARN` | true | 1 | 2-4 | — | `CONTAMINATED-PREPRINT+COVERAGE-NOISE` |
| `ok` / `LOW-WARN` | false / absent | 2 | 2-4 | — | `CONTAMINATED-PARTIAL-UNMATCH` |
| `ok` / `LOW-WARN` | true | 2 | 2-4 | — | `CONTAMINATED-PREPRINT+PARTIAL-UNMATCH` |
| `ok` / `LOW-WARN` | false / absent | 3 | 3 | — | `CONTAMINATED-TRIANGULATION-UNMATCHED` |
| `ok` / `LOW-WARN` | true | 3 | 3 | — | `CONTAMINATED-PREPRINT+TRIANGULATION-UNMATCHED` |
| `ok` / `LOW-WARN` | false / absent | 3 | 4 | — | `CONTAMINATED-PARTIAL-UNMATCH` |
| `ok` / `LOW-WARN` | true | 3 | 4 | — | `CONTAMINATED-PREPRINT+PARTIAL-UNMATCH` |
| `ok` / `LOW-WARN` | false / absent | 4 | 4 | — | `CONTAMINATED-QUADRANGULATION-UNMATCHED` |
| `ok` / `LOW-WARN` | true | 4 | 4 | — | `CONTAMINATED-PREPRINT+QUADRANGULATION-UNMATCHED` |

**v3.10/v3.11 Delta-1 extension (arXiv fourth index):** `arxiv_unmatched` is the fourth lookup field, present only on citations carrying an arXiv ID (absent ≠ false). Two new single-named tiers join the v3.9.0 tiers:
- **`CONTAMINATED-ARXIV-UNMATCHED` (k=1, k_max=1, present field = `arxiv_unmatched`)** — the arxiv-only carve-out, mirroring the `semantic_scholar_unmatched` legacy carve-out exactly: it fires ONLY when arxiv is the SOLE present-and-unmatched index. An arxiv-only k=1 with k_max ≥ 2 (arxiv unmatched, other present indexes matched) stays `CONTAMINATED-COVERAGE-NOISE` like every other k=1 k_max ≥ 2 case — "single-index" means k_max=1, not merely k=1 (consistent with the v3.9.0 s2 carve-out being k_max=1-only).
- **`CONTAMINATED-QUADRANGULATION-UNMATCHED` (k=4, k_max=4)** — all four indexes unmatched, the four-index analogue of `CONTAMINATED-TRIANGULATION-UNMATCHED` (which stays k=3 k_max=3, all-three-unmatched). A k=3 k_max=4 (three of four unmatched) is `CONTAMINATED-PARTIAL-UNMATCH`, NOT triangulation — the strong all-N name is reserved for k = k_max = N (the v3.9.0 "observation not inferred cause" rule extended to N=4).

**Composition order:** `PREPRINT` token first, triangulation token second, joined by `+`. The canonical token order list is `[PREPRINT, UNMATCHED | ARXIV-UNMATCHED | COVERAGE-NOISE | PARTIAL-UNMATCH | TRIANGULATION-UNMATCHED | QUADRANGULATION-UNMATCHED]`.

**Gate semantics:** All v3.9.0 AND Delta-1 suffixes are advisory. The terminal gate refusal list is NOT extended. `formatter_agent.md` pass-through allowlist MUST extend from 3 v3.7.3 suffixes to 9 (v3.9.0) to 13 (Delta-1: + the 4 arXiv tokens) per R-L3-2-E. `/ars-mark-read` behavior is unchanged.

Example markers:
- `<!--ref:smith2024 LOW-WARN CONTAMINATED-COVERAGE-NOISE-->` — single-index unmatched, k_max ≥ 2.
- `<!--ref:smith2024 ok CONTAMINATED-PARTIAL-UNMATCH-->` — two-of-three (or three-of-four) unmatched.
- `<!--ref:smith2024 LOW-WARN CONTAMINATED-TRIANGULATION-UNMATCHED-->` — all three indexes unmatched.
- `<!--ref:smith2024 LOW-WARN CONTAMINATED-ARXIV-UNMATCHED-->` — arxiv-only (k_max=1) unmatched.
- `<!--ref:smith2024 LOW-WARN CONTAMINATED-QUADRANGULATION-UNMATCHED-->` — all four indexes unmatched.
- `<!--ref:smith2024 LOW-WARN CONTAMINATED-PREPRINT+QUADRANGULATION-UNMATCHED-->` — preprint heuristic + k=4.

## Cite-Time Provenance Finalizer — v3.10 extension (terminal policy layer)

Spec: `docs/design/2026-05-31-ars-v3.10-policy-layer-rescope-spec.md` §3 PR-B items 6-9. Firm rule: `shared/references/firm_rules.md` R-L3-2-A (broad form) + R-L3-2-E.

v3.10 adds an **opt-in terminal policy layer** on top of the v3.9.0 advisory channel. The finalizer is the **sole policy evaluator**: it reads the passport-level `terminal_policies` block (per `shared/contracts/passport/terminal_policies.schema.json`) and, under a non-advisory policy, stamps a `policy_hash` on every ref marker and co-emits a terminal `HIGH-BLOCK` token where the policy fires. **The default (absent `terminal_policies`, or every key `advisory`) is byte-equivalent to v3.9.0 (Invariant 7): the finalizer emits the EXACT v3.9.0 marker — no `policy_hash` stamp, no terminal token, no behavior change.** The `policy_hash` stamp is added ONLY when the passport carries a non-advisory policy (see below); this is what lets a v3.9.0 (stampless) draft and a v3.10 default-advisory draft be identical, and lets the formatter pass a stampless marker under an advisory passport.

### policy_hash stamp (added ONLY under a non-advisory policy)

When — and ONLY when — the passport's `terminal_policies` carries at least one non-advisory CITATION-TIME key value, the finalizer appends `policy_hash=<slug>` to every marker it finalizes (so the formatter can detect a draft finalized under a stale policy). The citation-time keys are `contamination_triangulation`, `citation_existence`, and (forward) `temporal_integrity` — the marker-carrier policies; the package-level `submission_package` key (#394) NEVER participates in marker stamping and is OMITTED from the slug regardless of its value — its carrier is the #394 verifier's report file (`policy_slug` + `package_fingerprint`, the package-level analog of this stamp), so a `submission_package: strict`-only passport stamps nothing here. The slug is a **fully-encoded, human-readable canonical token** of the passport's citation-time `terminal_policies` state — NOT a computed digest (the finalizer is an LLM agent; it cannot reliably compute sha256 by hand). The slug encodes EVERY non-advisory citation-time policy key so two distinct policy configurations can never collide on one slug:

- **All-advisory** (absent `terminal_policies`, or every key explicitly `advisory`): NO stamp is emitted — the marker is the bare v3.9.0 shape (Invariant 7 byte-equivalence). There is no `policy_hash=advisory` sentinel; the *absence* of a stamp IS the advisory signal.
- **Any non-advisory key present:** stamp `policy_hash=<slug>`, where `<slug>` joins each NON-ADVISORY policy key with its value as `key.value`, sorted by key name, separated by `+`. Examples:
  - `contamination_triangulation: strict`, `temporal_integrity` absent/advisory → `policy_hash=contamination_triangulation.strict`
  - `contamination_triangulation: strict_articles_only` → `policy_hash=contamination_triangulation.strict_articles_only`
  - (forward) `contamination_triangulation: strict` + a future `temporal_integrity: strict` → `policy_hash=contamination_triangulation.strict+temporal_integrity.strict`
- A key whose value is the advisory default is OMITTED from the slug (it contributes nothing), so `contamination_triangulation: strict` + `temporal_integrity: advisory` collapses to `contamination_triangulation.strict`.

This slug is what `formatter_agent.md`'s freshness guard compares against the passport's CURRENT `terminal_policies` (recomputed by the same rule). A mismatch means the draft was finalized under a different policy and must be re-finalized. Under an all-advisory passport there is no slug to compare — the formatter passes the stampless marker (legacy/default transition).

### Two marker grammar shapes

Every finalized marker takes ONE of two shapes (the literal `TERMINAL-BLOCK` sentinel distinguishes them unambiguously). The `policy_hash=<slug>` segment shown below is present ONLY under a non-advisory passport (per the stamp rule above); under an all-advisory passport it is absent and the marker is the bare v3.9.0 shape:

- **Non-terminal** (advisory-or-clean — every marker that did NOT hit a terminal block):
  - under all-advisory: `<!--ref:<slug> <base-status> [<advisory-suffix>]-->` (the exact v3.9.0 marker, no stamp).
  - under a non-advisory policy: `policy_hash=<slug>` appended at the END, after any advisory suffix, with NO `TERMINAL-BLOCK` token:
    ```
    <!--ref:<slug> <base-status> [<advisory-suffix>] policy_hash=<slug>-->
    ```
- **Terminal** (entry hit a HIGH-BLOCK under a strict policy — only reachable under a non-advisory policy, so always stamped): the advisory suffix stays in its optional slot; the terminal token sequence is ADDITIONAL:
  ```
  <!--ref:<slug> <base-status> [<advisory-suffix>] TERMINAL-BLOCK severity=HIGH-BLOCK policy=<contamination_triangulation|temporal_integrity|citation_existence> reason=<reason-token> mode=<strict|strict_articles_only> policy_hash=<slug>-->
  ```

Where `<base-status>` ∈ {`ok`, `LOW-WARN`} (the v3.7.3 5-cell base resolution) and `[<advisory-suffix>]` is the OPTIONAL v3.9.0 contamination suffix (one token max, drawn from the v3.9.0 allowlist), present iff the entry fired an advisory signal. `reason` carries the typed payload that preserves remediation context — for contamination k=3 it is `reason=k3_all_indexes_unmatched`. The `mode=` enumeration above is the union across policies; the valid modes are **per-policy**: `contamination_triangulation` ∈ {`strict`, `strict_articles_only`}, `citation_existence` is `strict` only (no `strict_articles_only`), and `temporal_integrity` is forward-reserved advisory-only (no terminal mode wired). A `policy=citation_existence` token therefore always carries `mode=strict`.

**Legacy (v3.9.0) markers carry NO `policy_hash`** — and so does a v3.10 marker finalized under an all-advisory passport (they are byte-identical). They are NOT malformed; the formatter's legacy/default-transition rule (§ Formatter) passes a stampless marker under an advisory passport and refuses it only when the current passport is non-advisory (the user opted into hard-block, so the stampless draft must be re-finalized).

### Terminal promotion under strict

When `terminal_policies.contamination_triangulation == strict` AND the entry's triangulation signal is **k=3** (all three lookup indexes unmatched), the finalizer emits the terminal shape with `policy=contamination_triangulation reason=k3_all_indexes_unmatched mode=strict`. **Co-emitted with — not replacing — the advisory suffix** (R1 P1): the existing `CONTAMINATED-TRIANGULATION-UNMATCHED` (or `CONTAMINATED-PREPRINT+TRIANGULATION-UNMATCHED`) suffix STAYS in the advisory slot so the "why" survives; the `TERMINAL-BLOCK` sequence is an additional token.

Example (strict, k=3, preprint): `<!--ref:smith2024 LOW-WARN CONTAMINATED-PREPRINT+TRIANGULATION-UNMATCHED TERMINAL-BLOCK severity=HIGH-BLOCK policy=contamination_triangulation reason=k3_all_indexes_unmatched mode=strict policy_hash=contamination_triangulation.strict-->`

### strict_articles_only precision mode

When `terminal_policies.contamination_triangulation == strict_articles_only`, k=3 promotes to a terminal block ONLY when **all** of: DOI present AND `venue_type ∈ {journal-article, conference-paper}` AND `venue_type_provenance ∈ {adapter_declared, user_declared, trusted_source_declared}`. The terminal token then carries `mode=strict_articles_only`.

**This is a deliberate PRECISION mode (R1 P0-F, user-ruled): a DOI-less or `unknown`-venue journal article STAYS ADVISORY by design** — in the target humanities / non-English / regional-journal corpus, "journal + no-DOI + k=3" is overwhelmingly a legitimate coverage gap, not fabrication. Users wanting comprehensive hard-block use `strict` (no venue/DOI scoping). The recall limit is documented (user-facing docs + a by-design false-negative fixture: DOI-absent + unknown-venue + k=3 → stays advisory).

The finalizer reads `venue_type` / `venue_type_provenance` only as DECLARED entry metadata — it MUST NOT infer venue_type from the free-form `venue` string or from any index `type` field (R-L3-2-D).

### Citation-existence terminal promotion under strict (v3.11 / C-V6)

The `terminal_policies.citation_existence` key (enum `{advisory, strict}`, spec `docs/design/2026-05-21-v3.10-182-promote-citation-gate-spec.md` §2 Delta 3 + INVARIANT C-V6) governs the `lookup_verified == false` verdict from the `citation_verification_summary[]` aggregate (Delta 4). It inherits the SAME opt-in terminal model as `contamination_triangulation` — default advisory, opt-in `strict` — and introduces NO second hard-block philosophy. The finalizer is the sole policy evaluator here too; no new control-plane writer is added (this is the L4-question-3 boundary, not L1 hidden culling — the verdict is external-API factual, the flagged citation stays visible and annotated, and `resolver_outcomes` makes the criterion fully auditable).

The verdict input is the narrowed-`false` (C-V6(a)): `lookup_verified == false` ONLY when at least one ID-keyed (DOI / arXiv-ID) resolver returned `unmatched` with no `matched` — a provably-bogus identifier. A title-only `unmatched` with no resolvable identifier reduces to `unresolvable` (a coverage gap — regional / non-English / pre-digital paper indexed nowhere), NEVER `false`. The finalizer consumes the verdict the Delta 4 reducer already computed; it does NOT re-derive it.

- **Detection is unconditional (C-V6(e)):** the `citation_verification_summary[]` aggregate is always populated, so a `false` verdict is always visible THERE — in the aggregate, with full `resolver_outcomes`. **Unlike `contamination_triangulation`, `citation_existence` adds NO advisory suffix token to the ref marker** (there is no `CITATION-FALSE`-style suffix): the marker advisory slot is reserved for the contamination `CONTAMINATED-*` suffix, and the v3.7.3 marker grammar caps the marker at one advisory token, so a second would break the grammar. The `false` "why" lives in the `citation_verification_summary[]` aggregate (and, under `strict`, additionally in the terminal token's `reason=lookup_verified_false`); under `advisory` the per-marker-invisible aggregate signal is surfaced to the human reviewer by the formatter's mandatory `provenance_summary.md` `Citation Existence Advisories` section (C-V6(b); see `formatter_agent.md`), so the warning travels with the deliverable without a marker suffix. The `citation_existence` key governs ONLY whether the `false` row additionally promotes to a *terminal* marker (`strict`) or stays advisory (default).
- **`advisory` (default, C-V6(b)):** a `false` row stays visible in the `citation_verification_summary[]` aggregate (where it is `/ars-mark-read`-ack-able) and is listed in the formatter's mandatory `provenance_summary.md` `Citation Existence Advisories` section, and the pipeline completes normally. The ref **marker is byte-equivalent to v3.9.x** — no terminal token, no new suffix (per-key absence ⟹ advisory; a whole-object-absent passport ⟹ advisory for this key, so a v3.10 passport behaves identically to v3.9.x — no back-compat break). The advisory's visibility lives in the `provenance_summary.md` section, NOT in the marker (the marker stays byte-equivalent).
- **`strict` (opt-in, C-V6(c)):** when `terminal_policies.citation_existence == strict` AND the ref's `lookup_verified == false`, the finalizer appends the terminal token `TERMINAL-BLOCK severity=HIGH-BLOCK policy=citation_existence reason=lookup_verified_false mode=strict policy_hash=<slug>` to the ref marker. This is **additive** — it does not alter the base-status token (the `false` "why" survives in `reason=lookup_verified_false` + the aggregate, NOT in a marker advisory suffix). The block is terminal — NOT `/ars-mark-read`-ack-able. There is NO per-hit override token; the human decision is the opt-in itself (do I run this corpus under `citation_existence=strict`?).

Example (strict, ID-keyed false): `<!--ref:bogus2024 ok TERMINAL-BLOCK severity=HIGH-BLOCK policy=citation_existence reason=lookup_verified_false mode=strict policy_hash=citation_existence.strict-->` — the marker carries the base-status (`ok`) and the terminal token; there is no citation-existence advisory suffix between them (contrast contamination, whose `CONTAMINATED-*` suffix DOES occupy the advisory slot).

**Gating output = the existing Stage-5 formatter hard gate (C-V6(d)).** ARS has no separate "ready-for-review" state machine; the equivalent is the existing Stage-4→5 boundary where the finalizer runs and `formatter_agent` then refuses. Under `strict`, the appended `TERMINAL-BLOCK severity=HIGH-BLOCK` token is refused by `formatter_agent`'s generic rule-11 (any unresolved `severity=HIGH-BLOCK` inside a `<!--ref:...-->` marker), so the draft cannot reach final formatted output — i.e. a draft with a provably-bogus citation cannot reach the human-review deliverable. This gate is therefore symmetric with `contamination_triangulation == strict`: same terminal token mechanism, same generic formatter refusal, NO new refusal rule and NO formatter policy re-evaluation (Invariant 13; the formatter stays STAMP-ONLY). Under default `advisory` the `false` row stays an aggregate advisory and the run completes — avoiding the withdrawn "Zombie pipeline" advisory-yet-unconditionally-blocking contradiction. **Scope note (symmetric with all terminal policies):** the gate is the *output* boundary, exactly as `contamination_triangulation=strict`. A mid-pipeline raw draft (Stage 2–4, before the Stage-4→5 finalizer pass) is not a gated deliverable in any policy mode; the `false` signal is still visible in the always-populated aggregate from the moment detection runs, and the terminal block is what stops it reaching the *formatted* output a human reviews. This is the shipped definition of the gate, not a new hole introduced here.

**Recompute each pass; nothing cached (C-V6(h)).** Both the marker severity (strict terminal vs advisory) and the output gate are recomputed by the finalizer at every finalization pass — they are pure functions of the CURRENT `terminal_policies` state and the CURRENT `citation_verification_summary[]`, never cached status. Flipping `citation_existence` advisory→strict between passes re-stamps markers and re-applies the gate on the next finalize; a `resume_from_passport` / reset that re-enters finalization re-evaluates against the resumed summary. A previously-granted output (a draft that reached formatting) is never inherited across a resume without re-passing the gate under the then-current policy — there is no path where a stale certification survives a citation that resolves to `false` under `strict`. This is the same idempotency-on-current-evidence discipline as the v3.7.1 finalizer matrix above.

### Manual-entry exemption preserved

Manual entries (`obtained_via: manual`) carry no `*_unmatched` fields (v3.9.0 §3.1 not-rule), so k=3 is structurally unreachable for them — no terminal promotion can fire (Invariant 8). For `citation_existence`, a manual entry's resolvers are all `skipped`, so its `lookup_verified` reduces to `unresolvable` (never `false`), and the strict citation-existence block is likewise unreachable (C-V6(f)). Preserved across all policy modes.

### `/ars-mark-read` and HIGH-BLOCK

`HIGH-BLOCK` is **terminal — NOT `/ars-mark-read` ack-able**. Advisory tiers (LOW-WARN, all CONTAMINATED-* advisory suffixes) remain ack-able exactly as before. Acknowledgment cannot clear a terminal block; the only remediation is resolving the underlying signal (verify the source / replace the citation / switch off strict).

### Audit trail (v3.10 update)

The per-pass resolution counts gain a `terminal_blocked[]` bucket recording each ref slug promoted to a terminal block, with its `policy` / `reason` / `mode`. **Non-additive (R2-P2):** a single strict k=3 ref increments BOTH its advisory-signal count (e.g. CONTAMINATED-TRIANGULATION-UNMATCHED) AND the `terminal_blocked[]` bucket, but it remains ONE unique affected ref — any downstream aggregate "total affected refs" MUST dedupe by ref slug across the advisory and terminal buckets, NEVER sum them.

**Multiple terminal policies co-emit independently (C-V6(g)).** A single ref that violates BOTH `contamination_triangulation == strict` (k=3) AND `citation_existence == strict` (`lookup_verified == false`) carries **two** `TERMINAL-BLOCK` tokens in its marker — one per `policy=` value (`policy=contamination_triangulation` and `policy=citation_existence`) — alongside the shared advisory slot. The two tokens are additive at the marker, but the ref is counted ONCE in any "total affected refs" aggregate: dedupe by ref slug across BOTH policy buckets (the same non-additive rule as above, now spanning policies). The `policy_hash` slug encodes both non-advisory keys, sorted by key name: `policy_hash=citation_existence.strict+contamination_triangulation.strict`. The formatter's generic "refuse on any unresolved `severity=HIGH-BLOCK`" rule already handles N tokens without per-policy enumeration — no per-policy refusal rule is added.

---

