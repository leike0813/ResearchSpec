
# src/arsu-converter/authoring/procedures/m5/citation-existence.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/m5](../../../../../../modules/src/arsu-converter/authoring/procedures/m5.md)
<!-- node: document:src/arsu-converter/authoring/procedures/m5/citation-existence.md -->

m5 引用存在性核验 Procedure（绑定 validators/citation-verification-gate.py）。接收带各解析器观测的结构化书目记录，离线计算并返回 lookup_verified 的 true / false / unresolvable 三态，其中 false 仅保留给按 ID 匹配失败的情形。
源码：[src/arsu-converter/authoring/procedures/m5/citation-existence.md](../../../../../../../../src/arsu-converter/authoring/procedures/m5/citation-existence.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [citation-verification-summary.md](citation-verification-summary.md.md) | src/arsu-converter/authoring/procedures/m5/citation-verification-summary.md | m5 引用核验汇总 Procedure（绑定 validators/citation-verification-summary.py）。在不塌缩解析器细节的前提下聚合核验结论，按裁决与来源给出计数，并单独列出退避重试状态与撤稿等书目完整性信号。 |
