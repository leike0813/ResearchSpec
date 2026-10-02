
# src/arsu-converter/anchors/replacements/REVIEW-016.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/REVIEW-016.md -->

shared 的 REVIEW-016 替换契约，标题为“ResearchSpec Current Owner: Deterministic Panel Check”：规定评审面板必须先用 Python 3.11+ 与 jsonschema>=4.17（用户自备，不得安装）跑 check_sprint_contract / check_phase_conformance / check_panel_synthesis 等校验器，非零退出即候选失败，且校验通过只证明机械自洽，不等于 ResearchSpec Gate。
源码：[src/arsu-converter/anchors/replacements/REVIEW-016.md](../../../../../../../src/arsu-converter/anchors/replacements/REVIEW-016.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
