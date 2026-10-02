
# src/arsu-converter/source-rewrite.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/source-rewrite.ts -->

跨改写目录的重叠校验器：合并 anchor 替换计划与运行时策略计划的 span，检测非法区间与跨目录区间重叠，保证两套改写可以在同一源文件上安全组合。
源码：[src/arsu-converter/source-rewrite.ts](../../../../../src/arsu-converter/source-rewrite.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/source-rewrite.ts:validateCombinedRewritePlan -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| validateCombinedRewritePlan | 函数 | 4–20 | 简单 | 校验、冲突检测、改写计划 | 0 | 合并 anchor 与运行时策略两套 span 后按起点排序，检查区间是否非法以及是否存在跨目录重叠，返回排序后的错误列表。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [types.ts](anchors/types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |
| [types.ts](runtime-policy/types.ts.md) | src/arsu-converter/runtime-policy/types.ts | 运行时策略层的纯类型定义：目录条目、不可用引用、checker 闭包、改写 span、适配记录与可序列化计划形态，无运行时代码。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-runtime-policy.test.ts](../../tests/arsu-runtime-policy.test.ts.md) | tests/arsu-runtime-policy.test.ts | 运行时策略测试：对 pinned vendor/ars 构建策略计划，断言 41 个分类条目、5 个 checker 闭包、固定的两处路径改写与 11 处不可用引用替换，并确认与 anchor 替换计划无区间重叠。 |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| validateCombinedRewritePlan | 函数 | 4–20 | 合并 anchor 与运行时策略两套 span 后按起点排序，检查区间是否非法以及是否存在跨目录重叠，返回排序后的错误列表。 |
