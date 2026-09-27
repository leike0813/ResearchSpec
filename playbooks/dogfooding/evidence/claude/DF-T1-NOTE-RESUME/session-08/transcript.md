我已经摸清上下文了。先汇报判断依据，再继续。

## 我判断下一步的依据

| 文件 | 我从中读到的内容 |
|---|---|
| `work/researchspec-notes/writing-evidence.md` | 任务目标、已完成进度（只读稿子和识别了待证 claim）、明确的下一句指令："Check the draft claims against `benchmark/sources.yaml`, then write an ordinary synthesis file"，并声明 "Related run: none" |
| `.claude/rules/researchspec.md` | "Ordinary sustained work may continue from `work/researchspec-notes/` without a graph run"——所以不用走 graph，按 standalone 笔记继续 |
| `.claude/skills/researchspec-navigate/SKILL.md`（Standalone 段） | "Continuation alone stays standalone with a task note"；"Produce semantic files outside `researchspec/` and return their paths" |
| `benchmark/goal.md` | 约束：只用合成材料；区分观察/解释/未知；不补造引用或效应量；要改变 claim 强度必须先让用户决定 |
| `benchmark/sources.yaml` | 4 条合成证据（课堂观察、教师访谈、学生调查、机构政策）及其限制 |
| `benchmark/partial-manuscript.md` | 稿子里三条显式 claim：CLM-01（结构化提示与提纲修订）、关于反馈与验证工作的"访谈暗示"、以及明确撤回的 CLM-02（"reduces workload"）；稿子还自认缺方法、缺政策讨论、缺替代解释、缺校准过的结论 |
| `benchmark/README.md` | 强调所有 SYN-* 仅供 dogfooding，不作真实引用，禁止联网猜作者/出处 |

## 我的判断

任务边界清晰、没有歧义、不需要 graph run。直接照笔记里写的下一句做：在 `work/researchspec-notes/` 下写一份普通的 evidence synthesis，按 claim ↔ source + limits 的方式逐条对照，明确区分稿子里已经支持的、欠支持的、以及稿子自己撤回的部分。

下面执行。

---

更新一下任务笔记，把 "no completed synthesis has been delivered" 改成已交付，并记录产出文件。

---

## 资料核查已完成

**判断依据（你问的"基于哪些现有文件"）**

| 文件 | 提供的关键信号 |
|---|---|
| `work/researchspec-notes/writing-evidence.md` | "Next step: Check the draft claims against `benchmark/sources.yaml`, then write an ordinary synthesis file" + "Related run: none" |
| `.claude/rules/researchspec.md` | 普通延续工作可以从 `work/researchspec-notes/` 继续，不开 graph |
| `.claude/skills/researchspec-navigate/SKILL.md` | Standalone 模式：continuation 单独跑，把产出写到 `researchspec/` 之外 |
| `benchmark/goal.md` | 只能使用合成材料，不补造引用，要分清观察/解释/未知 |
| `benchmark/sources.yaml` | 4 条 `SYN-*` 证据及其自身限制 |
| `benchmark/partial-manuscript.md` | 三条显式 claim（CLM-01 / 关于反馈与验证的访谈 / 已自我撤回的 CLM-02）+ 介绍里两条隐含 claim + 自报的缺失章节 |
| `benchmark/README.md` | 强调 SYN-* 仅供 dogfooding，禁止联网补出处 |

**产出**

- 新建 `work/researchspec-notes/evidence-synthesis.md`：逐条 claim ↔ source + limits 对照，包含引言隐含 claim 的处理、证据做不到的事、给下一稿的校准建议。
- 更新 `work/researchspec-notes/writing-evidence.md`：记录已交付的合成文件、已完成的对照工作，把"open question"从"哪些 claim 能被支持"换为"无阻塞，下一步是用户层面的起草决定"。

**未动的东西**

- `benchmark/partial-manuscript.md` 没改。填充它的缺失章节是起草任务，不是这次核查的范围。
- `researchspec/specs/claims.yaml` 还是空的。我没有把笔记里的 claim mapping 写进 spec，因为 CLAUDE.md 里要求 claim 强度变化必须先让用户决定，而 spec 写下去会把它"硬化"。等你点头要不要进 spec 再说。
