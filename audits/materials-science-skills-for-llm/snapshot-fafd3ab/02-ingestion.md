# Materials-Science-Skills-For-LLM Extension Anchor Ingestion — snapshot-fafd3ab

- advisory vendor bundle: `skills/plugins/vendors/materials-science-skills-for-llm`
- vendor bundle files: 34
- vendor bundle tree SHA-256: `fcbeede16efa5c7129af56a4fbf1ebe39f84076e0f8069db22f9f703a99877f2`

## Raw Skill Inventory

| raw skill_id | files | tree SHA-256 | SKILL SHA-256 |
|---|---|---|---|
| `materials-science-skills-apex-alloy-workflows` | 5 | `d2b90d3c38948602160315a20a6e43f25f6b749f55a1536172ccd7beb01a26bc` | `6aa380d5ada2afb90c8bf415b7525cde2ed3fa59f8c46247077d742b12cfd7ec` |
| `materials-science-skills-atomsk-cli` | 4 | `4b8dd851040b7826712f225278b3fedd3349a8bb3c8ddb8272f280114c59f01a` | `9c1fbae5fe779f147276ea848d20fdbc86cdad75be483356825f399c89cfe93a` |
| `materials-science-skills-deeptb-helper` | 5 | `be842a69429a5392e3eba3ae9bec016318d6ff167f4ddecf8634e7787afd77f6` | `5135f04e4f1f26d4754f7114b93deb40fa31c91b3bedee6aa5db75c2fb51baac` |
| `materials-science-skills-dpgen-workflow` | 5 | `35017fdba04b8d6a5073b5dba1fa417fb25706948b7d4c1e85ba5079c2611517` | `e54e5d0e8d5c539f7f733e5b3242be03267ffc0c9cf249ee504c0c1bc0952e71` |
| `materials-science-skills-gpumd-workflow` | 5 | `a42828738ba8585271d9d763f144271925da6fcf333bfdfdfffce4d3b671828c` | `9c28decf1d6b8ade2ba9cfe792ec59774d2eef2dbac934deeb5f899909e6711c` |
| `materials-science-skills-phonopy-workflows` | 5 | `bfdf547c82b7e616249c43696bc650ce5c795ac73f4935e0cd22cfbf21dc7741` | `15c7da7fd6fec1bb2c092277f5d36c58e09f54dae946d1e5839109ed0e74e50c` |
| `materials-science-skills-unimol-ops` | 5 | `3996cf32007095d4e210d0c590530e82ad1764453f48cccf152129d907c9ca45` | `c040d77968a2f02acebe5afeeae3435945a8b4fb2942ef6e2133e25080549996` |

## Tool Ingestion

| target | source | SHA-256 | byte-identical |
|---|---|---|---|
| `skills/plugins/extensions/capabilities/plugin-materials-apex-alloy-workflows/references/property-parameters.md` | `skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-apex-alloy-workflows/references/property-parameters.md` | `c49514bcbe76fe916cbeb68bd99eb23a83cff727e7b88db5f3a7a3d7cac55101` | yes |
| `skills/plugins/extensions/capabilities/plugin-materials-deeptb-helper/references/dataset-and-configuration.md` | `skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-deeptb-helper/references/dataset-and-configuration.md` | `1eb7379bd04704eaf1902eab8f94929a248ceb6c448fbf794042613a7a47bb6b` | yes |
| `skills/plugins/extensions/capabilities/plugin-materials-dpgen-workflow/references/parameter-and-machine-files.md` | `skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-dpgen-workflow/references/parameter-and-machine-files.md` | `ed56521e82890be0c9d0def167dea0b48331c6edf20e2b6b6bbf40f569495975` | yes |
| `skills/plugins/extensions/capabilities/plugin-materials-gpumd-workflow/references/md-nep-and-output-playbook.md` | `skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-gpumd-workflow/references/md-nep-and-output-playbook.md` | `d79b1dc714b39d1558e78a5cab864537bee42e809e4c77dd763b23e47808213e` | yes |
| `skills/plugins/extensions/capabilities/plugin-materials-phonopy-workflows/references/configuration-and-force-files.md` | `skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-phonopy-workflows/references/configuration-and-force-files.md` | `cd5f6f522588fd0ce21507a4a308ee12d3bed435acde7a2cad967a1535786b40` | yes |
| `skills/plugins/extensions/capabilities/plugin-materials-unimol-ops/references/local-workflow-modes.md` | `skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-unimol-ops/references/local-workflow-modes.md` | `efc9883cd2e2d840022238b767cf246a2b730e709e9095b807f88318c5be0625` | yes |

## Verification

- 每个 mixed package 的 `tools/` 与 reviewed vendor bundle 逐字节一致。
- Agent-only package 不复制脚本，语义程序完整落在 `SKILL.md`。
- 上游可执行文件只审计，不执行、不安装依赖、不访问服务。
