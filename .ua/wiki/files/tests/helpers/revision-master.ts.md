
# tests/helpers/revision-master.ts
所属分层：[测试与验收夹具层](../../../layers/tests.md)  
所属目录：[tests/helpers](../../../modules/tests/helpers.md)
<!-- node: file:tests/helpers/revision-master.ts -->

revision-master 测试夹具：读取包内 Schema 的建表 DDL，并构造一个覆盖评语、线索、作用域、阻塞与策略卡的工作区样本。
源码：[tests/helpers/revision-master.ts](../../../../../tests/helpers/revision-master.ts)

## 符号（2）
<!-- node: function:tests/helpers/revision-master.ts:revisionMasterFixture -->
<!-- node: function:tests/helpers/revision-master.ts:revisionMasterSchemaSql -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| revisionMasterFixture | 函数 | 13–47 | 中等 | test-helper、fixture、factory | 0 | 构造通过 Schema 的最小工作区：两条原子评语、多对多线索关系、被阻塞与已就绪两种状态、五种作用域与一处 Markdown 块定位。 |
| revisionMasterSchemaSql | 函数 | 8–11 | 简单 | test-helper、fixture、database | 0 | 读取 authoring 侧的 revision-master-schema.yaml 并返回全部建表语句，用于在临时目录中直接建库。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [render.ts](../../src/review-workspace/render.ts.md) | src/review-workspace/render.ts | 把 Markdown 源与 Pandoc JSON AST 转换为统一的评审块序列，处理行内标记、行内公式、引用、脚注、表格与图片资源映射，并在解析失败时保留可见的原始回退。 |
| [revision-master.ts](../../src/review-workspace/revision-master.ts.md) | src/review-workspace/revision-master.ts | revision-master 评审工作区 v1 契约：显式业务表快照、阶段作用域与其基线、文档与定位、反馈结构，以及带严格确认规则的导出结果 Schema。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [revision-master-runtime.test.ts](../revision-master-runtime.test.ts.md) | tests/revision-master-runtime.test.ts | revision-master workbench 运行时的端到端测试：在临时目录建 SQLite 工作区，经 uv 共享 Python 环境调用包内工具，校验投影、写入计划、回执与生成的能力包行为。 |
| [revision-master-workspace.test.ts](../revision-master-workspace.test.ts.md) | tests/revision-master-workspace.test.ts | revision-master 评审工作区与结果的契约测试：验证多对多关系保留、断裂引用被拒、确认必须精确覆盖候选，以及来源变更与页面渲染失败的处理。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| revisionMasterFixture | 函数 | 13–47 | 构造通过 Schema 的最小工作区：两条原子评语、多对多线索关系、被阻塞与已就绪两种状态、五种作用域与一处 Markdown 块定位。 |
| revisionMasterSchemaSql | 函数 | 8–11 | 读取 authoring 侧的 revision-master-schema.yaml 并返回全部建表语句，用于在临时目录中直接建库。 |
