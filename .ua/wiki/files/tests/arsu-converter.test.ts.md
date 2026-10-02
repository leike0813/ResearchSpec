
# tests/arsu-converter.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/arsu-converter.test.ts -->

ARSU 转换端到端测试：用临时目录与固定 fixture runtime-policy catalog 构造最小上游，验证转换产物、幂等性、清单归一化、anchor 替换、路由 frontmatter 投影与 paper-humanizer 参考模式迁移。
源码：[tests/arsu-converter.test.ts](../../../../tests/arsu-converter.test.ts)

## 符号（3）
<!-- node: function:tests/arsu-converter.test.ts:makeAnchorAssets -->
<!-- node: function:tests/arsu-converter.test.ts:makeSource -->
<!-- node: function:tests/arsu-converter.test.ts:makeSourceFiles -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| makeAnchorAssets | 函数 | 488–567 | 中等 | fixture、test、anchor | 0 | 生成 anchor 替换测试所需的替换正文与目标标记资产，覆盖多个 anchor 及其 ResearchSpec 归属目标。 |
| makeSource | 函数 | 411–421 | 简单 | fixture、test、工具函数 | 0 | 在临时根目录下创建单个上游源文件及其父目录的最小辅助函数。 |
| makeSourceFiles | 函数 | 423–486 | 中等 | fixture、test、临时目录 | 0 | 在临时目录中搭建覆盖各 skill group 的最小上游文件树，作为转换测试的固定输入。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../src/arsu-converter/routing/catalog.ts.md) | src/arsu-converter/routing/catalog.ts | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |
| [contracts.ts](../src/arsu-converter/contracts.ts.md) | src/arsu-converter/contracts.ts | ResearchSpec 契约集成层：定义 preflight profile 与各注入标记、变更归属矩阵，构建契约集成清单，并向每个生成的 SKILL.md 注入包含 CLI 协议、Gate/Decision 确认、论文交付与文献适配约束的契约前言块。 |
| [converter.ts](../src/arsu-converter/converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [idempotence.ts](../src/arsu-converter/idempotence.ts.md) | src/arsu-converter/idempotence.ts | 转换幂等性校验：既检查既有输出是否偏离其自身 manifest，也通过在临时目录重新生成并比较归一化 manifest 来证明重复转换字节一致。 |
| [manifest.ts](../src/arsu-converter/manifest.ts.md) | src/arsu-converter/manifest.ts | 转换产物的清单与报告层：汇总各 Skill 分组文件、根级投影文件与风险发现，生成 conversion-manifest.json、人类可读的转换报告和逐锚点的替换前后对照报告，并提供用于幂等比较的归一化。 |
| [projection.ts](../src/arsu-converter/routing/projection.ts.md) | src/arsu-converter/routing/projection.ts | 路由语义的文本投影层：把 Skill、路由、前置条件组渲染为 SKILL.md frontmatter description 与命令描述，并校验 frontmatter 中的 name 与 Skill ID 一致后改写 description。 |
| [reference-mode.ts](../src/core-skills/paper-humanizer/reference-mode.ts.md) | src/core-skills/paper-humanizer/reference-mode.ts | paper-humanizer 路径常量：指向当前的 reference-mode Skill 路径与已退役的 prose-guidance 路径，供转换器判定上游文件是否属于参考模式迁移。 |
| [types.ts](../src/arsu-converter/runtime-policy/types.ts.md) | src/arsu-converter/runtime-policy/types.ts | 运行时策略层的纯类型定义：目录条目、不可用引用、checker 闭包、改写 span、适配记录与可序列化计划形态，无运行时代码。 |
| [types.ts](../src/arsu-converter/types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
| [validate.ts](../src/arsu-converter/validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |
