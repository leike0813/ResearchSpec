# Step 2 · Manuscript Structure Analysis

> 输入: `benchmark/partial-manuscript.md`、`benchmark/claims.yaml`、`benchmark/sources.yaml`。
> 目的: 为 comment atomization 提供锚点（哪个段落、哪个 claim、哪条 source）。

## 2.1 段落骨架（按当前 partial manuscript）

| § | Section | Exists? | Content gist | Risk for revision |
| --- | --- | --- | --- | --- |
| 1 | Working title | yes | "Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits" | low（标题本身已显式标注 "Evidence Limits"） |
| 2 | Introduction | yes | 大学正尝试把生成式 AI 纳入写作课；本文审视小规模合成证据以识别假设与设计约束，不主张因果 | medium — 当前 introduction 只笼统提到 "synthetic evidence set"，未显式声明 "all evidence is local and synthetic"（对应 Comment 1） |
| 3 | Preliminary findings | yes | 1) CLM-01: 结构化提示与可见提纲修订相关；2) 提到 faster feedback vs verification work 的权衡；3) 显式承认 CLM-02 不被现有证据支持 | high — CLM-02 用一句话承认 unsupported，但 conclusion/讨论未充分展开权衡；CLM-03 当前在稿件中**没有**出现（仅在 claims.yaml 与 review-comments 中） |
| 4 | Methods and evidence-selection limitations | **missing** | — | high — Comment 4 强制要求；须说明四个合成 source 是如何被选取、为什么不可做因果推断 |
| 5 | Discussion of policy variation | **missing** | — | high — 与 CLM-03 的 policy-clarity 假设相关；Comment 3 要求 |
| 6 | Explicit treatment of alternative explanations | **missing** | — | high — 当前没有替代解释讨论；与 CLM-02 的 unsupported 结论直接相关 |
| 7 | Conclusion calibrated to evidence | **missing** | — | high — 当前稿件没有 conclusion；Comment 1 要求前置披露"local & synthetic"，Minor 2 要求 limitations 在 conclusion 也可见 |

## 2.2 核心 claims 与证据链路

| Claim ID | 当前 wording（claims.yaml） | Stated strength | Linked sources | Manuscript 当前是否引用？ | 风险等级 |
| --- | --- | --- | --- | --- | --- |
| `CLM-01` | "Structured use of generative AI may increase visible revision activity in some introductory writing contexts." | tentative | `SYN-CLASSROOM-01` | **是**（Preliminary findings 第 1 句） | low — 措辞已使用 "may / some"，可保留 |
| `CLM-02` | "Generative AI reduces instructor workload." | unsupported_as_written | `SYN-INTERVIEW-02` | **是**，但稿件同时承认不被证据支持（"The stronger statement … is not supported by the supplied evidence"） | **critical** — 措辞与强度严重不一致；Comment 2 要求降级或删除；作者意图为 accept |
| `CLM-03` | "Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use." | hypothesis_only | `SYN-SURVEY-03`, `SYN-POLICY-04` | **否**（partial manuscript 完全未提） | **critical** — 稿件未呈现这条 claim，但 review 已提；Comment 3 要求；作者意图为降级为 hypothesis + 去因果 |

## 2.3 Sources 与其在稿件中的角色

| Source ID | Kind | Scope | 在稿件中的使用方式 | 风险点 |
| --- | --- | --- | --- | --- |
| `SYN-CLASSROOM-01` | classroom_observation_summary | one first-year writing course, six weeks | 支持 CLM-01 | 单课、无对照组、无验证性写作度量——必须在 methods 写明 |
| `SYN-INTERVIEW-02` | instructor_interview_summary | five instructors, one institution | 同时被 CLM-02（不当引用）和权衡叙述引用 | 自报工作量、五人便利样本、无数时间日志——必须改写为 "self-reported trade-off"，禁止用做 "reduces workload" 的支撑 |
| `SYN-SURVEY-03` | student_survey_summary | 84 voluntary responses | 当前**未被** partial manuscript 引用；是 CLM-03 的支撑 | 志愿偏差、态度非行为、采集期政策变化——降级 CLM-03 时必须披露 |
| `SYN-POLICY-04` | institutional_policy_excerpt | one synthetic university policy | 当前**未被** partial manuscript 引用；是 CLM-03 的支撑 | 单机构政策文本、不可推广——必须在 methods/discussion 中披露 |

## 2.4 高风险改动区（high-risk modification surface）

按 reviewer 要求与作者意图合并的"必须改"区域：

1. **Introduction 段首句** — 必须显式声明 "all evidence is local and synthetic"（Comment 1）。
2. **Preliminary findings 中关于 CLM-02 的句子** — 必须改写为 trade-off 描述，或删除独立句子改为整合到 discussion（Comment 2）。
3. **新章节 CLM-03 / policy clarity** — 必须在 discussion 节以 "future research hypothesis" 形式出现，删除任何因果性措辞（Comment 3）。
4. **新增 Methods 节** — 解释四 source 的选择逻辑、为什么无对照、为什么不可因果推断（Comment 4）。
5. **新增 Discussion of alternative explanations** — 至少回应: 自报偏差、单课样本、志愿偏差、政策文本与实施脱节、态度 ≠ 行为。
6. **新增 Conclusion 节** — 再次声明证据局限；不在 conclusion 中放大效应（Minor 2）。
7. **术语统一** — "AI-assisted feedback" / "generative AI feedback" 二选一，全文一致（Minor 1）。

## 2.5 当前稿件未触及、但与"意见覆盖完整性"相关的隐含缺口

> 这一节是 Step 4 覆盖检查的前置提示：以下对象 partial manuscript 完全未出现，但 review comments 隐含要求处理。

- 没有任何 ethics / IRB 声明 — 目标产物要求保留为 "no completed ethics review"。
- 没有任何 effect size / 统计量 — 目标产物禁止补造。
- 没有任何 "future research" 段 — 但 CLM-03 的 hypothesis 化处理需要它存在。
- 没有任何 conflict-of-interest / funding 声明 — 合成 fixture 不强制，但仍需在 roadmap 中显式标记。

## 2.6 下一步

进入 Step 3：将 review-comments.md 的 4 major + 2 minor 拆成原子项，并逐条建立"意见 ↔ claim ↔ source ↔ 段落 ↔ 处置"映射。