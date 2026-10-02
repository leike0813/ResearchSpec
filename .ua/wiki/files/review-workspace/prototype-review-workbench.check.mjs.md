
# review-workspace/prototype-review-workbench.check.mjs
所属分层：[评审批注与静态工作台层](../../layers/review-workspace.md)  
所属目录：[review-workspace](../../modules/review-workspace.md)
<!-- node: file:review-workspace/prototype-review-workbench.check.mjs -->

原型工作台的检查脚本，验证内联脚本语法可编译，并逐一断言 markdown/quarto/latex 三种格式的冻结锚点能正确挂载到文档块。
源码：[review-workspace/prototype-review-workbench.check.mjs](../../../../review-workspace/prototype-review-workbench.check.mjs)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [prototype-review-workbench.html](prototype-review-workbench.html.md) | review-workspace/prototype-review-workbench.html | 文档批注工作台的完整交互原型：内置 markdown、quarto、latex、empty 四种样稿，模拟段落/引述/公式/代码/脚注/表格单元格/图片等块类型，支持重叠高亮选择、脚注跳转、Agent 审阅项与用户批注混合筛选，并导出 prototype-review-workspace-result.v2 结果。 |
