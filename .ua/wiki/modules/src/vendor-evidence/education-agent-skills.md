
# src/vendor-evidence/education-agent-skills
> 目录聚合页：3 个文件、9 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/vendor-evidence/education-agent-skills/cli.ts](../../../files/src/vendor-evidence/education-agent-skills/cli.ts.md) | 文件 | 2 | 证据核验的命令行入口，只提供只读的 check 子命令：读取已提交的审计 JSON、证据映射与报告并校验三者一致。 |
| [src/vendor-evidence/education-agent-skills/index.ts](../../../files/src/vendor-evidence/education-agent-skills/index.ts.md) | 文件 | 5 | 证据映射的运行时装配层：解析 evidence-map.json、校验其与不可变审计的绑定、渲染 evidence JSON 与 evidence-report.md，并提供与已提交产物的比对入口。 |
| [src/vendor-evidence/education-agent-skills/schema.ts](../../../files/src/vendor-evidence/education-agent-skills/schema.ts.md) | 文件 | 2 | 证据映射的 zod 契约层：定义著作类型、存在性状态、映射类型、验证来源、逐条声明映射与 scholar 发现结果等结构，并校验唯一性与排序不变量。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/vendor-audits](../vendor-audits.md) | 3 |
