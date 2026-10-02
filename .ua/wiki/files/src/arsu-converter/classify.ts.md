
# src/arsu-converter/classify.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/classify.ts -->

上游文件路径分类器：把 vendor/ars 中的每个文件判定为运行时核心、共享资源、应排除或需人工复核，并给出可读理由与所属 Skill 分组，作为转换清单的分类单一事实源。
源码：[src/arsu-converter/classify.ts](../../../../../src/arsu-converter/classify.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/classify.ts:classifyPath -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [classifyPath](../../../symbols/src/arsu-converter/classify.ts/classifyPath.md) | 函数 | 35–82 | 复杂 | classification、policy、converter、routing | 1 | 按优先级依次判定 Skill 分组入口与运行时目录、共享目录、历史追踪文件、宿主适配器目录、开发资源与文档，最后对无法归类的路径标记 needs_review 而非静默丢弃。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [config.ts](config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [ingest.ts](ingest.ts.md) | src/arsu-converter/ingest.ts | 上游文件清单化入口：只把存在 SKILL.md 的分组登记为 Skill 分组，随后用 classifyPath 把全部源路径分流进运行时目录、共享、排除与待复核四个集合并统一排序。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [classifyPath](../../../symbols/src/arsu-converter/classify.ts/classifyPath.md) | 函数 | 35–82 | 按优先级依次判定 Skill 分组入口与运行时目录、共享目录、历史追踪文件、宿主适配器目录、开发资源与文档，最后对无法归类的路径标记 needs_review 而非静默丢弃。 |
