
# src/arsu-converter/authoring/procedures/m4/revision-roadmap-parsing.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/m4](../../../../../../modules/src/arsu-converter/authoring/procedures/m4.md)
<!-- node: document:src/arsu-converter/authoring/procedures/m4/revision-roadmap-parsing.md -->

m4 修订路线图解析 Procedure，从原始审稿意见及可选的稿件与编辑决定信产出保持来源顺序的 revision_roadmap。经输入收集、意见解析、分类、承诺提取、章节映射与非排名化路线图字段生成六步，另设 Rebuttal-Audit 分支。
源码：[src/arsu-converter/authoring/procedures/m4/revision-roadmap-parsing.md](../../../../../../../../src/arsu-converter/authoring/procedures/m4/revision-roadmap-parsing.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [revision-patching.md](revision-patching.md.md) | src/arsu-converter/authoring/procedures/m4/revision-patching.md | m4 修订补丁应用 Procedure，从结构化 revision_patch 产出 patched_manuscript。要求先校验补丁 schema 与目标稿件哈希，授权只来自 ResearchSpec 变更记录加上 CLI 可见的用户确认，然后用 anchor/apply 确定性工具改块、未匹配块一律 fail closed，并复核未触碰块的字节不变。 |
