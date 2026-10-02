
# scripts/generate-arsu-graph-match-assessment-html.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/generate-arsu-graph-match-assessment-html.mjs -->

graph 匹配评估页生成器：把上游 mode 文档锚点与 ResearchSpec graph 能力逐段对照，输出每个 mode 的匹配度、上下文片段与可选文档判定。
源码：[scripts/generate-arsu-graph-match-assessment-html.mjs](../../../../scripts/generate-arsu-graph-match-assessment-html.mjs)

## 符号（2）
<!-- node: function:scripts/generate-arsu-graph-match-assessment-html.mjs:anchorRows -->
<!-- node: function:scripts/generate-arsu-graph-match-assessment-html.mjs:modeSection -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| anchorRows | 函数 | 328–340 | 简单 | html-渲染、锚点、匹配评估 | 0 | 把某个 mode 的上游锚点渲染为表格行，标注是否在 graph 能力中获得匹配。 |
| modeSection | 函数 | 342–368 | 中等 | html-渲染、评估区块、arsu | 0 | 输出单个 mode 的完整评估区块：文档行、锚点行、上下文片段与总体结论。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [generate-arsu-capability-review-html.mjs](generate-arsu-capability-review-html.mjs.md) | scripts/generate-arsu-capability-review-html.mjs | ARSU 模式能力审阅 HTML 生成器：枚举 vendor/ars 的 SKILL、agent、reference、template 文档与转换后的能力包，按 mode 生成可折叠审阅页面。 |
