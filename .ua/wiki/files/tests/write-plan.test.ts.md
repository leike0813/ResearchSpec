
# tests/write-plan.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/write-plan.test.ts -->

验证 write-plan 的核心不变量：计划后目标被改动即拒绝、用户所有权文件受保护、漂移跳过、符号链接与文件模式处理，以及执行失败后的回滚一致性。
源码：[tests/write-plan.test.ts](../../../../tests/write-plan.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](helpers/cli.ts.md) | tests/helpers/cli.ts | CLI 测试夹具：用 spawnSync 运行编译产物、解析 envelope 响应，并创建与清理临时项目目录。 |
| [write-plan.ts](../src/core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |
