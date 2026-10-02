
# tests/helpers/vendor-maintenance.ts
所属分层：[测试与验收夹具层](../../../layers/tests.md)  
所属目录：[tests/helpers](../../../modules/tests/helpers.md)
<!-- node: file:tests/helpers/vendor-maintenance.ts -->

厂商锚点测试的共享断言：校验 manifest 的锚点身份、上游 revision 与文件数、raw Skill 与 capability/profile 计数、领域分布与工具文件一致性，维护文件哈希匹配，并实际执行对应厂商的 check 命令。
源码：[tests/helpers/vendor-maintenance.ts](../../../../../tests/helpers/vendor-maintenance.ts)

## 符号（1）
<!-- node: function:tests/helpers/vendor-maintenance.ts:testVendorAnchor -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| testVendorAnchor | 函数 | 8–55 | 中等 | test-helper、test、assertion | 0 | 注册并执行单个厂商锚点的 manifest 校验用例，覆盖计数、哈希格式、维护文件指纹与 check 子命令退出码。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [education-agent-skills-maintenance.test.ts](../education-agent-skills-maintenance.test.ts.md) | tests/education-agent-skills-maintenance.test.ts | 断言 Education Agent Skills 目录映射 136 个 llm extension、revision 与 vendor bundle manifest 一致，并校验 snapshot-6bbbce4 锚点。 |
| [finrobot-maintenance.test.ts](../finrobot-maintenance.test.ts.md) | tests/finrobot-maintenance.test.ts | 断言 FinRobot 目录映射六个 financial-research extension（4 mixed / 2 llm）、raw Skill 名称集合固定且 brief 字段不少于五项。 |
| [histagent-maintenance.test.ts](../histagent-maintenance.test.ts.md) | tests/histagent-maintenance.test.ts | 断言 HistAgent 目录映射三个 executable Skills 均为 mixed 类型且名称集合固定，并校验 snapshot-47bbe21 锚点。 |
| [materials-science-maintenance.test.ts](../materials-science-maintenance.test.ts.md) | tests/materials-science-maintenance.test.ts | 断言 Materials Science 目录映射七个 curated Skills 均为 llm 类型、raw Skill 命名集合固定，并校验 snapshot-fafd3ab 锚点。 |
| [scientific-agent-skills-maintenance.test.ts](../scientific-agent-skills-maintenance.test.ts.md) | tests/scientific-agent-skills-maintenance.test.ts | 以运行时读取的目录为准断言 Scientific Agent Skills 的 revision 与 vendor checkout 的 HEAD 一致，并校验 capability ID 与 raw Skill ID 的一对一唯一性及统一 brief 字段。 |
| [tooluniverse-maintenance.test.ts](../tooluniverse-maintenance.test.ts.md) | tests/tooluniverse-maintenance.test.ts | 断言 ToolUniverse 目录把 130 个 reviewed Skills 一对一映射为 extension，42 个 mixed、88 个 llm，且全部使用统一六项 brief 字段。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| testVendorAnchor | 函数 | 8–55 | 注册并执行单个厂商锚点的 manifest 校验用例，覆盖计数、哈希格式、维护文件指纹与 check 子命令退出码。 |
