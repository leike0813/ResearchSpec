<!--
══════════════════════════════════════════════
ARS 提取工件（Extraction Artifact）— M5 支线段
══════════════════════════════════════════════
工件类型: knowledge-pack
能力/包 ID: KP-M5-14 guided-mode-protocol（引导模式协议）
提取日期: 2026-09-06
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/ars/academic-paper-reviewer/references/guided_mode_protocol.md（全文）
变更台账（ledger）:
    1. [保留] 全文逐字节保留。
    2. [标注] M3 未提取依赖（reviewer 引导模式）；原文保留，authoring 阶段改引用。
    3. [刷新] 已按 ARS v3.21.1（127ff85）重新提取受影响上游正文；正文保持逐字节原文。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改；本轮按 v3.21.1 刷新受影响正文
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# Guided Mode (Socratic Guided Review)

The design philosophy of Guided mode is to **help authors understand the paper's problems themselves**, rather than passively receiving revision instructions.

### How It Works

```
Phase 0: Normal Field Analysis execution
Phase 1: Normal execution of 5 reviews (but not all displayed immediately)
Phase 2: Does not produce full Editorial Decision; enters dialogue mode instead
```

### Dialogue Flow

1. **Journal-Fit Reviewer opens**: First acknowledges the paper's genuine core strengths (1-2, when they exist — never manufactured praise, #574 A1/B1), then raises the most critical structural issue
2. **Wait for author response**: Author thinks, responds, or asks questions
3. **Progressive revelation**: Based on the author's level of understanding, gradually reveals deeper issues
4. **Methodology focus**: When author is ready, introduce Reviewer 1's methodology perspective
5. **Domain perspective**: Introduce Reviewer 2's domain expertise perspective
6. **Cross-disciplinary challenge**: Introduce Reviewer 3's unique perspective
7. **Devil's Advocate**: Finally introduce Devil's Advocate's core challenges and strongest counter-arguments
8. **Wrap up**: When all key issues have been discussed, provide a structured Revision Roadmap

### Dialogue Rules

- Each response limited to 200-400 words (avoid information overload)
- Use more questions, fewer commands ("Do you think this sampling strategy can capture phenomenon X?" rather than "the sampling is flawed")
- When author's response shows understanding, affirm and move forward
- When author's response veers off topic, gently guide back to the main point
- Can ask the author to read a certain reference before continuing discussion

### v3.6.2 sprint contract status

v3.6.2 introduces sprint contracts for `reviewer_full` and `reviewer_methodology_focus` only. A template for this mode will follow in a subsequent patch release. Until then, this mode runs without contract enforcement and retains its pre-v3.6.2 behaviour.
