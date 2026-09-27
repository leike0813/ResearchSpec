# Review-Response Intake Report

> Capability: `design-review-response-intake`
> Workspace: `/tmp/researchspec-journey-6wNGd8`
> Generated: 2026-09-27

## 1. Resolved Entry

| Role | Resolved path | Notes |
| --- | --- | --- |
| `manuscript_source` | `benchmark/partial-manuscript.md` | Markdown 草稿（非 LaTeX）。见 open confirmation A。 |
| `review_comments_source` | `benchmark/review-comments.md` | 单文件 Markdown。 |
| `editor_letter_source` | 嵌入 `benchmark/review-comments.md` 的 "Editorial recommendation" 段落 | 视作内联编辑信。 |
| `user_notes` | `benchmark/revision-context.md`、`benchmark/goal.md` | 作者立场 + 范围约束。 |

材料目录（原文保留源语种，下方为中文摘要）：

- `goal.md`：范围是生成式 AI 对高校写作教学的影响；约束——只用合成材料、区分观察/推断/未知、不补造参与者/效应量/引用/伦理审批、范围或 claim 强度变更需先经用户确认。
- `partial-manuscript.md`：工作标题、Introduction、Preliminary findings（含 CLM-01/CLM-02/CLM-03）、Missing sections 列表。
- `claims.yaml`：CLM-01 tentative，CLM-02 unsupported as written，CLM-03 hypothesis only。
- `sources.yaml`：SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 / SYN-POLICY-04。
- `review-comments.md`：编辑推荐 "Major revision"，4 条 major + 2 条 minor。
- `revision-context.md`：作者接受 1、2、4；对 3 保留 policy-clarity 思路但同意标为 hypothesis 并去除因果措辞。

## 2. 语言确认

- 文本语种（text language）：**English**（稿件为英文）。
- 工作语种（working language）：**中文**（用户当前提示）。
- 需用户确认：是否接受双语产出（源语种内容保留原文，工作语种内容用中文撰写）。

## 3. 依赖与脚本状态

| 项 | 状态 | 备注 |
| --- | --- | --- |
| Python 3 | 可用 | `$HOME/.ar` uv 共享环境可达。 |
| PyYAML / Jinja2 | 未检测（本流程未调用） | Intake 脚本 `init_artifact_workspace.py` 面向 LaTeX 工件空间；本 Markdown fixture **不**调用该脚本。 |
| `scripts/detect_main_tex.py` | 未调用 | 入口是 `.md`，不是 LaTeX 工程。 |
| `scripts/init_artifact_workspace.py` | 未调用 | 流程要求 LaTeX；Markdown 替代物就地处理。 |
| `scripts/gate_and_render_workspace.py` | 未调用 | 未创建 `revision-master.db`。 |

决策：本步骤产出四个 Markdown 工件，落在 `work/review-response/`，对应过程 schema（`review-response-intake.v1`、`review-response-manuscript-analysis.v1`、`atomic-review-comment-list`、`review-comment-coverage`）。不修改 ResearchSpec 工作流状态。

## 4. 待用户确认事项

- **A. 稿件入口是 `.md` 而非 `.tex`** —— 确认 (a) 直接以 Markdown 替代物推进，或 (b) 先把稿件转成 LaTeX 桩再走标准 intake。
- **B. 语言配对（英文文本 / 中文工作）** —— 确认接受双语产出。
- **C. 作者立场覆盖** —— `revision-context.md` 覆盖了 major 1、2、3（部分）、4；两条 minor 与编辑推荐均未直接表态。确认作者是否也接受 minor 项，以及 "Major revision" 是否对应实质的多轮修订。

## 5. 范围外提醒

依 `goal.md` 与 `revision-context.md`：

- 不补造数据、来源、分析、伦理审批或参与者。
- 区分观察、解释、未知。
- 范围或 claim 强度变更须先经用户决定。
