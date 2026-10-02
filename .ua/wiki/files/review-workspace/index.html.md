
# review-workspace/index.html
所属分层：[评审批注与静态工作台层](../../layers/review-workspace.md)  
所属目录：[review-workspace](../../modules/review-workspace.md)
<!-- node: file:review-workspace/index.html -->

review-workspace.v2 冻结文档批注工作台的完整单文件实现：在严格 CSP 下手写 schema 校验，把 Markdown/QMD/LaTeX 稿件渲染成可批注块，支持划选与整段/整图/公式/单元格批注、Agent 审阅项处置、localStorage 草稿，并导出 review-workspace-result.v2。检测到 v1 输入时拒绝导入并引导回 v1.html，两代契约不混用。
源码：[review-workspace/index.html](../../../../review-workspace/index.html)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [instructions.ts](../src/review-workspace/instructions.ts.md) | src/review-workspace/instructions.ts | 按 profile 或 capability 决定是否提供本地静态评审面：返回描述符/结果契约名、包内页面与 workbench 路径、评审阶段映射和给 Agent 的操作指引。 |
| [review-workspace-preview.ts](../harness/review-workspace-preview.ts.md) | harness/review-workspace-preview.ts | 维护者预览夹具：用手写手稿、冻结的 pandoc AST 和润色方案组装 7 个 review-workspace.v2 样例，并给静态工作台 HTML 注入一个样例下拉选择器与 base64 引导脚本。 |
| [v1.html](v1.html.md) | review-workspace/v1.html | 保留的 review-workspace.v1 论文审阅工作台：导入 v1 JSON 后按队列逐项处置审阅意见，可切换查看手稿原文或渲染视图，草稿存入 localStorage，导出 review-workspace-result.v1。它与 v2 页面并行保留，不做迁移或隐式转换。 |
