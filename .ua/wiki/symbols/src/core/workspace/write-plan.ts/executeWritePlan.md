
# executeWritePlan
<!-- node: function:src/core/workspace/write-plan.ts:executeWritePlan -->

执行整批写入事务：先校验冲突与读前置条件，再写临时文件、备份原文件并原子改名，任一步失败即逆序回滚。
类型：函数  
复杂度：复杂  
入边数：3  
标签：write-plan、transaction、rollback、atomicity  
所属文件：[src/core/workspace/write-plan.ts](../../../../../files/src/core/workspace/write-plan.ts.md)
源码：[src/core/workspace/write-plan.ts:143](../../../../../../../src/core/workspace/write-plan.ts#L143)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [applyGraphWorkspaceProjection](../../../cli/handlers/graph-bootstrap.ts/applyGraphWorkspaceProjection.md) | src/cli/handlers/graph-bootstrap.ts:37–98 | 生成并提交整套工作区投影：校验既有清单、运行交付计划、写 config 与安装清单，冲突或阻塞诊断时整体放弃。 |
| [commitGraphMutation](../../../../../files/src/core/runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts:1302–1361 | 图谱变更的统一提交点：把所属节点或 handoff 与新满足的运行完成状态合并进同一 write plan，并对受影响运行及其子孙建立读前置条件。 |
| [projectWorkspacePlugins](../../../plugins/graph-delivery.ts/projectWorkspacePlugins.md) | src/plugins/graph-delivery.ts:348–369 | 执行插件投影事务并清理因移除而变空的 Skill、capability 与投影目录。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [assertPathWithinRoot](../path-boundary.ts/assertPathWithinRoot.md) | src/core/workspace/path-boundary.ts:4–31 | 校验目标路径位于可信根目录之内，逐级拒绝符号链接与非目录祖先，违规时抛出 EWRITE_CONFLICT。 |
