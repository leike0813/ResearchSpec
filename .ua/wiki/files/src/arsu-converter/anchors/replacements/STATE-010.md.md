
# src/arsu-converter/anchors/replacements/STATE-010.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/STATE-010.md -->

academic-pipeline 运行证据的 STATE-010 替换契约：上游 run ledger 与其确定性重放不随包分发，须用 status --json 与精确选择器的 instructions 恢复工作流状态；会话摘要或委派报告不能确立用户同意、通过的检查或已完成的交付物，缺失证据须显式标为 not_checked。
源码：[src/arsu-converter/anchors/replacements/STATE-010.md](../../../../../../../src/arsu-converter/anchors/replacements/STATE-010.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [STATE-011.md](STATE-011.md.md) | src/arsu-converter/anchors/replacements/STATE-011.md | academic-pipeline 检查点步骤的 STATE-011 替换契约：用 status --json 与归属选择器的 instructions 读取当前状态，呈报实际交付物与检查发现；每个正式 Gate 结论与 Decision 都要经各自的人工确认后走指定 CLI 变更，只有归属记录才能关闭控制，咨询性观察输出不能成为阻断标准。 |
