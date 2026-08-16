# ARSU Anchor Audit Record Template

## Directory

```text
audits/arsu/<version>-<short_commit>/
  manifest.json
  01-analysis.md
  02-ingestion.md
  03-conversion.md
  04-review.md
  05-semantic-review.md
```

## manifest.json

由 `node scripts/arsu-maintenance.mjs baseline <anchor>` 生成；`01-04` 记录由 `records` 生成，`05-semantic-review.md` 必须由 Agent 完成，`[NOT-COMPLETED]` 会被 baseline 拒绝。核心字段：

```json
{
  "schema_version": "1",
  "anchor_id": "v3.19.0-828ef3b",
  "upstream": {
    "submodule_path": "vendor/ars",
    "repository_url": "https://github.com/Imbad0202/academic-research-skills",
    "version": "v3.19.0",
    "commit": "828ef3b613b0e8b91830da3328a1e33d4eb5ab4c"
  },
  "extraction": {
    "index_sha256": "<sha256>",
    "artifact_count": 119,
    "pass": 119
  },
  "conversion": {
    "registry_sha256": "<sha256>",
    "capability_count": 38,
    "operational_count": 38,
    "packages_tree_sha256": "<sha256>"
  },
  "review": {
    "parity_report_sha256": "<sha256>",
    "section_coverage": 0.9513519147963746,
    "rule_coverage": 0.9660287081339716,
    "assessment_html_sha256": "<sha256>",
    "review_html_sha256": "<sha256>"
  }
}
```

## 工件生成入口

```bash
pnpm arsu-maintenance:artifacts
node scripts/arsu-maintenance.mjs records <anchor>
node scripts/arsu-maintenance.mjs baseline <anchor>
```

## 四阶段记录模板

### 01-analysis.md

```markdown
# ARSU Anchor Analysis

- anchor: <id>
- upstream: <repo> @ <version> (<commit>)
- date: <date>

## Scope

- <first anchor or diff range>
- diff stat summary
- files changed

## Impact classification

| Upstream change | ResearchSpec surface | Decision |
|---|---|---|
| ... | ... | ... |

## Decisions needing confirmation

- [ ] ...
```

### 02-ingestion.md

```markdown
# ARSU Anchor Ingestion

- extraction index SHA-256: <sha>
- artifact count: <n>
- verification: pass/fail/error counts

## Artifacts

| Artifact ID | Action | Upstream source | Notes |
|---|---|---|---|
| ... | unchanged/updated/added | ... | ... |
```

### 03-conversion.md

```markdown
# ARSU Anchor Conversion

- capability packages: 38
- operational: 38
- packages tree SHA-256: <sha>
- registry SHA-256: <sha>

## Changes

| Capability / profile | Change | Reason |
|---|---|---|
| ... | ... | ... |

## Verification

- [x] pnpm arsu:author idempotent
- [x] pnpm arsu:check
- [x] pnpm check / lint
- [x] full test suite
```

### 04-review.md

```markdown
# ARSU Anchor Review

- parity: section <x>, rule <x>, knowledge 1, flow 0
- assessment: <preserved>/<total> preserved, <flow> flow, <gap> gaps
- review HTML SHA-256: <sha>
- assessment HTML SHA-256: <sha>

## Human confirmation

- [ ] ...
```

## Incremental update record

新锚点 `02-ingestion.md` 必须额外记录：

- old anchor / new anchor
- unchanged artifacts
- updated artifacts
- removed artifacts
- 新增 artifacts

### 05-semantic-review.md（Agent 必填）

```markdown
# ARSU Anchor Semantic Review — <anchor>

## 审阅范围

## 逐项语义判定

| 上游语义 | 转换后承载 | 判定 | 证据 |
|---|---|---|---|

## 流程权威检查

- [ ] ...

## 风险与遗留

## 结论

<declared-fit / declared-fit-with-notes / not-fit> 及理由。
```
