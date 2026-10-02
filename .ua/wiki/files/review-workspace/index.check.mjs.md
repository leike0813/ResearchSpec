
# review-workspace/index.check.mjs
所属分层：[评审批注与静态工作台层](../../layers/review-workspace.md)  
所属目录：[review-workspace](../../modules/review-workspace.md)
<!-- node: file:review-workspace/index.check.mjs -->

v2 审阅工作台的契约自检脚本，抽取内联脚本纯函数校验 workspace/result schema、锚点挂载与拒绝路径，并在可用时用无头 Chrome 验证导入回放。
源码：[review-workspace/index.check.mjs](../../../../review-workspace/index.check.mjs)

## 符号（1）
<!-- node: function:review-workspace/index.check.mjs:dumpWithImport -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| dumpWithImport | 函数 | 191–229 | 中等 | test、无头浏览器、端到端、临时目录 | 0 | 在临时目录中用无头 Chrome 打开审阅页、执行文件导入并抓取控制台与导出结果，用于端到端回放验证。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [v1.html](v1.html.md) | review-workspace/v1.html | 保留的 review-workspace.v1 论文审阅工作台：导入 v1 JSON 后按队列逐项处置审阅意见，可切换查看手稿原文或渲染视图，草稿存入 localStorage，导出 review-workspace-result.v1。它与 v2 页面并行保留，不做迁移或隐式转换。 |
