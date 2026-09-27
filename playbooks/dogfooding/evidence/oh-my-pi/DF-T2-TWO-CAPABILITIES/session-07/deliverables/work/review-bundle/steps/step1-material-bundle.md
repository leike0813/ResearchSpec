# 步骤 1 — 现有稿件与审稿回复材料整理

> 单一文件快照：`work/review-bundle/steps/step1-material-bundle.md`
> 阶段产物路径：`work/review-bundle/steps/step1-material-bundle.md`
> 输入来源：`benchmark/`（合成材料，仅供流程演练）
> 工作语言：中文（与用户指令一致）
> 注：以下文案仅整理事实，不做修改。本阶段不写回复信或重写稿件。

## 1. 目标稿件（`partial-manuscript.md`）

### 1.1 工作标题
`Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits`

### 1.2 引言原文（verbatim）
> Universities are experimenting with generative AI in writing courses while instructors and students negotiate new expectations for feedback, authorship, and disclosure. This paper examines a small synthetic evidence set to identify useful hypotheses and design constraints rather than general causal effects.

### 1.3 现有"初步发现"原文（verbatim）
> Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`). Interview summaries also suggest that faster feedback may be offset by verification work. The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence.

### 1.4 现状缺失章节（manual pull from fixture）
- Methods and evidence-selection limitations
- Discussion of policy variation
- Explicit treatment of alternative explanations
- Conclusion calibrated to the supplied evidence

### 1.5 现稿对 `CLM-03` 的处理
`partial-manuscript.md` 引言和初步发现段均未单独陈述 `CLM-03`；claim ID 出现在 `claims.yaml`，但当前章节文本未引用 `CLM-03`。

## 2. 证据基础（`sources.yaml`）

| Source ID | 类型 | 范围 | 关键观察 | 已记录局限 |
|---|---|---|---|---|
| `SYN-CLASSROOM-01` | classroom_observation_summary | one first-year writing course, six weeks | 使用结构化 AI 提示的学生产生更多提纲修改；期末评分差异较大 | 无对照组；无写作质量验证量表；提示全部由授课教师提供 |
| `SYN-INTERVIEW-02` | instructor_interview_summary | five instructors at one institution | 教师反馈生成式 AI 加快了形成性反馈，但用于核对未经支撑的 claim 的时间增加 | 自报工作量；便利抽样；无时间日志 |
| `SYN-SURVEY-03` | student_survey_summary | 84 voluntary responses | 学生重视快速反馈，部分表示对"允许使用范围"和归属不清楚 | 自愿偏差；态度而非行为；数据采集期间本地政策变更 |
| `SYN-POLICY-04` | institutional_policy_excerpt | one synthetic university policy | 课程层面需要披露规则，但"可接受协助"留给任课教师自行定义 | 政策文本无法反映实施质量；不可跨机构泛化 |

## 3. Claim 现状（`claims.yaml`）

| Claim ID | 现行措辞（verbatim） | 支持来源 | 强度 | 已记录的局限 |
|---|---|---|---|---|
| `CLM-01` | Structured use of generative AI may increase visible revision activity in some introductory writing contexts. | `SYN-CLASSROOM-01` | tentative | 仅一个课程；修改活动 ≠ 写作质量 |
| `CLM-02` | Generative AI reduces instructor workload. | `SYN-INTERVIEW-02` | unsupported_as_written | 证据同时记录了节约时间与新增核对工作；没有量化工作量 |
| `CLM-03` | Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use. | `SYN-SURVEY-03` + `SYN-POLICY-04` | hypothesis_only | 所提供材料未直接对比政策清晰度与学生的不确定程度 |

## 4. 审稿意见（`review-comments.md`）

### 4.1 编辑意见
> Major revision.

### 4.2 Major comments（逐条原文）
1. The manuscript should state that all evidence is local and synthetic before presenting findings.
2. `CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it.
3. The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis.
4. Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.

### 4.3 Minor comments（verbatim）
- Use consistent terms for "AI-assisted feedback" and "generative AI feedback".
- Make the limitations visible in the conclusion, not only in methods.

## 5. 作者回复意图（`revision-context.md`）

- 评论 1、2、4 全部接受。
- 评论 3：保留政策-清晰度观点，但降级为 hypothesis 并删除因果措辞。
- 期望输出：
  - 意见↔行动路线图（roadmap）
  - 修改后的稿件（保留稳定 claim ID）
  - 回复信（说明哪些改动、保留哪些局限）
  - 不补造数据、来源、分析或伦理审批。

## 6. 当前 synthesis-state 速查

- **稳定 claim ID**：`CLM-01`、`CLM-02`、`CLM-03` 必须可被引用且 ID 不变。
- **已作者接受范围**：major 1、2、4 + minor 全；major 3 需要降级措辞。
- **已计划变更**：
  - `CLM-02`：降级或删除 → 改写为"更快反馈 vs 核对工作量"权衡陈述。
  - `CLM-03`：标记为 hypothesis_only，删除"associated with fewer uncertainties"这类准因果表述。
- **必须新增**：Methods & limitations、Policy 讨论、Alternative explanations、Calibrated conclusion。
- **必须澄清**：术语使用一致性，局限需在 conclusion 重复出现。
- **禁止事项**：补造数据、来源、分析或伦理审批；擅自扩范围；改 stable claim ID。

## 7. 资料入口与下一步

- 全部合成材料位于 `benchmark/`（仅流程演练用，非真实研究输入）。
- ResearchSpec workspace：`researchspec/`。
- 下一步：在 `work/review-bundle/atoms/` 下逐条拆分意见；产出会保留 stable claim ID 和已确认的修改方向。
