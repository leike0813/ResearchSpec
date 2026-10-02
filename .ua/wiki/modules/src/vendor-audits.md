
# src/vendor-audits
> 目录聚合页：8 个文件、24 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/vendor-audits/contracts.ts](../../files/src/vendor-audits/contracts.ts.md) | 文件 | 1 | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |
| [src/vendor-audits/education-agent-skills-cli.ts](../../files/src/vendor-audits/education-agent-skills-cli.ts.md) | 文件 | 2 | Education Agent Skills 审计的命令行入口，提供 audit 与 check 两个子命令，负责写出 skill-audit.json 与 report.md，或与已提交产物做逐字节比对。 |
| [src/vendor-audits/education-agent-skills.ts](../../files/src/vendor-audits/education-agent-skills.ts.md) | 文件 | 17 | Education Agent Skills 上游快照的完整不可变审计实现：校验 snapshot-6bbbce4 身份、读取 Git 受跟踪清单、解析 165 个 Skill 的 frontmatter，并逐项判定受众、许可证、风险、证据强度与重叠关系，最终渲染审计 JSON 与 Markdown 报告。 |
| [src/vendor-audits/finrobot.ts](../../files/src/vendor-audits/finrobot.ts.md) | 文件 | 0 | FinRobot 审计的 zod schema 集合：受版本控制的源条目与 git 模式、内容来源、许可声明、129 个知识面与候选能力，以及 13 类运营风险枚举。 |
| [src/vendor-audits/histagent.ts](../../files/src/vendor-audits/histagent.ts.md) | 文件 | 0 | HistAgent 审计 schema：处置枚举、运行时权限、外部资源与安全发现记录，以及三个候选 Skill 的自包含执行契约和五层输出区分。 |
| [src/vendor-audits/materials-science-skills-for-llm.ts](../../files/src/vendor-audits/materials-science-skills-for-llm.ts.md) | 文件 | 0 | Materials-Science-Skills-For-LLM 审计 schema：12 个上游 Skill 的 frontmatter 校验、范围处置与摄入就绪度、运营风险与重叠判断，以及整体汇总计数。 |
| [src/vendor-audits/scientific-agent-skills.ts](../../files/src/vendor-audits/scientific-agent-skills.ts.md) | 文件 | 0 | Scientific Agent Skills 审计 schema：逐 Skill 的范围处置、摄入就绪度、上游安全复核结论与资源统计，外加上游分类和汇总计数。 |
| [src/vendor-audits/zotero-library-agent-bundle.ts](../../files/src/vendor-audits/zotero-library-agent-bundle.ts.md) | 文件 | 4 | Zotero Library Agent Bundle 的不可变审计 SSOT：定义审计 JSON 契约、固定发布集 ID 与路径常量，并校验上游身份、文件哈希与排序一致性。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/workspace](core/workspace.md) | 1 |
| [src/literature-adapters](literature-adapters.md) | 1 |
