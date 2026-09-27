# Step 3 · Atomic Comment Decomposition

> 输入: `benchmark/review-comments.md`、`benchmark/revision-context.md`、Step 1+2 的产物。
> 目的: 把每条意见拆成"可执行、可验证、可在 response letter 中逐条回复"的原子项，并完成 ↔ claim / source / 段落 / 处置 的映射。

## 3.1 拆分原则

- 一条意见可以含多个原子动作；保留 ID 层级（`M1`, `M1a/M1b`）。
- 标"决策类"原子项时显式注明 `decision-needed`，因为它影响下游多个 claim。
- 任何无法在 partial manuscript 当前段落直接定位的，标 `target-section: new` 并指明拟新增段落。
- `author_intent` 直接取自 `revision-context.md`；`uncertain` 表示未在 revision-context 中表态。

## 3.2 原子项表

### Major 1 — 证据的本地 / 合成属性须前置披露

| 子项 | 内容 | 目标段落 | 目标 claim/source | author_intent | 必须回信内容 |
| --- | --- | --- | --- | --- | --- |
| `M1` | 在 preliminary findings 之前显式声明"all evidence is local and synthetic" | Introduction 末段 / 新增 Evidence Scope 提示框 | 全 4 sources | accept | 已新增 evidence-scope 披露，引用 fixture README 中的合成性质 |

### Major 2 — CLM-02 强度过高

| 子项 | 内容 | 目标段落 | 目标 claim/source | author_intent | 必须回信内容 |
| --- | --- | --- | --- | --- | --- |
| `M2-DECISION` | 在"重写为 trade-off" 与 "删除 CLM-02" 之间二选一 | Preliminary findings / Discussion | `CLM-02` / `SYN-INTERVIEW-02` | accept, 倾向 revise（revision-context 表述为 "Revise it … or remove it"） | 在回信中显式给出选择与原因；如 revise，写出新措辞；如 remove，删除 CLM-02 并同步删除 claims.yaml 条目 |
| `M2a` | 若 revise：CLM-02 wording 改为描述"faster formative feedback is offset by additional verification work"；在 claims.yaml 中 strength 降为 `tentative`，support 仍保留 SYN-INTERVIEW-02 | claims.yaml + Preliminary findings | `CLM-02` / `SYN-INTERVIEW-02` | accept | 在回信中贴出新的 CLM-02 措辞与 strength 字段 |
| `M2b` | 若 revise：明确写出 "self-reported, no time logs" 的局限 | Methods / Limitations | `SYN-INTERVIEW-02` | accept | 在 Methods 或 Limitations 中显式标注 |

### Major 3 — CLM-03 当前未直接检验

| 子项 | 内容 | 目标段落 | 目标 claim/source | author_intent | 必须回信内容 |
| --- | --- | --- | --- | --- | --- |
| `M3a` | CLM-03 不再以"finding"形式出现；改为 future-research hypothesis | Discussion / Future research（新增） | `CLM-03` / `SYN-SURVEY-03`, `SYN-POLICY-04` | accept, 降级 | 回信中写明已降级为 hypothesis |
| `M3b` | 删除 CLM-03 中的因果措辞（如 "associated with fewer uncertainties"），改为方向性、探索性表述 | Discussion / Future research | `CLM-03` | accept | 回信中贴出新措辞 |
| `M3c` | 解释为什么 SYN-SURVEY-03 + SYN-POLICY-04 不能直接支撑"政策清晰度 ↔ 学生不确定感"的因果关系（survey 是态度非行为；policy 是文本非实施；二者未在同一分析中对照） | Methods / Discussion | `SYN-SURVEY-03`, `SYN-POLICY-04` | accept（隐含） | 回信中说明证据差距 |

### Major 4 — 新增 Methods 节

| 子项 | 内容 | 目标段落 | 目标 claim/source | author_intent | 必须回信内容 |
| --- | --- | --- | --- | --- | --- |
| `M4a` | 新增 Methods 节 | Methods（新增） | — | accept | 回信中给出 Methods 节标题与定位 |
| `M4b` | 解释四个 supplied source 的选择逻辑 | Methods | 全 4 sources | accept | 回信中贴出选择说明（如：合成 fixture 提供；不做外部增补） |
| `M4c` | 解释为什么因果推断不可用（无对照组、单课样本、自报、志愿偏差、单机构政策文本） | Methods / Limitations | 全 4 sources | accept | 回信中列出至少 3 条不可因果的原因 |

### Minor 1 — 术语统一

| 子项 | 内容 | 目标段落 | 目标 claim/source | author_intent | 必须回信内容 |
| --- | --- | --- | --- | --- | --- |
| `m1a` | 选定一个 canonical 术语（候选: "AI-assisted feedback" 或 "generative AI feedback"） | 全稿 | — | uncertain（未在 revision-context 表态） | 回信中给出选择；用户决定 |
| `m1b` | 全文按 canonical 术语统一替换 | 全稿 | — | accept（implicit） | 回信中说明已做全局替换 |

### Minor 2 — Limitations 在 conclusion 也可见

| 子项 | 内容 | 目标段落 | 目标 claim/source | author_intent | 必须回信内容 |
| --- | --- | --- | --- | --- | --- |
| `m2` | 在 conclusion 重申关键局限：单机构 / 合成 fixture / 无对照 / 不可因果 | Conclusion（新增） | 全 4 sources | accept | 回信中贴出 conclusion 的 limitations 句子 |

## 3.3 映射总览（claim ↔ 原子项 ↔ 段落）

| Claim | 涉及的原子项 | 目标段落 | 现状 |
| --- | --- | --- | --- |
| `CLM-01` | （无强制意见；隐含受益于 M1, M4c 的语境说明） | Preliminary findings | 保持 tentative；稿件措辞基本合规 |
| `CLM-02` | `M2-DECISION`, `M2a`, `M2b` | Preliminary findings / Methods or Limitations | 必须改写或删除 |
| `CLM-03` | `M3a`, `M3b`, `M3c` | Discussion / Future research（新增） | 必须从 finding 降级为 hypothesis |
| 全 sources | `M1`, `M4a`, `M4b`, `M4c`, `m2` | Intro / Methods / Limitations / Conclusion | 整体披露范围扩大 |

## 3.4 决策与未决项

> 这些项必须在 response letter 之外、单独由用户决定，Agent 不擅自决定。

1. **M2-DECISION** — "revise CLM-02" 还是 "remove CLM-02"。revision-context 表态偏 revise 但保留选择权；用户决定。
2. **m1a** — canonical 术语选哪个。revision-context 未表态；用户决定。
3. **M4b 选择说明的"措辞强度"** — fixture README 要求"不得把短期课堂观察表述为普遍因果结论"；Methods 中应明确"不可外推"还是"完全不可外推"。可由 Agent 给保守措辞、用户审。

## 3.5 下一步

进入 Step 4：以 claim / source / 段落为维度，反向检查这些对象是否都被某条意见覆盖；标记 reviewer 未提及的缺口。