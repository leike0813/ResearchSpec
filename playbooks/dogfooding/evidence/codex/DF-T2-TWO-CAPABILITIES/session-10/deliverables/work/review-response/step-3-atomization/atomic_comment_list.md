# Atomic Review-Comment List

> Capability: `transform-review-response-comment-atomization`
> Source thread file: `benchmark/review-comments.md`（原文保留源语种）
> Generated: 2026-09-27

## 0. Source Thread Inventory

每个 `thread_id` 对应 `review-comments.md` 中一处边界。源文本保留英文原文；本层不做语义合并。

| thread_id | role | 段落 | 源片段（verbatim） |
| --- | --- | --- | --- |
| `editor_thread_001` | editor | Editorial recommendation | "Major revision." |
| `reviewer_thread_001` | reviewer | Major 1 | "The manuscript should state that all evidence is local and synthetic before presenting findings." |
| `reviewer_thread_002` | reviewer | Major 2 | "The `CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it." |
| `reviewer_thread_003` | reviewer | Major 3 | "The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis." |
| `reviewer_thread_004` | reviewer | Major 4 | "Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable." |
| `reviewer_thread_005` | reviewer | Minor 1 | "Use consistent terms for \"AI-assisted feedback\" and \"generative AI feedback\"." |
| `reviewer_thread_006` | reviewer | Minor 2 | "Make the limitations visible in the conclusion, not only in methods." |

线程总数：7。fixture 中只有单一审稿人，未做跨审稿人合并。

## 1. Canonical Atomic Items

稳定 ID 形如 `atomic_<3-digit-seq>`。每项独立可答、独立可执行、独立可校验。

### `atomic_001` — 证据出现前的本地/合成声明

- 父线程：`reviewer_thread_001`
- 关联 claim：无（稿件全局）
- 关联章节：Introduction（若补 abstract 亦需同步）
- 必要动作：在任何 preliminary finding 出现之前，加入一句明确声明——所有证据为本地、合成。
- 验收标准：直接跳到 "Preliminary findings" 的读者已经先读到该声明。
- 立场来源：作者接受（revision-context.md 第 1 项）。
- 立场状态：**作者已确认**。

### `atomic_002` — 弱化 `CLM-02` 措辞

- 父线程：`reviewer_thread_002`
- 关联 claim ID：`CLM-02`
- 关联章节：Preliminary findings
- 必要动作：用同时反映 "更快形成性反馈" 与 "新增核查工作" 的措辞替换现句，或彻底删除该因果性断言。
- 验收标准：稿件中不再残留 SYN-INTERVIEW-02 不支持的方向性 "reduce workload" 断言。
- 立场来源：作者接受（revision-context.md 第 2 项）。
- 立场状态：**作者已确认**。

### `atomic_003` — `CLM-03` 标为 hypothesis、去除因果措辞

- 父线程：`reviewer_thread_003`
- 关联 claim ID：`CLM-03`
- 关联章节：Discussion / Hypothesis（新增）—— CLM-03 措辞目前在正文中缺位
- 必要动作：把 CLM-03 移到 "Future research hypotheses" 或对等章节；显式标注 "未直接检验"；从措辞中去除任何因果动词。
- 验收标准："associated with" 只能以纯描述形式保留，或替换为更明确的 hedge；小节标题直接标记为 hypothesis。
- 立场来源：作者条件性接受（revision-context.md 第 3 项）—— 保留 policy-clarity 思路，标为 hypothesis，去除因果措辞。
- 立场状态：**作者条件性确认**（具体措辞选择须落到 round artifact 中记录）。

### `atomic_004` — Methods 章节：来源选择 + 因果推断不可用

- 父线程：`reviewer_thread_004`
- 关联 claim ID：CLM-01、CLM-02、CLM-03（全部）
- 关联章节：Methods（新增）
- 必要动作：撰写 Methods 章节：(a) 按 ID 与 kind 命名四份供给来源；(b) 说明选择方式；(c) 明确声明当前证据无法支撑因果推断。
- 验收标准：稿件中每条 claim 至少追溯到 Methods 中的某个具名来源 ID；Methods 包含一句显式的 "causal inference unavailable"。
- 立场来源：作者接受（revision-context.md 第 4 项）。
- 立场状态：**作者已确认**。

### `atomic_005` — 术语一致性

- 父线程：`reviewer_thread_005`
- 关联章节：全文
- 必要动作：在 "AI-assisted feedback" / "generative AI feedback" 之间选定一个，全文统一使用；另一术语全文替换为零。
- 验收标准：修订稿件全文检索中，被弃用术语出现次数为 0。
- 立场来源：`revision-context.md` 未明确表态。
- 立场状态：**待作者确认**。

### `atomic_006` — 局限在 Conclusion 中也可见

- 父线程：`reviewer_thread_006`
- 关联章节：Conclusion（新增）、Methods
- 必要动作：撰写 Conclusion 时复述主要局限（本地/合成证据、无因果推断、单课/小样本约束），而不局限于 Methods。
- 验收标准：Conclusion 至少包含一句以陈述局限为主要功能的句子（非贡献陈述）。
- 立场来源：`revision-context.md` 未明确表态。
- 立场状态：**待作者确认**。

### `atomic_007` — 编辑决策：Major revision

- 父线程：`editor_thread_001`
- 关联章节：全文
- 必要动作：将编辑推荐视为修订范围约束——返回稿件需覆盖全部作者已接受的 major 项（`atomic_001`、`atomic_002`、`atomic_003`、`atomic_004`），minor 项（`atomic_005`、`atomic_006`）要么处理要么附理由显式延后。
- 验收标准：response letter 开篇承认 "Major revision"，并把每个声明的原子项映射回其源评论 ID 与作者立场状态。
- 立场来源：`revision-context.md` 隐含支持；未对编辑信行直接表态。
- 立场状态：**待作者确认**（确认 response letter 开篇措辞）。

## 2. Raw-Thread → Atomic-Item Map

| thread_id | atomic items |
| --- | --- |
| `editor_thread_001` | `atomic_007` |
| `reviewer_thread_001` | `atomic_001` |
| `reviewer_thread_002` | `atomic_002` |
| `reviewer_thread_003` | `atomic_003` |
| `reviewer_thread_004` | `atomic_004` |
| `reviewer_thread_005` | `atomic_005` |
| `reviewer_thread_006` | `atomic_006` |

每条 thread 映射到 ≥ 1 atomic；每个 atomic 引用其父 thread——双向不变量满足。

## 3. Items Still Awaiting Author Confirmation

- `atomic_005` — 术语选择。
- `atomic_006` — Conclusion 中局限延续的范围。
- `atomic_007` — response letter 开篇措辞。

`atomic_001`–`atomic_004` 已带作者立场，可在 round artifact 记录 `atomic_003` 的措辞选择后推进。
