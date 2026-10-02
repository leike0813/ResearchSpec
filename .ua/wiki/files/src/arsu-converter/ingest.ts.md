
# src/arsu-converter/ingest.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/ingest.ts -->

上游文件清单化入口：只把存在 SKILL.md 的分组登记为 Skill 分组，随后用 classifyPath 把全部源路径分流进运行时目录、共享、排除与待复核四个集合并统一排序。
源码：[src/arsu-converter/ingest.ts](../../../../../src/arsu-converter/ingest.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/ingest.ts:buildInventory -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| buildInventory | 函数 | 17–69 | 复杂 | inventory、classification、converter、determinism | 0 | 构建完整 Inventory：以传入的受版本控制文件列表或全量扫描结果为输入，按分类结果填充各 Skill 分组的桶与共享/排除/待复核记录，并对所有集合排序保证输出确定。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [classify.ts](classify.ts.md) | src/arsu-converter/classify.ts | 上游文件路径分类器：把 vendor/ars 中的每个文件判定为运行时核心、共享资源、应排除或需人工复核，并给出可读理由与所属 Skill 分组，作为转换清单的分类单一事实源。 |
| [config.ts](config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [fs-utils.ts](fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [types.ts](types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| buildInventory | 函数 | 17–69 | 构建完整 Inventory：以传入的受版本控制文件列表或全量扫描结果为输入，按分类结果填充各 Skill 分组的桶与共享/排除/待复核记录，并对所有集合排序保证输出确定。 |
