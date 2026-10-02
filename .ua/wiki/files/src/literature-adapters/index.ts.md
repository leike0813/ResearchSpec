
# src/literature-adapters/index.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/literature-adapters](../../../modules/src/literature-adapters.md)
<!-- node: file:src/literature-adapters/index.ts -->

文献适配器子系统的 barrel 入口，re-export catalog、assets、contracts、delivery、platform、provider-contracts 与 provider-policy 七个模块。
源码：[src/literature-adapters/index.ts](../../../../../src/literature-adapters/index.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-bootstrap.ts](../cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [literature-adapters.test.ts](../../tests/literature-adapters.test.ts.md) | tests/literature-adapters.test.ts | 验证 Zotero 目录的发布集与运行组件绑定、适配器表达式与平台规范化的精确行为，以及未选适配器零交付、选定运行时的降级投影策略。 |
| [literature-provider-contracts.test.ts](../../tests/literature-provider-contracts.test.ts.md) | tests/literature-provider-contracts.test.ts | 锁定文献来源策略的四模式 SSOT、provider 就绪状态作为调用事实、handoff 对上游字节的引用方式，以及受管授权在每个权限边界的逐级回退。 |
| [workspace-delivery.ts](../adapters/workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |
