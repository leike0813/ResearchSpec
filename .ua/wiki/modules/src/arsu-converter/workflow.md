
# src/arsu-converter/workflow
> 目录聚合页：3 个文件、4 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/workflow/boundary-deliverables.ts](../../../files/src/arsu-converter/workflow/boundary-deliverables.ts.md) | 文件 | 1 | 从路由声明的 output_types 派生边界产出描述符：生成 role/type、用途说明、结构约束，并按类型区分 text-artifact 与 binary-file-artifact 两种校验档位。 |
| [src/arsu-converter/workflow/catalog.ts](../../../files/src/arsu-converter/workflow/catalog.ts.md) | 文件 | 1 | ARSU 工作流目录的导入门禁：导出 validateArsuWorkflowCatalog 包装路由目录校验，并在模块加载时立即执行，目录一旦非法就抛出带 issue 明细的错误。 |
| [src/arsu-converter/workflow/generate.ts](../../../files/src/arsu-converter/workflow/generate.ts.md) | 文件 | 2 | 预设图谱生成器：把 converter 内置的 authored 图谱投影为工作区 profiles/ 目录下的 YAML 文件与 registry.json，并按投影内容计算 SHA-256。 |

## 子目录
- [graph-profiles](workflow/graph-profiles.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/arsu-converter/routing](routing.md) | 3 |
| [src/arsu-converter](../arsu-converter.md) | 1 |
| [src/arsu-converter/workflow/graph-profiles](workflow/graph-profiles.md) | 1 |
| [src/graph-profiles](../graph-profiles.md) | 1 |
