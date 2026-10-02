
# src/arsu-converter/authoring/procedures/m5/pdf-read-preflight.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/m5](../../../../../../modules/src/arsu-converter/authoring/procedures/m5.md)
<!-- node: document:src/arsu-converter/authoring/procedures/m5/pdf-read-preflight.md -->

m5 PDF 读取前置检查 Procedure（绑定 validators/pdf-read-preflight.py）。用有界解析比较 PDF 声明页数、枚举页数与读取器页数并报告解析警告，不修改 PDF，返回 PASS / FAIL / UNAVAILABLE。
源码：[src/arsu-converter/authoring/procedures/m5/pdf-read-preflight.md](../../../../../../../../src/arsu-converter/authoring/procedures/m5/pdf-read-preflight.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [claim-faithfulness.md](claim-faithfulness.md.md) | src/arsu-converter/authoring/procedures/m5/claim-faithfulness.md | m5 主张忠实度审计 Procedure，从 manuscript_draft、已解析的引用标记、claim_intent_manifests 与 literature_corpus 产出 claim_audit_report。执行六步审计流水线（锚点存在性、参考文献检索、缓存查找、段落定位、判定器调用、缺陷阶段分类），并做清单交叉引用与无引用断言检测。 |
