<!--
══════════════════════════════════════════════
Paper Humanizer 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: capability
能力/包 ID: PH-CAP-04 revision-execution
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/paper-humanizer/agents/full.md（L141-181）
变更台账（ledger）:
    1. [保留] full 工作流第 5 节"Execute the approved plan"逐字节保留。
    2. [标注] 流程 gate 与 apply 命令语义由 graph engine 承接；本切片作为 revision capability 的 procedure 上游。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

## 5. Execute the approved plan

Run `gate` and require `execute_revision`.

Before editing, map the information units for each included plan item:

- claims, propositions, evidence, and citations;
- entities, numbers, dates, terminology, scope, conditions, certainty, negation, contrast, and causality;
- paragraph and section function;
- deliberate voice features.

Edit only the `text` fields of approved `prose` segments in the current base artifact. Do not touch excluded, pending, or protected content. Prefer the smallest operation that resolves the supported mechanism.

After editing:

```bash
python scripts/document_pipeline.py analyze --input EDITED.yaml --output CANDIDATE.yaml
python scripts/document_pipeline.py validate --input CANDIDATE.yaml
```

Do not render the public output yet. Record execution with:

```json
{
  "approved_plan_hash": "<approved hash>",
  "base_content_sha256": "<approved base content hash>",
  "candidate_document": "/absolute/path/to/CANDIDATE.yaml",
  "item_results": [
    {
      "plan_item_id": "RP-001",
      "status": "applied",
      "note": "The bounded operation was applied."
    }
  ]
}
```

`status` is exactly `applied`, `partly_applied`, or `unchanged_for_safety`. Include one result for every plan item whose disposition is `include`, and none for excluded items.

The runtime rejects a stale plan, stale base, invalid candidate, changed source anchor, changed manifest, or incomplete item results.

