
# src/arsu-converter/runtime-policy/catalog.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/runtime-policy](../../../../modules/src/arsu-converter/runtime-policy.md)
<!-- node: file:src/arsu-converter/runtime-policy/catalog.ts -->

ARSU 上游运行时策略目录：把 41 个命中跨模型/模型分级关键词的源文件逐条判定为 adapt 或 retain，并记录 11 处未随包分发的上游运行时引用及其替换文本，同时给出禁止出现的 provider 凭证、endpoint 与 shell 请求模式。
源码：[src/arsu-converter/runtime-policy/catalog.ts](../../../../../../src/arsu-converter/runtime-policy/catalog.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/runtime-policy/catalog.ts:unavailable -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| unavailable | 函数 | 18–28 | 简单 | 策略目录、构造器、边界声明 | 0 | 构造「未随包分发的上游运行时」条目，把来源路径、引用片段、判定理由与替换文本组装为目录记录，并统一附加嵌套提及不构成执行授权的边界声明。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [types.ts](types.ts.md) | src/arsu-converter/runtime-policy/types.ts | 运行时策略层的纯类型定义：目录条目、不可用引用、checker 闭包、改写 span、适配记录与可序列化计划形态，无运行时代码。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-runtime-policy.test.ts](../../../tests/arsu-runtime-policy.test.ts.md) | tests/arsu-runtime-policy.test.ts | 运行时策略测试：对 pinned vendor/ars 构建策略计划，断言 41 个分类条目、5 个 checker 闭包、固定的两处路径改写与 11 处不可用引用替换，并确认与 anchor 替换计划无区间重叠。 |
| [converter.ts](../converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [planner.ts](planner.ts.md) | src/arsu-converter/runtime-policy/planner.ts | 运行时策略计划器：按目录逐条读取上游源文件，把命中段落或整文件改写为 host-native 委托文本，注入 checker 闭包与「不可用上游运行时」替换段落，并校验目录分类完整性、源 commit 与 41/5 数量约束，全部通过后才返回带 SHA-256 证据的改写计划。 |
| [validate.ts](../validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |
