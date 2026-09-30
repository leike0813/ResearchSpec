<!--
══════════════════════════════════════════════
ARS 提取工件（Extraction Artifact）— M4 修订与定稿段
══════════════════════════════════════════════
工件类型: capability
能力/包 ID: CAP-M4-04 terminal-policy-gate（投稿包终检门 #394）
提取日期: 2026-09-06
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/ars/academic-pipeline/agents/pipeline_orchestrator_agent.md §Submission-Package Terminal Gate (#394 slice 4 — Stage 5, post-formatter)（L1400-1426）
变更台账（ledger）:
  0. v3.22.2 增量同步：保留上游切片并校验来源范围。
    1. [保留] 原文逐字节保留。
    2. [标注] package 级终端门（verify_submission_package.py 分发、TERMINAL-BLOCK / VERIFICATION-INCOMPLETE stdout 令牌语义）；原文保留，authoring 阶段归 terminal-policy-gate 家族。
    3. [刷新] 已按 ARS v3.21.1（127ff85）重新提取受影响上游正文；正文保持逐字节原文。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改；本轮按 v3.21.1 刷新受影响正文
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

## Submission-Package Terminal Gate (#394 slice 4 — Stage 5, post-formatter)

A **package-level** gate, explicitly NOT the ref-marker stamp path above: the v3.10/v3.11 terminality machinery is finalizer-stamped ref markers + the formatter's stamp-only rules, but this verifier runs AFTER the formatter has produced the whole output package, so that carrier cannot serve it (spec `docs/design/2026-06-10-394-submission-package-verifier-spec.md` §5 seam 2). The evaluated carrier is the verifier's report file itself (`header.package_fingerprint` + `header.policy_slug`) plus the `provenance_summary.md` `Submission Package Advisories` section (see `formatter_agent.md`). No ref-marker grammar change — markers are untouched by this gate. **Token disambiguation:** the literal `TERMINAL-BLOCK` is REUSED from the v3.10 marker grammar but lives in a different channel here — in the sections above it is an in-marker token carrying `severity=HIGH-BLOCK` + `policy_hash`, refused by the formatter's rule 11; here it is a **stdout line** carrying `policy=submission_package` with NO `severity=` and NO `policy_hash`, evaluated by THIS agent. The `policy=` value is the discriminator; rule 11 never fires on it (it is not inside a `<!--ref:...-->`).

**Policy reading stays single-homed (§5.3).** The orchestrator is the SOLE reader of `terminal_policies.submission_package` and sole selector of the policy in force. `scripts/verify_submission_package.py` NEVER reads `terminal_policies` — the orchestrator hands the already-resolved value down via the `--policy` CLI argument, and the script applies it mechanically (deterministic evaluation tooling, not a second policy reader).

### Procedure (after the formatter emits the output package)

1. **Resolve the policy.** Read `terminal_policies.submission_package` from the Material Passport. Key absence — or absence of the whole `terminal_policies` object — resolves to `advisory` (the same per-key runtime convention as the existing keys). ALWAYS pass the resolved value explicitly: the CLI is never run policy-less in the pipeline (an unflagged run stamps `policy_slug: null` = a standalone unevaluated report, which can never satisfy the freshness guard below).
2. **Run the verifier** on the package directory: `python scripts/verify_submission_package.py <package_dir> --policy <resolved>` plus `--passport` / `--venue-profile` / `--join-map` when the run has them — the SAME input set the freshness invocation (step 5) will carry, or the inputs fingerprint can never match.
3. **Gate on stdout tokens, NEVER on exit codes.** Exit 1 also covers nonterminal advisory/heuristic fails (a strict-mode heuristic fail exits 1 with NO terminal token and must not block — heuristic findings never promote, structurally). Match each token as a line PREFIX, not full-line equality — the emitted lines carry a `strict_eligible_fails=<ids>` / `strict_eligible_not_checked=<ids>` suffix. The terminal signals are exactly:
   - `TERMINAL-BLOCK policy=submission_package` (a strict-eligible check FAILED under `strict`) → return the package to the formatter fix loop, **bounded: 2 fix rounds**, then surface to the scholar (mirrors the revision-loop cap philosophy). One round = dispatch the formatter to remediate the named findings, then re-run the verifier; if the 2nd round still emits the token, STOP and surface — never a 3rd. Never carry a verdict across rounds.
   - `VERIFICATION-INCOMPLETE` (a strict-eligible check is NOT-CHECKED under `strict`) → blocks emission like a fail DOES (fail-closed §5.2: a missing parser or input must not waive the one check class the scholar opted into blocking on) — but its remediation is NOT the formatter fix loop: a missing venue profile or parser is not a formatter-fixable defect. Remediation, stated plainly to the scholar: declare a venue profile (under `strict`, Family B checks without one are strict-eligible NOT-CHECKED), or — the other way out — flip `submission_package` back to `advisory` and re-finalize.
4. **Advisory path:** after the verifier writes its report, dispatch the formatter ONCE MORE in append-only mode to write the `Submission Package Advisories` section into `provenance_summary.md` from the report's findings (any fail / warn / NOT-CHECKED — see `formatter_agent.md`); then the pipeline completes. This re-entry is advisory transcription, not a content revision (no manuscript bytes change; Invariant 13 preserved). Byte-equivalence holds for non-opting users: no manuscript, ref-marker, or formatted-artifact bytes change — the report file and the advisories section are the only additions.
5. **Report reuse REQUIRES the freshness guard.** Before ever reusing an existing report (resume, re-entry, second finalization pass), run `--check-freshness --policy <resolved>` first, WITH the same `--venue-profile` / `--passport` / `--join-map` arguments the reuse context carries (the guard compares an inputs fingerprint too — a report produced under a different venue profile is stale). `STALE-REPORT` (fingerprint, inputs, or policy mismatch; null-stamped; missing/unreadable) → re-run the verifier; NEVER evaluate a stale report (§5.2 — the package-level analog of the `policy_hash` stamp). A FRESH report re-emits its verdict (token + exit semantics identical to a live run) — gate on that re-emitted token exactly as in step 3; "fresh" alone is never a pass.
6. **Recompute each pass; nothing cached.** The gate verdict is a pure function of the CURRENT passport policy and the CURRENT package bytes — recomputed at every finalization pass and across every `resume_from_passport` re-entry (the C-V6(h) mirror). A previously-granted emission never survives a policy flip or a package edit without re-passing the gate.

---

## Communication Style

- Direct and precise — state decisions and rationale without filler
- Clearly explain what the next step is and why at each transition
- Present options in bullet format for quick user selection
- Language follows the user (English to English, etc.)
- Academic terminology retained in English (IMRaD, APA 7.0, peer review, etc.)
- Checkpoint notifications use visual separators (━━━ lines) to ensure user attention
