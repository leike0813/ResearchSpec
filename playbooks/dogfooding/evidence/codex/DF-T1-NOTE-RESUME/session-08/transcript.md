我先把任务现状读清楚，再判断下一步。

## 现状（基于以下文件）

1. [`work/researchspec-notes/writing-evidence.md`]([workspace]/work/researchspec-notes/writing-evidence.md) — 上次留下来的任务说明，明确写了"已读稿件并标出需要核查的 claim，未做正式评审或 graph 操作；下一步：把稿件 claim 与 `benchmark/sources.yaml` 对照，然后写一份普通合成文件。"
2. [`benchmark/partial-manuscript.md`]([workspace]/benchmark/partial-manuscript.md) — 待核查的工作稿件，包含三条实质性 claim：
   - 结构化 prompt 与更多提纲修改同时发生（引 `CLM-01`）
   - 访谈显示更快反馈可能被核实工作抵消
   - "生成式 AI 减少工作量"这一更强表述不被现有证据支持
3. [`benchmark/sources.yaml`]([workspace]/benchmark/sources.yaml) — 四份合成证据（SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 / SYN-POLICY-04），每份都自带 limits。
4. `researchspec status --json` — 0 个 active run，没有 pending gate/decision；不需要 graph。
5. [`AGENTS.md`]([workspace]/AGENTS.md) — 当前项目是 researchspec-initialized，ordinary sustained work 走 `work/researchspec-notes/`，不进 graph。

## 判断

按上次留下的笔记，这就是个 standalone 的"按现有 source 核查稿件 claim"的任务，不需要开 run。我直接对照 claim 与 source，把核查结果写成合成文件，并把任务笔记里"已完成/未完成/下一步"刷新一下。

另外稿件里引用的 `CLM-01` / `CLM-02` 不是 source ID（真实 source ID 是 `SYN-CLASSROOM-01` / `SYN-INTERVIEW-02`），这是稿件本身的引用风格问题，会在合成里如实指出。

## 执行

---

核查完成。

**做了什么**
- 把 [`benchmark/partial-manuscript.md`]([workspace]/benchmark/partial-manuscript.md) 的三条实质性 claim 逐条对照 [`benchmark/sources.yaml`]([workspace]/benchmark/sources.yaml) 的四份 `SYN-*` 证据。
- 核查结果落到 [`work/researchspec-notes/evidence-synthesis.md`]([workspace]/work/researchspec-notes/evidence-synthesis.md)（104 行，普通合成文件）。
- 把 [`work/researchspec-notes/writing-evidence.md`]([workspace]/work/researchspec-notes/writing-evidence.md) 的进度条推进到"verification phase is complete"。
- 没开 run / gate / decision；`researchspec status --json` 仍为 `runs.active = 0`。

**核查结论速览**
- "结构化 prompt 与更多提纲修改同时发生" — 方向支持，幅度不支持；`SYN-CLASSROOM-01` 自带无对照组 / 无效标 / 教师统一供 prompt 的限制。
- "更快反馈可能被核实工作抵消" — 作为假设成立，不可量化；`SYN-INTERVIEW-02` 是自报、n=5、无时间日志。
- "生成式 AI 减少工作量" — 拒绝正确；现有四份 source 都不支撑这一表述。
- 稿件未用到的两份 source（`SYN-SURVEY-03`、`SYN-POLICY-04`）已在合成里标注留给 Discussion。
- 稿件里的 `CLM-01` / `CLM-02` 与 source 的 `SYN-*` 键不一致 — 这是稿件本身的问题，未改动稿件，只在合成里指出。

**判断下一步的依据**
- `work/researchspec-notes/writing-evidence.md` 的 "next step" 明确写"check the draft claims against `benchmark/sources.yaml`, then write an ordinary synthesis file"，且明确 `Related run: none` —— 走 standalone，不开 graph。
- `AGENTS.md` 的 researchspec-entry 段说 ordinary sustained work 走 `work/researchspec-notes/`，graph 只用于 formal Gates/Decisions。
- `researchspec status --json` 显示 `runs.active = 0`、`frontier: []`，没有待处理的 gate/decision。

**下一步（等你确认是否进入）**
- 用合成文件里的 calibration guidance 改 `benchmark/partial-manuscript.md` 本身（缩小因果语言、把 source-borne limits 写进"Missing sections"、讨论段补 `SYN-SURVEY-03` / `SYN-POLICY-04`、修 `CLM-*` 引用键）。
- 或者你只想要这次核查结果、不动稿件 —— 那就此结束。
