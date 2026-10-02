
# src/vendor-evidence/education-agent-skills/cli.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-evidence/education-agent-skills](../../../../modules/src/vendor-evidence/education-agent-skills.md)
<!-- node: file:src/vendor-evidence/education-agent-skills/cli.ts -->

证据核验的命令行入口，只提供只读的 check 子命令：读取已提交的审计 JSON、证据映射与报告并校验三者一致。
源码：[src/vendor-evidence/education-agent-skills/cli.ts](../../../../../../src/vendor-evidence/education-agent-skills/cli.ts)

## 符号（2）
<!-- node: function:src/vendor-evidence/education-agent-skills/cli.ts:findRepoRoot -->
<!-- node: function:src/vendor-evidence/education-agent-skills/cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| findRepoRoot | 函数 | 54–67 | 简单 | cli、path-resolution、utility | 0 | 自当前目录向上定位仓库根目录，用于解析审计与证据产物路径。 |
| main | 函数 | 20–52 | 中等 | cli、command-dispatch、evidence | 0 | 读取审计、证据映射与报告三类产物，调用一致性检查并以 JSON 或人读形式返回结果与退出码。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [education-agent-skills.ts](../../vendor-audits/education-agent-skills.ts.md) | src/vendor-audits/education-agent-skills.ts | Education Agent Skills 上游快照的完整不可变审计实现：校验 snapshot-6bbbce4 身份、读取 Git 受跟踪清单、解析 165 个 Skill 的 frontmatter，并逐项判定受众、许可证、风险、证据强度与重叠关系，最终渲染审计 JSON 与 Markdown 报告。 |
| [index.ts](index.ts.md) | src/vendor-evidence/education-agent-skills/index.ts | 证据映射的运行时装配层：解析 evidence-map.json、校验其与不可变审计的绑定、渲染 evidence JSON 与 evidence-report.md，并提供与已提交产物的比对入口。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 20–52 | 读取审计、证据映射与报告三类产物，调用一致性检查并以 JSON 或人读形式返回结果与退出码。 |
