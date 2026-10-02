
# src/arsu-converter/routing/projection.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/routing](../../../../modules/src/arsu-converter/routing.md)
<!-- node: file:src/arsu-converter/routing/projection.ts -->

路由语义的文本投影层：把 Skill、路由、前置条件组渲染为 SKILL.md frontmatter description 与命令描述，并校验 frontmatter 中的 name 与 Skill ID 一致后改写 description。
源码：[src/arsu-converter/routing/projection.ts](../../../../../../src/arsu-converter/routing/projection.ts)

## 符号（5）
<!-- node: function:src/arsu-converter/routing/projection.ts:projectSkillFrontmatterDescription -->
<!-- node: function:src/arsu-converter/routing/projection.ts:readSkillFrontmatterDescription -->
<!-- node: function:src/arsu-converter/routing/projection.ts:renderArsuCommandDescription -->
<!-- node: function:src/arsu-converter/routing/projection.ts:renderArsuRouteSummary -->
<!-- node: function:src/arsu-converter/routing/projection.ts:renderArsuSkillDescription -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| projectSkillFrontmatterDescription | 函数 | 52–71 | 简单 | 投影、frontmatter、yaml-解析、校验 | 0 | 解析 SKILL.md 的 YAML frontmatter，校验 name 与 Skill ID 一致后用目录派生的 description 覆写并回写全文，同时返回投影结果。 |
| readSkillFrontmatterDescription | 函数 | 73–80 | 简单 | frontmatter、读取、容错解析 | 0 | 从 SKILL.md 文本中读取 frontmatter 的 description 字段，无 frontmatter、YAML 非法或字段非字符串时返回 null。 |
| renderArsuCommandDescription | 函数 | 48–50 | 简单 | 渲染、描述生成、adapters | 0 | 生成 commands 模式下 Skill 包装器的简短描述，只包含摘要与路由列表。 |
| renderArsuRouteSummary | 函数 | 18–37 | 简单 | 渲染、摘要、路由目录 | 0 | 把一条路由压缩为前置条件、边界产出、正式 Gate、风险/成本与确认要求的五段摘要，供表格与描述文本复用。 |
| renderArsuSkillDescription | 函数 | 11–16 | 简单 | 渲染、frontmatter、描述生成 | 1 | 把单个 Skill 拼成 frontmatter description 文本，包含摘要、路由列表、适用意图、near-miss 引导与逐次启动前需确认的前置与 Gate 清单。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](catalog.ts.md) | src/arsu-converter/routing/catalog.ts | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |
| [contracts.ts](contracts.ts.md) | src/arsu-converter/routing/contracts.ts | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-converter.test.ts](../../../tests/arsu-converter.test.ts.md) | tests/arsu-converter.test.ts | ARSU 转换端到端测试：用临时目录与固定 fixture runtime-policy catalog 构造最小上游，验证转换产物、幂等性、清单归一化、anchor 替换、路由 frontmatter 投影与 paper-humanizer 参考模式迁移。 |
| [arsu-routing-catalog.test.ts](../../../tests/arsu-routing-catalog.test.ts.md) | tests/arsu-routing-catalog.test.ts | 路由目录测试：锁定四个 Skill 的顺序、25 条 mode 与 2 条 entry 路由、跨引用校验为空，并检查每条路由的摘要字段齐备、frontmatter 投影结果与 near-miss 语义。 |
| [emit.ts](../emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [graph.ts](../../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [navigation-projection.ts](navigation-projection.ts.md) | src/arsu-converter/routing/navigation-projection.ts | 把路由目录投影为 Navigate 可见的 Markdown「目录派生路由参考」章节，为每个 Skill 输出意图、near-miss 与一张路由语义表，并显式声明这些语义不等于运行时选择器或工作区可用性。 |
| [types.ts](../types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
| [validate.ts](../validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| projectSkillFrontmatterDescription | 函数 | 52–71 | 解析 SKILL.md 的 YAML frontmatter，校验 name 与 Skill ID 一致后用目录派生的 description 覆写并回写全文，同时返回投影结果。 |
| readSkillFrontmatterDescription | 函数 | 73–80 | 从 SKILL.md 文本中读取 frontmatter 的 description 字段，无 frontmatter、YAML 非法或字段非字符串时返回 null。 |
| renderArsuCommandDescription | 函数 | 48–50 | 生成 commands 模式下 Skill 包装器的简短描述，只包含摘要与路由列表。 |
| renderArsuRouteSummary | 函数 | 18–37 | 把一条路由压缩为前置条件、边界产出、正式 Gate、风险/成本与确认要求的五段摘要，供表格与描述文本复用。 |
| renderArsuSkillDescription | 函数 | 11–16 | 把单个 Skill 拼成 frontmatter description 文本，包含摘要、路由列表、适用意图、near-miss 引导与逐次启动前需确认的前置与 Gate 清单。 |
