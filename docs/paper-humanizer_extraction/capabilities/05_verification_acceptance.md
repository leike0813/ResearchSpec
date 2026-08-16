<!--
══════════════════════════════════════════════
Paper Humanizer 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: capability
能力/包 ID: PH-CAP-05 verification-acceptance
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/paper-humanizer/agents/full.md（L182-243）
变更台账（ledger）:
    1. [保留] full 工作流第 6–7 节"Verify the candidate / User acceptance and rejection"逐字节保留。
    2. [标注] acceptance 状态由 graph Decision 承接；本切片作为 verification capability 的 procedure 上游。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

## 6. Verify the candidate

Run `gate` and require `record_verification`. Verify before rendering a public document.

### Bidirectional information check

- Map every original-source information unit to the candidate.
- Map every candidate unit to the original source or separately authorized user input.
- Compare facts, numbers, names, dates, citations, terms, claim strength, uncertainty, scope, time, population, causality, negation, and contrast.
- Also compare the candidate with its immediate base to identify the current cycle's changes.

### Structure and protection check

- Require successful document validation.
- Confirm heading and section order, paragraph functions, lists, tables, links, code, formulas, citations, labels, identifiers, and protected syntax retain their roles.
- Confirm unapproved spans remain unchanged.

### Style and finding check

- Rescan approved findings as `resolved`, `partly_resolved`, or `unchanged_for_safety`.
- Mark excluded findings `not_in_scope` when included in the verification list.
- Search for newly introduced instances of all numbered patterns.
- Compare register, lexical level, stance, and recognizable voice with the source and any supplied writing sample.
- Interpret refreshed sentence statistics descriptively; never edit merely to raise variation.

Submit the verification payload defined below. Use:

- `pass`: every required check passes and there are no material residuals;
- `pass_with_residuals`: required checks pass and disclosed non-blocking residuals remain;
- `failed`: at least one required check fails.

A `failed` result automatically returns to plan, increments the cycle, keeps the pre-execution base, clears approval, and exposes the verification residuals for repair planning. Present the verification report before proposing the repair plan.

## 7. User acceptance and rejection

When verification passes, run `gate` and require `await_user_acceptance`. Render the candidate document to a new output path, then present:

1. the revised text or agreed output path;
2. `verification-report.md`;
3. resolved, retained, new, and residual findings;
4. one explicit acceptance question.

Acceptance payload:

```json
{"decision_note": "User accepted the latest verified candidate."}
```

Submit with `--action accept`. Acceptance is legal only for the latest `pass` or `pass_with_residuals` verification and makes the workflow terminal.

Rejection requires actionable feedback:

```json
{"feedback": "Preserve the original technical term in P3 S2."}
```

Submit with `--action reject`. The runtime increments the cycle, promotes the latest verified candidate to the working base, preserves the original document as the drift anchor, clears approval, and returns `revise_plan_after_rejection`.

If the user says only that the candidate is unacceptable, request the smallest actionable reason before recording rejection. Do not invent a repair plan from an unspecified dislike.

After rejection, submit a complete revised plan, obtain fresh approval, execute, verify, and request acceptance again. Repeat without a fixed round limit.

