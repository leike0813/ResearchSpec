
# tests/materials-science-maintenance.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/materials-science-maintenance.test.ts -->

断言 Materials Science 目录映射七个 curated Skills 均为 llm 类型、raw Skill 命名集合固定，并校验 snapshot-fafd3ab 锚点。
源码：[tests/materials-science-maintenance.test.ts](../../../../tests/materials-science-maintenance.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [vendor-maintenance.ts](helpers/vendor-maintenance.ts.md) | tests/helpers/vendor-maintenance.ts | 厂商锚点测试的共享断言：校验 manifest 的锚点身份、上游 revision 与文件数、raw Skill 与 capability/profile 计数、领域分布与工具文件一致性，维护文件哈希匹配，并实际执行对应厂商的 check 命令。 |
