---
sidebar_position: 1
title: 工作流指南
description: 了解 standalone 工作、graph、handoff、Gate 和 Decision
---

# 工作流指南

ResearchSpec 使用文件协议：

```text
status -> instructions <selector> -> start / decide / advance -> status
```

`init` 只准备工作区，不会启动学术工作。

## Standalone 工作

不需要形式化控制的普通研究以 standalone 方式进行。Procedure 将稿件、报告等普通文件写到 `researchspec/` 外，不创建 run、node、handoff、Gate 或 Decision。

持续普通工作通过 `work/researchspec-notes/<task-id>.md` 衔接。主 Agent 核对笔记与当前材料和产出；笔记只是非正式材料，不能证明 run、node 或 Gate 已完成，`status` 和 `check` 也不会扫描它。

## Graph 工作

需要 formal Gate 或 Decision、并行汇合、修订轮次或可审计工作流状态时，使用 graph。启动根 run 前，Agent 展示 profile entry、前置条件、边界输出、Gate、Decision 和成本，并取得你的确认。该确认只授权新 run 的 frozen graph；其中每个 Gate 和 Decision 仍须单独确认。

生产者在 `researchspec/` 外写语义交付物，并在 handoff 中记录角色和安全相对路径。ResearchSpec 不登记、复制或哈希绑定这些文件。CLI 是唯一的 workflow state 写入方。

确认 Gate 只记录 Gate 结果，不会完成执行节点。`advance node:<run>/<node>` 会验证 graph、Gate、Decision、handoff、输出和 validators，再完成节点。子 profile 节点创建绑定的 child run，不需要第二次 run 级确认。

旧版或未知工作区会报告为 unsupported 并保持不变。
