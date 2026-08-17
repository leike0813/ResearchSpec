# HistAgent Extension Anchor Ingestion — snapshot-47bbe21

- advisory vendor bundle: `skills/plugins/vendors/histagent`
- vendor bundle files: 24
- vendor bundle tree SHA-256: `67a2333b593dc1317c84a768b9f33fa381e065783f7918dfeece32f4990d0829`

## Raw Skill Inventory

| raw skill_id | files | tree SHA-256 | SKILL SHA-256 |
|---|---|---|---|
| `histagent-historical-research` | 8 | `7211fd4c513b9fc9bdd35a3620c68a1fccdebc1bab988955168e94b8f9ffef6d` | `f3a947459670d01fba54975a7ec9e841dd1ee379d1a37ded59ed739d2d84590b` |
| `histagent-historical-source-analysis` | 8 | `641810100efb2e10d2f2cc5bc384bdd1442519218b5b5764e30d0c627f98a60a` | `f021d66c0e6c361bc62a1904d0f570644de9e6959fd7fac9e8645c0208befd60` |
| `histagent-historical-source-identification` | 8 | `a853e2001f9379db60e7e2119bbee3390970f573ad96a2f25504628fb046e60e` | `cff2a73ed49816f9d7093a7062f4dee8037bd319e1239d344614500a1ca229b8` |

## Tool Ingestion

| target | source | SHA-256 | byte-identical |
|---|---|---|---|
| `skills/plugins/extensions/capabilities/plugin-historical-research/tools/research_runtime.py` | `skills/plugins/vendors/histagent/histagent-historical-research/scripts/research_runtime.py` | `1bf8b39abf4fab11a0e2cd13df594a7e71a10721c69d1b81158a25a5286a6f1c` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-research/tools/historical_support.py` | `skills/plugins/vendors/histagent/histagent-historical-research/lib/historical_support.py` | `f46f1da49ee21d8e0586bc953ab0e7373802cbf631e0821437628d57ef158c91` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-research/references/stage-records.md` | `skills/plugins/vendors/histagent/histagent-historical-research/references/stage-records.md` | `82639590d7d5f1062ea497005136e5b6d6fb950a44e21f04f7a2379ac5f9fe3b` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-research/references/evidence-and-conflict-cases.md` | `skills/plugins/vendors/histagent/histagent-historical-research/references/evidence-and-conflict-cases.md` | `f91b50b40f23f4c15a3a38003d9eee8f59b1756ea9dc636db42b19b8748886b5` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-source-analysis/tools/analyze_source.py` | `skills/plugins/vendors/histagent/histagent-historical-source-analysis/scripts/analyze_source.py` | `7a4355ebd86dac2882b4e39ffa89cc468753a3fedaa3faf1e81a7162a2245e3a` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-source-analysis/tools/historical_support.py` | `skills/plugins/vendors/histagent/histagent-historical-source-analysis/lib/historical_support.py` | `f46f1da49ee21d8e0586bc953ab0e7373802cbf631e0821437628d57ef158c91` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-source-analysis/references/adapters-and-formats.md` | `skills/plugins/vendors/histagent/histagent-historical-source-analysis/references/adapters-and-formats.md` | `c8eb580edbbd66bd1c235cd2e37a6f85e127e6ad6a7dcfc6fb6ec75792302546` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-source-analysis/references/layer-and-collation-cases.md` | `skills/plugins/vendors/histagent/histagent-historical-source-analysis/references/layer-and-collation-cases.md` | `f3553e4f04a8621676577d8f0fe65f1a199ba6450aa091f664a8455ef0f4b002` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-source-identification/tools/identify_sources.py` | `skills/plugins/vendors/histagent/histagent-historical-source-identification/scripts/identify_sources.py` | `dbaecbf5a5a23ad3fc869e60ea89457e17d54441f13a072a213756032f8c21b1` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-source-identification/tools/historical_support.py` | `skills/plugins/vendors/histagent/histagent-historical-source-identification/lib/historical_support.py` | `f46f1da49ee21d8e0586bc953ab0e7373802cbf631e0821437628d57ef158c91` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-source-identification/references/provider-adapters.md` | `skills/plugins/vendors/histagent/histagent-historical-source-identification/references/provider-adapters.md` | `4eda74f31eac16eea956be2a37e645428e48aca4d961e32f572f43c1957bd78f` | yes |
| `skills/plugins/extensions/capabilities/plugin-historical-source-identification/references/candidate-verification-cases.md` | `skills/plugins/vendors/histagent/histagent-historical-source-identification/references/candidate-verification-cases.md` | `5c5492c102c22e61073af19b048606abcdf30a2bbafb7a6cc75eb0b93a746ce0` | yes |

## Verification

- 每个 mixed package 的 `tools/` 与 reviewed vendor bundle 逐字节一致。
- Agent-only package 不复制脚本，语义程序完整落在 `SKILL.md`。
- 上游可执行文件只审计，不执行、不安装依赖、不访问服务。
