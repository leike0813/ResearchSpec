
# src/arsu-converter/authoring/procedures/m4/temporal-integrity.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/m4](../../../../../../modules/src/arsu-converter/authoring/procedures/m4.md)
<!-- node: document:src/arsu-converter/authoring/procedures/m4/temporal-integrity.md -->

m4 时间完整性审计 Procedure（精简契约文档），从 manuscript_draft 与可选的时间线/引用溯源产出 temporal_audit_report。执行五个确定性检查通道：未来当过去的时间算术、版本被当作证据的时代错置、未落实的比较基准、因果倒置与指示时间炸弹。
源码：[src/arsu-converter/authoring/procedures/m4/temporal-integrity.md](../../../../../../../../src/arsu-converter/authoring/procedures/m4/temporal-integrity.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [format-rendering.md](format-rendering.md.md) | src/arsu-converter/authoring/procedures/m4/format-rendering.md | m4 格式渲染 Procedure（本批次最长文档），从 manuscript_draft 与已确认的交付契约产出 formatted_manuscript。支持 Markdown、LaTeX、DOCX、PDF 与组合输出，涵盖期刊专属排版、格式画像、Cover Letter 生成、AI 披露声明与引用格式转换流水线，并声明 cite-time 溯源硬闸门与终端策略闸门。 |
