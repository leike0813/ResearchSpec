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
| `plugin-financial-company-fundamentals` | `0fd1fd966326f7f4f79e2d3afe0837c29f1f02fc252cfb92fdab1d5e219e9b15` | `a1a000fe73c9ccbbc79565969bec18d10c7b7f47bad09137fdde7af79b18648a` | 2 | yes | yes |
| `plugin-financial-competitive-position` | `263911063fca2d46126d69be1d6808b31e8954334d46b38b54de8b4e99ac8693` | `53603aa27c517aadbaa4244ff17ca34a158e3577ffc06377bc9d078c59d3c927` | 0 | yes | yes |
| `plugin-financial-corporate-risk` | `5415e389c60c65a0b776ea089b0a87ed1546c636bc73c5fd65a88436a6930ff3` | `d67d1be5c5c0f733604bd113faeacb8482a17a237edc47f7d6f7a14f2c1a7791` | 0 | yes | yes |
| `plugin-financial-event-evidence` | `2edb6c82b7348c66aa46d950d28c18be49571a043315de58d5e71534ae51c8a0` | `d1b441c425c107eead5c0d0f4e0e144192f08e5b2acb3ae26d3a00ba5106044f` | 2 | yes | yes |
| `plugin-financial-relative-valuation` | `e36775d436657b753255f0431dafe3e992cb2496fe1809763afeb9e7107307c8` | `4e4ce4246971058f469c7f543a8e35176e93606ad16fc36ff19ac0a62beb73ee` | 2 | yes | yes |
| `plugin-financial-statement-analysis` | `fc7114213071b6719e1fd9e4e50a2710b6edc3c538b093288bb6e5dda89a5448` | `12fd1b179b8ec29ffef0e981f6e3241788d85d02762d626cd7b70e6d2be33008` | 2 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/finrobot/snapshot-297a8d2/artifacts/extension-review.json` | `6061c596ce7fd3a9e1da08e4a4160811340be930e9f00b687fb33e9b25e447b0` |

## Human Confirmation

- [x] 六个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
