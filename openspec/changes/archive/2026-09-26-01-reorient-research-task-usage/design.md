# Design

## Context

见 `proposal.md` - Why。现状约束：

- `openspec/specs/arsu-user-routing/spec.md` 与 `openspec/specs/procedure-routing/spec.md` 当前把 persistence 和 resume 列为 graph 的触发理由，这与产品意图矛盾，必须在本 change 用完整 MODIFIED delta 修正，否则 03 的连续性实现没有规格依据。
- 固定表面已经锁定：单 `researchspec-navigate` 入口、十六个顶层命令、schema `"2"`、stable spec 文件集合、graph/CLI 引擎。本 change 只能改规格与文档，不能改源码。
- 普通笔记的目录先例已存在：`work/annotation-intake/` 被 `openspec/specs/manuscript-annotation-system/spec.md` 定义为"researchspec/ 外的普通工作材料"。普通任务笔记沿用同一目录约定。

## Goals / Non-Goals

**Goals:**
- 把"自然研究任务优先、恢复普通工作不需要 graph、stable specs 只承载已确认承诺"写成可验证的产品行为规格，作为 02-05 的依据。
- 用完整 MODIFIED delta 消除现有 routing/procedure 规格里的 persistence/resume 矛盾。
- 让交付物可被其他 Agent 直接执行：明确的文档漂移清单、逐文件意图、可复现的验证清单。

**Non-Goals:**
- 不实现入口交付、宿主常驻规则或入口文案（02）。
- 不实现笔记的恢复流程与正式 run 衔接细节（03）。
- 不实现关键词发现、能力协作或插件建议（04）。
- 不做真实宿主验收或回填证据（05）。
- 不改源码、CLI、schema、graph 引擎、playbook 或生成文档。

## Decisions

### 1. 持久化与恢复的 graph 触发条件收窄

保留 graph 用于：formal Gates/Decisions、parallel/join、重复轮次实例化、审计状态。移除"persistence"与"resume"作为独立触发理由，改由普通任务笔记承载跨会话连续性。

替代方案：把"恢复"整体删掉。否决——正式 run 的恢复仍是真实需求，只是改为 graph 内部能力而非进入理由。完整 MODIFIED 内容同时说明"继续普通工作用笔记"和"恢复正式 run 用 status/instructions"，避免读者二选一。

### 2. 普通任务笔记是"非正式状态"，不是 graph 状态

笔记路径 `work/researchspec-notes/<task-id>.md`，位于 `researchspec/` 外，不进入安装 manifest，不由 `status` 扫描或校验，不新增 CLI task selector。由 Navigate 主 Agent 在阶段产出、阻塞或结束一轮时更新。理由：复用既有"外部普通工作材料"边界，避免第二套工作流状态机；CLI 保持 run/node 状态的唯一写入者。

替代方案：在 `researchspec/` 内新增 task 目录并由 CLI 管理。否决——会把非正式探索升级为受管状态，违背"stable specs 只承载已确认承诺"，且需要新命令/新 schema。

### 3. 承诺边界用既有 project change，不新建机制

stable specs 只承载已确认的研究范围、主张、限制和交付要求；探索草稿（研究问题候选、暂定观点、草稿提纲）留在普通工作文件。提升候选为承诺或改变已有承诺，走既有 `propose -> decide -> 修改 specs -> archive`。理由：现有 `contract-change-proposal` 规格已覆盖该生命周期，无需新写路径。

### 4. 规格与文档分离，规格先行

先写 delta specs 并自检，再改产品文档。文档只表达最终状态，不含"从前如何、现在改为如何"的变更历史。

## Risks / Trade-offs

- [收窄 graph 触发条件被误读为"graph 不再需要"] -> 完整 MODIFIED delta 明确保留 Gate/Decision、parallel/join、动态轮次、审计状态四类理由，且不删任何 graph 节点或 profile。
- [普通笔记成为影子状态源，与 handoff 冲突] -> 笔记不进入 manifest、不被 status 读取、不复制外部 bytes；跨 run 消费仍必须走 handoff。规格写死这一边界。
- [文档与主 spec 短期不一致] -> 本 change 只交付 delta，不 sync 主 spec；实现阶段由实现 Agent 运行 sync 技能后，主 spec 才与文档一致。此依赖在 tasks 与最终说明中标注。
- [02-05 依赖本 change 却先行实现] -> tasks 明确本 change 先确认，02-05 的 OpenSpec 依赖指向本 change 名称。

## Migration Plan

无运行时迁移。docs 与 `AGENTS.md` 属实现阶段编辑；主 spec 同步由实现 Agent 用 `openspec-sync-specs` 一次性完成。回滚即还原本 change 目录与文档改动，无 schema 影响。

## Open Questions

无。宿主常驻入口的交付形态、能力发现改进、真实验收属 02/04/05，不影响本 change 的规格与文档。
