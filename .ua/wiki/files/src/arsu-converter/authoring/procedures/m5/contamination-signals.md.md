
# src/arsu-converter/authoring/procedures/m5/contamination-signals.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/m5](../../../../../../modules/src/arsu-converter/authoring/procedures/m5.md)
<!-- node: document:src/arsu-converter/authoring/procedures/m5/contamination-signals.md -->

m5 污染信号检测 Procedure（绑定 validators/contamination-signals.py）。从语料记录与宿主工具取得的解析器观测计算有界污染信号，严格区分启发式、确定性与过程三类信号，并保持启发式、确定性与过程信号互不混淆。
源码：[src/arsu-converter/authoring/procedures/m5/contamination-signals.md](../../../../../../../../src/arsu-converter/authoring/procedures/m5/contamination-signals.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [citation-existence.md](citation-existence.md.md) | src/arsu-converter/authoring/procedures/m5/citation-existence.md | m5 引用存在性核验 Procedure（绑定 validators/citation-verification-gate.py）。接收带各解析器观测的结构化书目记录，离线计算并返回 lookup_verified 的 true / false / unresolvable 三态，其中 false 仅保留给按 ID 匹配失败的情形。 |
| [passport-verifier.md](passport-verifier.md.md) | src/arsu-converter/authoring/procedures/m5/passport-verifier.md | m5 材料护照校验 Procedure（绑定 validators/passport-verifier.py）。校验 material_passport 的 schema、必需字段绑定与获取/审计一致性，来源真实性、引用存在性与上游运行时 schema 全量校验显式保持 not_checked。 |
