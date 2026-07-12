# ResearchSpec Playbooks

本目录收录两类用途不同的演练资料。请先根据自己的目标选择入口，不要把理解项目的学习过程和发布前验收混在一起。

| 文档 | 主要读者 | 回答的问题 |
| --- | --- | --- |
| [项目所有者演练](owner-walkthrough/README.md) | 项目所有者、架构决策者、新维护者 | ResearchSpec 实际如何运行？每一步由谁完成、产生什么、我如何保持掌控？ |
| [Dogfooding QA Playbook](dogfooding/README.md) | 发布维护者、测试执行者 | 如何用稳定场景、证据和评分验证 ResearchSpec 是否遵守产品契约？ |

建议第一次接触项目时先完成项目所有者演练。理解 route、subflow、frontier、artifact、Gate、Decision 和 Workspace 权威边界后，再使用 Dogfooding QA Playbook 做发布验收。

两类 playbook 都是仓库维护资产，不属于 npm 交付面。
