我先把当前状态核对清楚。

---

现在情况清楚了：上次的工作把稿子里需要查证的论断列了出来（`CLM-01`、`CLM-02`），但 `benchmark/sources.yaml` 这个文件实际上不存在，`researchspec/specs/sources.yaml` 也是空的——所以"按来源核查"那一步根本没法做。

我把这次能完成的部分完成，能查到的写下来，卡住的明确标记。

---

已完成上次的论断核查。

**实际情况**：上次的工作把稿子里的待查论断抽出来了（`CLM-01`、`CLM-02` 及两个隐含论断），但后续的"按来源核验"那一步根本没法做——`benchmark/sources.yaml` 在工作区里就不存在，`researchspec/specs/sources.yaml` 与 `researchspec/specs/claims.yaml` 也都是空表，稿子里也没有 `<!--ref:slug-->` / `<!--anchor:...-->` 标记。

**这次能完成的事**就是"稿内自洽 + 措辞保险度"那部分，已写到 [claim-check-writing-evidence.md](<[workspace]/work/claim-check-writing-evidence.md>)：

- `CLM-01`：稿内作为观察呈现，用了"coincided"和"one introductory course"双重保险，措辞合宜。
- `CLM-02`：稿内自己就标注了"is not supported by the supplied evidence"，否决到位，无需额外动作。
- 隐含的访谈观察句（"Interview summaries also suggest..."）按"uncited assertion"看是低风险，但若补证据应优先放这里。
- 范围声明（"small synthetic evidence set...rather than general causal effects"）与缺失章节列表一致，未越界。

**阻塞**：跨来源核验没有来源语料，跑不了。如果之后补上 `benchmark/sources.yaml` 且授权做引用标记转换，可以走 `check-claim-faithfulness-audit` 这条正式 standalone 流程，输出 `claim_audit_report (claim-audit.v1)`。

工作笔记也更新到 [writing-evidence.md](<[workspace]/work/researchspec-notes/writing-evidence.md>)，把可用输入、产出、阻塞条件都记下了。

skipped: 跨来源逐条核验（缺 `benchmark/sources.yaml`）；要不要走正式程序（需先转换稿子为 `manuscript-draft.v1` 并补引用标记），等你确认来源语料后再决定。
