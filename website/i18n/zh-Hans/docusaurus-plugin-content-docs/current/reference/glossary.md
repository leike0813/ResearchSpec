---
title: 术语表
---

# 术语表

**Boundary deliverable（边界交付物）** — `researchspec/` 外的普通项目文件，由 handoff 以角色和安全路径引用。

**Companion workflow** — 提案、决策或验证等框架级 Procedure；它们是隐藏的 Procedure，不是宿主 Skill。

**Decision** — 由人确认的范围、声明、结构、分支或失败 Gate 覆盖选择，记录在对应 node instance 或 project change 中。

**Formal Gate** — profile 声明的学术检查点，其结果必须由人确认。

**Frozen graph** — run 内保存的 profile 副本，是该 run 的权威定义。

**Graph profile** — converter 管理并投影到工作区的 graph 模板。

**Handoff** — 可直接编辑的 run 文档，记录边界输入输出的角色、路径、用途、来源、使用方和限制。

**Navigate** — 唯一固定的用户可见 Agent Skill，负责对话、发现并激活隐藏 Procedure。

**Procedure** — 按需加载、声明输入输出角色的能力，通过 `instructions procedure:<procedure-id>` 激活。

**Project change** — 高影响更新的提案，在接受、明确应用并验证前与 stable specs 分开保存。

**Run** — 一次 frozen graph 执行。根 run 需人工授权；绑定的子 run 继承 graph 授权。

**Stable specs** — 保存项目意图、来源、声明和稿件结构的四份权威规约。

**Standalone mode** — 生成普通项目文件但不创建 run、node、handoff、Gate 或 Decision 的工作方式。

**Task note** — `work/researchspec-notes/<task-id>.md` 中承接持续普通工作的 Markdown 笔记；它不是 workflow state。
