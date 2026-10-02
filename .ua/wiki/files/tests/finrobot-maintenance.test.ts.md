
# tests/finrobot-maintenance.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/finrobot-maintenance.test.ts -->

断言 FinRobot 目录映射六个 financial-research extension（4 mixed / 2 llm）、raw Skill 名称集合固定且 brief 字段不少于五项。
源码：[tests/finrobot-maintenance.test.ts](../../../../tests/finrobot-maintenance.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [vendor-maintenance.ts](helpers/vendor-maintenance.ts.md) | tests/helpers/vendor-maintenance.ts | 厂商锚点测试的共享断言：校验 manifest 的锚点身份、上游 revision 与文件数、raw Skill 与 capability/profile 计数、领域分布与工具文件一致性，维护文件哈希匹配，并实际执行对应厂商的 check 命令。 |
