
# review-workspace/revision-master.html
所属分层：[评审批注与静态工作台层](../../layers/review-workspace.md)  
所属目录：[review-workspace](../../modules/review-workspace.md)
<!-- node: file:review-workspace/revision-master.html -->

revision-master-review-workspace.v1 业务工作台模板：从内嵌的 __REVISION_MASTER_DATA__ 冻结快照读取数据，覆盖意见覆盖、整体工作板、当前策略、本轮改稿与回复四个阶段，收集处置、独立批注、内部确认、本轮已看、焦点请求与整体说明六类反馈，导出 revision-master-review-result.v1。
源码：[review-workspace/revision-master.html](../../../../review-workspace/revision-master.html)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [revision-master-prepare.ts](../src/review-workspace/revision-master-prepare.ts.md) | src/review-workspace/revision-master-prepare.ts | 准备 revision-master 独立评审工作台：只读执行包内投影命令、冻结源与图片、装配业务快照与定位关系、复核期间无变更后写出 workspace.json 与内嵌数据的 review.html。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [review-workspace.md](../docs/user/review-workspace.md.md) | docs/user/review-workspace.md | 交互式论文审阅工作台说明：区分通用 review-workspace.v2 三栏批注页面与 review-response 的 revision-master-review-workspace.v1 业务工作台，详述冻结快照、导入前渲染与 Quarto 单独同意、浏览器本地草稿与导出结果契约、按 scope 接收的交回流程，以及 v1 恢复与维护者本地预览。 |
| [revision-master-preview.ts](../harness/revision-master-preview.ts.md) | harness/revision-master-preview.ts | 用生产路径生成 revision-master 工作台的四个阶段预览页：从生产 schema 建库、写样例文件，再经只读 workbench 投影和 prepareRevisionMasterReview 输出 HTML。 |
