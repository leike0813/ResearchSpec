
# tests/literature-adapters.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/literature-adapters.test.ts -->

验证 Zotero 目录的发布集与运行组件绑定、适配器表达式与平台规范化的精确行为，以及未选适配器零交付、选定运行时的降级投影策略。
源码：[tests/literature-adapters.test.ts](../../../../tests/literature-adapters.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](helpers/cli.ts.md) | tests/helpers/cli.ts | CLI 测试夹具：用 spawnSync 运行编译产物、解析 envelope 响应，并创建与清理临时项目目录。 |
| [index.ts](../src/literature-adapters/index.ts.md) | src/literature-adapters/index.ts | 文献适配器子系统的 barrel 入口，re-export catalog、assets、contracts、delivery、platform、provider-contracts 与 provider-policy 七个模块。 |
| [workspace-delivery.ts](../src/adapters/workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |
| [write-plan.ts](../src/core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |
