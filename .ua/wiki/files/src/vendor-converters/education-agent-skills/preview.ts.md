
# src/vendor-converters/education-agent-skills/preview.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/education-agent-skills](../../../../modules/src/vendor-converters/education-agent-skills.md)
<!-- node: file:src/vendor-converters/education-agent-skills/preview.ts -->

生成 Education Agent Skills 转换预览：渲染完整树并输出一份中文审阅报告与计数摘要，供人工在正式转换前核对准入范围。
源码：[src/vendor-converters/education-agent-skills/preview.ts](../../../../../../src/vendor-converters/education-agent-skills/preview.ts)

## 符号（4）
<!-- node: function:src/vendor-converters/education-agent-skills/preview.ts:main -->
<!-- node: function:src/vendor-converters/education-agent-skills/preview.ts:previewCounts -->
<!-- node: function:src/vendor-converters/education-agent-skills/preview.ts:renderChineseReview -->
<!-- node: function:src/vendor-converters/education-agent-skills/preview.ts:writeEducationAgentSkillsPreview -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 157–168 | 简单 | cli、entry-point、preview | 0 | 预览命令的独立入口，定位仓库根目录并调用预览写入函数。 |
| previewCounts | 函数 | 62–84 | 中等 | metrics、summarization、preview | 0 | 统计预览中的准入/排除、许可证状态、域分布与证据标记数量。 |
| renderChineseReview | 函数 | 86–155 | 复杂 | reporting、markdown、human-review | 0 | 渲染面向人工审阅的中文 Markdown 报告，列出策略哈希、准入清单、排除原因与边界说明。 |
| writeEducationAgentSkillsPreview | 函数 | 9–60 | 复杂 | preview、file-emission、entry-point | 0 | 清空并重建预览目录，写入中文审阅报告与结构化预览数据，返回审阅状态、整树哈希与准入数量。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/education-agent-skills/complete-tree.ts | 渲染每个被准入 Skill 的完整文件树（SKILL.md、LICENSE、NOTICE.md），计算逐文件与整树 SHA-256，并汇总为带 treeSetSha256 的完整树集合。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/vendor-converters/education-agent-skills/cli.ts | Education Agent Skills vendor converter 的命令行入口，串联 preview、convert、check、idempotence 四个子命令并支持 --force/--dry-run/--json。 |
| [education-agent-skills-ingest.test.ts](../../../tests/education-agent-skills-ingest.test.ts.md) | tests/education-agent-skills-ingest.test.ts | 转换链端到端测试：校验生产策略展开的准入/证据/关系/安全域计数、整树哈希、边界标记完整性、预览与转换产物一致性、幂等性以及插件注册表中的域归属。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| writeEducationAgentSkillsPreview | 函数 | 9–60 | 清空并重建预览目录，写入中文审阅报告与结构化预览数据，返回审阅状态、整树哈希与准入数量。 |
