
# src/arsu-converter/idempotence.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/idempotence.ts -->

转换幂等性校验：既检查既有输出是否偏离其自身 manifest，也通过在临时目录重新生成并比较归一化 manifest 来证明重复转换字节一致。
源码：[src/arsu-converter/idempotence.ts](../../../../../src/arsu-converter/idempotence.ts)

## 符号（3）
<!-- node: function:src/arsu-converter/idempotence.ts:checkExistingOutputClean -->
<!-- node: function:src/arsu-converter/idempotence.ts:checkIdempotence -->
<!-- node: function:src/arsu-converter/idempotence.ts:compareOutputHashes -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| checkExistingOutputClean | 函数 | 10–38 | 中等 | validation、drift-detection、idempotency、error-handling | 0 | 读取既有输出的 conversion-manifest.json 并逐文件校验哈希，列出漂移路径；manifest 缺失或损坏时也返回结构化失败而不是抛错，让调用方决定是否 --force。 |
| checkIdempotence | 函数 | 40–65 | 复杂 | validation、idempotency、determinism、drift-detection | 0 | 先校验现有产物，再在系统临时目录以同一 regenerate 回调重新生成一次，比较两侧归一化 manifest 的 JSON 字符串，失败时给出具体漂移文件列表。 |
| compareOutputHashes | 函数 | 67–72 | 简单 | comparison、hashing、drift-detection、diagnostics | 1 | 按输出路径对齐两侧 manifest 的哈希，返回新增、缺失或内容不同的文件路径，作为幂等性失败的具体证据。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [fs-utils.ts](fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [manifest.ts](manifest.ts.md) | src/arsu-converter/manifest.ts | 转换产物的清单与报告层：汇总各 Skill 分组文件、根级投影文件与风险发现，生成 conversion-manifest.json、人类可读的转换报告和逐锚点的替换前后对照报告，并提供用于幂等比较的归一化。 |
| [types.ts](types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
| [validate.ts](validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-converter.test.ts](../../tests/arsu-converter.test.ts.md) | tests/arsu-converter.test.ts | ARSU 转换端到端测试：用临时目录与固定 fixture runtime-policy catalog 构造最小上游，验证转换产物、幂等性、清单归一化、anchor 替换、路由 frontmatter 投影与 paper-humanizer 参考模式迁移。 |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| checkExistingOutputClean | 函数 | 10–38 | 读取既有输出的 conversion-manifest.json 并逐文件校验哈希，列出漂移路径；manifest 缺失或损坏时也返回结构化失败而不是抛错，让调用方决定是否 --force。 |
| checkIdempotence | 函数 | 40–65 | 先校验现有产物，再在系统临时目录以同一 regenerate 回调重新生成一次，比较两侧归一化 manifest 的 JSON 字符串，失败时给出具体漂移文件列表。 |
