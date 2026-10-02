
# src/arsu-converter/workflow/catalog.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/workflow](../../../../modules/src/arsu-converter/workflow.md)
<!-- node: file:src/arsu-converter/workflow/catalog.ts -->

ARSU 工作流目录的导入门禁：导出 validateArsuWorkflowCatalog 包装路由目录校验，并在模块加载时立即执行，目录一旦非法就抛出带 issue 明细的错误。
源码：[src/arsu-converter/workflow/catalog.ts](../../../../../../src/arsu-converter/workflow/catalog.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/workflow/catalog.ts:validateArsuWorkflowCatalog -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| validateArsuWorkflowCatalog | 函数 | 4–8 | 简单 | 导入门禁、校验、路由目录 | 0 | 调用路由目录跨引用校验并把 issue 拼接为 `code:message` 字符串列表，供导入门禁与 CLI 报告使用。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../routing/catalog.ts.md) | src/arsu-converter/routing/catalog.ts | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |
| [contracts.ts](../routing/contracts.ts.md) | src/arsu-converter/routing/contracts.ts | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](../converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| validateArsuWorkflowCatalog | 函数 | 4–8 | 调用路由目录跨引用校验并把 issue 拼接为 `code:message` 字符串列表，供导入门禁与 CLI 报告使用。 |
