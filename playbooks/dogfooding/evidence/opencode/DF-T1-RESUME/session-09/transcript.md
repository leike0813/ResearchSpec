## 状态摘要（基于 `[workspace]`）

**已完成**
- Workspace 已 `init`，profile `academic-pipeline`（0.1.0）解析成功，agent_tools = `opencode`/`skills`。
- Run `run-0efd1a9cba3062f93d50aed0` 已创建并 `active`，由 `synthetic-fixture-user` 确认，期望产出 `submission_package` + `process_summary`。
- `handoff.md` 框架已写入（仅占位，无 outputs）。
- `diagnostics_summary`: blocking=0, warning=0。

**阻塞 / 未决决策**（非系统阻断，需用户拍板）
- `specs/project.md` 只有空标题，`manuscript.yaml` / `claims.yaml` / `sources.yaml` 全为空。
- `benchmark/` 提供了多个 fixture 变体（`goal-only` / `evidence-corpus` / `partial-manuscript` / `review-cycle` / `fault-injection`），尚未选定哪个导入 `specs/`。
- `goal.md` 明确声明：研究问题、研究设计、目标产物均未定。
- `plugins.selected = []`；与"高校写作教学"相关 plugin（如 `curriculum-and-pedagogy`、`specialist-studies-in-education`）未加载。
- `runs/.../nodes/` 为空，`work/` 与 `work/researchspec-notes/` 不存在 ——实际未产出任何研究材料。

**下一步建议**
1. 由用户敲定研究问题、范围与方法立场（`goal.md` 要求先决策再动手）。
2. 选定 fixture 变体并把对应材料写入 `specs/`（project.md、sources.yaml、claims.yaml、manuscript.yaml）。
3. 选择并 `plugin install` 相关 plugin。
4. 执行 `researchspec instructions node:run-0efd1a9cba3062f93d50aed0/research` 取 research 子图的精确节点指令，然后 `advance` 推进首个待启子图 `research`。
