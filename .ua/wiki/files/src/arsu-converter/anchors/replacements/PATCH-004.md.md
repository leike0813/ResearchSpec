
# src/arsu-converter/anchors/replacements/PATCH-004.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/PATCH-004.md -->

academic-pipeline 的 PATCH-004 替换契约：pipeline 修订子节点派发 academic-paper 修订模式时，补丁、修订稿、回复与摘要都是普通文件，私有副本留在子节点 work/ 下；应用脚本是无状态可选工具，每个修订子节点有自己的启动确认与正式 Gate，父节点按 profile 的 join 规则推进。
源码：[src/arsu-converter/anchors/replacements/PATCH-004.md](../../../../../../../src/arsu-converter/anchors/replacements/PATCH-004.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [PATCH-001.md](PATCH-001.md.md) | src/arsu-converter/anchors/replacements/PATCH-001.md | academic-paper 的 PATCH-001 替换契约：修订模式下写手可改用有界修订补丁，revision_patch.schema.json 是唯一手稿补丁 schema，保留稳定操作 id、块 id 与 old_hash 前置条件；QMD 须按 Markdown 兼容文本处理且不得在修订中改扩展名。 |
