
# src/arsu-converter/anchors/replacements/PATCH-002.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/PATCH-002.md -->

academic-paper 的 PATCH-002 替换契约：针对调用方给定的确切手稿字节发补丁，使用稳定 operation_id、块 id、十二位 old_hash 与封闭的 replace_block/insert_after/delete_block 词表；每个已实现批注都要在 annotation_mapping 中出现，非编辑处置须给出理由或后继项。
源码：[src/arsu-converter/anchors/replacements/PATCH-002.md](../../../../../../../src/arsu-converter/anchors/replacements/PATCH-002.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [PATCH-003.md](PATCH-003.md.md) | src/arsu-converter/anchors/replacements/PATCH-003.md | academic-paper 的 PATCH-003 替换契约，标题为“ResearchSpec revision patch protocol”：把修订补丁定义为 ARSU 的输入/输出文件而非框架生命周期记录，给出一次性机械应用的四步流程、前置失败不留半成品、QMD 受保护字节与跨节点文件的 handoff 登记要求。 |
