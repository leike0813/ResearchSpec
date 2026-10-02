
# src/arsu-converter/authoring/procedures/paper-humanizer
> 目录聚合页：4 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/authoring/procedures/paper-humanizer/reference.md](../../../../../files/src/arsu-converter/authoring/procedures/paper-humanizer/reference.md.md) | 文档 | 0 | 论文去 AI 化能力包的「参考模式」写作辅助指令：先声明 7 条不可协商不变量，再按 39 条编号模式（内容、语法、风格、沟通、填充措辞、语义重复六大类）给出识别信号与最小安全改写建议，并列出需保护的假阳性与受保护内容边界（引用、标识符、代码、公式、LaTeX/Quarto 语法）。 |
| [src/arsu-converter/authoring/procedures/paper-humanizer/review.md](../../../../../files/src/arsu-converter/authoring/procedures/paper-humanizer/review.md.md) | 文档 | 0 | 论文去 AI 化的只读评审流程：从边界手稿构建 document artifact 与覆盖率台账，输出句长画像，再按 A–F 六轮（信息与主张、词汇句法、组织格式、节奏修辞、假阳性挑战、完整性对账）穷尽扫描，最终产出 `humanization_review_report` 与保守的 `humanization_revision_plan` 两份输出，绝不修改源文件。 |
| [src/arsu-converter/authoring/procedures/paper-humanizer/revision.md](../../../../../files/src/arsu-converter/authoring/procedures/paper-humanizer/revision.md.md) | 文档 | 0 | 论文去 AI 化的修订执行节点：接收已批准的修订计划，只对 document artifact 中 `kind: prose` 段的 `text` 字段做最小编辑，随后依次执行 analyze、validate、render 三步确定性流水线，并双向比对源与候选的信息单元。 |
| [src/arsu-converter/authoring/procedures/paper-humanizer/verification.md](../../../../../files/src/arsu-converter/authoring/procedures/paper-humanizer/verification.md.md) | 文档 | 0 | 论文去 AI 化的验证节点：在人工接受之前核对候选与原文，先做确定性校验（哈希、清单、受保护段逐字节比对、段序不变），再做双向信息单元台账与计划符合性检查，最终只输出证据报告并给出 pass / pass_with_residuals / failed 结论，接受与拒绝由 graph 的 Decision 决定。 |
