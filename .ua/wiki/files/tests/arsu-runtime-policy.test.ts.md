
# tests/arsu-runtime-policy.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/arsu-runtime-policy.test.ts -->

运行时策略测试：对 pinned vendor/ars 构建策略计划，断言 41 个分类条目、5 个 checker 闭包、固定的两处路径改写与 11 处不可用引用替换，并确认与 anchor 替换计划无区间重叠。
源码：[tests/arsu-runtime-policy.test.ts](../../../../tests/arsu-runtime-policy.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../src/arsu-converter/runtime-policy/catalog.ts.md) | src/arsu-converter/runtime-policy/catalog.ts | ARSU 上游运行时策略目录：把 41 个命中跨模型/模型分级关键词的源文件逐条判定为 adapt 或 retain，并记录 11 处未随包分发的上游运行时引用及其替换文本，同时给出禁止出现的 provider 凭证、endpoint 与 shell 请求模式。 |
| [match.ts](../src/arsu-converter/anchors/match.ts.md) | src/arsu-converter/anchors/match.ts | 契约锚点匹配与替换计划的核心：先校验全部替换正文再逐锚点定位真实区间，检测同源文件内的区间重叠，产出带 before/after 指纹的 AnchorReplacementPlan，任何阻塞失败都在写入生成产物之前抛错。 |
| [planner.ts](../src/arsu-converter/runtime-policy/planner.ts.md) | src/arsu-converter/runtime-policy/planner.ts | 运行时策略计划器：按目录逐条读取上游源文件，把命中段落或整文件改写为 host-native 委托文本，注入 checker 闭包与「不可用上游运行时」替换段落，并校验目录分类完整性、源 commit 与 41/5 数量约束，全部通过后才返回带 SHA-256 证据的改写计划。 |
| [source-rewrite.ts](../src/arsu-converter/source-rewrite.ts.md) | src/arsu-converter/source-rewrite.ts | 跨改写目录的重叠校验器：合并 anchor 替换计划与运行时策略计划的 span，检测非法区间与跨目录区间重叠，保证两套改写可以在同一源文件上安全组合。 |
| [types.ts](../src/arsu-converter/types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
