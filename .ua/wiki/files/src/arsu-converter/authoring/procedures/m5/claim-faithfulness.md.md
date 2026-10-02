
# src/arsu-converter/authoring/procedures/m5/claim-faithfulness.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/m5](../../../../../../modules/src/arsu-converter/authoring/procedures/m5.md)
<!-- node: document:src/arsu-converter/authoring/procedures/m5/claim-faithfulness.md -->

m5 主张忠实度审计 Procedure，从 manuscript_draft、已解析的引用标记、claim_intent_manifests 与 literature_corpus 产出 claim_audit_report。执行六步审计流水线（锚点存在性、参考文献检索、缓存查找、段落定位、判定器调用、缺陷阶段分类），并做清单交叉引用与无引用断言检测。
源码：[src/arsu-converter/authoring/procedures/m5/claim-faithfulness.md](../../../../../../../../src/arsu-converter/authoring/procedures/m5/claim-faithfulness.md)
