
# listFiles
<!-- node: function:src/arsu-converter/fs-utils.ts:listFiles -->

递归遍历目录收集全部文件路径，跳过 .git 并统一为 POSIX 分隔符后排序返回，是上游清单与清单化扫描的共同基础。
类型：函数  
复杂度：中等  
入边数：2  
标签：filesystem、recursion、utility、traversal  
所属文件：[src/arsu-converter/fs-utils.ts](../../../../files/src/arsu-converter/fs-utils.ts.md)
源码：[src/arsu-converter/fs-utils.ts:27](../../../../../../src/arsu-converter/fs-utils.ts#L27)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [buildInventory](../../../../files/src/arsu-converter/ingest.ts.md) | src/arsu-converter/ingest.ts:17–69 | 构建完整 Inventory：以传入的受版本控制文件列表或全量扫描结果为输入，按分类结果填充各 Skill 分组的桶与共享/排除/待复核记录，并对所有集合排序保证输出确定。 |
| [buildRuntimePolicyPlan](../../../../files/src/arsu-converter/runtime-policy/planner.ts.md) | src/arsu-converter/runtime-policy/planner.ts:27–132 | 构建完整运行时策略计划：先核对源 commit、条目去重与 41/5 数量约束，再以关键词正则双向比对目录分类与实际命中文件，按 adapt 策略生成段落级或整文件改写 span，并补充 checker 闭包与不可用引用改写，任一错误即在触碰生成产物前整体抛错。 |

## 调用

该符号没有记录对外调用。
