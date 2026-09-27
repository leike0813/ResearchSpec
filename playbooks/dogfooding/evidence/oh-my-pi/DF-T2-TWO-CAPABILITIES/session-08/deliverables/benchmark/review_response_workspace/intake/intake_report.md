# Intake Report — Review-Response Round

> 来源：全部来自 `benchmark/` 中的合成材料；不联网，不补造。
> 触发 profile：`researchspec/profiles/review-response.yaml`，节点 `intake` (capability `design-review-response-intake`)。
> 角色：`review_response_workspace` + `intake_report`。

## 1. 收口后的关键事实

### 1.1 研究目标（`goal.md`）
- 主题：生成式 AI 对高校写作教学的影响。
- 重点：学生写作过程、反馈质量、教师工作量、学术诚信。
- 现状：研究问题、研究设计、目标产物尚未确定。
- 边界约束（逐字保留）：
  - 只使用本基准包提供的合成材料；
  - 明确区分观察、解释与未知项；
  - 不补造参与者信息、效应量、引用或伦理审批；
  - 如需改变研究范围或 claim 强度，必须先让用户决定。

### 1.2 证据基础（`sources.yaml`，4 条合成来源，全部为本地/合成）
| ID | 类型 | 范围 | 结论摘要 | 关键局限 |
|----|------|------|----------|----------|
| `SYN-CLASSROOM-01` | classroom_observation_summary | 一门一年级写作课，6 周 | 使用结构化 AI 提示的学生产生更多提纲修改；最终评分差异大 | 无对照组、无改进度量、教师自备提示 |
| `SYN-INTERVIEW-02` | instructor_interview_summary | 一所机构 5 位教师 | 形成性反馈更快，但额外花费时间核查未支持的论述 | 自报工作量、便利样本、无时间日志 |
| `SYN-SURVEY-03` | student_survey_summary | 84 份自愿问卷 | 学生看重快速反馈；部分学生对允许使用与署名存在不确定 | 自愿偏差、态度而非行为、政策同期变更 |
| `SYN-POLICY-04` | institutional_policy_excerpt | 一所合成大学政策 | 要求课程级披露，但"可接受协助"交由教师定义 | 政策文本不能反映执行；不可跨校推广 |

### 1.3 Claim 现状（`claims.yaml`，与 `sources.yaml` 映射）
| Claim ID | Wording（缩写） | 支撑来源 | 强度标记 | 主要局限 |
|----------|-----------------|----------|----------|-----------|
| `CLM-01` | 结构化使用生成式 AI 在部分入门写作情境中可能增加可见的修改活动 | `SYN-CLASSROOM-01` | tentative | 单课程；修改活动 ≠ 写作质量 |
| `CLM-02` | 生成式 AI 减少教师工作量 | `SYN-INTERVIEW-02` | unsupported_as_written | 同时报告节约时间与新增核查工作；无实测数据 |
| `CLM-03` | 清晰披露指引与学生对可接受 AI 使用的更少不确定性相关 | `SYN-SURVEY-03` + `SYN-POLICY-04` | hypothesis_only | 现有材料未直接比较政策清晰度与不确定性 |

### 1.4 当前稿件结构（`partial-manuscript.md`）
- Working title：`Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits`
- Introduction：定位为"小规模合成证据"——辨识假设与设计约束，非因果性推广。
- Preliminary findings：保留 `CLM-01`、承认访谈提示工作量权衡、显式否证 `CLM-02`。
- Missing sections（partial 自身已承认）：
  - 方法与证据选择局限；
  - 政策差异讨论；
  - 替代解释显式处理；
  - 结论与所提供证据校准。

### 1.5 审稿意见（`review-comments.md`）
- Editorial recommendation：**Major revision**。
- Major comments（4 条）：
  1. 在呈现发现前声明证据全部为本地且合成。
  2. `CLM-02` 过强 → 反映"更快反馈 vs 核查工作量"权衡或删除。
  3. `CLM-03` 关系未被直接测试 → 降级为未来研究假设。
  4. 增补 Methods，解释 4 个来源如何选出、为何不能做因果推断。
- Minor comments（2 条）：
  - 统一"AI-assisted feedback"与"generative AI feedback"的术语。
  - 在结论中也显式呈现局限，不只在方法。

### 1.6 作者在 `revision-context.md` 的初步决定
- 接受意见 1、2、4。
- 对意见 3：保留政策清晰度想法，但同意标注为 hypothesis、去除因果措辞。

### 1.7 本轮 review-response profile 的下一节点约束
- 仅产出 `manuscript_structure_summary` + `atomic_comment_list` + `comment_coverage_report`。
- 不进入 workboard、round、gates、outcome——这些由后续节点处理。
- 不修改 `partial-manuscript.md`，仅产出对应分析文档。

## 2. Workspace 索引（产物对照）
| review-response 输出角色 | 路径（相对 `benchmark/`） |
|--------------------------|----------------------------|
| `intake_report` | `review_response_workspace/intake/intake_report.md` |
| `review_response_workspace` 索引 | `review_response_workspace/WORKSPACE.md` |
| `manuscript_structure_summary` | `review_response_workspace/manuscript_analysis/manuscript_structure_summary.md` |
| `atomic_comment_list` | `review_response_workspace/comment_atomization/atomic_comment_list.md` |
| `comment_coverage_report` | `review_response_workspace/comment_coverage/comment_coverage_report.md` |

## 3. 已识别风险与下一步
- 风险：partial manuscript 缺少 Methods / Discussion / Conclusion 主体段落，下游做 round（写作）前必须先按意见 4 起一段方法学骨架——否则原子意见的落地位置无法对齐。
- 风险：术语"AI-assisted feedback" vs "generative AI feedback"未在 partial 中实际出现，但 goal/intro 均未锁定单一表述，需在 round 之前定一个统一术语。
- 下一步（仍在本轮 review-response 内）：
  1. 落 `manuscript_structure_summary`，标出每条 missing section 的覆盖点；
  2. 落 `atomic_comment_list`，按 major/minor/editorial 拆分；
  3. 落 `comment_coverage_report`，核对 partial + revision-context 是否完整回应每一条意见，列出未覆盖点。