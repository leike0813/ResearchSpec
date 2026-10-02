
# src/arsu-converter/routing/catalog.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/routing](../../../../modules/src/arsu-converter/routing.md)
<!-- node: file:src/arsu-converter/routing/catalog.ts -->

ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。
源码：[src/arsu-converter/routing/catalog.ts](../../../../../../src/arsu-converter/routing/catalog.ts)

## 符号（2）
<!-- node: function:src/arsu-converter/routing/catalog.ts:getArsuRoute -->
<!-- node: function:src/arsu-converter/routing/catalog.ts:getArsuSkillDefinition -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| getArsuRoute | 函数 | 164–169 | 简单 | 查询、路由目录、工具函数 | 0 | 在全部 Skill 的路由中按 route_ref 线性查找单条路由定义，未知引用直接抛错。 |
| getArsuSkillDefinition | 函数 | 158–162 | 简单 | 查询、路由目录、工具函数 | 1 | 按 skill_id 从已解析的路由目录中取出单个 Skill 路由定义，未知 ID 直接抛错。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [boundary-deliverables.ts](../workflow/boundary-deliverables.ts.md) | src/arsu-converter/workflow/boundary-deliverables.ts | 从路由声明的 output_types 派生边界产出描述符：生成 role/type、用途说明、结构约束，并按类型区分 text-artifact 与 binary-file-artifact 两种校验档位。 |
| [contracts.ts](contracts.ts.md) | src/arsu-converter/routing/contracts.ts | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-converter.test.ts](../../../tests/arsu-converter.test.ts.md) | tests/arsu-converter.test.ts | ARSU 转换端到端测试：用临时目录与固定 fixture runtime-policy catalog 构造最小上游，验证转换产物、幂等性、清单归一化、anchor 替换、路由 frontmatter 投影与 paper-humanizer 参考模式迁移。 |
| [arsu-routing-catalog.test.ts](../../../tests/arsu-routing-catalog.test.ts.md) | tests/arsu-routing-catalog.test.ts | 路由目录测试：锁定四个 Skill 的顺序、25 条 mode 与 2 条 entry 路由、跨引用校验为空，并检查每条路由的摘要字段齐备、frontmatter 投影结果与 near-miss 语义。 |
| [catalog.ts](../../procedures/catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [catalog.ts](../workflow/catalog.ts.md) | src/arsu-converter/workflow/catalog.ts | ARSU 工作流目录的导入门禁：导出 validateArsuWorkflowCatalog 包装路由目录校验，并在模块加载时立即执行，目录一旦非法就抛出带 issue 明细的错误。 |
| [converter.ts](../converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [graph.ts](../../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [navigation-projection.ts](navigation-projection.ts.md) | src/arsu-converter/routing/navigation-projection.ts | 把路由目录投影为 Navigate 可见的 Markdown「目录派生路由参考」章节，为每个 Skill 输出意图、near-miss 与一张路由语义表，并显式声明这些语义不等于运行时选择器或工作区可用性。 |
| [projection.ts](projection.ts.md) | src/arsu-converter/routing/projection.ts | 路由语义的文本投影层：把 Skill、路由、前置条件组渲染为 SKILL.md frontmatter description 与命令描述，并校验 frontmatter 中的 name 与 Skill ID 一致后改写 description。 |
| [validate.ts](../validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| getArsuRoute | 函数 | 164–169 | 在全部 Skill 的路由中按 route_ref 线性查找单条路由定义，未知引用直接抛错。 |
| getArsuSkillDefinition | 函数 | 158–162 | 按 skill_id 从已解析的路由目录中取出单个 Skill 路由定义，未知 ID 直接抛错。 |
