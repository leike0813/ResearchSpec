我先查看当前项目状态和上次的核查任务上下文。

---

确认了状态：没有 active run (`status --json` 显示空)，`benchmark/sources.yaml` 文件实际不存在（任务笔记里引用了它，但 fixture 缺这个文件）。前一步只完成了"读稿 + 识别需要源支撑的论断"，下一步动作笔记里写明了：要对照源检查论断，然后写出 synthesis。

由于 sources.yaml 缺失，验证能落到的事实比想象的要少。我把现在能核查的全部做完，并明确标出 fixture 缺源这一核心阻塞。先更新任务笔记，再产出合成文件。

---

完成 — 上次停在"已识别论断、未做核查、未产出 synthesis"。这次把核查和产出都补完。

修改/新增：
- `work/researchspec-notes/writing-claim-verification.md`（新）：claim-by-claim 核查，CLM-01 弱可保留但无源、CLM-02 稿内自否应当删除或降级、隐含判断已逐条标注措辞校准。
- `work/researchspec-notes/writing-evidence.md`（改）：推进任务笔记，把 next step 收口到"等 fixture 补源 / 等用户对 CLM-02 决定"。

阻塞（已在核查笔记中明确）：`benchmark/sources.yaml` 在 fixture 里不存在，`researchspec/specs/sources.yaml`、`claims.yaml` 都为空——没有源文件，核查只能落到内部一致性与措辞校准，不能对回任何 SYN-* 条目。剩余决策交给用户：补源后再决定要不要走 `researchspec-verify`，未补源前不开 graph run、不补造任何效应量或引用。
