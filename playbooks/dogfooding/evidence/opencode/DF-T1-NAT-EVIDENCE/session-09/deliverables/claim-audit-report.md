# Claim–Source 核查报告

> TEST FIXTURE DELIVERABLE — NOT A REAL RESEARCH OUTPUT
>
> 本报告基于 `benchmark/` 下的合成材料生成，目的是评估 `partial-manuscript.md` 中提到的主要论断能否由 `sources.yaml` 提供证据支持。所有 `SYN-*` source 与 `CLM-*` claim 仅用于内部 dogfooding，不代表真实参与者、论文或审稿过程。
>
> 范围：bounded，standalone，未修改 `researchspec/` 工作流状态，未创建 run / node / Gate / Decision。

## 1. 执行摘要

- 已审核 manuscript 提及的 claim 数：2（CLM-01、CLM-02）
- 未被 manuscript 提及的 claim 数：1（CLM-03，**drift**）
- 结论：manuscript 总体上没有过度声明（no overclaim），但在 evidence strength 标注、source limits 转写、CLM-03 的缺失这三处存在明确的补证缺口。
- 已使用 source：SYN-CLASSROOM-01、SYN-INTERVIEW-02。
- 完全未被引用的 source：SYN-SURVEY-03、SYN-POLICY-04。
- 严重程度：MED-WARN（无 gate-refuse），无需重写现有论断，但需补一段 “policy variation / disclosure guidance” 的 hypothesis-only 段落，并把 CLM-01 的强度显式标为 tentative。

## 2. 输入材料

| 路径 | 角色 | 用途 |
|---|---|---|
| `benchmark/goal.md` | 研究目标 | 范围与约束（合成、不联网、不补造效应量） |
| `benchmark/sources.yaml` | evidence corpus | 4 条 source（SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 / SYN-POLICY-04） |
| `benchmark/claims.yaml` | claim manifest | 3 条 claim（CLM-01 / CLM-02 / CLM-03） |
| `benchmark/partial-manuscript.md` | manuscript draft | 待核查的草稿 |

## 3. Claim Audit Results

按 `procedure:check-claim-faithfulness-audit` 的 6 步 pipeline 评估每条 manuscript 中提及的 claim。

### 3.1 CLM-01：结构化使用生成式 AI 可能增加某些入门写作课中可见的修订活动

| 项 | 值 |
|---|---|
| manuscript 行 | `benchmark/partial-manuscript.md:15`（"Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`)…"） |
| 支持 source | SYN-CLASSROOM-01（`benchmark/sources.yaml:4-11`） |
| claim strength 标注（claims.yaml） | tentative |
| judgment | **SUPPORTED**（表述已自带谨慎词 "coincided with"） |
| defect_stage | null |
| audit_status | completed |
| 触发判定 | manuscript 用 "coincided with" 而非 "increased/caused"，与 SYN-CLASSROOM-01 finding 一致；CLM-01 wording 也用 "may increase"，未做强因果 |
| 缺证 / caveat | ① 缺少 `strength: tentative` 显式标注；② 未转写 source limits（"No comparison group"、"No validated measure of writing improvement"、"Instructor supplied all prompts"）；③ 未提及 source 同一句中的 "final rubric scores varied widely"，进一步限制 "visible revision activity" 的解释力 |

补充观察：SYN-CLASSROOM-01 的 scope 仅 "one first-year writing course, six weeks"——manuscript 已写 "one introductory course"，但未保留 "six weeks" 与 "first-year" 这两个对可推广性很关键的字段。

### 3.2 CLM-02：生成式 AI 减轻教师工作量

| 项 | 值 |
|---|---|
| manuscript 行 | `benchmark/partial-manuscript.md:15`（"The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence."） |
| 支持 source | SYN-INTERVIEW-02（`benchmark/sources.yaml:12-19`），claim 强度 claims.yaml 标 `unsupported_as_written` |
| judgment | **CORRECTLY FLAGGED**（manuscript 显式声明不被支持，未采用该 wording） |
| defect_stage | not_applicable（claim 被识别为 unsupported，未在文中作支持使用） |
| audit_status | completed |

补充观察：manuscript 同时段写 "Interview summaries also suggest that faster feedback may be offset by verification work"——这与 SYN-INTERVIEW-02 finding（"faster formative feedback but additional time spent checking unsupported claims"）一致，等价于对 SYN-INTERVIEW-02 的 **PARTIAL** 引用（只用了 "faster + verification" 的对冲表述，未引用 source limits：self-reported workload、small convenience sample、no time logs）。这部分 judgment 归类为 **SUPPORTED with caveats**，defect_stage=null。

## 4. Claim Drifts

按 manifest 三方 diff（intended ∩ emitted ∩ supported）。

| drift_kind | claim_text | manifest_claim_id | section_path | 严重程度 |
|---|---|---|---|---|
| INTENDED_NOT_EMITTED | "Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use." | CLM-03 | 全文（草稿未引用 CLM-03，未引用 SYN-SURVEY-03 / SYN-POLICY-04） | LOW-WARN（manifest 标 `hypothesis_only`，本身证据弱；但缺失会留下 source 利用空白） |

CLM-03 的 `support` 是 SYN-SURVEY-03 + SYN-POLICY-04，`limits` 明确写 "The supplied materials do not directly compare policy clarity with uncertainty"。这意味着 CLM-03 的 wording 本身已经 over-strengthen（把"披露指引与不确定性"做了相关性断言），应当：

1. 要么在 manuscript 中以 hypothesis-only 形式引入，并显式写 "the supplied materials do not directly compare policy clarity with uncertainty"；
2. 要么从 claim manifest 中移除 wording 中的 "associated with fewer"，改为 "is hypothesized to reduce"。

CLAUDE.md 与 `goal.md` 都强调 "明确区分观察、解释与未知项" 与 "如需改变研究范围或 claim 强度，必须先让用户决定"——选项 2 属于改动 claim 强度，需先向用户请示；建议默认走选项 1。

## 5. Uncited Assertions（潜在）

按 D4-c（量词 / 实证动词 + 无 ref marker + 非定义句）。在 partial-manuscript.md 中扫描：

| sentence_id | section_path | trigger | rationale |
|---|---|---|---|
| S-INTRO-1 | `partial-manuscript.md:11` | "Universities are experimenting with generative AI…" | "are experimenting" 是经验性主张；可被 SYN-CLASSROOM-01（"Instructor supplied all prompts" 隐含实验性教学）部分支撑，但 manuscript 未标 source。建议补 "based on SYN-CLASSROOM-01" 或改写为定义性背景句 |
| S-META-1 | `partial-manuscript.md:11` | "This paper examines a small synthetic evidence set…" | 元陈述（self-positioning），不是经验性断言，豁免 |

未发现数字 / 百分比 / "most / several / showed / demonstrated / observed / proved / confirmed" 等强触发词。

## 6. Source 利用情况

| source_id | 在 manuscript 中是否被引用 | 备注 |
|---|---|---|
| SYN-CLASSROOM-01 | 是（CLM-01） | 引用但 limits 未转写 |
| SYN-INTERVIEW-02 | 是（CLM-02 + 反向使用） | 引用但 limits 未转写 |
| SYN-SURVEY-03 | **否** | 与 CLM-03 直接相关，但 CLM-03 未被引入 |
| SYN-POLICY-04 | **否** | 同上；policy variation discussion 已被 manifest 标为 missing section，但当前 manuscript 既未引入 source，也未展开 policy 维度 |

## 7. Constraint Check（与 goal.md 对齐）

`benchmark/goal.md:6-11` 显式约束：

- "只使用本基准包提供的合成材料"——本核查只读 4 条 SYN-* source，符合。
- "明确区分观察、解释与未知项"——manuscript 已识别 CLM-02 unsupported，但 CLM-01 缺少 tentative 标注、CLM-03 完全缺失，部分违反。
- "不补造参与者信息、效应量、引用或伦理审批"——manuscript 未补造，符合。
- "如需改变研究范围或 claim 强度，必须先让用户决定"——见 §4 中 CLM-03 的两个选项，需要用户裁决。

## 8. Defect-Stage Histogram

| defect stage | count |
|---|---|
| null（SUPPORTED with caveats） | 2（CLM-01、CLM-02 的 PARTIAL 反向使用部分） |
| not_applicable（correctly flagged unsupported） | 1（CLM-02 作为 unsupported 提及） |
| INTENDED_NOT_EMITTED（drift） | 1（CLM-03） |
| uncited low-warn | 1（S-INTRO-1） |

总样本量 5，附录 histogram 不生成（procedure 要求 ≥ 5 条 completed entries）。

## 9. 仍需补证清单（next actions）

按优先级排序，每条都给出对应 manuscript 行号与建议动作：

1. **HIGH：在 manuscript 中显式标注 CLM-01 强度 = tentative，并转写 source limits**
   - 位置：`benchmark/partial-manuscript.md:15`
   - 建议：在 CLM-01 句后追加 "(tentative; single course, six weeks; no comparison group; instructor-supplied prompts; final rubric scores varied widely — see SYN-CLASSROOM-01)"。

2. **HIGH：补写 CLM-03 / disclosure guidance 的 hypothesis-only 段落，并引用 SYN-SURVEY-03、SYN-POLICY-04**
   - 位置：在 `## Preliminary findings` 之后或新开 `## Policy and disclosure` 段。
   - 建议措辞骨架（hypothesis-only，禁止出现 "associated with fewer" 这类未支持的关联词）：
     > "Across 84 voluntary responses, students valued rapid feedback but also reported uncertainty about permitted use and attribution (`SYN-SURVEY-03`); a synthetic institutional policy (`SYN-POLICY-04`) requires course-level disclosure while leaving acceptable assistance to instructors. We hypothesize that clearer course-level guidance may reduce student uncertainty, but the supplied materials do not directly compare policy clarity with uncertainty."
   - 同步把 CLM-03 的 wording 维持在 `hypothesis_only`，不在文中改写。

3. **MED：在 missing sections 列表中追加"transparency about source limits"作为方法节子项**
   - 位置：`benchmark/partial-manuscript.md:19-22`
   - 建议：在 "Methods and evidence-selection limitations" 下列出已使用 source 的 limits 摘要，避免读者误把 tentative finding 当 strong claim。

4. **MED：改写或紧引 S-INTRO-1**
   - 位置：`benchmark/partial-manuscript.md:11`
   - 建议：要么标 source（如 "based on SYN-CLASSROOM-01"），要么改写为更轻量的背景句（例如去掉 "are experimenting"，改为 "is increasingly discussed"）。

5. **LOW：保留 CLM-02 的 "not supported" 标记作为示范性 unsupported-claim 范例**
   - 位置：`benchmark/partial-manuscript.md:15`
   - 现状已合规，仅在最终稿中可补一句解释为什么标注它（"to contrast with the supported hypothesis below"）以提升可读性。

## 10. 未触发 / 无需报告的维度

- 引用格式合规：草稿未列 reference list，问题不在本核查范围。
- 引用存在性：本核查未对外网 / DOI 做检索；所有 source 是 SYN-* 合成 ID，已按 goal.md 约束排除联网核实。
- 时序完整性：草稿未出现日期 / 时点 / 因果时间表述，未触发 temporal lint。
- 实验/伦理：manuscript 未做实验，也未声明伦理审批编号，无对应违规。

## 11. 总体 readiness

- **Scope**：bounded，单一核查任务，无 Gates、无 Decisions、无并行 join。
- **Owner**：下一动作由用户决定（CLM-03 的 hypothesis 引入 vs claim wording 改写属于 claim-strength 变更，需先与用户确认）。
- **No workflow mutation**：本核查未运行 `researchspec start` / `advance` / `decide`，未改 `researchspec/specs/` 或 `researchspec/runs/`；`benchmark/` 下材料字节不变。
- **No fabricated evidence**：未编造参与者、效应量、引用或伦理审批号；所有判定均回指 `benchmark/sources.yaml` 与 `benchmark/claims.yaml` 的具体字段。