# 核心运行模型

![ResearchSpec 与 ARSU 当前架构](diagrams/rendered/system-architecture.svg)

## 1. 文件 owner

四份 stable specs 拥有研究事实；project profile 拥有 pipeline graph；每个 control 拥有一个
subflow 的 lifecycle、checkpoint、Gate attempts、Decisions 和 transitions；handoff 拥有边界
input/output role/path；project change 拥有尚未应用的高影响更新。

边界论文、报告、review、图表和数据位于 `researchspec/` 外。Private working material 位于 owning
subflow 的 `work/`，默认不能被其它 subflow 消费。

## 2. 派生视图

Status、list、show、history、parent/child summaries 和 frontier 均通过扫描当前 files 得到。Child
control 的 parent reference 是唯一关系事实；不会持久化 children list 或全局 index。

## 3. Agent 边界

ARSU producer 维护语义文件、stable specs、changes 和自身 handoff。ResearchSpec CLI 独占 control
mutation。Companion 将 route、verification 和 decision 对话连接到这些 owner。Plugin 和 Zotero
Adapter 只能把 working result 返回原 producer。

## 4. 两层 spec-driven 治理

![仓库治理与研究工作区](diagrams/rendered/two-level-openspec-model.svg)

仓库的 `openspec/changes` 管理 ResearchSpec 产品变更；用户 workspace 的
`researchspec/changes` 管理研究语义变更。两者都区分 current/proposed，但没有共享 runtime。
