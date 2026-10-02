
# src/arsu-converter/anchors/replacements/PATCH-003.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/PATCH-003.md -->

academic-paper 的 PATCH-003 替换契约，标题为“ResearchSpec revision patch protocol”：把修订补丁定义为 ARSU 的输入/输出文件而非框架生命周期记录，给出一次性机械应用的四步流程、前置失败不留半成品、QMD 受保护字节与跨节点文件的 handoff 登记要求。
源码：[src/arsu-converter/anchors/replacements/PATCH-003.md](../../../../../../../src/arsu-converter/anchors/replacements/PATCH-003.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [PATCH-004.md](PATCH-004.md.md) | src/arsu-converter/anchors/replacements/PATCH-004.md | academic-pipeline 的 PATCH-004 替换契约：pipeline 修订子节点派发 academic-paper 修订模式时，补丁、修订稿、回复与摘要都是普通文件，私有副本留在子节点 work/ 下；应用脚本是无状态可选工具，每个修订子节点有自己的启动确认与正式 Gate，父节点按 profile 的 join 规则推进。 |
