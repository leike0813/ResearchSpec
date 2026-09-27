我先看看工作区里有哪些文件，判断上次停在哪里。

---

我先把所有相关文件摸清楚再判断。

---

工作区情况都摸清了，现在给你完整的判断依据和下一步。

## 我依据哪些文件判断下一步

| 文件 | 用途 | 决定 |
|---|---|---|
| `benchmark/goal.md` | 限定主题 + 约束 | 只用合成材料、不能补造引用/效应量/参与者 |
| `benchmark/README.md` | 强调 fixture 是合成 + 禁止联网猜测真实出处 | 不调用 WebSearch，不把 SYN-* 当真实引用 |
| `benchmark/sources.yaml` | 4 个证据源（SYN-CLASSROOM-01/INTERVIEW-02/SURVEY-03/POLICY-04）+ `finding`/`limits` | claim 评估的唯一可用证据库 |
| `benchmark/partial-manuscript.md` | 工作草稿已含 1 条背景叙述 + 2 条具名 claim（CLM-01、CLM-02） | 评估对象已就位，无需重写 |
| `work/researchspec-notes/writing-evidence.md` | 延续任务笔记，明确"Next step: Check the draft claims against sources.yaml, then write an ordinary synthesis file" | 这是当前任务的入口和指令 |
| `.claude/skills/researchspec-navigate/SKILL.md` | "Ordinary sustained work may continue from `work/researchspec-notes/` without a graph run"；standalone 模式不创建 run/node/Gate/Decision；boundary deliverable 必须在 `researchspec/` 外 | 选 standalone；输出落到 `work/` 而非 `researchspec/` |
| `researchspec status --json` | `runs.total=0`, `runs.active=0`, `frontier=[]`, `pending_gates=[]`, `pending_decisions=[]` | 确认没有未完成的 graph 状态需要继承；纯 standalone 任务 |
| `researchspec/specs/{claims,sources,project,manuscript}.yaml` | 几乎全空（`claims: []`、`sources: []`、标题/语言/大纲空） | 草稿状态领先于 stable specs；按 SKILL.md 不在 standalone 流程里强行回写 specs（用户/笔记都没要求） |

**模式判断**：standalone（不需 Gates/Decisions/并行/审计状态；SKILL.md 明确说延续工作不必启 graph）。

**下一步**：写一份 claim × source 支撑表到 `researchspec/` 之外，更新任务笔记记录阶段产出。

现在开始执行。

---

更新任务笔记，标记阶段产出。

---

## 完成

**模式**：standalone（`researchspec status --json` 确认 0 active runs / 无 pending Gates-Decisions，匹配 SKILL.md "ordinary sustained work"）。

**新增**：
- `work/claims-vs-sources.md` — 逐条评估 BKG-1、CLM-01、CLM-02；另列出证据支持但草稿缺失的 CLM-03/04/05 作为候选；明示 CLM-01 只能保留"coincided with"措辞、CLM-02 的否定判断正确。

**更新**：
- `work/researchspec-notes/writing-evidence.md` — 追加阶段产出、模式决策、剩余待决。

**未做（按 SKILL.md 与 goal.md 约束）**：
- 没有补造引用 / 参与者 / 效应量（goal.md 明确禁止）。
- 没有改动 `benchmark/partial-manuscript.md` 草稿正文——草稿本身不在 standalone 任务范围；CLM-03/04/05 哪些进 "Preliminary findings" 哪些进 "Discussion" 是作者决定，等你拍板。
- 没有改动 `researchspec/specs/*`（stable specs 当前为空，但用户和笔记都没要求回写）。
- 没有创建 run / 节点 / Gate / Decision / handoff（standalone 模式不创建任何这类状态）。

**待你决定**（一个聚焦问题）：CLM-03 / CLM-04 / CLM-05 中哪条进 Preliminary findings、哪条留给 Discussion？证据强度 CLM-04 > CLM-03 > CLM-05，但取捨取决于你想让"初步发现"段多克制。
