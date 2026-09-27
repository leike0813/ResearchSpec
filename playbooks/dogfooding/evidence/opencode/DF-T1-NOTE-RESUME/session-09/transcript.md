我先加载 ResearchSpec 导航 skill，然后并行查看项目状态和现有笔记。

---

笔记 `writing-evidence.md` 存在。我读它并并行检查工作空间状态：

---

继续之前我先把判断依据和现有文件一并展示。先并行读关键输入和规格文件：

---

在写综合前，再读 `benchmark/` 下的 README 与目标声明，以及参考一下能用的 standalone 流程：

---

## 判断依据（来自哪些现有文件）

| 来源 | 关键事实 | 影响 |
|---|---|---|
| `work/researchspec-notes/writing-evidence.md:3-11` | 任务笔记明确下一步："Check the draft claims against `benchmark/sources.yaml`, then write an ordinary synthesis file"；声明 "Related run: none" | 这是上次的"未做完"所在；交付物是普通综合文件，不进 graph |
| `researchspec status --json` | `runs.total=0`、`active=0`、`frontier=[]`、`pending_gates=[]`、`pending_decisions=[]` | 工作空间无活跃运行；按 navigate skill "Continuation alone stays standalone with a task note" 走 standalone模式 |
| `benchmark/README.md:1-7` + `goal.md:5-8` | 合成 dogfooding fixture；约束：只用合成材料、区分观察/解释/未知、不联网补造引用 | 我不会扩展 source，也不会把 `SYN-*` 当真实引用 |
| `benchmark/sources.yaml:4-32` | 4 个来源（CLASSROOM-01、INTERVIEW-02、SURVEY-03、POLICY-04），各带 `finding` + `limits` | 核查时要逐条匹配草稿 claim，并显式带上每条 limit |
| `benchmark/partial-manuscript.md:15` | 草稿自标 `CLM-01` 被支持，`CLM-02`（"AI reduces workload"）不被支持；`Missing sections` 列了 4 项缺口 | 我需逐条核对并指出未声明 claim 是否被来源支持 |
| `researchspec/specs/claims.yaml:1-2` | 正式 claim 注册表为空 | 不能擅自注册新 claim ID；草稿自带的 `CLM-01/02` 视为草稿自有命名 |
| `researchspec list procedures` | 可用 `procedure:analysis-evidence-synthesis`（standalone 模式，profiles 含 minimal/research-main） | 可选的 standalone 程序；笔记说要 "ordinary"，所以默认不包它 |

## 我打算的下一步（请确认）

按笔记指示，写一份普通综合文件到工作区外：

- 路径：`benchmark/evidence-synthesis.md`
- 内容：逐条对照 4 个来源，对草稿 `Preliminary findings` 中显式与隐含的 claim 给出「支持 / 部分支持 / 不支持 / 来源不足」四档结论，并把每条来源的 `limits` 写进对应行；最后对 `Missing sections` 列出"哪部分可由现有来源填补、哪部分仍属未知"。
- 同时把 `work/researchspec-notes/writing-evidence.md` 的「Completed work / Open question / Next step」三段更新到本次实际进度。

**两种走法供你选：**

1. **按笔记的 ordinary 路线**（默认推荐）：直接写 `benchmark/evidence-synthesis.md`，不启动 procedure、不创建 run/node/Gate。
2. **用 `procedure:analysis-evidence-synthesis` 包裹**：先 `instructions procedure:analysis-evidence-synthesis --json` 取输入/输出契约，再产出相同内容。

请告诉我走 (1) 还是 (2)，或对默认路线有调整。
