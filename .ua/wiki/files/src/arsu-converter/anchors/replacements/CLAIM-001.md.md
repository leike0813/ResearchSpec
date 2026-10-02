
# src/arsu-converter/anchors/replacements/CLAIM-001.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/CLAIM-001.md -->

academic-paper 的 CLAIM-001 替换契约：动笔前先读 claims.yaml 的已接受主张，再输出唯一一份不可变 claim_intent_manifest 记录拟写主张与作者声明的“禁止”规则；新主张或更强措辞只能走 change.md，审计 Agent 依据 handoff 指向的预承诺做三集合差分。
源码：[src/arsu-converter/anchors/replacements/CLAIM-001.md](../../../../../../../src/arsu-converter/anchors/replacements/CLAIM-001.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [CLAIM-002.md](CLAIM-002.md.md) | src/arsu-converter/anchors/replacements/CLAIM-002.md | deep-research 的 CLAIM-002 替换契约：报告编译前从稳定主张契约生成 claim_intent_manifest，覆盖实质主张与全部否定约束；编译引入新主张或改变主张强度时并行提出 change.md，而不是就地改写稳定契约。 |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
