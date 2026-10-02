
# tests/education-agent-skills-evidence.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/education-agent-skills-evidence.test.ts -->

证据映射契约测试：断言 872 条声明与 165 个 Skill 的覆盖、审计哈希绑定、存在性分布、scholar 发现结果，以及 JSON/报告的确定性渲染与 CLI check 退出码。
源码：[tests/education-agent-skills-evidence.test.ts](../../../../tests/education-agent-skills-evidence.test.ts)

## 符号（1）
<!-- node: function:tests/education-agent-skills-evidence.test.ts:loadArtifacts -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| loadArtifacts | 函数 | 232–246 | 简单 | test、fixture-loading、evidence | 0 | 按需读取并缓存审计 JSON、审计对象、证据映射 JSON 与对象，供各断言复用。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](helpers/cli.ts.md) | tests/helpers/cli.ts | CLI 测试夹具：用 spawnSync 运行编译产物、解析 envelope 响应，并创建与清理临时项目目录。 |
| [education-agent-skills.ts](../src/vendor-audits/education-agent-skills.ts.md) | src/vendor-audits/education-agent-skills.ts | Education Agent Skills 上游快照的完整不可变审计实现：校验 snapshot-6bbbce4 身份、读取 Git 受跟踪清单、解析 165 个 Skill 的 frontmatter，并逐项判定受众、许可证、风险、证据强度与重叠关系，最终渲染审计 JSON 与 Markdown 报告。 |
| [index.ts](../src/vendor-evidence/education-agent-skills/index.ts.md) | src/vendor-evidence/education-agent-skills/index.ts | 证据映射的运行时装配层：解析 evidence-map.json、校验其与不可变审计的绑定、渲染 evidence JSON 与 evidence-report.md，并提供与已提交产物的比对入口。 |
