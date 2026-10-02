
# src/arsu-converter/routing/contracts.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/routing](../../../../modules/src/arsu-converter/routing.md)
<!-- node: file:src/arsu-converter/routing/contracts.ts -->

ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。
源码：[src/arsu-converter/routing/contracts.ts](../../../../../../src/arsu-converter/routing/contracts.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/routing/contracts.ts:validateRoutingCatalogReferences -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| validateRoutingCatalogReferences | 函数 | 115–210 | 中等 | 校验、路由目录、图遍历、契约 | 1 | 对路由目录做跨引用完整性校验：Skill/路由 ID 唯一性、路由归属与 mode_id 一致、entry 路由仅限 pipeline、Gate 策略自洽、边界产出与前置条件去重、25/2 路由数量、near-miss 与 fallback 指向存在，并用三色 DFS 检测 fallback 环。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-routing-catalog.test.ts](../../../tests/arsu-routing-catalog.test.ts.md) | tests/arsu-routing-catalog.test.ts | 路由目录测试：锁定四个 Skill 的顺序、25 条 mode 与 2 条 entry 路由、跨引用校验为空，并检查每条路由的摘要字段齐备、frontmatter 投影结果与 near-miss 语义。 |
| [boundary-deliverables.ts](../workflow/boundary-deliverables.ts.md) | src/arsu-converter/workflow/boundary-deliverables.ts | 从路由声明的 output_types 派生边界产出描述符：生成 role/type、用途说明、结构约束，并按类型区分 text-artifact 与 binary-file-artifact 两种校验档位。 |
| [catalog.ts](../workflow/catalog.ts.md) | src/arsu-converter/workflow/catalog.ts | ARSU 工作流目录的导入门禁：导出 validateArsuWorkflowCatalog 包装路由目录校验，并在模块加载时立即执行，目录一旦非法就抛出带 issue 明细的错误。 |
| [catalog.ts](catalog.ts.md) | src/arsu-converter/routing/catalog.ts | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |
| [config.ts](../config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [emit.ts](../emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [graph.ts](../../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [navigation-projection.ts](navigation-projection.ts.md) | src/arsu-converter/routing/navigation-projection.ts | 把路由目录投影为 Navigate 可见的 Markdown「目录派生路由参考」章节，为每个 Skill 输出意图、near-miss 与一张路由语义表，并显式声明这些语义不等于运行时选择器或工作区可用性。 |
| [procedures.test.ts](../../../tests/procedures.test.ts.md) | tests/procedures.test.ts | Procedure 目录的行为测试：验证目录规模由各注册表派生、Companion 仅暴露三个隐藏 Procedure、排序检索与激活包内容符合契约。 |
| [projection.ts](projection.ts.md) | src/arsu-converter/routing/projection.ts | 路由语义的文本投影层：把 Skill、路由、前置条件组渲染为 SKILL.md frontmatter description 与命令描述，并校验 frontmatter 中的 name 与 Skill ID 一致后改写 description。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [types.ts](../types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
| [validate.ts](../validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| validateRoutingCatalogReferences | 函数 | 115–210 | 对路由目录做跨引用完整性校验：Skill/路由 ID 唯一性、路由归属与 mode_id 一致、entry 路由仅限 pipeline、Gate 策略自洽、边界产出与前置条件去重、25/2 路由数量、near-miss 与 fallback 指向存在，并用三色 DFS 检测 fallback 环。 |
