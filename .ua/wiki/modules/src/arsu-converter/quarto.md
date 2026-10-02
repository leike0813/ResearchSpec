
# src/arsu-converter/quarto
> 目录聚合页：3 个文件、9 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/quarto/delivery.ts](../../../files/src/arsu-converter/quarto/delivery.ts.md) | 文件 | 5 | Quarto 交付层：探测本机 Quarto 可用性，并把单个 .qmd 渲染结果以「临时暂存 + 硬链接」方式原子落地；默认禁用代码执行，执行需独立人工同意记录。 |
| [src/arsu-converter/quarto/index.ts](../../../files/src/arsu-converter/quarto/index.ts.md) | 文件 | 0 | Quarto 交付子系统的 barrel 出口，re-export 探测、单文件渲染、命令执行与相关类型。 |
| [src/arsu-converter/quarto/render-quarto.mjs](../../../files/src/arsu-converter/quarto/render-quarto.mjs.md) | 文件 | 4 | Quarto 渲染辅助脚本：校验源文件、目标路径与输出格式后在临时目录调用 quarto render，原子落盘并返回结构化结果。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/contracts](../core/contracts.md) | 1 |
