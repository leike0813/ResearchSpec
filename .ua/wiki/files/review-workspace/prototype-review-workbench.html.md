
# review-workspace/prototype-review-workbench.html
所属分层：[评审批注与静态工作台层](../../layers/review-workspace.md)  
所属目录：[review-workspace](../../modules/review-workspace.md)
<!-- node: file:review-workspace/prototype-review-workbench.html -->

文档批注工作台的完整交互原型：内置 markdown、quarto、latex、empty 四种样稿，模拟段落/引述/公式/代码/脚注/表格单元格/图片等块类型，支持重叠高亮选择、脚注跳转、Agent 审阅项与用户批注混合筛选，并导出 prototype-review-workspace-result.v2 结果。
源码：[review-workspace/prototype-review-workbench.html](../../../../review-workspace/prototype-review-workbench.html)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.html](index.html.md) | review-workspace/index.html | review-workspace.v2 冻结文档批注工作台的完整单文件实现：在严格 CSP 下手写 schema 校验，把 Markdown/QMD/LaTeX 稿件渲染成可批注块，支持划选与整段/整图/公式/单元格批注、Agent 审阅项处置、localStorage 草稿，并导出 review-workspace-result.v2。检测到 v1 输入时拒绝导入并引导回 v1.html，两代契约不混用。 |
