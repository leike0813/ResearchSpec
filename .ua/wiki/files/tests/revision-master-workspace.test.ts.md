
# tests/revision-master-workspace.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/revision-master-workspace.test.ts -->

revision-master 评审工作区与结果的契约测试：验证多对多关系保留、断裂引用被拒、确认必须精确覆盖候选，以及来源变更与页面渲染失败的处理。
源码：[tests/revision-master-workspace.test.ts](../../../../tests/revision-master-workspace.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [review-workspace.ts](../src/review-workspace.ts.md) | src/review-workspace.ts | 交互式审阅工作台子系统的 barrel 入口，向上重导出 v1/v2 工作台、适配器、结果契约与冻结来源投影接口。 |
| [revision-master.ts](helpers/revision-master.ts.md) | tests/helpers/revision-master.ts | revision-master 测试夹具：读取包内 Schema 的建表 DDL，并构造一个覆盖评语、线索、作用域、阻塞与策略卡的工作区样本。 |
