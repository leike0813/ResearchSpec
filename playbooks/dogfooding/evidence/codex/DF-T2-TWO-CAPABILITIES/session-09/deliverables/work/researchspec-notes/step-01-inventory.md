# Step 01 — 材料清单与现状盘点

> 输入：`benchmark/` 下的全部合成材料（`goal.md`、`partial-manuscript.md`、`review-comments.md`、`revision-context.md`、`claims.yaml`、`sources.yaml`）。
> 输出：每份材料的角色定位、关键事实摘要、相互引用关系。

## 1.1 文件 → 角色

| 文件 | 角色 | 关键内容 |
|---|---|---|
| `goal.md` | 研究目标 | 主题：生成式 AI 对高校写作教学的影响；约束：只用合成材料、区分观察/解释/未知、不补造数据 |
| `partial-manuscript.md` | 稿件初稿 | 含 working title、Introduction、Preliminary findings、Missing sections 四段 |
| `claims.yaml` | 主张台账 | 3 条 claim（CLM-01/02/03），含支持来源、强度、限制 |
| `sources.yaml` | 证据清单 | 4 条 source（CLASSROOM/INTERVIEW/SURVEY/POLICY），含 scope、finding、limits |
| `review-comments.md` | 审稿意见 | Editorial: Major revision；4 条 major + 2 条 minor |
| `revision-context.md` | 作者立场 | 接受意见 1/2/4；对意见 3 保留方向但改为 hypothesis 并去因果表述 |

## 1.2 主张 ↔ 来源 ↔ 稿件现状

| Claim | 强度（yaml） | 支撑 source | 稿件当前表述 | 与审稿意见的对齐 |
|---|---|---|---|---|
| CLM-01 | tentative | SYN-CLASSROOM-01 | "Structured prompting coincided with more visible outline revisions in one introductory course" | 与意见 1 部分相关（"local" 已隐含） |
| CLM-02 | unsupported_as_written | SYN-INTERVIEW-02 | "faster feedback may be offset by verification work"（稿件已弱化） | 稿件已部分对齐意见 2，但 yaml 强度仍是 unsupported_as_written，需要正式调档 |
| CLM-03 | hypothesis_only | SYN-SURVEY-03 + SYN-POLICY-04 | 稿件中尚未出现对应段落（属于"Missing sections"中的 policy variation 与 alternative explanations） | 意见 3 的核心目标 |

## 1.3 稿件"Missing sections"清单（来自 `partial-manuscript.md`）

- Methods and evidence-selection limitations
- Discussion of policy variation
- Explicit treatment of alternative explanations
- Conclusion calibrated to the supplied evidence

这四项与意见 4（方法节）、意见 3（policy/不确定性→hypothesis）、意见 1（local/synthetic 警示）、意见 2（calibrated conclusion）一一对应或交叉。

## 1.4 审稿意见计数核对

- Major comments：1, 2, 3, 4（4 条） ✓
- Minor comments：术语统一（1 条）、局限性要在结论处也体现（1 条） ✓
- Editorial recommendation：Major revision（影响整体策略：不重做，按意见改）

## 1.5 作者立场 vs. 审稿意见的冲突点

| 意见 | 作者接受 | 备注 |
|---|---|---|
| 1 — local & synthetic 声明 | 接受 | 无冲突 |
| 2 — CLM-02 改写或删除 | 接受 | 稿件已弱化，需同步 yaml 强度 |
| 3 — CLM-03 改为 hypothesis | 接受方向、保留"policy-clarity idea"，改 hypothesis 并去因果 | 需要在 yaml 把 CLM-03 强度与限制更新 |
| 4 — Methods 节 | 接受 | 新增节 |

无未决冲突。

## 1.6 下一步

→ 进入 Step 02，逐条拆分每条意见，给出"做什么 / 在哪改 / 引用哪些材料"的清单。
