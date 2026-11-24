---
sidebar_position: 1
title: 项目介绍
description: 面向智能体、以规约驱动的学术研究工作框架
---

# ResearchSpec

ResearchSpec 是面向智能体的文件式研究框架，用于承载 ARSU（Academic Research Skills Universal）能力，并以稳定文件描述研究意图、来源、声明、稿件和工作流状态。

## 工作方式

- `researchspec init` 准备 schema `"2"` 工作区，不会启动研究。
- 唯一固定入口 `researchspec-navigate` 从自然语言任务发现合适能力。
- 普通研究可以独立完成；只有 formal Gate、Decision、并行汇合、修订轮次或可审计状态需要 graph。
- 每个 formal Gate 和 graph Decision 都由用户单独确认。
- 稿件和报告等边界交付物保存在 `researchspec/` 之外，ResearchSpec 不登记或管理这些文件。

## 核心概念

| 概念 | 说明 |
| --- | --- |
| Stable specs | 保存项目意图、来源、声明和稿件结构的四份稳定规约 |
| Procedure | 通过 `instructions procedure:<id>` 按需加载的能力 |
| Gate | 需要人工确认结果的学术检查点 |
| Boundary deliverable | `researchspec/` 外的普通文件，由 handoff 记录角色和路径 |
| Selector | 精确定位 procedure、profile、run、node 或 change 的标识 |

## 五个 ARSU 工作流

- `deep-research`：系统性文献发现、获取和综合
- `academic-paper`：从研究问题到章节的分步论文撰写
- `academic-paper-reviewer`：结构化稿件审阅
- `academic-pipeline`：跨阶段工作流编排
- `sr-screener`：系统综述筛选、排除复核和 PRISMA 报告

它们都是隐藏的按需 Procedure。CLI 命令参考由源码生成，因此不单独翻译。

## 从这里开始

- [安装](/installation)
- [快速入门](/quick-start)
- [CLI 命令参考](/cli)
- [工作流指南](/guides/workflow)
- [技能与 Procedure](/guides/skills)
