
# src/arsu-converter/workflow/boundary-deliverables.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/workflow](../../../../modules/src/arsu-converter/workflow.md)
<!-- node: file:src/arsu-converter/workflow/boundary-deliverables.ts -->

从路由声明的 output_types 派生边界产出描述符：生成 role/type、用途说明、结构约束，并按类型区分 text-artifact 与 binary-file-artifact 两种校验档位。
源码：[src/arsu-converter/workflow/boundary-deliverables.ts](../../../../../../src/arsu-converter/workflow/boundary-deliverables.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/workflow/boundary-deliverables.ts:boundaryDeliverables -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| boundaryDeliverables | 函数 | 9–25 | 简单 | 边界产出、派生、工具函数 | 0 | 按路由声明的 output_types 生成边界产出描述符，格式化用途说明并按类型选择 text-artifact 或 binary-file-artifact 校验档位。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](../routing/contracts.ts.md) | src/arsu-converter/routing/contracts.ts | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../routing/catalog.ts.md) | src/arsu-converter/routing/catalog.ts | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| boundaryDeliverables | 函数 | 9–25 | 按路由声明的 output_types 生成边界产出描述符，格式化用途说明并按类型选择 text-artifact 或 binary-file-artifact 校验档位。 |
