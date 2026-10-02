
# renderAgentProfileFiles
<!-- node: function:src/adapters/agent-profiles.ts:renderAgentProfileFiles -->

为单个宿主渲染两个角色的全部托管 profile 文件；宿主不支持原生 Agent 时返回空列表。
类型：函数  
复杂度：简单  
入边数：2  
标签：renderer、agent-profile、factory  
所属文件：[src/adapters/agent-profiles.ts](../../../../files/src/adapters/agent-profiles.ts.md)
源码：[src/adapters/agent-profiles.ts:90](../../../../../../src/adapters/agent-profiles.ts#L90)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planToolDelivery](../delivery.ts/planToolDelivery.md) | src/adapters/delivery.ts:24–140 | 为每个选中宿主规划 Navigate Skill 文件、命令包装、共享标记与 custom-agent profile 的写入，并汇总安装记录与诊断。 |
| [resolveAgentTarget](../../../../files/src/adapters/managed-target.ts.md) | src/adapters/managed-target.ts:77–135 | 校验宿主工具与来源类型的组合，按 project-entry、command、shared-skill-target、custom-agent 与 Skill 命名空间分别推导目标。 |

## 调用

该符号没有记录对外调用。
