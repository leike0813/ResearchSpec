
# src/arsu-converter/runtime-policy/check.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/runtime-policy](../../../../modules/src/arsu-converter/runtime-policy.md)
<!-- node: file:src/arsu-converter/runtime-policy/check.ts -->

可独立运行的 runtime-policy 自检入口，校验上游 checkout 后构建策略计划并以 JSON 输出分类/适配/保留计数与 checker 闭包数量，失败时打印聚合错误详情。
源码：[src/arsu-converter/runtime-policy/check.ts](../../../../../../src/arsu-converter/runtime-policy/check.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/runtime-policy/check.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 9–33 | 简单 | cli-入口、自检、错误处理 | 0 | 自检入口：解析仓库根、校验上游 checkout、构建运行时策略计划并输出 JSON 摘要，失败时把 message 与 details 逐行写入 stderr 并返回 1。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [config.ts](../config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [planner.ts](planner.ts.md) | src/arsu-converter/runtime-policy/planner.ts | 运行时策略计划器：按目录逐条读取上游源文件，把命中段落或整文件改写为 host-native 委托文本，注入 checker 闭包与「不可用上游运行时」替换段落，并校验目录分类完整性、源 commit 与 41/5 数量约束，全部通过后才返回带 SHA-256 证据的改写计划。 |
| [upstream.ts](../upstream.ts.md) | src/arsu-converter/upstream.ts | 上游 ARSU checkout 的门禁：定位仓库根与 vendor 目录，校验来源路径位于仓库内、是独立 git 仓库、能解析 HEAD、必需 skill group 齐备且工作区干净，否则抛出带具体原因码的 ArsuConverterError。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 9–33 | 自检入口：解析仓库根、校验上游 checkout、构建运行时策略计划并输出 JSON 摘要，失败时把 message 与 details 逐行写入 stderr 并返回 1。 |
