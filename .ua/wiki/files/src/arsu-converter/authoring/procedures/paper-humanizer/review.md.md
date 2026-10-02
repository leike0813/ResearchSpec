
# src/arsu-converter/authoring/procedures/paper-humanizer/review.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/paper-humanizer](../../../../../../modules/src/arsu-converter/authoring/procedures/paper-humanizer.md)
<!-- node: document:src/arsu-converter/authoring/procedures/paper-humanizer/review.md -->

论文去 AI 化的只读评审流程：从边界手稿构建 document artifact 与覆盖率台账，输出句长画像，再按 A–F 六轮（信息与主张、词汇句法、组织格式、节奏修辞、假阳性挑战、完整性对账）穷尽扫描，最终产出 `humanization_review_report` 与保守的 `humanization_revision_plan` 两份输出，绝不修改源文件。
源码：[src/arsu-converter/authoring/procedures/paper-humanizer/review.md](../../../../../../../../src/arsu-converter/authoring/procedures/paper-humanizer/review.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [reference.md](reference.md.md) | src/arsu-converter/authoring/procedures/paper-humanizer/reference.md | 论文去 AI 化能力包的「参考模式」写作辅助指令：先声明 7 条不可协商不变量，再按 39 条编号模式（内容、语法、风格、沟通、填充措辞、语义重复六大类）给出识别信号与最小安全改写建议，并列出需保护的假阳性与受保护内容边界（引用、标识符、代码、公式、LaTeX/Quarto 语法）。 |
| [revision.md](revision.md.md) | src/arsu-converter/authoring/procedures/paper-humanizer/revision.md | 论文去 AI 化的修订执行节点：接收已批准的修订计划，只对 document artifact 中 `kind: prose` 段的 `text` 字段做最小编辑，随后依次执行 analyze、validate、render 三步确定性流水线，并双向比对源与候选的信息单元。 |
