---
sidebar_position: 99
title: 常见问题
description: ResearchSpec 的使用与工作流常见问题
---

# 常见问题

### ResearchSpec 做什么？

它通过可复用能力和普通项目文件承载学术研究任务。你描述目标，由 Agent 发现能力、交付工作并保留继续任务所需的信息。

### 我必须先学会 CLI 吗？

不必。固定用户入口是 `researchspec-navigate`，Agent 会根据你的请求发现 Procedure。需要检查状态、确认 Gate 或恢复 run 时才会使用 CLI。

### npm 包已经发布了吗？

尚未。0.1.0 是首发候选版本，待发布检查清单签署后才会发布。当前评估请按[安装指南](/installation)从源码安装。

### `researchspec init` 会启动研究吗？

不会。它准备 schema `"2"` 工作区、稳定规约、profiles 和 Agent 投影。学术任务从 Agent 对话开始；graph 工作还需确认 profile entry。

### 普通研究必须使用 graph 吗？

不需要。普通工作可 standalone 完成，Agent 在 `researchspec/` 外写文件，不创建 run、node、handoff、Gate 或 Decision。只有 formal Gate/Decision、并行汇合、修订轮次或可审计状态需要 graph。

### 稿件和报告存在哪里？

放在 `researchspec/` 外的普通项目路径。Run handoff 记录角色和路径；ResearchSpec 不登记、复制或哈希绑定这些文件。

### 可以直接编辑 ResearchSpec 文件吗？

stable specs、project changes 和 run handoff 可以直接编辑。Gate、Decision、node 完成等 run/node 状态通过 CLI 修改。

### 确认 Gate 会推进工作流吗？

不会。它记录 Gate 尝试。随后需运行 `advance node:<run>/<node>` 校验当前要求并完成节点。

### 如何恢复工作？

Run 工作使用 `researchspec status --json` 获取精确 instance ID，再请求其 instructions。持续普通工作从 task note 恢复，并对照当前材料和产出核对。

### 旧工作区会怎样？

ResearchSpec 会报告不支持并保持原样，不提供迁移或语义修复。

### Doctor 会修复项目吗？

不会。Doctor 只读检查运行环境、路径安全和托管文件漂移。
