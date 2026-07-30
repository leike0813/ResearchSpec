---
sidebar_position: 1
title: 项目介绍
description: ResearchSpec —— 面向智能体的、以规约为驱动的学术研究写作框架
---

# ResearchSpec

ResearchSpec 是一个**面向智能体的、基于文件的学术研究规约框架**，
用于编排学术论文写作工作流。它通过结构化规约、显式人工决策和可复现的
工作流状态来驱动 ARSU（Academic Research Skills Universal）技能包。

## 能做什么

- **一键初始化研究工作区** —— `researchspec init`
- **引导智能体执行结构化工作流** —— 文献获取、综合、撰写、审阅和修订
- **让人类掌控关键决策** —— 通过显式的门控（Gate）和决策账本
- **与任意 AI 智能体协作** —— 不依赖任何特定平台运行时
- **维护可复现的论文轨迹** —— 每件制品、决策和门控裁定都通过哈希追踪

## 核心概念

| 概念 | 说明 |
|------|------|
| **规约（Contract）** | 类型化的文件（YAML/JSON/JSONL），保存结构化的研究意图、声明、来源和状态 |
| **制品（Artifact）** | 草稿、报告、审阅或生成文件，按哈希和类型注册 |
| **门控（Gate）** | 确定性检查，在条件满足前阻止工作流推进 |
| **决策（Decision）** | 记录在决策账本中的显式人工选择 |
| **选择器（Selector）** | 由 `researchspec instructions` 返回的运行时动作令牌 |

## 四个 ARSU 技能

- **deep-research** — 系统性文献发现、获取与综合
- **academic-paper** — 从研究问题到章节的分步论文撰写
- **academic-paper-reviewer** — 结构化稿件审阅，附带可追溯的审阅意见
- **academic-pipeline** — 跨阶段工作流编排

## 从哪里开始

- [快速入门](/quick-start) — 安装并运行你的第一个工作区
- [CLI 命令参考](/cli) — 完整命令参考（从源码自动生成）
- [工作流指南](/guides/workflow) — 理解研究工作流模型
