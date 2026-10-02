
# src/arsu-converter/anchors/replacements/REVIEW-002.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/REVIEW-002.md -->

academic-paper-reviewer 的 REVIEW-002 替换契约：v2 评审者 sprint 契约的实例化规则，须从 handoff 解析冻结契约并深拷贝允许的调用字段，保留面板规模、验收维度、eligible_roles、fatal 与可修复阻断、量化条件、override 阶梯与有限修订，禁止为不合格维度推断分数。
源码：[src/arsu-converter/anchors/replacements/REVIEW-002.md](../../../../../../../src/arsu-converter/anchors/replacements/REVIEW-002.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [REVIEW-009.md](REVIEW-009.md.md) | src/arsu-converter/anchors/replacements/REVIEW-009.md | academic-paper-reviewer 的 REVIEW-009 替换契约：说明 sprint 契约是冻结且可机器检查的验收基线，用物理隔离的 Phase 1 / Phase 2 防止事后合理化标准，并给出准备契约、盲读、lint、可见评审、面板基数校验（不足即 [PANEL-SHRUNK] 中止）等七步流程。 |
