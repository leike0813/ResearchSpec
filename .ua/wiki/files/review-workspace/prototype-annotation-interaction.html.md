
# review-workspace/prototype-annotation-interaction.html
所属分层：[评审批注与静态工作台层](../../layers/review-workspace.md)  
所属目录：[review-workspace](../../modules/review-workspace.md)
<!-- node: file:review-workspace/prototype-annotation-interaction.html -->

批注交互的三变体讨论原型：页边对齐、文档与批注清单、逐段聚焦三种布局通过 ?variant=A|B|C 或方向键切换，演示划选批注、整段批注、重叠批注选择菜单和 Agent 审阅项处置。
源码：[review-workspace/prototype-annotation-interaction.html](../../../../review-workspace/prototype-annotation-interaction.html)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.html](index.html.md) | review-workspace/index.html | review-workspace.v2 冻结文档批注工作台的完整单文件实现：在严格 CSP 下手写 schema 校验，把 Markdown/QMD/LaTeX 稿件渲染成可批注块，支持划选与整段/整图/公式/单元格批注、Agent 审阅项处置、localStorage 草稿，并导出 review-workspace-result.v2。检测到 v1 输入时拒绝导入并引导回 v1.html，两代契约不混用。 |
