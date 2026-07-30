---
sidebar_position: 2
title: 技能指南
description: ARSU 技能在 ResearchSpec 中的工作方式
---

# 技能指南

ARSU（Academic Research Skills Universal）提供 ResearchSpec 编排的核心
研究能力。每个技能是一个技能包，智能体在工作流中按指令执行。

## 四个 ARSU 技能

### deep-research

系统性的文献发现、获取与综合。

### academic-paper

从研究问题到章节的分步论文撰写。

### academic-paper-reviewer

结构化稿件审阅，附带可追溯的审阅意见。

### academic-pipeline

跨研究阶段的工作流编排。

## 配套技能

| 配套技能 | 用途 |
|----------|------|
| `researchspec-navigate` | 将模糊或跨技能请求路由到正确的技能 |
| `researchspec-propose` | 创建结构化的规约变更提案 |
| `researchspec-decide` | 引导人工决策 |
| `researchspec-verify` | 根据规约验证实现 |

## 文献适配器技能

七个 Zotero 文献适配器技能提供文献库管理和分析：

| 适配器 | 用途 |
|--------|------|
| `zotero-library-agent` | 路由和协调文献库研究任务 |
| `zotero-library-query` | 从文献库内容检索和回答问题 |
| `zotero-literature-acquisition` | 发现、评估和导入文献 |
| `zotero-literature-analysis` | 分析文献并附带可追溯的证据 |
| `zotero-research-synthesis` | 将文献综合为研究上下文 |
| `zotero-library-curation` | 执行已批准文献库维护 |
| `zotero-bridge-cli` | 底层 Zotero 操作 |
