# Manuscript Structure Summary

> Capability: `analysis-review-response-manuscript-analysis`
> Source entry: `benchmark/partial-manuscript.md`
> Generated: 2026-09-27

## 1. Entry Shape

- 工程形态：**单 Markdown 文件**（无 LaTeX 工程，无多文件结构）。
- 标题块存在；无 abstract；尚无正式的 Methods / Discussion / Conclusion 章节。
- fixture 自标 "Partial Manuscript"，作者在源文里显式列出 missing sections。

## 2. Section Hierarchy

| # | 标题 | 功能 | 源中状态 |
| --- | --- | --- | --- |
| 1 | Working title | 封面 / 框架 | 存在 |
| 2 | Introduction | 问题定义 | 存在（2 句） |
| 3 | Preliminary findings | 结果 / 观察（含 claim CLM-01、CLM-02、CLM-03 引用） | 存在（3 句） |
| 4 | Missing sections | 缺失章节清单 | 存在（4 项） |

源文缺失章节（原文）：

- Methods and evidence-selection limitations
- Discussion of policy variation
- Explicit treatment of alternative explanations
- Conclusion calibrated to the supplied evidence

下游含义：3 → 5 节均缺失，"Missing sections" 本身就是路线图。

## 3. Claim Catalog

| Claim ID | 当前措辞 | 强度 | 支持来源 | 高风险点 |
| --- | --- | --- | --- | --- |
| `CLM-01` | "Structured use of generative AI may increase visible revision activity in some introductory writing contexts." | tentative | SYN-CLASSROOM-01 | 已校准，无审稿人直接质疑。 |
| `CLM-02` | "Generative AI reduces instructor workload." | **unsupported as written** | SYN-INTERVIEW-02 | 来源同时报告更快的反馈与新的核查工作；现句只断言了一个方向。Major 2 + 作者接受。 |
| `CLM-03` | "Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use." | **hypothesis only** | SYN-SURVEY-03 + SYN-POLICY-04 | 两份来源未直接比对政策清晰度与不确定性。Major 3 + 作者条件性接受（保留 policy-clarity 思路、标为 hypothesis、去除因果措辞）。 |

注：`CLM-03` 在 "Preliminary findings" 中仅被引用（提及 ID），源文没有一句话把它的命题写出。修订稿必须补出或迁移该句显式表述。

## 4. Evidence Links

```
CLM-01 ──► SYN-CLASSROOM-01（单门课、6 周、教师提供 prompt；无对照组；无写作质量验证测量）
CLM-02 ──► SYN-INTERVIEW-02（5 位教师、自报工作量、便利样本、无时间日志）
CLM-03 ──► SYN-SURVEY-03（84 份自愿回答、态度数据、自愿偏差、采集期间政策变化）
         └► SYN-POLICY-04（合成机构政策文本；无实施质量数据；不可跨机构泛化）
```

没有来源错配；没有 claim 引用了供给集合外的来源。

## 5. High-Risk Modification Areas

| 区域 | 风险 | 原因 |
| --- | --- | --- |
| `Preliminary findings`（CLM-02 措辞） | 高 | 现句断言了来源不支持的方向性效应。必须改写或删除。 |
| Introduction / 框架 | 中 | 尚未声明证据为本地、合成（Major 1）。 |
| Methods 章节 | 高 | 完全缺失。Major 4 与源文 "Missing sections" 均要求。 |
| CLM-03 措辞落位 | 中 | 当前正文无显式表述；需 hypothesis 化并迁移。 |
| 术语一致性 | 中 | "AI-assisted feedback" 与 "generative AI feedback" 混用（Minor 1）。 |
| Conclusion 局限可见性 | 中 | 局限仅出现在 "Missing sections"；也须出现在 Conclusion（Minor 2）。 |

## 6. Implications For Comment Atomization

- Major 1、2、4 分别触及稿件框架、CLM-02 措辞、缺失 Methods 章节——全部映射到上述高风险区。
- Major 3 触及 CLM-03，而 CLM-03 当前在正文中是缺位的；原子化项必须包含 "wording-relocation" 子动作，而非简单的措辞编辑。
- Minor 项分别是术语统一与 Conclusion 局限延续，均为中风险。
