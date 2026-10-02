
# src/review-workspace/revision-master.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/review-workspace](../../../modules/src/review-workspace.md)
<!-- node: file:src/review-workspace/revision-master.ts -->

revision-master 评审工作区 v1 契约：显式业务表快照、阶段作用域与其基线、文档与定位、反馈结构，以及带严格确认规则的导出结果 Schema。
源码：[src/review-workspace/revision-master.ts](../../../../../src/review-workspace/revision-master.ts)

## 符号（3）
<!-- node: function:src/review-workspace/revision-master.ts:createRevisionMasterResult -->
<!-- node: function:src/review-workspace/revision-master.ts:revisionMasterTargets -->
<!-- node: function:src/review-workspace/revision-master.ts:validateRevisionMasterResult -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| createRevisionMasterResult | 函数 | 240–246 | 简单 | factory、validation、review-workspace | 0 | 创建 revision-master 导出结果骨架，生成结果与草稿 ID，空反馈时给出空集合作为起点，再交由 Schema 校验。 |
| revisionMasterTargets | 函数 | 177–185 | 简单 | utility、review-workspace、projection | 0 | 汇总评语、原始评审线索、线索-评语关系、冻结文档与阶段作用域的可寻址目标 ID 集合。 |
| validateRevisionMasterResult | 函数 | 248–253 | 简单 | validation、security、review-workspace | 0 | 解析导出结果并要求其内嵌工作区与单独保留的快照完全一致，阻断被替换的候选内容。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [v2.ts](v2.ts.md) | src/review-workspace/v2.ts | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [instructions.ts](instructions.ts.md) | src/review-workspace/instructions.ts | 按 profile 或 capability 决定是否提供本地静态评审面：返回描述符/结果契约名、包内页面与 workbench 路径、评审阶段映射和给 Agent 的操作指引。 |
| [revision-master-prepare.ts](revision-master-prepare.ts.md) | src/review-workspace/revision-master-prepare.ts | 准备 revision-master 独立评审工作台：只读执行包内投影命令、冻结源与图片、装配业务快照与定位关系、复核期间无变更后写出 workspace.json 与内嵌数据的 review.html。 |
| [revision-master-runtime.test.ts](../../tests/revision-master-runtime.test.ts.md) | tests/revision-master-runtime.test.ts | revision-master workbench 运行时的端到端测试：在临时目录建 SQLite 工作区，经 uv 共享 Python 环境调用包内工具，校验投影、写入计划、回执与生成的能力包行为。 |
| [revision-master.ts](../../tests/helpers/revision-master.ts.md) | tests/helpers/revision-master.ts | revision-master 测试夹具：读取包内 Schema 的建表 DDL，并构造一个覆盖评语、线索、作用域、阻塞与策略卡的工作区样本。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| createRevisionMasterResult | 函数 | 240–246 | 创建 revision-master 导出结果骨架，生成结果与草稿 ID，空反馈时给出空集合作为起点，再交由 Schema 校验。 |
| revisionMasterTargets | 函数 | 177–185 | 汇总评语、原始评审线索、线索-评语关系、冻结文档与阶段作用域的可寻址目标 ID 集合。 |
| validateRevisionMasterResult | 函数 | 248–253 | 解析导出结果并要求其内嵌工作区与单独保留的快照完全一致，阻断被替换的候选内容。 |
