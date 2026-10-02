
# startGraphRun
<!-- node: function:src/core/runtime/graph-run.ts:startGraphRun -->

启动顶层图谱运行：校验启动命令与确认人，按入口选择节点，写入 run.yaml、冻结 graph.yaml、handoff.md 与 run 目录。
类型：函数  
复杂度：复杂  
入边数：1  
标签：graph-run、runtime、workflow-state、transaction  
所属文件：[src/core/runtime/graph-run.ts](../../../../../files/src/core/runtime/graph-run.ts.md)
源码：[src/core/runtime/graph-run.ts:153](../../../../../../../src/core/runtime/graph-run.ts#L153)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphStart](../../../../../files/src/cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts:411–446 | 处理启动命令：要求人工确认人，调用 startGraphRun 创建冻结运行，支持 dry-run 预演。 |

## 调用

该符号没有记录对外调用。
