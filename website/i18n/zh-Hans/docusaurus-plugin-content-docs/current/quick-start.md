---
sidebar_position: 2
title: 快速入门
description: 创建 schema 2 工作区并通过 Navigate 开始研究任务
---

# 快速入门

先按[安装指南](/installation)安装首发候选版本，然后创建工作区：

```bash
mkdir my-research
cd my-research
researchspec init . --tools codex
researchspec check all --strict
```

`init` 创建 schema `"2"` 工作区、四份 stable specs、预设 graph profiles 和 Agent 投影，不会启动研究。再次运行 `init` 会替换完整工具和 Adapter 选择；CLI 升级后用 `update` 刷新托管投影。

在同一项目的 Agent 中用自然语言描述研究目标。`researchspec-navigate` 检查工作区并发现合适能力。

## 普通研究

不需要形式化 Gate 或 Decision 的任务保持 standalone。Agent 将稿件或报告写到 `researchspec/` 外的项目路径，并报告路径。持续工作通过 `work/researchspec-notes/<task-id>.md` 延续，无需 graph。

## Graph 工作

需要 formal Gate、Decision、并行汇合、修订轮次或可审计状态时，Navigate 会先展示 profile entry 的前置条件、边界输出、Gate、Decision、成本和交互负担。你确认后才启动根 run：

```bash
researchspec start profile:<profile-id> --input start.yaml --confirmed-by "Your Name"
```

此确认只授权该根 run 的 frozen graph。每个 formal Gate 和 Decision 仍需单独确认。生产者在 `researchspec/` 外写交付物，并在 handoff 记录角色和安全相对路径。Gate 确认不会完成节点；还需单独运行 `advance`。

## 恢复工作

```bash
researchspec status --json
```

对照返回的精确 selector 使用 `instructions` 或 `show`，再用 `start`、`decide` 或 `advance` 完成当前步骤。`pack --output <file>` 导出有限上下文，不复制外部交付物内容。
