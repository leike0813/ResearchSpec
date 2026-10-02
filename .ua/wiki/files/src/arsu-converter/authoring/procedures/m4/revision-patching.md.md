
# src/arsu-converter/authoring/procedures/m4/revision-patching.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/m4](../../../../../../modules/src/arsu-converter/authoring/procedures/m4.md)
<!-- node: document:src/arsu-converter/authoring/procedures/m4/revision-patching.md -->

m4 修订补丁应用 Procedure，从结构化 revision_patch 产出 patched_manuscript。要求先校验补丁 schema 与目标稿件哈希，授权只来自 ResearchSpec 变更记录加上 CLI 可见的用户确认，然后用 anchor/apply 确定性工具改块、未匹配块一律 fail closed，并复核未触碰块的字节不变。
源码：[src/arsu-converter/authoring/procedures/m4/revision-patching.md](../../../../../../../../src/arsu-converter/authoring/procedures/m4/revision-patching.md)
