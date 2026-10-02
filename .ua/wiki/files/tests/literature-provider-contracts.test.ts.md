
# tests/literature-provider-contracts.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/literature-provider-contracts.test.ts -->

锁定文献来源策略的四模式 SSOT、provider 就绪状态作为调用事实、handoff 对上游字节的引用方式，以及受管授权在每个权限边界的逐级回退。
源码：[tests/literature-provider-contracts.test.ts](../../../../tests/literature-provider-contracts.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.ts](../src/literature-adapters/index.ts.md) | src/literature-adapters/index.ts | 文献适配器子系统的 barrel 入口，re-export catalog、assets、contracts、delivery、platform、provider-contracts 与 provider-policy 七个模块。 |
