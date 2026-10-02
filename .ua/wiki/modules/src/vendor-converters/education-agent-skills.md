
# src/vendor-converters/education-agent-skills
> 目录聚合页：8 个文件、29 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/vendor-converters/education-agent-skills/adaptation.ts](../../../files/src/vendor-converters/education-agent-skills/adaptation.ts.md) | 文件 | 8 | 把上游 SKILL.md 改编为 ResearchSpec 授权版本：重写 frontmatter、插入边界声明区块，并在正文中按句/行/列表/表格单元标注证据来源，保证可回溯且原文可恢复。 |
| [src/vendor-converters/education-agent-skills/cli.ts](../../../files/src/vendor-converters/education-agent-skills/cli.ts.md) | 文件 | 2 | Education Agent Skills vendor converter 的命令行入口，串联 preview、convert、check、idempotence 四个子命令并支持 --force/--dry-run/--json。 |
| [src/vendor-converters/education-agent-skills/complete-tree.ts](../../../files/src/vendor-converters/education-agent-skills/complete-tree.ts.md) | 文件 | 2 | 渲染每个被准入 Skill 的完整文件树（SKILL.md、LICENSE、NOTICE.md），计算逐文件与整树 SHA-256，并汇总为带 treeSetSha256 的完整树集合。 |
| [src/vendor-converters/education-agent-skills/converter.ts](../../../files/src/vendor-converters/education-agent-skills/converter.ts.md) | 文件 | 5 | Education Agent Skills 生产转换器：校验策略与审批哈希、在 staging 目录生成 136 个准入 Skill 的插件包、写入转换清单，并提供产物检查与幂等性检查。 |
| [src/vendor-converters/education-agent-skills/policy.ts](../../../files/src/vendor-converters/education-agent-skills/policy.ts.md) | 文件 | 8 | Education Agent Skills 生产策略 SSOT：固定 release、revision 与三个权威 SHA-256，加载并校验生产策略、审计与证据映射，展开 165 条准入决策、872 条证据改编、813 条建议关系与 136 条安全域决策。 |
| [src/vendor-converters/education-agent-skills/preview.ts](../../../files/src/vendor-converters/education-agent-skills/preview.ts.md) | 文件 | 4 | 生成 Education Agent Skills 转换预览：渲染完整树并输出一份中文审阅报告与计数摘要，供人工在正式转换前核对准入范围。 |
| [src/vendor-converters/education-agent-skills/production-policy.json](../../../files/src/vendor-converters/education-agent-skills/production-policy.json.md) | 配置 | 0 | Education Agent Skills 的生产准入策略：固定审计与证据映射的 SHA-256、预期 165 个 Skill 中准入 136 排除 29、CC-BY-SA-4.0 许可来源与允许的领域白名单。 |
| [src/vendor-converters/education-agent-skills/review-decision.json](../../../files/src/vendor-converters/education-agent-skills/review-decision.json.md) | 配置 | 0 | Education Agent Skills 的人工审核决定记录：绑定审计、证据映射、生产策略与许可文本的哈希，批准树集合哈希并记录批准人与时间。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/workspace](../core/workspace.md) | 3 |
| [src/plugins](../plugins.md) | 2 |
| [src/vendor-audits](../vendor-audits.md) | 2 |
| [src/vendor-converters/shared](shared.md) | 2 |
| [src/vendor-evidence/education-agent-skills](../vendor-evidence/education-agent-skills.md) | 1 |
