# Step 4 · Coverage & Omission Check

> 目的: 反向核对 — 每个 claim / source / 缺失段落 / 隐含问题是否都被某条意见覆盖；标记 reviewer 未提的缺口（omissions）。
> 判定标记:
> - `covered` = 至少一条原子项明确处理
> - `implicit` = 没有直接意见，但被相邻原子项间接处理（如 M1, M4c 间接覆盖 CLM-01）
> - `gap` = 没有任何意见触及，需用户决定是否补救
> - `non-issue` = fixture/goal 规则明确禁止补造，无需意见覆盖

## 4.1 Claims 覆盖矩阵

| Claim | Strength | 覆盖状态 | 触达的原子项 | 备注 |
| --- | --- | --- | --- | --- |
| `CLM-01` | tentative | **implicit** | `M1`（证据范围）, `M4c`（不可因果） | reviewer 未单独提；但其措辞已 "may / some"，与 evidence-scope 披露和因果局限一致。**无需新增意见**；response letter 中可主动声明 "Comment N/A: CLM-01 保留 tentative 措辞" |
| `CLM-02` | unsupported_as_written | **covered** | `M2-DECISION`, `M2a`, `M2b` | 必须改写或删除 |
| `CLM-03` | hypothesis_only | **covered** | `M3a`, `M3b`, `M3c` | 必须降级为 future-research hypothesis |

## 4.2 Sources 覆盖矩阵

| Source | 覆盖状态 | 触达的原子项 | 备注 |
| --- | --- | --- | --- |
| `SYN-CLASSROOM-01` | **implicit** | `M1`, `M4c` | 单课、无对照组；其支撑的 CLM-01 被 implicit 覆盖。建议在 Methods 中列出其局限（M4c 已覆盖） |
| `SYN-INTERVIEW-02` | **covered** | `M2a`, `M2b` | 自报、无时间日志必须显式披露 |
| `SYN-SURVEY-03` | **covered** | `M3a`, `M3c` | 志愿偏差、态度非行为必须显式披露 |
| `SYN-POLICY-04` | **covered** | `M3a`, `M3c` | 单机构政策文本、不可外推必须显式披露 |

## 4.3 缺失段落覆盖矩阵

| Missing section | 覆盖状态 | 触达的原子项 | 备注 / gap |
| --- | --- | --- | --- |
| Methods and evidence-selection limitations | **covered** | `M4a`, `M4b`, `M4c` | — |
| Discussion of policy variation | **partial** | `M3a`, `M3c` | **GAP**: 评论 3 只要求把 CLM-03 放进 future research；并未要求"一般性 policy variation discussion"。若仅在 hypothesis 段落提到 policy，会留下"为什么其他机构/课程政策差异未被讨论"的缺口。需用户决定是否扩展 |
| Explicit treatment of alternative explanations | **gap** | （无直接意见） | **GAP**: reviewer 未要求"alternative explanations"专节。隐含支持：`M4c` 列不可因果原因时可顺带列出。但 fixture goal "明确区分观察、解释与未知" 实质上要求该节——**建议在 Methods/Discussion 末尾新增 1 段** |
| Conclusion calibrated to evidence | **partial** | `m2` | **GAP**: `m2` 只要求 "limitations visible in conclusion"；但 "calibrated to evidence" 还要求不放大效应、不做外推、不暗示因果。建议在 conclusion 增加 calibrated 一句 |

## 4.4 隐含问题覆盖矩阵

| 隐含问题 | 覆盖状态 | 触达的原子项 | 备注 |
| --- | --- | --- | --- |
| 术语"AI-assisted feedback" vs "generative AI feedback" | **covered** | `m1a`, `m1b` | 用户需在 m1a 决定 canonical 术语 |
| Limitations 在 conclusion 也可见 | **covered** | `m2` | — |
| Local + synthetic 披露前置 | **covered** | `M1` | — |
| 未来研究方向 | **implicit** | `M3a` | CLM-03 hypothesis 化要求新增 future research 小节，标题需在 roadmap 显式化 |
| Ethics / IRB 声明 | **non-issue** | — | 合成 fixture + goal 明确"不得补造伦理审批"；response letter 可写 "IRB not applicable to synthetic fixture" |
| 效应量 / 统计量 | **non-issue** | — | goal 禁止补造；response letter 可写 "no effect sizes reported; not derivable from supplied sources" |
| 利益冲突 / 资助声明 | **gap (minor)** | （无意见） | **MINOR GAP**: 合成 fixture 不强制，但学术惯例要求声明。建议在 Conclusion 末尾加 "No conflicts declared; synthetic fixture, no external funding" 一行 |
| 摘要 / abstract | **non-issue** | — | partial manuscript 没有 abstract；不是缺失段落清单所列项 |
| 图表 | **non-issue** | — | 当前 manuscript 无图无表；reviewer 未提 |
| 作者贡献 / CRediT | **non-issue** | — | 合成 fixture；reviewer 未提 |
| 数据可用性 / reproducibility | **gap (minor)** | （无意见） | **MINOR GAP**: 当代期刊常要求 data availability。合成 fixture 没有"真实数据"；建议在 Methods 末或单独"Data availability"中写 "Synthetic fixture; no real data" |

## 4.5 Reviewer 自身意见的歧义点 / 决策依赖

| 编号 | 歧义 | 处理建议 |
| --- | --- | --- |
| `M2-DECISION` | "revise or remove" — reviewer 给二选一 | revision-context 表态偏 revise；response letter 必须显式选择并写原因；用户最终决定 |
| `M3` 中的 "relationship proposed in CLM-03 is not directly tested" | reviewer 未指明 "tested" 的标准是什么 | 在 Methods（M4c）中显式写出"未在同一分析中对照"即可满足 |
| `m1a` | canonical 术语未指定 | 用户决定 |

## 4.6 遗漏（omissions）汇总

按重要性递减：

1. **[GAP-major] Alternative explanations 节** — reviewer 未要求；但 fixture goal 实质要求。建议处理：在 Discussion 末新增 1 段，列出 3–5 条替代解释（如：单课效应、自报偏差、志愿偏差、政策文本 ≠ 实施、合成 fixture ≠ 真实课堂）。
2. **[GAP-major] "Conclusion calibrated to evidence" 的 calibration 部分** — `m2` 只覆盖 limitations 可见性；calibration 还需要：不在 conclusion 重申因果、不外推、不引用 CLM-02。建议处理：在 Conclusion 显式 1–2 句校准。
3. **[GAP-major] General policy-variation discussion** — Comment 3 只要求 CLM-03 假设化，未要求更宽泛的政策差异讨论。建议处理：若仅保留 CLM-03 段，至少在 Discussion 显式写"institutional policy variation is not modeled here" 一句以避免被审稿人追轮次。
4. **[GAP-minor] Conflict-of-interest / funding 声明** — 学术惯例要求；合成 fixture 不强制，但加一行无害。
5. **[GAP-minor] Data availability 声明** — 合成 fixture 没有真实数据；显式声明反而能预审稿人疑问。

## 4.7 是否有 reviewer 提出的意见被错配？

| 检查 | 结果 |
| --- | --- |
| M1 是否影响所有 4 source | 是（M1 笼统覆盖） |
| M2 是否仅影响 CLM-02 / SYN-INTERVIEW-02 | 是 |
| M3 是否仅影响 CLM-03 / SYN-SURVEY-03 + SYN-POLICY-04 | 是 |
| M4 是否要求新增 Methods 节 | 是 |
| m1 是否要求全文术语统一 | 是 |
| m2 是否要求 conclusion 显式 limits | 是 |
| 是否有意见被错误地归到无关 claim/source | 否 |
| 是否有意见被遗漏映射 | 否（4 major + 2 minor 全部映射到 §3.2 原子项） |

## 4.8 给用户的下一步选项

> 这些不是 Gate / Decision；只是后续工作建议。

- **选项 A**: 用户先决定 `M2-DECISION` 与 `m1a`；之后 Agent 起一个 review-response graph run 做完整修订。
- **选项 B**: 用户接受当前 4 个 GAP 的默认处理建议（新增 alternative-explanations 段、conclusion calibration、policy-variation 一句话、COI/data availability 声明），Agent 据此起 review-response graph run。
- **选项 C**: 用户要 Agent 在不进 graph run 的前提下继续手工产出修订稿与 response letter（stand-alone 模式）。

## 4.9 下一步

进入 Step 5：在 `work/researchspec-notes/review-response-prep.md` 维护任务笔记，列出所有产出路径与待决项。