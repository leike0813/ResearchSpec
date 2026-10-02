
# applyGraphWorkspaceProjection
<!-- node: function:src/cli/handlers/graph-bootstrap.ts:applyGraphWorkspaceProjection -->

生成并提交整套工作区投影：校验既有清单、运行交付计划、写 config 与安装清单，冲突或阻塞诊断时整体放弃。
类型：函数  
复杂度：复杂  
入边数：2  
标签：transaction、delivery、planning、bootstrap  
所属文件：[src/cli/handlers/graph-bootstrap.ts](../../../../../files/src/cli/handlers/graph-bootstrap.ts.md)
源码：[src/cli/handlers/graph-bootstrap.ts:37](../../../../../../../src/cli/handlers/graph-bootstrap.ts#L37)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphInit](../../../../../files/src/cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts:100–119 | init 命令处理器：新建 schema 2 工作区并写入初始稳定 spec，或对既有当前工作区转入重配置。 |
| [handleGraphUpdate](../../../../../files/src/cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts:138–151 | update 命令处理器：在既有工作区上按显式选项或当前配置重新投影生成文件。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderToolInstallationManifest](../../../../../files/src/adapters/installations.ts.md) | src/adapters/installations.ts:187–190 | 补齐 schema_version 后校验并序列化为稳定的缩进 JSON 清单文本。 |
| [planWorkspaceDelivery](../../../adapters/workspace-delivery.ts/planWorkspaceDelivery.md) | src/adapters/workspace-delivery.ts:33–163 | 编排 profile、工具交付与对账、遗留清理、文献 Adapter 与插件投影，合并为统一的写入计划与安装清单。 |
| [loadGraphWorkspaceIndex](../../../core/runtime/graph-workspace-index.ts/loadGraphWorkspaceIndex.md) | src/core/runtime/graph-workspace-index.ts:118–197 | 构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。 |
| [executeWritePlan](../../../core/workspace/write-plan.ts/executeWritePlan.md) | src/core/workspace/write-plan.ts:143–227 | 执行整批写入事务：先校验冲突与读前置条件，再写临时文件、备份原文件并原子改名，任一步失败即逆序回滚。 |
