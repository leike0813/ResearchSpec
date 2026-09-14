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
| `plugin-historical-research` | `ff240ed257c38984ab1e7e30f2b5bdd919a8d6f30d71e77e3a3b013eff7a3e82` | `9de5e5d7a7d5aa8bd9048adda7aef9034afe0245bab503813d6feafc99568514` | 4 | yes | yes |
| `plugin-historical-source-analysis` | `c9a62c7ccbe6f67ee609096cf132cae2552da02c651ac875cf81a07dee04ce6b` | `bee9383586e32c2d2d986a8ab91a43b4f835e79b500cb74eeaf1d34f15c80098` | 4 | yes | yes |
| `plugin-historical-source-identification` | `1fcb60e0b6d9b8ade6f1e574ba18ce909687783d98193029c85e9723e6ea07e2` | `5eaa68ce89bb944cafbae6bf91ecef83ae4f2f7915c9bbaa1197aabe88fcda21` | 4 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/histagent/snapshot-47bbe21/artifacts/extension-review.json` | `e527f83eb6d3b02e0e83b7b8d85c6755f0993c4e6e0121281ebc79ce8a3d7218` |

## Human Confirmation

- [x] 三个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
