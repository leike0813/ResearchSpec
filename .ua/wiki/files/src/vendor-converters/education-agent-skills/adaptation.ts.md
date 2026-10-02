
# src/vendor-converters/education-agent-skills/adaptation.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/education-agent-skills](../../../../modules/src/vendor-converters/education-agent-skills.md)
<!-- node: file:src/vendor-converters/education-agent-skills/adaptation.ts -->

把上游 SKILL.md 改编为 ResearchSpec 授权版本：重写 frontmatter、插入边界声明区块，并在正文中按句/行/列表/表格单元标注证据来源，保证可回溯且原文可恢复。
源码：[src/vendor-converters/education-agent-skills/adaptation.ts](../../../../../../src/vendor-converters/education-agent-skills/adaptation.ts)

## 符号（8）
<!-- node: function:src/vendor-converters/education-agent-skills/adaptation.ts:adaptEducationSkill -->
<!-- node: function:src/vendor-converters/education-agent-skills/adaptation.ts:bodyUnits -->
<!-- node: function:src/vendor-converters/education-agent-skills/adaptation.ts:identityAuthorTokens -->
<!-- node: function:src/vendor-converters/education-agent-skills/adaptation.ts:lineUnits -->
<!-- node: function:src/vendor-converters/education-agent-skills/adaptation.ts:markBodyEvidence -->
<!-- node: function:src/vendor-converters/education-agent-skills/adaptation.ts:normalizeFrontmatter -->
<!-- node: function:src/vendor-converters/education-agent-skills/adaptation.ts:recoverEducationSourceBody -->
<!-- node: function:src/vendor-converters/education-agent-skills/adaptation.ts:sentenceUnits -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [adaptEducationSkill](../../../../symbols/src/vendor-converters/education-agent-skills/adaptation.ts/adaptEducationSkill.md) | 函数 | 32–73 | 复杂 | adaptation、orchestration、evidence-marking | 1 | 改编入口：按准入、安全与证据策略生成授权 SKILL.md 正文，返回正文、标记正文、证据匹配区间与未匹配证据 ID。 |
| bodyUnits | 函数 | 184–205 | 中等 | text-processing、parsing、evidence-marking | 0 | 将正文切分为列表项、表格行与段落单元，作为证据标注的粗粒度锚点。 |
| identityAuthorTokens | 函数 | 272–284 | 中等 | normalization、text-processing、evidence-matching | 0 | 从作者列表中提取可用于证据比对的规范化词元，过滤停顿词并限制长度。 |
| lineUnits | 函数 | 207–249 | 复杂 | text-processing、hashing、evidence-marking | 0 | 按行切分正文并为每一行生成稳定 SHA-256，用于作者-年份型证据的行级匹配。 |
| markBodyEvidence | 函数 | 135–175 | 复杂 | evidence-marking、text-processing、validation | 0 | 在正文单元之间插入证据标记注释，并记录每个标记的证据 ID、位置、单元类型与源文本哈希。 |
| normalizeFrontmatter | 函数 | 84–118 | 复杂 | adaptation、yaml、data-model | 0 | 重建 Skill frontmatter：保留必要上游字段并写入 admission、license、evidence 与边界等 ResearchSpec 授权元数据。 |
| recoverEducationSourceBody | 函数 | 75–82 | 中等 | text-processing、round-trip、validation | 0 | 从标记正文中移除 ResearchSpec 插入的边界区块与证据标记，还原上游原始正文用于比对。 |
| sentenceUnits | 函数 | 251–261 | 中等 | text-processing、parsing、evidence-marking | 0 | 按句末标点切分文本，作为比行更细的证据匹配单元。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [education-agent-skills.ts](../../vendor-audits/education-agent-skills.ts.md) | src/vendor-audits/education-agent-skills.ts | Education Agent Skills 上游快照的完整不可变审计实现：校验 snapshot-6bbbce4 身份、读取 Git 受跟踪清单、解析 165 个 Skill 的 frontmatter，并逐项判定受众、许可证、风险、证据强度与重叠关系，最终渲染审计 JSON 与 Markdown 报告。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/education-agent-skills/policy.ts | Education Agent Skills 生产策略 SSOT：固定 release、revision 与三个权威 SHA-256，加载并校验生产策略、审计与证据映射，展开 165 条准入决策、872 条证据改编、813 条建议关系与 136 条安全域决策。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/education-agent-skills/complete-tree.ts | 渲染每个被准入 Skill 的完整文件树（SKILL.md、LICENSE、NOTICE.md），计算逐文件与整树 SHA-256，并汇总为带 treeSetSha256 的完整树集合。 |
| [education-agent-skills-ingest.test.ts](../../../tests/education-agent-skills-ingest.test.ts.md) | tests/education-agent-skills-ingest.test.ts | 转换链端到端测试：校验生产策略展开的准入/证据/关系/安全域计数、整树哈希、边界标记完整性、预览与转换产物一致性、幂等性以及插件注册表中的域归属。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [adaptEducationSkill](../../../../symbols/src/vendor-converters/education-agent-skills/adaptation.ts/adaptEducationSkill.md) | 函数 | 32–73 | 改编入口：按准入、安全与证据策略生成授权 SKILL.md 正文，返回正文、标记正文、证据匹配区间与未匹配证据 ID。 |
| recoverEducationSourceBody | 函数 | 75–82 | 从标记正文中移除 ResearchSpec 插入的边界区块与证据标记，还原上游原始正文用于比对。 |
