
# src/arsu-converter/anchors/replacements/STATE-001.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/STATE-001.md -->

academic-paper 的 STATE-001 替换契约：只能从选定 run 的冻结图、节点状态与 handoff 恢复，用 status 与定向 instructions 推导当前前沿，一切生命周期、Gate、Decision 与转换变更都由 CLI 执行，外部文件可作输入但不能替代控制权威。
源码：[src/arsu-converter/anchors/replacements/STATE-001.md](../../../../../../../src/arsu-converter/anchors/replacements/STATE-001.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [STATE-002.md](STATE-002.md.md) | src/arsu-converter/anchors/replacements/STATE-002.md | academic-pipeline 的 STATE-002 替换契约：禁止使用上游 resume token 或状态载体，从既有材料进入时须请求 academic-pipeline:mid-entry 指令、识别真实外部前置角色与路径、给出路线摘要并取得新的实例级确认，由 CLI 创建新的归属控制。 |
