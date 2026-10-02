
# tests/fixtures/domain-skill-plugins/registry.json
所属分层：[测试与验收夹具层](../../../../layers/tests.md)  
所属目录：[tests/fixtures/domain-skill-plugins](../../../../modules/tests/fixtures/domain-skill-plugins.md)
<!-- node: config:tests/fixtures/domain-skill-plugins/registry.json -->

domain-skill-plugins 领域插件测试夹具的注册表：声明 taxonomy、两个 vendor 及其 Skill 列表、领域与归属关系。
源码：[tests/fixtures/domain-skill-plugins/registry.json](../../../../../../tests/fixtures/domain-skill-plugins/registry.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [domain-source/rock-mechanics/NOTICE.md](vendors/domain-source/rock-mechanics/NOTICE.md.md) | tests/fixtures/domain-skill-plugins/vendors/domain-source/rock-mechanics/NOTICE.md | 夹具用领域 Skill 的来源声明，指向 registry.json 中记录的修订版本。 |
| [domain-source/rock-mechanics/SKILL.md](vendors/domain-source/rock-mechanics/SKILL.md.md) | tests/fixtures/domain-skill-plugins/vendors/domain-source/rock-mechanics/SKILL.md | 夹具用领域 Skill 树：带 frontmatter、NOTICE 与 references，并附一个 ResearchSpec 不会执行的可选计算脚本。 |
| [method-source/research-tables/NOTICE.md](vendors/method-source/research-tables/NOTICE.md.md) | tests/fixtures/domain-skill-plugins/vendors/method-source/research-tables/NOTICE.md | 夹具用方法型 Skill 的来源声明，指向 registry.json 记录的修订版本。 |
| [method-source/research-tables/SKILL.md](vendors/method-source/research-tables/SKILL.md.md) | tests/fixtures/domain-skill-plugins/vendors/method-source/research-tables/SKILL.md | 夹具用方法型 Skill：只有 SKILL.md 与 NOTICE，演示纯程序型 Skill 的最小树结构。 |
