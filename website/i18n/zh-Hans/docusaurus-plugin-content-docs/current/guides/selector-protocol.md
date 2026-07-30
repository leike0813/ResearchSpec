---
sidebar_position: 5
title: 选择器协议
description: 理解驱动 ResearchSpec 工作流的动作选择器系统
---

# 选择器协议

选择器协议是 ResearchSpec 向智能体动态传递可用动作的机制。

## 选择器结构

选择器的形式为 `family:identifier`。示例：

- `subflow:deep-research`
- `gate:literature-acquired`
- `transition:to-drafting`

## 选择器族

| 族 | 用途 |
|----|------|
| `subflow:` | 启动命名子流程 |
| `obligation:` | 完成必需的运行时任务 |
| `gate:` | 确认或覆盖门控裁定 |
| `completion:` | 标记子流程或阶段完成 |
| `work:` | 执行开放式的语义工作 |
| `transition:` | 移动到下一个工作流阶段 |
| `patch:` | 应用修订补丁 |
| `change:` | 提议规约变更 |

## 智能体如何使用选择器

1. 通过 `researchspec status --json` 发现可用选择器
2. 通过 `researchspec instructions <selector> --json` 读取动作描述符
3. 通过 `start`、`submit` 或 `advance` 执行动作
4. 从返回的 `next_selectors` 中发现新的选择器
