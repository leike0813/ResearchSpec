
# tests/review-workspace-v2.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/review-workspace-v2.test.ts -->

review-workspace.v2 的测试：冻结来源比对、结果快照的锚点校验、三种投影适配器、块解析、宿主 LaTeX/HTML 转换与 handoff 状态判定。
源码：[tests/review-workspace-v2.test.ts](../../../../tests/review-workspace-v2.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [review-workspace.ts](../src/review-workspace.ts.md) | src/review-workspace.ts | 交互式审阅工作台子系统的 barrel 入口，向上重导出 v1/v2 工作台、适配器、结果契约与冻结来源投影接口。 |
