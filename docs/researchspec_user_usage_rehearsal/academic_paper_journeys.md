# Academic Paper 用户旅程

本文属于 [ResearchSpec 目标态用户使用预演](../researchspec_user_usage_rehearsal.md)。
`academic-paper` 负责规划、写作、修订和投稿准备；它不替代独立 reviewer，也不把稿件正文
保存为 stable spec。

## 共同边界

所有稿件和辅助材料位于 `researchspec/` 外。`manuscript.yaml` 保存当前认可的稿件蓝图、
venue、语言、格式约束和 `delivery` 选择，不保存正文、draft status、round 或 patch 状态。高影响 structure、
claim 或 revision strategy 选择写入 owning control；普通文字编辑由 Git 记录。

## 1. `academic-paper:full`：完整论文写作

从 S2 开始。用户说：“根据现有研究材料写完整论文。”Navigate 确认 research handoff、目标
venue、篇幅、语言、引用格式和作者边界；若研究材料不足，near miss 是
`deep-research:full`。

```text
Skill/mode: academic-paper:full
Inputs: four stable specs、research handoff 与其外部材料
Outputs: configuration、outline、evidence map、argument blueprint、draft
Formal Gates: manuscript quality、citation integrity
Cost: high / long-horizon
```

用户确认后，`start` 创建 writing control。Producer 读取 stable specs、上游 control/handoff
和实际 research report、synthesis、bibliography，生成：

```text
paper/
├── outline.md
├── evidence-map.md
├── argument-blueprint.md
└── manuscript.md  # 或首次 writing intake 选定的 manuscript.qmd
```

Outline 有多个实质结构方案时，用户选择后由 `decide` 记录 structure Decision，Agent 再把
认可蓝图写入 `manuscript.yaml`。Producer 不超出 `claims.yaml` 的允许强度；需要新增或
加强 claim 时先提出 research change。

Handoff 指向稿件和辅助材料。Verify 分别评估稿件质量与引文完整性，用户逐一确认 formal
Gate，`decide` 写 control，`advance` 完成实例。失败 Gate 保留；未确认前不得以“草稿已写完”
替代 readiness。

## 2. `academic-paper:outline-only`：只规划结构

从 S2 开始。用户只要详细 outline 和 evidence map，不要正文。Navigate 明确排除 `full`，
确认读者、贡献和章节约束，展示 medium/single-pass、条件性 manuscript-structure Gate。

Producer 输出 `paper/outline.md` 与 `paper/evidence-map.md`。若只是工作草案，结果保持 advisory；
若用户打算把它定为当前稿件结构，Verify 提出 structure verdict，用户确认后 `decide` 保存
Gate/structure Decision，Agent 更新 `manuscript.yaml`。

启动被拒绝时不创建实例；证据不足的 section 必须标为 gap，不能用待补引用的正文掩盖。
完成时不存在空白 manuscript 文件，也不暗中升级为 `full`。

## 3. `academic-paper:revision`：按意见改稿

从 S4 开始。用户要求按 round 01 review 和 roadmap 修订。Navigate 核对当前稿件、review、
roadmap、round 与输出位置，区分实际改稿的 `revision` 和只制定策略的 `revision-coach`。

用户确认 high/iterative 路线后创建 round-aware control。Producer 生成：

```text
paper/revisions/
├── round-01.patch.json
├── manuscript-round-01.md  # QMD 稿源保持 .qmd
└── response-to-reviewers-round-01.md
```

ARSU revision patch 是唯一稿件 patch 合同。无状态辅助工具可以校验结构、block ID、
`old_hash` 与 annotation mapping，并安全应用到显式输入/输出路径。它不读写 control，不生成
registry、receipt、全局 verification state、必备 apply report 或 resolution report。

Stale target 或 unknown block 时自动应用不修改稿件。用户可以要求重新生成 patch，或人工
改稿；人工路径仍须在 response 与 handoff 中说明。机械 precheck 之后，Verify 判断是否
充分回应意见。用户确认 revision-completeness Gate，`decide` 写 control，`advance` 完成。

改变 claim 强度、研究范围或核心结构时另记 Decision/change，不能把“接受 patch ID”当作
研究决定。原稿始终保留，re-review 必须通过 handoff 读取修订稿与回复信。

## 4. `academic-paper:abstract-only`：摘要与关键词

从 S3 开始。用户要求为现有稿件写 250 词结构式摘要。Navigate 确认稿件路径、字数、摘要
结构和 venue 规则，选择 `abstract-only` 而不是重新写整篇论文。

用户确认低成本 single-pass 路线后，Producer 只读稿件并输出：

```text
paper/abstract.md
paper/keywords.md
```

Handoff 标明它们对应的稿件版本和 venue 限制。此 mode 通常没有 formal Gate；完成不修改
正文，也不自动把摘要嵌入稿件。若摘要声称稿件中不存在的结果，Producer 必须修正或报告
冲突，而不是扩展 claims。

## 5. `academic-paper:lit-review`：论文中的文献综述

从 S2 开始。用户要写论文中的 literature review section。Navigate 选择本 mode，因为目标
是 manuscript prose；若目标是独立证据综合，应改用 `deep-research:lit-review`。

路线摘要覆盖 project、sources、claims、manuscript、目标 section、research handoff、
evidence-quality 与 manuscript-quality Gates，以及 medium/iterative 成本。Producer 可以在
外部目录生成专用 matrix、section synthesis 和 `paper/sections/literature-review.md`。

写作必须把来源分歧、方法差异和 claim 限制带入正文，不以流畅性覆盖不确定性。用户分别
确认 evidence 与 manuscript Gates 后，Agent 可更新 `manuscript.yaml` 的 section intent，
但不会把 section 正文写进 spec。若新检索改变稳定来源或 claims，先回到相应 research
合同，而不是让本 section 成为事实源。

## 6. `academic-paper:format-convert`：投稿格式转换

从 S6 开始。用户指定期刊模板和最终输出。Navigate 确认最终稿路径、模板、引用样式、图表资源
与覆盖策略，展示 low/single-pass 路线。格式转换不承担正文修订或事实核查。Markdown 继续沿用
既有转换路径；QMD 每个 formatting subflow 只确认一个 Quarto target，先只读探测
`quarto --version`，默认 no-execute，执行代码必须另行确认 `render_consent`。

```text
paper/submission/
└── manuscript.pdf  # 示例：v1 单一确认目标
```

Producer 读取最终稿与 `manuscript.yaml`，输出到用户确认路径。确定性检查验证文件可读、必要
section 存在、引用与资源链接闭合；通常没有独立 formal Gate。若作为 pipeline 最终 child，
其结果随后参加 parent profile 的 final-integrity Gate。

Quarto 缺失、探测 unknown、命令失败、输出缺失或 staging 检查失败时不覆盖已有 submission
文件，也不更新成功 handoff。格式化不得偷偷改写学术措辞；QMD 源稿与渲染稿均由 handoff 以
role/path 传递，`pack` 不复制它们。

## 7. `academic-paper:citation-check`：引文审计

从 S3 开始。用户要求检查文内引文与参考文献。Navigate 确认稿件、`sources.yaml`、引用规范
和检查范围，避免把请求误解为新增文献综述。

Producer 输出 `paper/audits/citation-audit.md`，区分缺失引用、孤立参考文献、标识符冲突、
不支持当前 claim 的引用和无法核验项。它不直接改稿或 Zotero library。

默认是条件性 citation-integrity Gate：轻微格式问题可以 advisory 完成；捏造来源、关键
claim 无支持或系统性错配会阻断。Verify 展示证据，用户确认后 `decide` 写 control。需要
修稿时另启 revision 或直接进行用户授权的普通编辑，不能由 audit 自动覆盖正文。

## 8. `academic-paper:plan`：对话式章节与论证规划

从 S2 开始。用户说：“先和我一起推演章节与核心论证，不写正文。”Navigate 选择 `plan`，
确认读者、贡献、材料和互动预算。

Agent 通过多轮对话组织 chapter plan 与 insight collection。普通头脑风暴留在输出文件；
当用户在“按机制组织”与“按气候区组织”之间作出结构选择时，`decide` 把 structure Decision
写入本实例 control，Agent 更新 `manuscript.yaml`。

```text
paper/planning/chapter-plan.md
paper/planning/insight-collection.md
```

此 mode 通常无 formal Gate，不生成 draft，也不自动启动 `outline-only` 或 `full`。恢复时从
原 checkpoint 继续；提出新结构路线时重新获得用户选择。

## 9. `academic-paper:revision-coach`：先制定修改策略

从 S4 开始。用户暂时不允许改稿，只想整理审稿意见与优先级。Navigate 选择
`revision-coach`，确认 review/comments、稿件路径和期望的 response 风格。

Producer 只读材料，输出 `paper/revisions/round-01-roadmap.md` 与
`response-letter-skeleton.md`。它把每条意见映射到拟处理位置、风险、依赖和候选回应，但不
生成 patch 或修订稿。

普通优先级排序是工作材料；若用户选择“收窄因果 claim”或重构论文，则由 `decide` 记录
策略/structure Decision，并在需要时交给 Propose 创建 project change。此 mode 无 formal
Gate，完成后建议 `revision`，但 child/route 仍须重新确认。

## 10. `academic-paper:disclosure`：AI 使用披露

从 S3 或 S6 开始。用户提供 venue policy，并如实说明本项目中 AI 的实际用途。Navigate 确认
政策版本、稿件、需披露的研究/写作/编辑行为和放置位置。

Producer 输出 `paper/submission/ai-disclosure.md` 与 placement guidance。它只能基于用户确认
的实际使用情况写作，不能从工具日志猜测，也不能淡化 venue 禁止事项。

路线为 low/single-pass，但合规风险为 medium；venue 要求时触发条件性 compliance Gate。
Verify 对照政策与陈述，用户确认后 `decide` 写 control。政策不可访问或实际使用情况未知
时，结果保持 draft/unknown，不生成虚假“完全合规”结论。

## 11. `academic-paper:rebuttal-audit`：回复信覆盖检查

从 S5 开始。用户要求检查回复信是否逐条回答 round 01 意见。Navigate 核对 review/comments、
response 与修订稿，区分仅审计回复信的本 mode 和验证稿件修改的 reviewer `re-review`。

Producer 输出 `paper/revisions/round-01-rebuttal-audit.md`，逐条标记 covered、partial、missing、
contradictory 或 unverifiable，并指向相应稿件位置。它不改回复信或稿件。

默认 advisory；关键意见遗漏时触发条件性 rebuttal-completeness Gate。Verify 组织证据，用户
确认后 `decide` 写 control。修复动作需用户授权的编辑或新的 revision，不得由 audit 自动
应用。

## 12. Academic Paper 分册验收

- 十一个 mode 都维持正文、stable manuscript spec 与运行 control 的职责分离。
- `abstract-only`、`format-convert`、`plan`、`revision-coach` 不制造 formal Gate。
- 条件性 Gate 只在触发条件成立时进入 control；required Gates 必须由用户确认。
- Revision patch 保留 block/hash discipline，但不恢复全局 patch lifecycle。
- Writer 不冒充独立 reviewer，audit/coach 不擅自改稿。
