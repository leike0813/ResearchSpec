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
| `plugin-materials-apex-alloy-workflows` | `3cc8056045c5500fe5e11a5b56983e341197be0377d06123a3c5181fa5746e71` | `451428f9b7959164a0bb4528df8da1f5ec88252c94f634401e1284c0f69b2369` | 1 | yes | yes |
| `plugin-materials-atomsk-cli` | `c54e82fb5d28275470db9190a74b1c5009fcebe821dbb144f2d62b6df07d4ce1` | `10d0919ceb3d37985899a0d8d00dfb7fab8104c15e6ee5c64fa7c757f96d76bf` | 0 | yes | yes |
| `plugin-materials-deeptb-helper` | `95fc326ce44f2eb864c09b9c8c911d770426cea1f204b7898cca68b85b743f97` | `d977b4b0015eb8ecbfd3cdd5962558330ef03babe299d1213ba6ea327df0d481` | 1 | yes | yes |
| `plugin-materials-dpgen-workflow` | `7b81bd7f77cd3f45b1e69e8948706ae549a19d66917a75737bce917f66d25493` | `4c233e16557d758e6d963dc609130a76af33c94c6f89c26a7ba82bcd4b15996b` | 1 | yes | yes |
| `plugin-materials-gpumd-workflow` | `da446a3a46f7b246be7a4ee3c79c1f0e14a158728ccea5d1a163bea0f99dbf3d` | `ff15144110c09a1ddfac64f601c08e5dcd7d406c83fc04f92386b2b87598b89c` | 1 | yes | yes |
| `plugin-materials-phonopy-workflows` | `efdddb82ae959690b6dfd6cc93673f840041b4e8b63e387eda315e0b6df4c11e` | `f08149037a9b5b4949513a56a9addbf789910beb37c92109170b59bf37a27e88` | 1 | yes | yes |
| `plugin-materials-unimol-ops` | `a774eaac6c555937fc859f8ae86c57fa4f60c74e47d6161284c9071561e2e6e2` | `3e4543abadadce0c9ce1c4177165ef295b15fbfb7903cee1f9a67d5f0e0ce148` | 1 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/materials-science-skills-for-llm/snapshot-fafd3ab/artifacts/extension-review.json` | `67df83acd01e8888fc96a141162ad7431f6b70b8dbbddf54bfaac3544008cfdc` |

## Human Confirmation

- [x] 七个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
