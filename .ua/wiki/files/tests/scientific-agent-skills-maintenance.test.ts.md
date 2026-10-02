
# tests/scientific-agent-skills-maintenance.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/scientific-agent-skills-maintenance.test.ts -->

以运行时读取的目录为准断言 Scientific Agent Skills 的 revision 与 vendor checkout 的 HEAD 一致，并校验 capability ID 与 raw Skill ID 的一对一唯一性及统一 brief 字段。
源码：[tests/scientific-agent-skills-maintenance.test.ts](../../../../tests/scientific-agent-skills-maintenance.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [vendor-maintenance.ts](helpers/vendor-maintenance.ts.md) | tests/helpers/vendor-maintenance.ts | 厂商锚点测试的共享断言：校验 manifest 的锚点身份、上游 revision 与文件数、raw Skill 与 capability/profile 计数、领域分布与工具文件一致性，维护文件哈希匹配，并实际执行对应厂商的 check 命令。 |
