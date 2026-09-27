我先把"上次留下的线索"全部摊开，再根据它们推进下一步。

**用到的现有文件（判断下一步的依据）**

| 文件 | 我从中读到的关键事实 | 对下一步的影响 |
|---|---|---|
| `work/researchspec-notes/writing-evidence.md` | 任务便签：goal/inputs/已完成工作/下一步，全部指向"对照 sources 检查 draft claims，写一份普通合成稿" | 任务范围已锁死，无歧义；无需再问 |
| `benchmark/ordinary-task-note.md` | 便签模板本身：明确属于普通研究笔记，不需要图运行 | 走 standalone，**不启动 graph** |
| `benchmark/goal.md` | 目标 = 总结合成材料如何支撑 draft 声明；约束：不补造数据/效应/引用/伦理审批 | 产出只能基于 sources.yaml 已有内容 |
| `benchmark/partial-manuscript.md` | 三处具体声明：CLM-01（结构化 prompt → 提纲修订增多）、CLM-02（AI 减轻工作量，draft 自己声明不被支持）、反馈-验证抵消 | 这些就是要逐条核查的目标 |
| `benchmark/sources.yaml` | 四条合成材料：SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 / SYN-POLICY-04，附 scope 与 limits | 核查用的证据集 |
| `researchspec status --json` | `runs.total = 0`，无 frontier / 无 pending gates | 不走图；按便签走 standalone |
| `.agents/skills/researchspec-navigate/SKILL.md` | "Continuation alone stays standalone with a task note" | 印证上述判断 |
| `.codex/agents/researchspec-*-executor.toml` | 存在 executor/reviewer 子代理，但当前任务小、不需要并行隔离 | 不委派，主线程直接做 |

**所以下一步就是**：用 sources.yaml 的四条合成材料，逐条对照 partial-manuscript.md 的三处声明，写一份 claim↔source 核查稿，并把任务便签推进到"已交付"状态。

直接执行。

---

`apply_patch` 在当前会话里被判定为不可用（每次调用都被环境回 abort，并且我已经在 `/tmp` 测过独立文件也无效）。改用 `uv run` 调 Python 做单点编辑，仍然走 AGENTS.md 推荐的共享环境。

---

**结果（极简版）**

- 核查稿：[work/claim-source-check.md]([workspace]/work/claim-source-check.md)（新建，3.3 KB）
- 任务便签：[work/researchspec-notes/writing-evidence.md]([workspace]/work/researchspec-notes/writing-evidence.md)（已推进到"已交付 claim↔source 检查"）

**三条声明的核查结论**

| 声明 | 来源 | 结论 |
|---|---|---|
| CLM-01（结构化 prompt → 提纲修订增多） | SYN-CLASSROOM-01 | **支持**——但仅限"一门入门课程"的窄范围，禁止提升为因果 |
| CLM-02（AI 减轻工作量） | SYN-INTERVIEW-02 | **不支持**——可观察信号反而是验证工作抵消了部分时间节省；draft 自我否定应保留 |
| 访谈类陈述（反馈加快但被验证抵消） | SYN-INTERVIEW-02 | **支持**——作为自报口径成立；落稿须保留"may"并补 self-report / 小样本 / 无 time-log 的限定 |

SYN-SURVEY-03、SYN-POLICY-04 已登记在"跨来源、暂不并入 draft"段，等你决定是否扩 scope 再启用。

**下一步等你定**

1. 维持现状，由我按这张核查表起草 Methods + Discussion + Conclusion；
2. 扩 scope，把 survey/policy 并入 draft；
3. 到此为止。

**关于编辑工具**：本会话 `apply_patch` 被环境回 abort（`/tmp` 独立测试同样无效），便签修改改用 `uv run` 调共享环境 Python 做单点替换——已加 `assert new != old` 防误改。
