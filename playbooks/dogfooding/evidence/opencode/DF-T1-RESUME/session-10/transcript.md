**Workspace status (synthetic fixture, latest confirmed run)**

| 状态 | 内容 |
|---|---|
| Workspace | `[workspace]/researchspec`，schema `"2"` |
| 活跃 Run | `run-4d473e97b9d1eed257b7a59d`，profile `academic-pipeline @ 0.1.0`，入口 `main`，由 `synthetic-fixture-user` 于 2026-09-27T06:42:27Z 确认 |
| 节点进度 | `nodes/` 空；执行的节点数 0 |
| 图前沿 | `pending_subgraph_starts: node:run-4d473e97b9d1eed257b7a59d/research` |
| Gates / Decisions | 无 |

**已完成**
- 根 run 已确认启动（`academic-pipeline:end-to-end`）。在收藏上需要的产物：`submission_package` + `process_summary`，预期路径 `work/historical-submission_package.zip`、`work/historical-process_summary.md`。
- `benchmark/` 提供合成材料：goal、4 条 SYN 来源、3 条 CLM claim、半稿、review 意见与作者接受的修订约束。

**阻塞**
- `researchspec/specs/project.md` 仍是空模板（RQ/scope/method/contribution 全部空）。
- `researchspec/specs/{sources,claims,manuscript}.yaml` 仍是空骨架（`sources: []`, `claims: []`, manuscript 字段全 `null`）。`research` 子图以 `project_intent` 为唯一输入，这些 spec 没填就启动会拿到空 context。

**下一步（按当前 selector 状态）**
1. 独立（不建图）把 `benchmark/` 内容落进稳定 spec：`project.md` 写 goal + scope + method + contribution；`sources.yaml` 写入 4 条 `SYN-*`；`claims.yaml` 写入 3 条 `CLM-*`（含各自的 `strength`/`limits`）；`manuscript.yaml` 用 partial-manuscript 的 working title 填 `working_title`、设 `output_type` 与 `outline`。这是合规的直接编辑（specs 可手动修改），完成后不必新建图。
2. `researchspec instructions node:run-4d473e97b9d1eed257b7a59d/research --json` → 读 packet 的 `start_input` 与 `child_profile_id`。
3. 用 packet 里的 `start_input` 内容构建 payload，`researchspec start <child_profile_selector> --input <file> --json` 启动 `research` 子图（父 run 已授权子图启动，不再要根级确认）。
4. 子图推进到 `research-gate` 前先 `status --json` 看 frontier 类别，再读对应 instructions。

是否要我先做第 1 步把 benchmark 内容落到稳定 spec，再继续走图？
