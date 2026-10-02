
# src/arsu-converter/authoring/procedures/m4/format-rendering.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/m4](../../../../../../modules/src/arsu-converter/authoring/procedures/m4.md)
<!-- node: document:src/arsu-converter/authoring/procedures/m4/format-rendering.md -->

m4 格式渲染 Procedure（本批次最长文档），从 manuscript_draft 与已确认的交付契约产出 formatted_manuscript。支持 Markdown、LaTeX、DOCX、PDF 与组合输出，涵盖期刊专属排版、格式画像、Cover Letter 生成、AI 披露声明与引用格式转换流水线，并声明 cite-time 溯源硬闸门与终端策略闸门。
源码：[src/arsu-converter/authoring/procedures/m4/format-rendering.md](../../../../../../../../src/arsu-converter/authoring/procedures/m4/format-rendering.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [terminal-policy-gate.md](terminal-policy-gate.md.md) | src/arsu-converter/authoring/procedures/m4/terminal-policy-gate.md | m4 提交包终端策略闸门 Procedure，从已生成的提交包与当前 material-passport 策略产出 terminal_policy_report。策略读取单宿（ResearchSpec 独占），只按 stdout 前缀令牌判定，绝不看退出码；复用报告前必须过新鲜度闸门，每个终态都重新计算、不缓存结论。 |
