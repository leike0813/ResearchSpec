# Atomic Comment List

> 节点：`comment-atomization`（capability `transform-review-response-comment-atomization`）。
> 角色：`atomic_comment_list` + `comment_coverage_report`（后者见 `comment_coverage/`）。
> 输入：`benchmark/review-comments.md`、`benchmark/revision-context.md`。
> 编号约定：每条原子意见一个稳定 ID，前缀与原意见分组一致（M=主意见、m=次要意见、E=编辑决定），用于下游覆盖核对与引用。

## 1. 编辑决定
| ID | 原文要点 | 落点 | 必答 |
|----|----------|------|------|
| E-1 | Editorial recommendation: Major revision | 决定后续逐条覆盖；不单列段落 | — |

## 2. 主意见（Major comments）

### M-1 — 证据披露
- 原文："The manuscript should state that all evidence is local and synthetic before presenting findings."
- 关键要求：在 *presenting findings* 之前声明证据为本地与合成。
- 范围：影响 Introduction 前的写作顺序与新增 Evidence-base disclosure 段落。
- partial 中已埋伏笔："small synthetic evidence set"（Introduction）。
- author 立场（revision-context）：**接受**。
- 落点建议：`manuscript_structure_summary.md` §3 表 #1。

### M-2 — CLM-02 强度调整
- 原文："`CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it."
- 关键要求：表述改为更快反馈 vs 核查工作量权衡，或直接删除。
- partial 中已显式否证更强说法（Preliminary findings §c）。
- author 立场（revision-context）：**接受**（保留权衡叙述、不删除）。
- 落点建议：`manuscript_structure_summary.md` §3 表 #2（Discussion · Trade-off framing）。

### M-3 — CLM-03 降级为假设
- 原文："The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis."
- 关键要求：去除因果措辞，标注为未来研究假设。
- partial 完全未触及 `CLM-03`。
- author 立场（revision-context）：**接受**（保留政策清晰度想法，按假设措辞处理）。
- 落点建议：`manuscript_structure_summary.md` §3 表 #3（Hypothesis box for CLM-03）。

### M-4 — 增 Methods 章节
- 原文："Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable."
- 关键要求：解释 4 来源如何选出、为何不能因果。
- partial 完全缺失 Methods。
- author 立场（revision-context）：**接受**。
- 落点建议：`manuscript_structure_summary.md` §3 表 #4（新增整章）。

## 3. 次要意见（Minor comments）

### m-1 — 术语统一
- 原文："Use consistent terms for 'AI-assisted feedback' and 'generative AI feedback'."
- 关键要求：全文采用同一术语。
- partial 中两个术语均未出现。
- author 立场：未在 revision-context 显式表态，默认跟随 minor 接受；待 round 阶段锁定为 "AI-assisted feedback" 并在首现处加注。
- 落点建议：`manuscript_structure_summary.md` §3 表 术语规范行。

### m-2 — 结论中也显式呈现局限
- 原文："Make the limitations visible in the conclusion, not only in methods."
- 关键要求：Conclusion 不只是 Methods 末段的镜像，需独立再列。
- partial 无 Conclusion。
- author 立场：未显式表态，但与 M-4 一并接受属合理推断。
- 落点建议：`manuscript_structure_summary.md` §3 表 末行（新增 Conclusion）。

## 4. 未在 review-comments 中出现但 goal/partial 已点出的隐含项
下列项并非审稿意见，而是 partial 自身声明的 missing sections。为避免下游遗漏，作为"非审稿但需补"标记：

- D-1 Methods and evidence-selection limitations — 与 M-4 同源，但 partial 在 missing list 里单列。
- D-2 Discussion of policy variation — partial 自列；与 `SYN-POLICY-04` + `CLM-03` 假设化相关，可纳入 Discussion。
- D-3 Explicit treatment of alternative explanations — partial 自列；建议作为 Discussion 子段。
- D-4 Conclusion calibrated to the supplied evidence — 与 m-2 重合。

这些项不进入审稿意见覆盖率统计，但 round 阶段需保证被一并处理。

## 5. 编号稳定性说明
- 原子 ID（E-/M-/m-）仅用于本轮 review-response 文档互引，不写入 partial manuscript 文本。
- D-1～D-4 仅供 round 阶段使用，不参与审稿覆盖核对。
- 若后续 re-review 增列新意见，沿用 M-5 / m-3 等递增编号。