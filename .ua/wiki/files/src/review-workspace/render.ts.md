
# src/review-workspace/render.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/review-workspace](../../../modules/src/review-workspace.md)
<!-- node: file:src/review-workspace/render.ts -->

把 Markdown 源与 Pandoc JSON AST 转换为统一的评审块序列，处理行内标记、行内公式、引用、脚注、表格与图片资源映射，并在解析失败时保留可见的原始回退。
源码：[src/review-workspace/render.ts](../../../../../src/review-workspace/render.ts)

## 符号（6）
<!-- node: function:src/review-workspace/render.ts:emitPieces -->
<!-- node: function:src/review-workspace/render.ts:markdownInline -->
<!-- node: function:src/review-workspace/render.ts:pandocInline -->
<!-- node: function:src/review-workspace/render.ts:reviewBlocksFromMarkdown -->
<!-- node: function:src/review-workspace/render.ts:reviewBlocksFromPandocAst -->
<!-- node: function:src/review-workspace/render.ts:splitCitations -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| emitPieces | 函数 | 16–34 | 简单 | rendering、parsing、review-block | 0 | 把行内片段聚合为带 runs 标记的块，在公式、图片、引用等独立块前先冲刷累积文本；未捕获的图片降级为带回退说明的原始块。 |
| markdownInline | 函数 | 49–63 | 简单 | parsing、markdown、rendering | 0 | 把 markdown-it 行内 token 栈转换成片段列表，维护强调、代码与链接标记栈，并派发图片与公式片段。 |
| pandocInline | 函数 | 107–138 | 中等 | parsing、rendering、recursive | 0 | 递归遍历 Pandoc AST 行内节点，识别 Str、Math、Span 数学、Image、Cite、Note 与强调/链接节点，并收集脚注文本。 |
| [reviewBlocksFromMarkdown](../../../symbols/src/review-workspace/render.ts/reviewBlocksFromMarkdown.md) | 函数 | 79–101 | 中等 | rendering、parsing、entry-point、markdown | 2 | 解析整篇 Markdown：先摘出脚注定义，再按块级公式切分，逐 token 产出标题、段落、表格单元格、代码块与脚注块；解析不出内容时回退为整篇原始块。 |
| reviewBlocksFromPandocAst | 函数 | 140–160 | 中等 | rendering、parsing、entry-point | 0 | 遍历 Pandoc JSON 的块级 AST 生成评审块，表格内段落降级为单元格类型，RawBlock 与调用方提供的回退以 raw-source 呈现；无可见块时抛错。 |
| splitCitations | 函数 | 36–47 | 简单 | parsing、citations、review-block | 0 | 按 pandoc 引用语法把文本切分为普通片段与引用块，并保留引用键。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [v2.ts](v2.ts.md) | src/review-workspace/v2.ts | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [host.ts](host.ts.md) | src/review-workspace/host.ts | 通过宿主机 Pandoc 解析已渲染 HTML 与 LaTeX 源码为评审块，不执行任何项目 hook；LaTeX 路径会把无法确定的命令与环境显式记为回退说明。 |
| [revision-master-prepare.ts](revision-master-prepare.ts.md) | src/review-workspace/revision-master-prepare.ts | 准备 revision-master 独立评审工作台：只读执行包内投影命令、冻结源与图片、装配业务快照与定位关系、复核期间无变更后写出 workspace.json 与内嵌数据的 review.html。 |
| [revision-master.ts](../../tests/helpers/revision-master.ts.md) | tests/helpers/revision-master.ts | revision-master 测试夹具：读取包内 Schema 的建表 DDL，并构造一个覆盖评语、线索、作用域、阻塞与策略卡的工作区样本。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [reviewBlocksFromMarkdown](../../../symbols/src/review-workspace/render.ts/reviewBlocksFromMarkdown.md) | 函数 | 79–101 | 解析整篇 Markdown：先摘出脚注定义，再按块级公式切分，逐 token 产出标题、段落、表格单元格、代码块与脚注块；解析不出内容时回退为整篇原始块。 |
| reviewBlocksFromPandocAst | 函数 | 140–160 | 遍历 Pandoc JSON 的块级 AST 生成评审块，表格内段落降级为单元格类型，RawBlock 与调用方提供的回退以 raw-source 呈现；无可见块时抛错。 |
