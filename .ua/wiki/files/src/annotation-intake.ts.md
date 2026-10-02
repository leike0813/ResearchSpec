
# src/annotation-intake.ts
所属分层：[核心契约与工作流运行时](../../layers/core.md)  
所属目录：[src](../../modules/src.md)
<!-- node: file:src/annotation-intake.ts -->

批注接收（annotation intake）子系统的 barrel 入口，向上重导出 contracts、session、sources、review-copy、review-delta 与 interpretation 全部公开接口。
源码：[src/annotation-intake.ts](../../../../src/annotation-intake.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [manuscript-annotation-intake-adapters.test.ts](../tests/manuscript-annotation-intake-adapters.test.ts.md) | tests/manuscript-annotation-intake-adapters.test.ts | 批注接收主链路的测试：槽位可逆性、从自由文本到候选批注集的完整物化、未决解释必须失败，以及对话捕获的确定性。 |
| [manuscript-annotation.test.ts](../tests/manuscript-annotation.test.ts.md) | tests/manuscript-annotation.test.ts | 修订补丁与批注来源的端到端测试：补丁应用、过期哈希与不完整映射的失败路径、QMD 围栏保持、独立 helper 的原子输出与来源边界校验。 |
| [review-workspace.test.ts](../tests/review-workspace.test.ts.md) | tests/review-workspace.test.ts | v1 工作台与预览夹具的测试：适配器证据保真、结果覆盖全部条目、静态 HTML 的自包含性，以及预览样例确实走真实 v2 适配器。 |
