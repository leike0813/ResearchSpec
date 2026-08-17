# Materials-Science-Skills-For-LLM Extension Anchor Review — snapshot-fafd3ab

## Registry And Domain Review

- capability entries: 7
- profile entries: 7
- `materials-engineering`: apex + atomsk + deeptb + dpgen + gpumd + phonopy
- `macromolecular-and-materials-chemistry`: phonopy + unimol；`computational-modeling-and-simulation`: 全部七个
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-materials-apex-alloy-workflows` | `a4818aa7a7742abb39c7b6c953014df973da25604caeb4a3a443d5f62a6eaf92` | `451428f9b7959164a0bb4528df8da1f5ec88252c94f634401e1284c0f69b2369` | 1 | yes | yes |
| `plugin-materials-atomsk-cli` | `a27b55d391f7f09a1544f7e6575b15d012dd4b0c3a9457305a69de5274a21bca` | `10d0919ceb3d37985899a0d8d00dfb7fab8104c15e6ee5c64fa7c757f96d76bf` | 0 | yes | yes |
| `plugin-materials-deeptb-helper` | `70be8d394e017a9a588487593336b109e18883b92973ed149cb665d8709fc11c` | `d977b4b0015eb8ecbfd3cdd5962558330ef03babe299d1213ba6ea327df0d481` | 1 | yes | yes |
| `plugin-materials-dpgen-workflow` | `7c9b786aa1a276532e0bafae9aac3ce11fcbd778adae4556c7794a72243e59dc` | `4c233e16557d758e6d963dc609130a76af33c94c6f89c26a7ba82bcd4b15996b` | 1 | yes | yes |
| `plugin-materials-gpumd-workflow` | `92f3c5758b66c5609c4cf7e9a042293c2f0f0a0155687b0ce463ca12b2bd7474` | `ff15144110c09a1ddfac64f601c08e5dcd7d406c83fc04f92386b2b87598b89c` | 1 | yes | yes |
| `plugin-materials-phonopy-workflows` | `68aa25b764decac61ff62803b13b6d0cb63dab006a45733dcccdbebf963990e6` | `f08149037a9b5b4949513a56a9addbf789910beb37c92109170b59bf37a27e88` | 1 | yes | yes |
| `plugin-materials-unimol-ops` | `d6229708246c9c223036cd43f9544a7315d608e6ff81dfbba1b3a57c126eb19a` | `3e4543abadadce0c9ce1c4177165ef295b15fbfb7903cee1f9a67d5f0e0ce148` | 1 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/materials-science-skills-for-llm/snapshot-fafd3ab/artifacts/extension-review.json` | `336b300d1bd5211a2fe36b3fb5a4cca7eb81b9b8067242fe0e88ef8c085dfc0f` |

## Human Confirmation

- [x] 七个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
