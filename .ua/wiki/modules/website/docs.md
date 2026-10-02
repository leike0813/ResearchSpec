
# website/docs
> 目录聚合页：4 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [website/docs/faq.md](../../files/website/docs/faq.md.md) | 文档 | 0 | 常见问题：七条问答澄清 `init` 不启动研究、论文与报告存放于 `researchspec/` 之外的项目路径、可直接编辑的稳定 spec/变更/handoff 与必须走 CLI 的 run/node 变更、Gate 确认不等于推进（需 `advance`）、用 `status --json` 恢复、旧工作区只报告不修改、doctor 只读不自愈。 |
| [website/docs/index.md](../../files/website/docs/index.md.md) | 文档 | 0 | 文档站首页：说明 ResearchSpec 是面向学术论文写作的 Agent 中立、基于文件的研究契约框架，概述其四项能力（初始化工作区、以结构化契约引导 Agent、通过 Gate 与 Decision 保持人工控制、维护可复现运行时状态），并以表格定义 Contract、Boundary deliverable、Gate、Decision、Selector 五个核心概念，末尾给出快速开始、CLI 参考与工作流指南三个入口。 |
| [website/docs/installation.md](../../files/website/docs/installation.md.md) | 文档 | 0 | 安装指南：要求 Node.js >= 22，给出 pnpm/npm 全局安装与版本校验，解释以 `researchspec/` 为根的工作区约定与 `init` 的行为（拒绝非空目标）、工具选择矩阵（`--tools all/none/具体 ID`、`--delivery`、`--literature-adapters`）、Zotero Adapter 的 Zotero-Agents 前置条件、更新与卸载流程，并指向 doctor/check 排障。 |
| [website/docs/quick-start.md](../../files/website/docs/quick-start.md.md) | 文档 | 0 | 快速上手：给出 `init --tools codex` + `check all --strict` 的四步起步脚本，说明初始化只创建 schema 2 工作区、四个稳定 spec、预置 graph profile 与 Agent 投影而不启动学术工作；随后演示可选 Zotero Adapter、root entry 确认后的 `start profile:<id>` 调用、产出落在 `researchspec/` 之外、正式评审经 Verify 建议加人工 `decide`、进度需独立 `advance`，以及用 `status --json` 恢复、用 `pack` 导出有界上下文。 |

## 子目录
- [cli](docs/cli.md)、[guides](docs/guides.md)、[reference](docs/reference.md)
