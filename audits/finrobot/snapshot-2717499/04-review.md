# FinRobot Extension Anchor Review — snapshot-2717499

## Registry And Domain Review

- capability entries: 6
- profile entries: 6
- `accounting-auditing-and-accountability`: company-fundamentals + statement-analysis
- `banking-finance-and-investment`: all 6 FinRobot extensions
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-financial-company-fundamentals` | `38deebaaab8f3d8c3304829cb895c65d8fd300d90a104505ffc3c9425eb0ff97` | `a1a000fe73c9ccbbc79565969bec18d10c7b7f47bad09137fdde7af79b18648a` | 2 | yes | yes |
| `plugin-financial-competitive-position` | `cecb765b11ae254f8ec40dafbac76b94734aec3c3a7a62b2625f600e421989d2` | `53603aa27c517aadbaa4244ff17ca34a158e3577ffc06377bc9d078c59d3c927` | 0 | yes | yes |
| `plugin-financial-corporate-risk` | `6c8fd287cd0deaf4427b57d5419cc212bc7594aa4cea8e9c0668d76f4e44f281` | `d67d1be5c5c0f733604bd113faeacb8482a17a237edc47f7d6f7a14f2c1a7791` | 0 | yes | yes |
| `plugin-financial-event-evidence` | `2f3667d543a9d0397e4b6484ab1891c765a3d383b259fef01751807a1e525f95` | `d1b441c425c107eead5c0d0f4e0e144192f08e5b2acb3ae26d3a00ba5106044f` | 2 | yes | yes |
| `plugin-financial-relative-valuation` | `d44ce5e311f1fda1ae402f760b48a27e0853531495f96991e03813cc6da6de79` | `4e4ce4246971058f469c7f543a8e35176e93606ad16fc36ff19ac0a62beb73ee` | 2 | yes | yes |
| `plugin-financial-statement-analysis` | `0c8daf72a99995b438e831e2cef9b4f32991da886cf29a870e5f57d95d8f9e83` | `12fd1b179b8ec29ffef0e981f6e3241788d85d02762d626cd7b70e6d2be33008` | 2 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/finrobot/snapshot-2717499/artifacts/extension-review.json` | `043af955d99984b0869d19d5d33c9ccb64ffded81a008afb2ea193ff302ce2ea` |

## Human Confirmation

- [x] 6 个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
