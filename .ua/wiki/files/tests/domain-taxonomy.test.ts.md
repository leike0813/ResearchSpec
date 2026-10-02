
# tests/domain-taxonomy.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/domain-taxonomy.test.ts -->

领域分类体系测试：校验 ANZSRC 2020 快照层级与署名、内部目录覆盖 213 个 Group 与 5 个工具域，以及各 vendor 审计记录的 Field 元数据合法性。
源码：[tests/domain-taxonomy.test.ts](../../../../tests/domain-taxonomy.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [registry.ts](../src/plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [taxonomy.ts](../src/plugins/taxonomy.ts.md) | src/plugins/taxonomy.ts | ANZSRC 2020 Fields of Research 快照的 schema、加载校验与 Group 标题到领域 slug 的派生规则，是学科领域命名的唯一事实源。 |
