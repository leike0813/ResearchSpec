---
sidebar_position: 1
title: 工作流指南
description: 理解 current subflow、handoff、Gate 与 transition
---

# 工作流指南

ResearchSpec 使用统一协议：

```text
status → instructions <selector> → start / decide / advance → status
```

每个 standalone、pipeline parent、child、branch 和 revision round 都需要独立 route summary 与
用户确认。一次确认只授权一个实例。

ARSU producer 在 `researchspec/` 外写语义文件，并在 owning handoff 中记录 role 和安全相对
path。CLI 独占 `control.yaml` 中 Gate、Decision、frontier 和 transition 的写入。

确认 Gate 不会自动推进 checkpoint。`advance` 会重新校验 profile、直接 child controls、Gate、
Decision 和 handoff 前置。Pipeline parent 通过扫描 child controls 派生当前 frontier。

旧或未知 workspace 会被报告为 unsupported 并保持不变。
