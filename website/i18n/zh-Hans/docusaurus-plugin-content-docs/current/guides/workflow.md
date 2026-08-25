---
sidebar_position: 1
title: 工作流指南
description: 理解 current graph run、handoff、Gate 与 Decision
---

# 工作流指南

ResearchSpec 使用统一协议：

```text
status → instructions <selector> → start / decide / advance → status
```

根 run 需要 profile entry summary 与用户确认。确认授权 frozen graph 声明的 nodes 和 bound child
runs；每个 Gate 与 Decision 仍要单独确认。

ARSU producer 在 `researchspec/` 外写语义文件，并在 owning handoff 中记录 role 和安全相对
path。CLI 独占 run/node lifecycle、Gate attempts、Decision 和 frontier 所需状态的写入。

确认 Gate 不会自动完成执行节点。`advance node:<run>/<node>` 会重新校验 frozen graph、Gate、
Decision、handoff、outputs 和 validators。Child-profile node 创建唯一绑定的 child run。

旧或未知 workspace 会被报告为 unsupported 并保持不变。
