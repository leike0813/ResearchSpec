
# tests/capability-manifest.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/capability-manifest.test.ts -->

manifest 契约测试：覆盖最小 producer 包、缺失输出角色、kebab-case 能力 ID、未知节点类型、重复角色 ID、输入来源策略、script 校验器 runner 契约与网络校验器降级声明。
源码：[tests/capability-manifest.test.ts](../../../../tests/capability-manifest.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-manifest.ts](../src/core/contracts/capability-manifest.ts.md) | src/core/contracts/capability-manifest.ts | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |
