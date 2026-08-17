# HistAgent Extension Anchor Review — snapshot-47bbe21

## Registry And Domain Review

- capability entries: 3
- profile entries: 3
- `historical-studies`: research + source analysis + source identification
- `heritage-archive-and-museum-studies`: source analysis + source identification
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-historical-research` | `f67b1df818b9fab28bfa1191d78c93c6c3176bffb0ca91f0ee08f1f61802397e` | `9de5e5d7a7d5aa8bd9048adda7aef9034afe0245bab503813d6feafc99568514` | 4 | yes | yes |
| `plugin-historical-source-analysis` | `2c04c0c5ccba9284a406e572608bd37ff06d2358c8dda476cb0b2254969c628d` | `bee9383586e32c2d2d986a8ab91a43b4f835e79b500cb74eeaf1d34f15c80098` | 4 | yes | yes |
| `plugin-historical-source-identification` | `08efc81316ce58b016dc7c4724cb164a34b20f50cdd0738886d32ca60905e286` | `5eaa68ce89bb944cafbae6bf91ecef83ae4f2f7915c9bbaa1197aabe88fcda21` | 4 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/histagent/snapshot-47bbe21/artifacts/extension-review.json` | `f4cc7a777dc047e9c4143b178d06d10b743a58472dc9a6ca01134088dc4a45ce` |

## Human Confirmation

- [x] 三个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
