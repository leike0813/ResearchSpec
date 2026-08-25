<!--
══════════════════════════════════════════════
ARS 提取工件（Extraction Artifact）— M1 研究段
══════════════════════════════════════════════
工件类型: knowledge-pack
能力/包 ID: KP-M1-06 three-layer-citation（三层引用发射 + locator）
提取日期: 2026-08-15
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/ars/deep-research/agents/synthesis_agent.md §Two-Layer Citation Emission (v3.7.1) + §Three-Layer Citation Emission (v3.7.3)（L253-302）
变更台账（ledger）:
    1. [保留] 原文逐字节保留（含 R-L3-1-A/B/C/D、anchor 闭集枚举、URL 编码规则含连字符特例）。
    2. [标注] 上游另有 check_v3_7_3_three_layer_citation.py lint；验证器资产在 authoring 阶段归引擎侧（Q6 决策）。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

## Two-Layer Citation Emission (v3.7.1)

When emitting any citation in the synthesis output, write the citation in two layers:

1. **Visible layer**: standard author-year form (e.g. `Smith (2024)` or `(Smith, 2024)`).
2. **Hidden layer**: immediately after the visible form, append an HTML comment of the shape `<!--ref:slug-->`, where `slug` is the `citation_key` already present in the corpus context provided in this prompt.

Examples: `Smith (2024) <!--ref:smith2024-->` or `(Smith, 2024)<!--ref:smith2024-->`.

Strict obligations:

- The slug is taken ONLY from the corpus context already in this prompt. NEVER read the entry frontmatter to discover the slug or any other entry attribute. The corpus context lists every slug you are allowed to cite.
- Emit the `<!--ref:slug-->` marker bare. NEVER resolve, mutate, annotate, or comment on the marker.
- The agent's job ends at emission. The agent does not consume, post-process, or audit the markers it has written.
- Apply the two-layer form to every citation, in every section, with no exceptions. A bare `Smith (2024)` without the trailing `<!--ref:slug-->` is a contract violation.
- The HTML comment is invisible in markdown rendering but mechanically extractable. Do not omit it on the assumption that "the comment will be added later."

## Three-Layer Citation Emission (v3.7.3)

Extends Two-Layer with a structured claim-faithfulness anchor. External motivation: Zhao et al. arXiv:2605.07723 (2026-05) — corpus-scale audit finds the L3 "real citations deployed to support claims the cited references do not actually make" problem unaddressed by existing safeguards. Spec: `docs/design/2026-05-12-ars-v3.7.3-claim-faithfulness-and-contaminated-source-spec.md` §3.1.

Every visible citation MUST be followed by BOTH a slug marker AND an anchor marker:

```
<visible> <!--ref:slug--><!--anchor:<kind>:<value>-->
```

Anchor kinds (closed enum):

| kind | value | example |
|---|---|---|
| `quote` | URL-encoded verbatim text from the cited source, ≤25 words | `<!--anchor:quote:When%20publishers%20bypass%20moderation-->` |
| `page` | page number or range from the cited source | `<!--anchor:page:12-14-->` |
| `section` | section identifier from the cited source | `<!--anchor:section:3.2-->` |
| `paragraph` | 1-based paragraph index within section | `<!--anchor:paragraph:3-->` |
| `none` | explicit no-anchor declaration | `<!--anchor:none:-->` |

Full example: `Smith (2024) <!--ref:smith2024--><!--anchor:page:14-->`.

Four firm rules:

- **R-L3-1-A (production-mandatory locator):** During synthesis emission, every visible citation MUST carry an anchor with `<kind>` ≠ `none`. The finalizer treats `<!--anchor:none:-->` as MED-WARN-NO-LOCATOR (gate-refused). Emitting `none` does NOT bypass the gate — it triggers it. Use `none` only when you genuinely cannot produce any locator and want the gate to surface the problem to the user.
- **R-L3-1-B (quote length cap):** When `<kind>` = `quote`, the URL-decoded value MUST be ≤25 words by whitespace split (per `shared/references/word_count_conventions.md`). Quotes exceeding 25 words MUST be replaced by `page` or `section` locator.
- **R-L3-1-C (no anchor reading by emitting agents):** Generate the `<!--anchor:...-->` value from the corpus context already in this prompt (the same context that provides the slug). You MUST NOT read entry frontmatter to discover anchor candidates — that breaks the v3.6.7 partial-inversion discipline that keeps the agent narrative-side and the finalizer audit-side separate. If the corpus context does not include enough source detail to produce a verifiable locator, emit `<!--anchor:none:-->` and let the gate surface it.
- **R-L3-1-D (#512 PDF read-integrity precondition):** A `page` anchor whose value derives from a locally-read PDF is fully licensed ONLY by a PDF read-integrity preflight verdict of `PASS` for that file (`scripts/pdf_read_preflight.py` sidecar; it arrives in your context like the corpus itself — R-L3-1-C still forbids reading entry frontmatter to discover it). Two non-PASS regimes, strict where there is evidence and advisory where there is only absence: (1) verdict `FAIL` — positive truncation/mispagination evidence — do NOT trust the page number: emit `<!--anchor:none:-->` (the existing gate then surfaces it) or an independently-visible non-page locator (`section` / `paragraph` grounded in text visible in your context), plus an explicit PDF-integrity warning line. (2) Verdict `UNAVAILABLE`, or NO sidecar in context (standalone dispatch without the orchestration layer, a no-Python install where the preflight cannot run, or a file the layer missed) — the channel is unverified, not known-bad: prefer an independently-visible non-page locator when one exists; otherwise the `page` anchor MAY be emitted, but MUST be accompanied by an explicit PDF-integrity warning line next to the citation stating the page locator is unverified. Never silently emit an unverified page anchor; never gate-refuse a citation solely because the preflight layer was absent. Rationale: PDF readers silently truncate documents with malformed cross-reference tables and misreport page counts; a page number extracted from a truncated read is poisoned in a way no downstream shape check can detect — but absence of verification is an advisory condition, while positive evidence of truncation is a refusal condition.

URL-encoding for `quote:` values uses standard percent-encoding (`%20` for space, `%2C` for comma, `%3A` for colon, etc.) **AND additionally percent-encodes any consecutive run of two or more hyphen characters: `--` MUST be written as `%2D%2D`** (and `---` as `%2D%2D%2D`, etc.). Standard RFC 3986 encoding treats `-` as an unreserved character and does NOT encode it, but a quote containing `--` (e.g., from an em-dash, a divider, or a nested HTML comment opener) would leave a literal `--` in the anchor value that prematurely closes the HTML comment. A single hyphen between word characters (e.g., `AI-generated`, `well-known`) is safe and may remain raw. Always percent-encode space, comma, colon, AND any consecutive-hyphen run. Never rely on the absence of `-->` in the quoted text. v3.7.3 gemini review F1 + codex round-6 F15 closure (prompt-vs-lint alignment).

The agent's job still ends at emission. The agent does NOT post-process or audit its own anchors. The cite_provenance_finalizer_agent reads `<!--anchor:...-->` markers downstream, applies the 5-cell matrix, and mutates them in place.

