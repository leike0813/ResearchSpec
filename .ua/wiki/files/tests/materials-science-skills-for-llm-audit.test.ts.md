
# tests/materials-science-skills-for-llm-audit.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/materials-science-skills-for-llm-audit.test.ts -->

Materials-Science 不可变审计测试：校验固定快照身份与 MIT 许可、12 个上游 Skill 的证据路径、ANZSRC 归类合法性，以及审计 schema 对越界路径与计数篡改的拒绝能力。
源码：[tests/materials-science-skills-for-llm-audit.test.ts](../../../../tests/materials-science-skills-for-llm-audit.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](../src/vendor-audits/contracts.ts.md) | src/vendor-audits/contracts.ts | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |
| [materials-science-skills-for-llm.ts](../src/vendor-audits/materials-science-skills-for-llm.ts.md) | src/vendor-audits/materials-science-skills-for-llm.ts | Materials-Science-Skills-For-LLM 审计 schema：12 个上游 Skill 的 frontmatter 校验、范围处置与摄入就绪度、运营风险与重叠判断，以及整体汇总计数。 |
| [production-vendors.ts](../src/vendor-converters/shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [registry.ts](../src/plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [taxonomy.ts](../src/plugins/taxonomy.ts.md) | src/plugins/taxonomy.ts | ANZSRC 2020 Fields of Research 快照的 schema、加载校验与 Group 标题到领域 slug 的派生规则，是学科领域命名的唯一事实源。 |
| [vendor-audit.ts](helpers/vendor-audit.ts.md) | tests/helpers/vendor-audit.ts | vendor 审计测试的共享断言工具：检查固定源码是否初始化、执行只读 git 查询、枚举顶层 Skill、汇总仓库资源统计并校验证据路径安全可读。 |
