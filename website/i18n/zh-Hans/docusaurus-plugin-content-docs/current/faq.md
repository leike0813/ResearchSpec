---
sidebar_position: 99
title: 常见问题
description: ResearchSpec 常见问题解答
---

# 常见问题

## 基础

### ResearchSpec 具体是做什么的？

ResearchSpec 是一个基于文件的框架，用于编排学术论文写作工作流。
它初始化工作区、安装技能（给 AI 智能体的指令）、管理工作流状态，
并通过类型化的规约系统强制执行门控和人工决策。

### 我需要会编程吗？

不需要。ResearchSpec 通过命令行接口使用，但实际研究工作通过自然语言
与 AI 智能体交互完成。你只需要确认决策和审阅产出即可。

## 设置

### 我运行了两次 `researchspec init`，会不会有问题？

不会。`init` 是幂等的——它会安全地扩展现有工作区，不会覆盖你的已做工作。

### adaptive 和 strict 运行时有什么区别？

| | Adaptive | Strict |
|---|---|---|
| **哈希绑定** | 自动记录 | 每次写入前必须提供 |
| **灵活性** | 智能体可自由提交 | 每次写入必须匹配预览计划 |
| **适用场景** | 大多数研究工作 | 高可复现性要求的场景 |

## 技能

### 我可以添加自己的技能吗？

ResearchSpec 支持来自 218 个 ANZSRC 研究领域的领域插件。你可以通过
`researchspec plugin install` 安装预审插件。

## 工作流

### 我怎么知道下一步该做什么？

运行 `researchspec status --json`。对每个返回的选择器运行
`researchspec instructions <selector> --json` 获取精确的动作描述符。

### 如果关闭终端，工作流会丢失吗？

不会。ResearchSpec 状态是**基于文件**的。所有工作流状态都在工作区的
`.researchspec/` 目录中。没有服务器，没有数据库，没有运行时进程。
