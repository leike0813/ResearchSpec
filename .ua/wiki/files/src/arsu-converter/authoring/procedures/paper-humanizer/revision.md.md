
# src/arsu-converter/authoring/procedures/paper-humanizer/revision.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/paper-humanizer](../../../../../../modules/src/arsu-converter/authoring/procedures/paper-humanizer.md)
<!-- node: document:src/arsu-converter/authoring/procedures/paper-humanizer/revision.md -->

论文去 AI 化的修订执行节点：接收已批准的修订计划，只对 document artifact 中 `kind: prose` 段的 `text` 字段做最小编辑，随后依次执行 analyze、validate、render 三步确定性流水线，并双向比对源与候选的信息单元。
源码：[src/arsu-converter/authoring/procedures/paper-humanizer/revision.md](../../../../../../../../src/arsu-converter/authoring/procedures/paper-humanizer/revision.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [verification.md](verification.md.md) | src/arsu-converter/authoring/procedures/paper-humanizer/verification.md | 论文去 AI 化的验证节点：在人工接受之前核对候选与原文，先做确定性校验（哈希、清单、受保护段逐字节比对、段序不变），再做双向信息单元台账与计划符合性检查，最终只输出证据报告并给出 pass / pass_with_residuals / failed 结论，接受与拒绝由 graph 的 Decision 决定。 |
