
# classifyPath
<!-- node: function:src/arsu-converter/classify.ts:classifyPath -->

按优先级依次判定 Skill 分组入口与运行时目录、共享目录、历史追踪文件、宿主适配器目录、开发资源与文档，最后对无法归类的路径标记 needs_review 而非静默丢弃。
类型：函数  
复杂度：复杂  
入边数：1  
标签：classification、policy、converter、routing  
所属文件：[src/arsu-converter/classify.ts](../../../../files/src/arsu-converter/classify.ts.md)
源码：[src/arsu-converter/classify.ts:35](../../../../../../src/arsu-converter/classify.ts#L35)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [buildInventory](../../../../files/src/arsu-converter/ingest.ts.md) | src/arsu-converter/ingest.ts:17–69 | 构建完整 Inventory：以传入的受版本控制文件列表或全量扫描结果为输入，按分类结果填充各 Skill 分组的桶与共享/排除/待复核记录，并对所有集合排序保证输出确定。 |

## 调用

该符号没有记录对外调用。
