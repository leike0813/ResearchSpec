



---

现在我理解了上下文：这是一个 ResearchSpec dogfooding 测试任务。我需要做的是把 `benchmark/ordinary-task-note.md` 的内容"复制/改写"成 `work/researchspec-notes/writing-evidence.md` 的形式——这是一份"普通任务笔记"，记录为合成证据起草综述的工作。

让我先读取相关资料，确认 ResearchSpec 的约定和任务期望。

---

现在我对 ResearchSpec 上下文有了清晰认识。让我再看下当前笔记与目标任务的对应。`benchmark/ordinary-task-note.md` 是测试夹具里描述的"普通任务笔记"，需要 copy 到 `work/researchspec-notes/writing-evidence.md`，然后用合成证据合成写作证据综述。这正是普通 standalone 任务笔记的设置。

按 Navigate 的 standalone流程：
1. 当前没有 run 要恢复（虽然有 `run-753d7a5e924e0969da091d33`，但任务说"继续这项工作"，测试夹具直接要求 copy note）；
2. 检查状态；
3. 看是否需要 CLI。

让我先确认是否安装了 `researchspec` CLI 和场景文件。

---

好。研究已初始化，但有 active run 在等 frontier。当前任务的需求很清楚：

1. 把 `benchmark/ordinary-task-note.md` 复制到 `work/researchspec-notes/writing-evidence.md`；
2. 根据 `benchmark/sources.yaml` + `benchmark/partial-manuscript.md` 写一份"普通合成文件"——普通任务笔记里"Next step: Check the draft claims against sources.yaml, then write an ordinary synthesis file"。

这是一项 standalone 任务，不是 graph任务。然而它落在了已有 run-753d7a5e924e0969da091d33 的 frontier，但用户明确说"继续这项工作"——即接续 note 中描述的 ordinary 工作。我按 standalone 处理，不动 run 状态。

---

现在做证据合成工作。draft 里的两段声明：
1. "Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`)" — 与 SYN-CLASSROOM-01 一致
2. "faster feedback may be offset by verification work" — 与 SYN-INTERVIEW-02 一致
3. "generative AI reduces workload (`CLM-02`) is not supported" — 文中已承认超证据

让我再读一下 partial manuscript 看清楚 claim IDs 与表达，并扫一眼是否还有别的引用。

---

只有 draft 提到 CLM-01/02，没有 claims.yaml 提供正式 claim 定义。task note 已经识别了需要支持的 claim。让我写一份普通合成文件——直接放工作目录，命名按文献综述"literature-synthesis"惯例。

---

我把合成报告放到 `work/writing-evidence-synthesis.md`，确保它是普通语义文件，不在 `researchspec/` 内、不入流程状态。

---

现在更新任务笔记，记录实际产出与下一步骤。

---

状态未变——standalone 任务笔记与合成文件都已落地，没有触动任何 run / gate / decision。

---

## 完成

**模式**: standalone。任务笔记确认这是一个普通研究工作，按 SKILL.md 中"Continuation alone stays standalone with a task note"处理。

**已交付**:

| 路径 | 用途 |
| --- | --- |
| `work/researchspec-notes/writing-evidence.md` | 普通任务笔记：从 `benchmark/ordinary-task-note.md` 复制并回写实际产出/限制/下一步 |
| `work/writing-evidence-synthesis.md` | 合成证据综述：claim 级映射（CLM-01 部分支持、CLM-02 不支持、内嵌的反馈–核验权衡由 SYN-INTERVIEW-02 直接支持），附每条支持的限制条件，以及给作者的稿件调整建议 |

**未触动**: `researchspec/` 工作流状态、`run-753d7a5e924e0969da091d33` 仍处 `pending_subgraph_starts: research`，按 SKILL.md "A note never authorizes a run…" 保持不动；`status --json` 复核确认。

**待用户决定**（笔记中已记录，未自动推进）:
- (a)稿件继续限定在合成证据并明确标注；
- (b) 在用户明确批准后扩大范围；
- (c) 仅作为方法练习收尾。

下一步动作需要等用户对范围 (a/b/c) 做决定；任何稿件修改或图节点推进都不从本笔记触发。
