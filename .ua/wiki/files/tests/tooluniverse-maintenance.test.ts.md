
# tests/tooluniverse-maintenance.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/tooluniverse-maintenance.test.ts -->

断言 ToolUniverse 目录把 130 个 reviewed Skills 一对一映射为 extension，42 个 mixed、88 个 llm，且全部使用统一六项 brief 字段。
源码：[tests/tooluniverse-maintenance.test.ts](../../../../tests/tooluniverse-maintenance.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [vendor-maintenance.ts](helpers/vendor-maintenance.ts.md) | tests/helpers/vendor-maintenance.ts | 厂商锚点测试的共享断言：校验 manifest 的锚点身份、上游 revision 与文件数、raw Skill 与 capability/profile 计数、领域分布与工具文件一致性，维护文件哈希匹配，并实际执行对应厂商的 check 命令。 |
