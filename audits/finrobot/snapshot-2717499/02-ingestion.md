# FinRobot Extension Anchor Ingestion — snapshot-2717499

- advisory vendor bundle: `skills/plugins/vendors/finrobot`
- vendor bundle files: 32
- vendor bundle tree SHA-256: `29493548be74dafda5cb87b920c8f8091f80e7e120847d367c7f041e5a0569ee`

## Raw Skill Inventory

| raw skill_id | files | tree SHA-256 | SKILL SHA-256 |
|---|---|---|---|
| `financial-research-company-fundamentals` | 6 | `f98e1587d5103db0a48c95baf1bd8ea1ad3c21f3d606bb5e992a38d33dbb41e4` | `0aad28130c0cff134f8d45751a61849e5f9e2da050032945ddb45b725b2f2210` |
| `financial-research-competitive-position` | 4 | `85f0e301377ce29ffa15d0b0fdb9e8f64a78b002e0d9283c087448441c183c35` | `4fa91e07d43dda8a2e7dea079e456dd39a75c5bdbe6cad00a3fe6524ae7feb30` |
| `financial-research-corporate-risk` | 4 | `c4e1cc37e6665bdb39351f7a6ce5d92bd0c61004f8cdc5d90199f321652fef2d` | `6d006582e10bdac81bc008314dbfa53d380c2c65e32ecce8f20e5366cc8fcea0` |
| `financial-research-event-evidence` | 6 | `bbc39b5e2c0a255672f0c34194735d5b35a763bde8b7be4c98a0402063ebb99f` | `b5203b38f8fde3a95f39c86eb6b93e76942d61a62de378a95f0a661d12de02c4` |
| `financial-research-relative-valuation` | 6 | `934605e76bf0586984741a2054c463fe8da57facca9aba2f279816a024d8303b` | `a4e0ca25d5f3bd461eded7e66bdd8c3fda4ef13ad23d6935075d4a99cd412e13` |
| `financial-research-statement-analysis` | 6 | `e1a8cd762e26b27abde949fb5a7a506de6e84aa9f7b72d7ac346a0e27f3c6a57` | `94ddb783832bb5dd13439dfa25d3c61acc1950f34f6fa6f677b2d2a6f82c660e` |

## Tool Ingestion

| target | source | SHA-256 | byte-identical |
|---|---|---|---|
| `skills/plugins/extensions/capabilities/plugin-financial-company-fundamentals/tools/fundamentals.py` | `skills/plugins/vendors/finrobot/financial-research-company-fundamentals/scripts/fundamentals.py` | `c13a2a3d909a194899ba82ce9f8e11952140f9844ccd5fe545c9a2489b544a2d` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-company-fundamentals/tools/financial_support.py` | `skills/plugins/vendors/finrobot/financial-research-company-fundamentals/lib/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-event-evidence/tools/event_evidence.py` | `skills/plugins/vendors/finrobot/financial-research-event-evidence/scripts/event_evidence.py` | `f564763b655b1ab77de3a92967dce667e6ce70eeba308dbeec5f000a34cdd3a7` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-event-evidence/tools/financial_support.py` | `skills/plugins/vendors/finrobot/financial-research-event-evidence/lib/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-relative-valuation/tools/valuation.py` | `skills/plugins/vendors/finrobot/financial-research-relative-valuation/scripts/valuation.py` | `f4e9975e2859473925063f73afe42da06fc48c6cde11b22d79ff99ebb8716374` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-relative-valuation/tools/financial_support.py` | `skills/plugins/vendors/finrobot/financial-research-relative-valuation/lib/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-statement-analysis/tools/statements.py` | `skills/plugins/vendors/finrobot/financial-research-statement-analysis/scripts/statements.py` | `bb5a82877c1d70e6c8c7dff4a509e4451255e2ebe50e858b9bbd2714c7067085` | yes |
| `skills/plugins/extensions/capabilities/plugin-financial-statement-analysis/tools/financial_support.py` | `skills/plugins/vendors/finrobot/financial-research-statement-analysis/lib/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` | yes |

## Verification

- 每个 mixed package 的 `tools/` 与 reviewed vendor bundle 逐字节一致。
- Agent-only package 不复制脚本，语义程序完整落在 `SKILL.md`。
- 上游可执行文件只审计，不执行、不安装依赖、不访问服务。
