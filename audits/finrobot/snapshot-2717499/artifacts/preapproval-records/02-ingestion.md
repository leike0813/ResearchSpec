# FinRobot 候选吸纳记录

日期：2026-09-30。状态：pending-human-review，尚未切换生产 pin。

候选 revision：`2717499b8e30f242640af08c4ad9afd1113c2d45`；audit SHA-256：`3a592982ff4bd9f53853ef56b958e330593d7b70594622580975bafa3727884b`。
完整候选树集合：`1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6`。

## 六个完整 raw 树

路径前缀：`artifacts/candidate/vendors/finrobot/`。四 Tier 3、两 Tier 1，共 32 文件。
每份树含完整 SKILL、LICENSE、NOTICE、DERIVATION；四 Tier 3 各有 entrypoint 与 copied support。

| raw Skill | renderer 树 SHA-256 |
| --- | --- |
| `financial-research-company-fundamentals` | `97d5978147105d728120c59841634d17000a7f3981fb2d37c437c2c5f3b9a46f` |
| `financial-research-competitive-position` | `8e0c69a17a7420fd055946b5b60d57f5d070219d5b883bb868e5b2aac2f4cbb1` |
| `financial-research-corporate-risk` | `28716dec9cacccca694b68eef05307622b499c673eebd442db64370992c8eb74` |
| `financial-research-event-evidence` | `33448526d9568d5fd3879f15d7fae4d79cd02689188b49d68ae4bafa021d1fe9` |
| `financial-research-relative-valuation` | `e5805507b06fe3ae024251a5f866cf4915f677fcddf14a20b1507d895b9fbedd` |
| `financial-research-statement-analysis` | `e884e5c35af1add771506cdd3a45e998c2e2860c4f232b383a6ee76a01464fc4` |

公司基本面与竞争地位增加 Agent 证据消费义务；估值和报表更新脚本与主程序；
风险和事件业务正文只变 release 元数据。fundamentals.py、event_evidence.py 和共享 support
保持生产字节。六个 ID、两领域和空 hard dependencies 不变。

## 八份 extension 工具

以下 tools 均从对应候选 raw scripts/lib 逐字节投影，未复制上游 provider/runtime。

| 工具路径 | SHA-256 |
| --- | --- |
| `plugin-financial-company-fundamentals/tools/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` |
| `plugin-financial-company-fundamentals/tools/fundamentals.py` | `c13a2a3d909a194899ba82ce9f8e11952140f9844ccd5fe545c9a2489b544a2d` |
| `plugin-financial-event-evidence/tools/event_evidence.py` | `f564763b655b1ab77de3a92967dce667e6ce70eeba308dbeec5f000a34cdd3a7` |
| `plugin-financial-event-evidence/tools/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` |
| `plugin-financial-relative-valuation/tools/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` |
| `plugin-financial-relative-valuation/tools/valuation.py` | `f4e9975e2859473925063f73afe42da06fc48c6cde11b22d79ff99ebb8716374` |
| `plugin-financial-statement-analysis/tools/financial_support.py` | `9e0ae3d35906d5b0cf65e25b409641c14a32b3262aa3ce59ce294662173daa7c` |
| `plugin-financial-statement-analysis/tools/statements.py` | `bb5a82877c1d70e6c8c7dff4a509e4451255e2ebe50e858b9bbd2714c7067085` |

## 来源与资源

全量 audit 为 1,049 entries、129 surfaces、八来源和七许可。39 admitted surface 精确映射
到六份定义，19 个来源只作 evidence-only；旧 34 排除项与新增 56 第三方 Skill 继续 excluded。
`artifacts/source-evidence/` 是离线审计证据，不随 Skill 分发。

验证：独立 Git tree/blob/bytes/SHA-256 核对零差异；preview 复核完整来源树与全部候选
输出；定向测试 34/34 通过，含旧生产、候选离线复现、金融边界和 extension 图执行。
最终全量结果见 [03-conversion.md](03-conversion.md)。
