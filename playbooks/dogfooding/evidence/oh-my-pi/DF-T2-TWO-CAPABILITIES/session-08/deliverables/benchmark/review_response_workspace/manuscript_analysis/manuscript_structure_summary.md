# Manuscript Structure Summary

> 节点：`manuscript-analysis`（capability `analysis-review-response-manuscript-analysis`）。
> 角色：`manuscript_structure_summary`。
> 输入：`benchmark/partial-manuscript.md`（逐字转录见 §2）；不修改原稿。

## 1. 评估范围声明
- 仅基于 `partial-manuscript.md` 当前文本与 `claims.yaml` 的可追溯性。
- 不外推任何实验设计、样本量或新增结论。
- partial 自身列出 4 个 missing section，本摘要在其基础上标注每一段意见最可能的落点。

## 2. partial-manuscript.md 转录结构（用于下游定位）

| 段落 | 标题 | 行/句概览 | Claim/Source 触达 | 关键术语 |
|------|------|-----------|--------------------|----------|
| §1 | Working title | `Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits` | — | "evidence limits" 自带 framing |
| §2 | Introduction | 一段：高校正在写作课试验生成式 AI；本文检视小规模合成证据，目的是辨析有用假设与设计约束，而非普遍因果 | — | "synthetic evidence set" 已埋下"声明本地/合成" 的伏笔 |
| §3 | Preliminary findings | (a) `CLM-01` 提示结构化提示与更多可见提纲修改同步出现；(b) 访谈摘要提示更快反馈可能被核查工作抵消；(c) 显式否证 `CLM-02` 的更强表述 | `CLM-01`、`SYN-CLASSROOM-01`、`CLM-02`（否证）、`SYN-INTERVIEW-02` | 术语："AI-assisted feedback"未出现；"generative AI feedback"未出现 |
| §4 | Missing sections | 项目化列出 4 段空缺 | — | — |

## 3. 与 review-comments 的落点映射

| 意见 | partial 中是否已触及 | 落点建议（仅规划，不动文） | 缺口 |
|------|----------------------|----------------------------|------|
| #1 在呈现发现前声明证据全部本地且合成 | Introduction 提到 "small synthetic evidence set"，但未在文首显式声明；缺少固定开头段落 | 在 Working title 之后增设一段 **Evidence-base disclosure**（独立于 Introduction），明确 4 条来源为合成、不代表真实研究 | 缺独立披露段 |
| #2 `CLM-02` 表述过强 | Preliminary findings (c) 已显式否证更强说法；但仍缺少"权衡"叙述（更快反馈 vs 核查工作） | 在 Discussion 中单列 **Trade-off framing for instructor workload**，引用 `SYN-INTERVIEW-02` | 缺权衡段落 |
| #3 `CLM-03` 关系未直接测试 | Preliminary findings 完全未提 `CLM-03`；partial 仅承认 missing sections，未将 `CLM-03` 降级为 hypothesis | 在 Discussion 或 Conclusion 中增设 **Hypothesis box for CLM-03**，使用 `revision-context.md` 已同意的"标注为 hypothesis、去除因果措辞"措辞 | 缺 hypothesis 化处理 |
| #4 增 Methods：4 来源如何选出 + 为何不能因果 | 完全缺失 | 新增 **Methods and evidence-selection limitations** 章节：说明来源非抽样而是基准包自带、范围有限、不能因果 | 缺整章 |
| minor · 术语统一 | 全文未统一出现两个术语 | 选定 "AI-assisted feedback" 作为正文统一表述；第一次出现时给出脚注 | 缺术语规范 |
| minor · 局限放结论 | 当前无 Conclusion | 新增 **Conclusion** 章节，重复 `CLM-02` 否证、`CLM-03` 假设化、不能因果；与 Methods 末尾限制呼应 | 缺整段 |

## 4. 关键结构缺口汇总

1. **Evidence-base disclosure 段落**（回应意见 #1）。
2. **Methods 章节**（回应意见 #4），并在该章末列出来源限制。
3. **Discussion 章节**，含：(a) instructor workload 权衡段（#2）、(b) `CLM-03` hypothesis 段（#3）。
4. **Conclusion 章节**（minor #2），显式重复局限而非只在 Methods。
5. **术语规范**（minor #1），在首次引入术语时一次性统一。

## 5. 仍待人工决策 / 不在本轮权限内的项
- 是否删除 `CLM-03` 而非 hypothesis 化（author 已表态保留，意见 #3 仅要求降级，不需决策）。
- 是否在本轮之外补 Methods 的伦理说明——goal 明确禁止补造伦理审批，故 Methods 仅声明"未做伦理审批，未提供参与者信息"，不作扩展。
- 是否替换 working title —— 意见列表未涉及，无需改动。

## 6. 下游对接
- `atomic_comment_list.md` 将按本表行项编号生成原子条目；本表序号与原子条目编号保持一致。
- `comment_coverage_report.md` 将逐条对照 partial + revision-context 是否覆盖，引用本表"落点建议"列作为下游 round 写入指针。