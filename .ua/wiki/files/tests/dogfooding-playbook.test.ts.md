
# tests/dogfooding-playbook.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/dogfooding-playbook.test.ts -->

维护者 dogfooding playbook 的结构校验测试：断言场景、fixture 变体与 release 映射引用的文件确实存在，并核对工具与路由覆盖。
源码：[tests/dogfooding-playbook.test.ts](../../../../tests/dogfooding-playbook.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../src/procedures/catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [tools.ts](../src/adapters/tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
