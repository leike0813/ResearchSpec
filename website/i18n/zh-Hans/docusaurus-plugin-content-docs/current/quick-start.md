---
sidebar_position: 2
title: 快速入门
description: 初始化 current workspace 并启动首个已确认的研究 subflow
---

# 快速入门

ResearchSpec 需要 Node.js 22 或更高版本。

```bash
mkdir my-research
cd my-research
researchspec init . --tools codex
researchspec check all --strict
```

初始化只创建 schema `"1"` workspace、四份 stable specs、project profile 和 Agent 投影，不会
启动学术工作。

在相同项目中打开 Agent 并描述研究目标。Agent 会先读取 status，展示候选 route 的前置、边界
输出、formal Gates 和成本。确认一个 route 后，Agent 才调用：

```bash
researchspec start <route-ref> --input start.yaml --confirmed-by "Your Name"
```

ARSU producer 在 `researchspec/` 外写交付物，并更新自己的 handoff。Formal Gate 由 Verify 准备
建议、用户确认，再通过 `decide` 记录；推进使用独立的 `advance`。

新会话使用 `researchspec status --json` 恢复，并以精确 instance ID 请求 instructions。
