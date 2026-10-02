
# planProjectEntryDelivery
<!-- node: function:src/adapters/project-entry.ts:planProjectEntryDelivery -->

按入口协议规划写入：处理 OpenCode 的 CLAUDE.md 回退、缺少 Navigate 资产、区域缺失/畸形/被改动等多种保留分支。
类型：函数  
复杂度：复杂  
入边数：1  
标签：planning、project-entry、region-protocol、diagnostics  
所属文件：[src/adapters/project-entry.ts](../../../../files/src/adapters/project-entry.ts.md)
源码：[src/adapters/project-entry.ts:24](../../../../../../src/adapters/project-entry.ts#L24)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planToolDelivery](../delivery.ts/planToolDelivery.md) | src/adapters/delivery.ts:24–140 | 为每个选中宿主规划 Navigate Skill 文件、命令包装、共享标记与 custom-agent profile 的写入，并汇总安装记录与诊断。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validateManagedTarget](../managed-target.ts/validateManagedTarget.md) | src/adapters/managed-target.ts:58–62 | 在解析结果之上追加词法与符号链接边界检查，作为任何目标读取前的统一前置。 |
| [entryOwnedBytes](entryOwnedBytes.md) | src/adapters/project-entry.ts:17–22 | 返回该安装记录实际拥有的字节：文件模式为全量，区域模式仅取合法标记区间。 |
| [findRegion](../../../../files/src/adapters/project-entry.ts.md) | src/adapters/project-entry.ts:202–218 | 在字节流中定位自有标记区间，对标记数量、配对、位置、换行与尾随内容做逐条校验后判为 none/valid/malformed。 |
| [renderAgreement](../../../../files/src/adapters/project-entry.ts.md) | src/adapters/project-entry.ts:185–200 | 渲染入口协议正文：说明何时使用 Navigate 入口、状态与 Procedure 发现流程，以及发现不构成任何授权。 |
