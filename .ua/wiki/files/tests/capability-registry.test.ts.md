
# tests/capability-registry.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/capability-registry.test.ts -->

能力注册表测试：验证全部内置能力包可加载且为 operational 目录名，并覆盖 ID/路径不匹配、重复 ID、manifest 与 knowledge 哈希不符、未知 schema 引用、ARS 溯源缺失及图谱输入准入诊断。
源码：[tests/capability-registry.test.ts](../../../../tests/capability-registry.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../src/core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [registry.ts](../src/capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
