我先看一下项目里现有的材料，了解结构再开始整理。

---

我先确认 ResearchSpec CLI 是否可用，并查看 review-response profile 的指令格式和当前工作区状态。

---

任务清晰对应 review-response profile 的三个早期步骤：`intake` → `manuscript-analysis` → `comment-atomization`（自带覆盖报告）。逐个跑 standalone procedure 并落盘。

---

我已读完全部材料：4 个合成源 + 4 个 claim + 6 条审稿意见 + 作者立场。任务对应 review-response profile 的前三个节点（intake → manuscript-analysis → comment-atomization，附带 comment-coverage-gate）。直接产出四个产物文件，不触发 LaTeX 工件脚本（fixture 是 Markdown，不是 `.tex`）。

---

### 第一步：intake 报告

---

### 第二步：manuscript-analysis报告

---

### 第三步：原子化评论清单

---

### 第四步：覆盖报告（漏检）

---

四份产物已落盘到 `work/review-response/`，每步一份文件：

| 步骤 | 产物 | 行数 |
| --- | --- | --- |
| 1 · intake | [intake_report.md](<[workspace]/work/review-response/step-1-intake/intake_report.md>) | 55 |
| 2 · manuscript-analysis | [manuscript_structure_summary.md](<[workspace]/work/review-response/step-2-manuscript-analysis/manuscript_structure_summary.md>) | 67 |
| 3 · comment-atomization | [atomic_comment_list.md](<[workspace]/work/review-response/step-3-atomization/atomic_comment_list.md>) | 114 |
| 3 · coverage（漏检） | [comment_coverage_report.md](<[workspace]/work/review-response/step-3-atomization/comment_coverage_report.md>) | 66 |

**流程对应关系**：用户的"整理材料→逐条拆分→检查遗漏"对应 review-response profile 的 `intake` → `manuscript-analysis` → `comment-atomization`（含 comment-coverage-gate）三节点。fixture 是 Markdown 而非 `.tex`，未触发 LaTeX 工件脚本；产物以 Markdown 形式落地，未改 ResearchSpec 工作流状态。

**漏检结果**：
- 源材料无遗漏。7 条源线程（1 编辑推荐 + 4 major + 2 minor）全部抽出为 7 个原子项，每条 thread ↔ ≥1 atomic，atomic ↔ 1 thread，字符覆盖率 100%。
- **3 项仍待作者立场**，不是覆盖缺口：
  - `atomic_005`（minor 1 术语选择）
  - `atomic_006`（minor 2 局限在 Conclusion 中的复述范围）
  - `atomic_007`（编辑推荐 / response letter 开篇措辞）
- Major 1–4 的作者立场已在 `revision-context.md` 中记录并落到对应 atomic 项；Major 3 的措辞细节需要落到 round artifact 时再具体化。

**3 项需用户决定**（见 intake_report § 4）：A) Markdown 替代物 vs 转 LaTeX；B) 双语产出；C) minor 与编辑信的作者立场。
