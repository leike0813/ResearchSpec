# Own Vendor Anchor Analysis — revision-master @ snapshot-13e69610

- generated: 2026-09-14T03:33:45.245Z
- upstream: snapshot-13e69610 @ 13e69610f216f816f106d1a2a1672eedfa01ac9a
- maintenance skill SHA-256: `def669d3fc096a0fdf7ae084b6c7abc36819f81347bdb0958de0600f82fc8e70`

## Upstream Inventory

- total files: 48
- tree SHA-256: `17c9a3813e7fa0f2260caaf2908f6825923828d67041020eb87a27830ed15b4c`

| top-level area | files |
|---|---|
| SKILL.md | 1 |
| assets | 29 |
| references | 10 |
| scripts | 8 |

| extension | files |
|---|---|
| .j2 | 23 |
| .json | 2 |
| .md | 12 |
| .py | 8 |
| .yaml | 3 |

## Conversion Mapping

| capability_id | class | node_kind | execution | gate | maturity |
|---|---|---|---|---|---|
| `analysis-review-response-manuscript-analysis` | analysis | producer | mixed | none | operational |
| `design-review-response-intake` | design | producer | mixed | none | operational |
| `design-review-response-workboard-planning` | design | producer | mixed | required | operational |
| `generation-review-response-round` | generation | producer | mixed | required | operational |
| `transform-review-response-comment-atomization` | transformation | producer | mixed | required | operational |

## Decisions

- [x] 以 `snapshot-13e69610 @ 13e69610f216f816f106d1a2a1672eedfa01ac9a` 作为当前锚点。
- [x] extraction index 固定为 45 artifacts。
- [x] capability package 命名采用 kebab-case，并由 manifest/registry schema 强制。
- [x] 上游 workflow/state-machine 文本只进入审计与分析，流程权威由 graph profile 与 Gate/Decision 承接。
