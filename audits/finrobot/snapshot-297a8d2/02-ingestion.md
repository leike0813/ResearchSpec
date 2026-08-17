# FinRobot Extension Anchor Ingestion — snapshot-297a8d2

- advisory vendor bundle: `skills/plugins/vendors/finrobot`
- vendor bundle files: 32
- vendor bundle tree SHA-256: `a2824084ede6ff0a2e54e4c1d1066ede7286e221277f58f08ce2a1885363e66f`

## Raw Skill Inventory

| raw skill_id | files | tree SHA-256 | SKILL SHA-256 |
|---|---|---|---|
| `financial-research-company-fundamentals` | 6 | `df61ae40e533e938f241c45510ba6111029ced2cb22762ec08bdf0e335328188` | `2cdfca4e64aee816f60ee3ed0aa593b7a8c3704d4a97655fc42d12e90c22a0d0` |
| `financial-research-competitive-position` | 4 | `fd620025fe97b3b42674f340ee8a8ef4f0402cb098ebc54a9b5b81e35c5a88a6` | `1e60a56e12aa20e99b1e60668df4f2b5249172ae2ac76e273a4db89c66685337` |
| `financial-research-corporate-risk` | 4 | `0d1bb3cbb31555b1ccf1cf7354ee59f74d9883564d8ec5867fc83b3f07543d78` | `ed3b2855c35e45cd18d4a6279319393fe0a10a319e84e9d74af9aa0fae3a80df` |
| `financial-research-event-evidence` | 6 | `c54f9c8fce4eceb5456adb608312f40ba114f858b07e0d5352c822fe55f151c6` | `49be990d036ce828b5b6a7603180e187354cbbbb1f118f98c6a747f14aeedfa6` |
| `financial-research-relative-valuation` | 6 | `8e2bf0a977eb083032cd2987e609c6b4e8c8efa461b988edc9bf55f5ef70d79e` | `9bd9a483950bc5916e71372aa2b4982cd5807ac2ceb9244d77e5defb3c40ff46` |
| `financial-research-statement-analysis` | 6 | `05e87883f07696d9a7552e88f530aa6b82ec5843412d2955495d19c4d7030a07` | `d164aa203ea0e3a6e37c9c1b87f6d0f5be3c5cf7f728820576adf15c710cb11e` |

## Tool Ingestion

| target | source | SHA-256 | byte-identical |
|---|---|---|---|
| `skills/plugins/extensions/capabilities/plugin-financial-company-fundamentals/tools/fundamentals.py` | `skills/plugins/vendors/finrobot/financial-research-company-fundamentals/scripts/fundamentals.py` | `c13a2a3d909a194899ba82ce9f8e11952140f9844ccd5fe545c9a2489b544a2d` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-company-fundamentals/tools/financial_support.py` | `skills/plugins/vendors/finrobot/financial-research-company-fundamentals/lib/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-event-evidence/tools/event_evidence.py` | `skills/plugins/vendors/finrobot/financial-research-event-evidence/scripts/event_evidence.py` | `f564763b655b1ab77de3a92967dce667e6ce70eeba308dbeec5f000a34cdd3a7` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-event-evidence/tools/financial_support.py` | `skills/plugins/vendors/finrobot/financial-research-event-evidence/lib/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-relative-valuation/tools/valuation.py` | `skills/plugins/vendors/finrobot/financial-research-relative-valuation/scripts/valuation.py` | `35a7b21406d4fae48aa514a894c010503cd16ff92334ef27899c000e8cf1f95e` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-relative-valuation/tools/financial_support.py` | `skills/plugins/vendors/finrobot/financial-research-relative-valuation/lib/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-statement-analysis/tools/statements.py` | `skills/plugins/vendors/finrobot/financial-research-statement-analysis/scripts/statements.py` | `fe06b8a206d189d35983e720407c39fdb06022e600662e74ad62b02994aed388` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-statement-analysis/tools/financial_support.py` | `skills/plugins/vendors/finrobot/financial-research-statement-analysis/lib/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` | yes |

## Verification

- 每个 mixed package 的 `tools/` 与 reviewed vendor bundle 逐字节一致。
- Agent-only package 不复制脚本，语义程序完整落在 `SKILL.md`。
- 上游可执行文件只审计，不执行、不安装依赖、不访问服务。
