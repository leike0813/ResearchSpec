
# tests/vendor-staging.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/vendor-staging.test.ts -->

共享暂存协议测试：遍历全部六个生产 vendor，断言提交目标 vendor 投影不会改动其他 vendor 的任何文件哈希。
源码：[tests/vendor-staging.test.ts](../../../../tests/vendor-staging.test.ts)

## 符号（1）
<!-- node: function:tests/vendor-staging.test.ts:vendorOwnedHashes -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| vendorOwnedHashes | 函数 | 34–44 | 简单 | test-helper、hashing、isolation | 0 | 收集指定 vendor 拥有的 Skill 树、bundle、manifest 与转换报告的 SHA-256 映射，用于比较提交前后的差异。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [production-vendors.ts](../src/vendor-converters/shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [staging.ts](../src/vendor-converters/shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../src/core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |
