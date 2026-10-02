
# src/vendor-audits/education-agent-skills-cli.ts
所属分层：[厂商 Skill 转换与审计层](../../../layers/vendor-converters.md)  
所属目录：[src/vendor-audits](../../../modules/src/vendor-audits.md)
<!-- node: file:src/vendor-audits/education-agent-skills-cli.ts -->

Education Agent Skills 审计的命令行入口，提供 audit 与 check 两个子命令，负责写出 skill-audit.json 与 report.md，或与已提交产物做逐字节比对。
源码：[src/vendor-audits/education-agent-skills-cli.ts](../../../../../src/vendor-audits/education-agent-skills-cli.ts)

## 符号（2）
<!-- node: function:src/vendor-audits/education-agent-skills-cli.ts:findRepoRoot -->
<!-- node: function:src/vendor-audits/education-agent-skills-cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| findRepoRoot | 函数 | 45–56 | 简单 | cli、utility、path-resolution | 0 | 自当前目录向上查找带 .git 的目录，得到审计所需的仓库根路径。 |
| main | 函数 | 17–43 | 中等 | cli、entry-point、command-dispatch | 0 | 解析 argv 选择 audit/check 子命令，定位仓库根目录后生成或校验审计产物，并通过 --json 输出结构化结果。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [education-agent-skills.ts](education-agent-skills.ts.md) | src/vendor-audits/education-agent-skills.ts | Education Agent Skills 上游快照的完整不可变审计实现：校验 snapshot-6bbbce4 身份、读取 Git 受跟踪清单、解析 165 个 Skill 的 frontmatter，并逐项判定受众、许可证、风险、证据强度与重叠关系，最终渲染审计 JSON 与 Markdown 报告。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 17–43 | 解析 argv 选择 audit/check 子命令，定位仓库根目录后生成或校验审计产物，并通过 --json 输出结构化结果。 |
