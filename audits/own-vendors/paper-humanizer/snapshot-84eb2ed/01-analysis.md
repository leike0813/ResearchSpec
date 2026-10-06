# Own Vendor Anchor Analysis — paper-humanizer @ snapshot-84eb2ed

- generated: 2026-10-05T18:11:28.510Z
- upstream: snapshot-84eb2ed @ 84eb2edf9570aea85a799e4c4db559882c19928c
- maintenance skill SHA-256: `54da495208f529136035ff10375cc7ae76981c6d44a3f0f1795e744c6b5f68af`

## Upstream Inventory

- total files: 10
- tree SHA-256: `b6879782fdb9ef1215e1a3cfbed5752e88778bd693489fea55521149a5dcd61d`

| top-level area | files |
|---|---|
| LICENSE | 1 |
| SKILL.md | 1 |
| agents | 2 |
| assets | 1 |
| references | 3 |
| scripts | 2 |

| extension | files |
|---|---|
| (none) | 1 |
| .md | 7 |
| .py | 2 |

## Conversion Mapping

| capability_id | class | node_kind | execution | gate | maturity |
|---|---|---|---|---|---|
| `check-paper-humanization-review` | verification | checker | mixed | none | operational |
| `check-paper-humanization-verification` | verification | checker | mixed | none | operational |
| `generation-humanization-reference` | generation | observer | llm | none | operational |
| `transform-paper-humanization-revision` | transformation | producer | mixed | required | operational |

## Decisions

- [x] 以 `snapshot-84eb2ed @ 84eb2edf9570aea85a799e4c4db559882c19928c` 作为当前锚点。
- [x] extraction index 固定为 11 artifacts。
- [x] capability package 命名采用 kebab-case，并由 manifest/registry schema 强制。
- [x] 上游 workflow/state-machine 文本只进入审计与分析，流程权威由 graph profile 与 Gate/Decision 承接。
