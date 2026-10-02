
# review-workspace
> 目录聚合页：8 个文件、1 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [review-workspace/index.check.mjs](../files/review-workspace/index.check.mjs.md) | 文件 | 1 | v2 审阅工作台的契约自检脚本，抽取内联脚本纯函数校验 workspace/result schema、锚点挂载与拒绝路径，并在可用时用无头 Chrome 验证导入回放。 |
| [review-workspace/index.html](../files/review-workspace/index.html.md) | 文件 | 0 | review-workspace.v2 冻结文档批注工作台的完整单文件实现：在严格 CSP 下手写 schema 校验，把 Markdown/QMD/LaTeX 稿件渲染成可批注块，支持划选与整段/整图/公式/单元格批注、Agent 审阅项处置、localStorage 草稿，并导出 review-workspace-result.v2。检测到 v1 输入时拒绝导入并引导回 v1.html，两代契约不混用。 |
| [review-workspace/prototype-annotation-interaction.html](../files/review-workspace/prototype-annotation-interaction.html.md) | 文件 | 0 | 批注交互的三变体讨论原型：页边对齐、文档与批注清单、逐段聚焦三种布局通过 ?variant=A\|B\|C 或方向键切换，演示划选批注、整段批注、重叠批注选择菜单和 Agent 审阅项处置。 |
| [review-workspace/prototype-review-workbench.check.mjs](../files/review-workspace/prototype-review-workbench.check.mjs.md) | 文件 | 0 | 原型工作台的检查脚本，验证内联脚本语法可编译，并逐一断言 markdown/quarto/latex 三种格式的冻结锚点能正确挂载到文档块。 |
| [review-workspace/prototype-review-workbench.html](../files/review-workspace/prototype-review-workbench.html.md) | 文件 | 0 | 文档批注工作台的完整交互原型：内置 markdown、quarto、latex、empty 四种样稿，模拟段落/引述/公式/代码/脚注/表格单元格/图片等块类型，支持重叠高亮选择、脚注跳转、Agent 审阅项与用户批注混合筛选，并导出 prototype-review-workspace-result.v2 结果。 |
| [review-workspace/prototype-revision-master.html](../files/review-workspace/prototype-revision-master.html.md) | 文件 | 0 | 论文修订工作台的早期原型：用阶段导航呈现意见覆盖核对、五项工作板安排、当前策略与本轮改稿回复四个视图，内置虚构审稿案例与处置指标，最后以对话框收集试用反馈摘要。 |
| [review-workspace/revision-master.html](../files/review-workspace/revision-master.html.md) | 文件 | 0 | revision-master-review-workspace.v1 业务工作台模板：从内嵌的 __REVISION_MASTER_DATA__ 冻结快照读取数据，覆盖意见覆盖、整体工作板、当前策略、本轮改稿与回复四个阶段，收集处置、独立批注、内部确认、本轮已看、焦点请求与整体说明六类反馈，导出 revision-master-review-result.v1。 |
| [review-workspace/v1.html](../files/review-workspace/v1.html.md) | 文件 | 0 | 保留的 review-workspace.v1 论文审阅工作台：导入 v1 JSON 后按队列逐项处置审阅意见，可切换查看手稿原文或渲染视图，草稿存入 localStorage，导出 review-workspace-result.v1。它与 v2 页面并行保留，不做迁移或隐式转换。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/review-workspace](src/review-workspace.md) | 1 |
