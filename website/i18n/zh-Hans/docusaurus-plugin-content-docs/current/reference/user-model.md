---
sidebar_position: 2
title: 用户使用模型
description: ResearchSpec 工作的进入、确认、执行、恢复与完成方式
---

# 用户使用模型

本页概述 [`docs/user/usage-model.md`](https://github.com/leike0813/ResearchSpec/blob/main/docs/user/usage-model.md) 中的规范。

## 进入任务

`researchspec init` 准备 schema `"2"` 工作区和 Navigate 入口，不会启动研究。对话从自然语言研究任务开始。Navigate 搜索精简 Procedure 卡片，展示候选并加载一个 activation packet。普通任务保持 standalone；需要形式化 Gate/Decision、并行汇合、修订轮次或可审计状态时才选择 profile 和 graph。

## 授权

用户确认一个根 profile entry 后，仅授权该根 run 的 frozen graph。符合条件的执行节点和绑定子 run 不需额外 start 确认；每个 formal Gate、graph Decision 和失败 Gate 覆盖仍需单独人工确认。

## 工作和状态

Procedure 在 `researchspec/` 外写稿件、报告和审阅结果。Handoff 记录语义角色和安全路径；ResearchSpec 不登记、复制或哈希绑定这些边界文件。只有 CLI 可以修改 run 生命周期和 node 记录。Gate 或 Decision 满足 frontier 条件但不完成执行节点，只有成功的 `advance node:<run>/<node>` 才会完成节点。

持续普通工作使用 `work/researchspec-notes/<task-id>.md`。未完成的相关 run 优先于 standalone 延续。

## Agent 能力

固定基础入口只有 `researchspec-navigate`。五个 ARSU 工作流、三个 Companion 工作流、核心能力和插件扩展都在运行时派生的隐藏 Procedure 目录中。选择可选 `zotero-library` Adapter 后，会增加七个明确的文献 Skills。
