
# src/review-workspace/host.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/review-workspace](../../../modules/src/review-workspace.md)
<!-- node: file:src/review-workspace/host.ts -->

通过宿主机 Pandoc 解析已渲染 HTML 与 LaTeX 源码为评审块，不执行任何项目 hook；LaTeX 路径会把无法确定的命令与环境显式记为回退说明。
源码：[src/review-workspace/host.ts](../../../../../src/review-workspace/host.ts)

## 符号（2）
<!-- node: function:src/review-workspace/host.ts:reviewBlocksFromHostHtml -->
<!-- node: function:src/review-workspace/host.ts:reviewBlocksFromHostLatex -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| reviewBlocksFromHostHtml | 函数 | 10–18 | 简单 | adapter、rendering、external-tool | 0 | 调用宿主 pandoc 把既有 HTML 归一化为评审块，沿用共享的 Pandoc AST 转换逻辑。 |
| reviewBlocksFromHostLatex | 函数 | 21–40 | 中等 | adapter、rendering、validation、external-tool | 0 | 用 pandoc 解析 LaTeX 生成评审块，并逐行扫描未知命令与未知环境，把转换不确定的行追加为可核查的原始回退。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [render.ts](render.ts.md) | src/review-workspace/render.ts | 把 Markdown 源与 Pandoc JSON AST 转换为统一的评审块序列，处理行内标记、行内公式、引用、脚注、表格与图片资源映射，并在解析失败时保留可见的原始回退。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| reviewBlocksFromHostHtml | 函数 | 10–18 | 调用宿主 pandoc 把既有 HTML 归一化为评审块，沿用共享的 Pandoc AST 转换逻辑。 |
| reviewBlocksFromHostLatex | 函数 | 21–40 | 用 pandoc 解析 LaTeX 生成评审块，并逐行扫描未知命令与未知环境，把转换不确定的行追加为可核查的原始回退。 |
