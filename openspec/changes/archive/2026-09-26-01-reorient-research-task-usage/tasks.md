# Tasks

Change: `01-reorient-research-task-usage`。本清单只改规格与产品文档，不改源码。

前置依赖：无。后续 `02-deliver-proactive-research-entry`、`03-support-research-task-continuity`、`04-align-research-capability-collaboration`、`05-verify-natural-research-journeys` 依赖本 change 的规格先确认。

## 1. 同步主规格

- [x] 1.1 使用本地 `openspec-sync-specs` Skill 合并本 change 的 5 个 delta 进主规格：新建 `openspec/specs/research-task-usage/spec.md`（含 delta 的 Purpose），并 MODIFIED `arsu-user-routing`、`procedure-routing`、`companion-skills`、`arsu-run-usage`。验证：`openspec validate --specs --strict` 通过；`openspec show research-task-usage --type spec` 显示 ADDED 需求，另四个主规格的对应需求已更新且无 delta 头（`## ADDED/MODIFIED/REMOVED Requirements`）。

## 2. 产品使用模型文档

- [x] 2.1 更新 `docs/user/usage-model.md`：明确默认路径为"表达目标 -> 调用能力 -> 交付成果 -> 保存必要进展"；新增普通任务笔记章节（路径 `work/researchspec-notes/<task-id>.md`、内容字段、由 Navigate 主 Agent 维护、不进入 manifest、不被 status 扫描、不新增 CLI selector、不用来声称 run/Gate 完成）；把第一节图与第 2 节"需要持久恢复……进入 graph 模式"改为"需要 Gate/Decision、parallel/join、轮次或审计时进入 graph"，并写明"恢复普通工作不需要 graph"；第 10 节"恢复"区分普通工作与正式 run。验证：文档内不再存在"以持久化/恢复作为 graph 进入理由"的表述；路径字符串与规格一致。

- [x] 2.2 更新 `docs/user/README.md`：首段导读把研究任务优先与普通任务笔记纳入，指向 `usage-model.md`。验证：入门顺序描述与 2.1 一致。

## 3. 开发者文档

- [x] 3.1 更新 `docs/developer/architecture.md`：在"每个概念只有一个 owner"表或邻近文字中说明普通任务笔记是 `researchspec/` 外的非正式工作材料，不是 owner 文件；"Agent 与扩展边界"说明 Navigate 维护笔记、笔记不成为 workflow authority。验证：未把笔记列为受管 owner 或状态源。

- [x] 3.2 更新 `docs/developer/runtime/core_runtime_model.md` 与 `docs/developer/runtime/runtime_protocols.md`：指向普通任务笔记（`work/researchspec-notes/`）作为非正式状态，说明它们不属于运行时协议、CLI 不扫描；第 4 节"恢复与失败"区分普通工作与正式 run。验证：无"恢复普通工作必须进入 graph"的表述。`docs/developer/runtime/README.md` 仅在"一句话模型"确需补充笔记边界时修改。

## 4. 仓库自述与变更记录

- [x] 4.1 更新 `README.md`：把产品主线改为研究任务优先；修正激励来源段落中"研究工件是附带产物，specs 才应驱动行为"的表述，说明 specs 承载已确认承诺、帮助保存约束和决定，价值由研究结果检验；快速入门示例改为不含内部术语的自然研究任务，并说明普通工作用任务笔记延续。验证：README 不再把持久化/恢复列为 graph 的必要条件，快速入门提示不含 ResearchSpec、Procedure、profile、frontier 等引导词。

- [x] 4.2 更新仓库根 `AGENTS.md` 的 Canonical User Usage Model：补充普通任务笔记的非正式状态边界、恢复判定、stable specs 仅承载已确认承诺，并修正与 delta 冲突的 persistence/resume 表述，保持文件剩余内容不变。验证：`AGENTS.md` 与同步后的主规格无矛盾表述。

- [x] 4.3 在 `CHANGELOG.md` 记录本次规格与文档重定位（用户可见影响：普通工作与恢复不再需要 graph，探索与承诺边界更明确）。验证：条目存在且不宣称已完成真实宿主验收。

## 5. 收尾验证

- [x] 5.1 运行 `openspec validate 01-reorient-research-task-usage --strict` 与 `openspec validate --specs --strict`，确认 change 与主规格均通过。

- [x] 5.2 运行 `pnpm docs:check` 与项目文档/链接相关检查，确认未触碰生成文档（`docs/user/cli-handbook.md`）且无链接漂移；确认未修改 `src/**`、`scripts/**`、`tests/**`、`playbooks/**`。

- [x] 5.3 交接条件（本 change 的实现完成定义）：任务组 1-4 与 5.1、5.2 全部完成后，把本 change 的规格交给 `02` 作为入口与验收依据。验证：`openspec status --change 01-reorient-research-task-usage` 显示全部规划工件完成，且 1-4、5.1、5.2 均已勾选。

## 6. 外部依赖（不在本 change 交付）

真实宿主验证由 `05-verify-natural-research-journeys` 在真实宿主会话中完成（"无需提醒即主动调用、正确恢复、交付可用"），依赖 `01` 与 `02` 的产物。本 change 不收集也不回填真实宿主证据，不得把静态检查当作行为验收；此依赖不登记为本 change 的勾选任务。
