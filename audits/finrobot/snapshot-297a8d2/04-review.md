# FinRobot Extension Anchor Review — snapshot-297a8d2

## Registry And Domain Review

- capability entries: 6
- profile entries: 6
- `accounting-auditing-and-accountability`: company-fundamentals + statement-analysis
- `banking-finance-and-investment`: all six FinRobot extensions
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-financial-company-fundamentals` | `23b0308a26ddfa0b42c8f2ca5fdcd6e17359ecb042ecc7ce2378313e65d4b369` | `a1a000fe73c9ccbbc79565969bec18d10c7b7f47bad09137fdde7af79b18648a` | 2 | yes | yes |
| `plugin-financial-competitive-position` | `b776acd1bb5e66b0ec267a4cde2304ae58c4ff92ef8b643e91aa7b6e86f6073c` | `53603aa27c517aadbaa4244ff17ca34a158e3577ffc06377bc9d078c59d3c927` | 0 | yes | yes |
| `plugin-financial-corporate-risk` | `50bdba8f538857b3cc81f4e302eeb6584a415d34f357c74965d64db5d1c32af8` | `d67d1be5c5c0f733604bd113faeacb8482a17a237edc47f7d6f7a14f2c1a7791` | 0 | yes | yes |
| `plugin-financial-event-evidence` | `a5e7d36c8cc091c520e7e34d733cc4b2a50632352b478958b4c0c2f89a286ac8` | `d1b441c425c107eead5c0d0f4e0e144192f08e5b2acb3ae26d3a00ba5106044f` | 2 | yes | yes |
| `plugin-financial-relative-valuation` | `ff35dc48d6b7ad629ae3f242f11d7c39ded2fee62158c89a3f9ef52c235e3a57` | `4e4ce4246971058f469c7f543a8e35176e93606ad16fc36ff19ac0a62beb73ee` | 2 | yes | yes |
| `plugin-financial-statement-analysis` | `599c55c0f0c5572ce168f7e3dc9fe467d8ebac8d862b7f8ba20e47df7cf98e9f` | `12fd1b179b8ec29ffef0e981f6e3241788d85d02762d626cd7b70e6d2be33008` | 2 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/finrobot/snapshot-297a8d2/artifacts/extension-review.json` | `5d60a2b06d96564a4d9c64d1609f9f575a055220db3f2ba292c9f8c320acd563` |

## Human Confirmation

- [x] 六个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
