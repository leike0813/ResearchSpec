---
name: dogfood-audit
description: Run ResearchSpec's all-target init matrix and optional single-host behavior audit. Use for maintainer dogfooding campaigns.
---

# Dogfood audit

本 Skill 只服务 ResearchSpec 项目维护者的真实宿主验收；不投影到被测研究项目，也不代替人工签收。场景以 `playbooks/dogfooding/scenarios.yaml` 为准，命令和评分规则见 `playbooks/dogfooding/README.md`。

## 确认运行范围

1. 静态矩阵固定覆盖工具目录中的全部目标，包括共享 `agents`，每个目标运行 `skills`、`commands`、`both` 三种投影。读取场景目录与当前请求；询问是否追加行为验收。行为验收仅选择一个有适配器的宿主。若选择行为验收，确认场景或 suite、该宿主模型和重复次数；默认 `natural-18`、每场景两次。不要把示例配置中的宿主和模型当作固定值。
2. 行为验收时另行确认验收 Agent 的宿主与模型。它用全新隔离会话起草报告；可与被测宿主相同，但报告会标明这一点。说明静态矩阵本地 CLI 次数为 `目标数 × 3`，行为尝试数与验收调用数均为 `场景数 × 重复次数`，模型调用会产生时间和费用。纯静态矩阵无需模型配置。
3. 选择现有配置或在临时目录准备本轮配置。执行 `pnpm dogfood plan [--config <配置>] [--behavior-host <宿主>] [--suite <套件> | --scenario <ID>]`，把解析出的目标、模式、行为场景、模型、调用数、并发和超时展示给用户。取得这份具体运行范围的确认后再运行；用户已经明确确认过同一范围时不重复询问。

## 运行与审阅

1. 执行相同选择的 `pnpm dogfood run [--config <配置>] <选择参数> --open-ui`。静态矩阵只运行本地 CLI；选择行为宿主时才使用 Orca 终端和模型隔离。不要改写 fixture、prompt、断言或宿主模型。记录 campaign ID 和 `Review:` URL。页面会自动更新矩阵和行为报告状态。
2. 若行为报告生成失败，解释失败原因，用 `pnpm dogfood assess --campaign <ID>` 重试。旧版导入批次只读；不要补写或续跑它。报告失败不触发被测宿主自动重跑。
3. 运行结束后，用 `pnpm dogfood serve --campaign <ID> --open-ui` 重开。先看“初始化投影矩阵”：各格状态、检查项及交付文件。再从“尝试与报告”队列阅读所选宿主每次行为报告，点证据引用回查。由用户填写审阅者并保存最终审定；验收 Agent 的建议不计入正式通过。
4. 用 `pnpm dogfood report --campaign <ID>` 预览静态和行为结果。仅在用户要求写入项目发布证据时执行 `--write`。完整静态矩阵与所选宿主 `natural-18` 全部两次人工通过才满足这部分发布门槛；不将所选宿主的行为结论扩展到其他目标。

行为验收在 Linux 上依赖 Orca、bubblewrap、目标宿主 CLI 和凭据。静态矩阵不依赖这些组件。预检失败时报告真实原因，不关闭隔离或静默换模型。
