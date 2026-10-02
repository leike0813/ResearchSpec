
# src/arsu-converter/runtime-policy
> 目录聚合页：4 个文件、11 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/runtime-policy/catalog.ts](../../../files/src/arsu-converter/runtime-policy/catalog.ts.md) | 文件 | 1 | ARSU 上游运行时策略目录：把 41 个命中跨模型/模型分级关键词的源文件逐条判定为 adapt 或 retain，并记录 11 处未随包分发的上游运行时引用及其替换文本，同时给出禁止出现的 provider 凭证、endpoint 与 shell 请求模式。 |
| [src/arsu-converter/runtime-policy/check.ts](../../../files/src/arsu-converter/runtime-policy/check.ts.md) | 文件 | 1 | 可独立运行的 runtime-policy 自检入口，校验上游 checkout 后构建策略计划并以 JSON 输出分类/适配/保留计数与 checker 闭包数量，失败时打印聚合错误详情。 |
| [src/arsu-converter/runtime-policy/planner.ts](../../../files/src/arsu-converter/runtime-policy/planner.ts.md) | 文件 | 9 | 运行时策略计划器：按目录逐条读取上游源文件，把命中段落或整文件改写为 host-native 委托文本，注入 checker 闭包与「不可用上游运行时」替换段落，并校验目录分类完整性、源 commit 与 41/5 数量约束，全部通过后才返回带 SHA-256 证据的改写计划。 |
| [src/arsu-converter/runtime-policy/types.ts](../../../files/src/arsu-converter/runtime-policy/types.ts.md) | 文件 | 0 | 运行时策略层的纯类型定义：目录条目、不可用引用、checker 闭包、改写 span、适配记录与可序列化计划形态，无运行时代码。 |

## 子目录
- [assets](runtime-policy/assets.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/arsu-converter](../arsu-converter.md) | 4 |
