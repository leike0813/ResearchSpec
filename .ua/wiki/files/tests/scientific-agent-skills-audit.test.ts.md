
# tests/scientific-agent-skills-audit.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/scientific-agent-skills-audit.test.ts -->

Scientific Agent Skills 不可变审计测试：校验固定上游身份、167 个 Skill 的证据路径与 ANZSRC 归类、资源统计复算，并复现上游安全发现以确认审计未漏报。
源码：[tests/scientific-agent-skills-audit.test.ts](../../../../tests/scientific-agent-skills-audit.test.ts)

## 符号（1）
<!-- node: function:tests/scientific-agent-skills-audit.test.ts:recomputeFrontmatterFindings -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| recomputeFrontmatterFindings | 函数 | 178–202 | 中等 | test-helper、security-review、recomputation、frontmatter | 0 | 在固定源码中重新扫描 SKILL.md frontmatter，独立复现审计记录的安全发现并逐条比对。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [production-vendors.ts](../src/vendor-converters/shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [registry.ts](../src/plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [scientific-agent-skills.ts](../src/vendor-audits/scientific-agent-skills.ts.md) | src/vendor-audits/scientific-agent-skills.ts | Scientific Agent Skills 审计 schema：逐 Skill 的范围处置、摄入就绪度、上游安全复核结论与资源统计，外加上游分类和汇总计数。 |
| [taxonomy.ts](../src/plugins/taxonomy.ts.md) | src/plugins/taxonomy.ts | ANZSRC 2020 Fields of Research 快照的 schema、加载校验与 Group 标题到领域 slug 的派生规则，是学科领域命名的唯一事实源。 |
| [vendor-audit.ts](helpers/vendor-audit.ts.md) | tests/helpers/vendor-audit.ts | vendor 审计测试的共享断言工具：检查固定源码是否初始化、执行只读 git 查询、枚举顶层 Skill、汇总仓库资源统计并校验证据路径安全可读。 |
