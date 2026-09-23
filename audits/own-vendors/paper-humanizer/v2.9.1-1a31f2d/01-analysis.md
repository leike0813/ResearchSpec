# Own Vendor Anchor Analysis — paper-humanizer @ v2.9.1-1a31f2d

- generated: 2026-09-22T17:15:48.474Z
- upstream: v2.9.1 @ 1a31f2d0ff6dab94c799f7ae1a3a469aea3e5394
- maintenance skill SHA-256: `def669d3fc096a0fdf7ae084b6c7abc36819f81347bdb0958de0600f82fc8e70`

## Upstream Inventory

- total files: 8
- tree SHA-256: `5094db4e59a88dc82065efe915686043621c31d77ad5f92f4debb2d1888fc853`

| top-level area | files |
|---|---|
| LICENSE | 1 |
| SKILL.md | 1 |
| agents | 2 |
| references | 2 |
| scripts | 2 |

| extension | files |
|---|---|
| (none) | 1 |
| .md | 5 |
| .py | 2 |

## Conversion Mapping

| capability_id | class | node_kind | execution | gate | maturity |
|---|---|---|---|---|---|
| `check-paper-humanization-review` | verification | checker | mixed | none | operational |
| `check-paper-humanization-verification` | verification | checker | mixed | none | operational |
| `generation-humanization-reference` | generation | observer | llm | none | operational |
| `transform-paper-humanization-revision` | transformation | producer | mixed | required | operational |

## Decisions

- [x] 以 `v2.9.1 @ 1a31f2d0ff6dab94c799f7ae1a3a469aea3e5394` 作为当前锚点。
- [x] extraction index 固定为 9 artifacts。
- [x] capability package 命名采用 kebab-case，并由 manifest/registry schema 强制。
- [x] 上游 workflow/state-machine 文本只进入审计与分析，流程权威由 graph profile 与 Gate/Decision 承接。
