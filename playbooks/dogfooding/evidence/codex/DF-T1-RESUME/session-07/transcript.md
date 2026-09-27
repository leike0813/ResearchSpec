## 已完成

- 工作区已用 schema_version "2" 初始化（`researchspec/config.yaml`、`researchspec/specs/`、`researchspec/profiles/`、`tool-installation-manifest.json`）。
- 跑了一次活跃根运行 `run-1ac5d7873312f643919c1b1b`，profile `academic-pipeline` v0.1.0，entry `main → research`，route `academic-pipeline:end-to-end`，由 `synthetic-fixture-user` 确认于 2026-09-27T06:31:01Z。
- 图节点全部就绪：`research → research-gate → write → write-gate → review → review-gate → (revision → re-review → round-outcome)* → format → final-integrity → final-integrity-gate`，并行无分支，决策点仅有 `round-outcome`（continue / complete）。
- 4 个 benchmark 文件已落盘：`goal.md`、`sources.yaml`（4 个 `SYN-*`）、`claims.yaml`（CLM-01/02/03）、`partial-manuscript.md`、`review-comments.md`、`revision-context.md`，README 标记这是 dogfooding 合成材料，禁止联网补造数据。
- 7 个框架 profile 与 2 个本地 agent（`researchspec-executor`、`researchspec-reviewer`）已注册。
- `researchspec status --json` 的 node 队列：根节点尚未激活（`pending_subgraph_starts` 一项、`pending_gates/pending_decisions` 都空、`nodes.run-...*` 为空）。

## 阻塞

CLI 没有报错（diagnostics_summary: 0 blocking / 0 warning）。但要让 frontier 真正前进，以下**事实层面的缺口**都在：

- `researchspec/specs/project.md` 只有空标题（研究问题、范围、方法立场、贡献全空）；`manuscript.yaml` 字段全 `null`；`claims.yaml`、`sources.yaml` 都是空数组。benchmark 数据还没有迁入稳定 spec，根运行的 `research` 子图拿不到必要输入。
- 没有 `work/` 目录，也没有 `work/researchspec-notes/<task>.md`，无法保留中途决策和已完成步骤的笔记。
- `handoff.md` 引用的两条历史交付物（`work/historical-submission_package.zip`、`work/historical-process_summary.md`）正文为空。
- 当前图走的是 `end-to-end`（从 `research` 起），但 benchmark 配齐的是 `review-cycle` 变体（已含部分稿件 + 审稿意见 + 修订单）。这意味着用户真正要的是中段入口，可能应改用 `entry_id: mid-entry` 跳过 research/write/review，直入 revision。
- 没有选任何 plugin。论文主题是生成式 AI 对高校写作教学，可选的领域 plugin 包括 `curriculum-and-pedagogy`、`specialist-studies-in-education`、`education-systems`，但当前全空、未做投影决策。
- 决策点当前不卡 `pending_decisions`，但只要后续 `round-outcome` 触发，就要当场让用户选 `continue` 还是 `complete`，不能代替。

## 下一步

只读检查已经做完，需要用户拍板才能动图。先把决定项摆出来，等用户点：

1. **进入点**：`end-to-end`（从 `research` 重做全部阶段）还是 `mid-entry`（基于已给的 partial-manuscript + 审稿意见，直接进 revision/re-review）。建议 `mid-entry`，更贴合现有 benchmark 材料且避免无意义重做。
2. **plugin 投射**：是否启用 `curriculum-and-pedagogy` / `specialist-studies-in-education` / `education-systems` 中任一项？默认不启用（保持 standalone 范围），除非你确认要领域特化。
3. **spec 归一**：要把 `benchmark/` 的 goal/sources/claims 拷到 `researchspec/specs/{project.md, sources.yaml, claims.yaml}` 作为稳定 spec 吗？这是 `research` 子图产物的官方归宿，写论文时也会被引用；不拷的话产物就只能停在一次性文件。

`status` 上看到的图下一步 CLI 命令是 `instructions node:run-1ac5d7873312f643919c1b1b/research --json`，但在那之前需要你至少给出 (1) 进入点选择和 (3) 的 spec 迁移决定。给完我就用 CLI 读精确的 frontier 指令并按包启动。
