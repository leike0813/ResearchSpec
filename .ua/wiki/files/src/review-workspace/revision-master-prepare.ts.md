
# src/review-workspace/revision-master-prepare.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/review-workspace](../../../modules/src/review-workspace.md)
<!-- node: file:src/review-workspace/revision-master-prepare.ts -->

准备 revision-master 独立评审工作台：只读执行包内投影命令、冻结源与图片、装配业务快照与定位关系、复核期间无变更后写出 workspace.json 与内嵌数据的 review.html。
源码：[src/review-workspace/revision-master-prepare.ts](../../../../../src/review-workspace/revision-master-prepare.ts)

## 符号（3）
<!-- node: function:src/review-workspace/revision-master-prepare.ts:prepareRevisionMasterReview -->
<!-- node: function:src/review-workspace/revision-master-prepare.ts:readRevisionMasterProjection -->
<!-- node: function:src/review-workspace/revision-master-prepare.ts:renderRevisionMasterHtml -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| prepareRevisionMasterReview | 函数 | 41–135 | 复杂 | frozen-source、review-workspace、validation、orchestration、security | 0 | 完整装配流程：校验工作目录在 researchspec/ 之外、比对投影上下文与图交接一致、冻结源与图片、把业务表与冻结文档投影成带定位的块、补充日志片段定位，发布前再次确认候选未变化。 |
| readRevisionMasterProjection | 函数 | 18–22 | 简单 | external-tool、read-only、projection | 0 | 以只读方式运行包内 review_workbench.py 的 project 子命令并解析其 JSON 投影，禁用字节码写入，不执行 instructions 或任何 schema 修复。 |
| renderRevisionMasterHtml | 函数 | 24–30 | 简单 | rendering、security、escaping | 0 | 把工作区 JSON 注入模板的唯一内嵌数据标记，并转义 < 与行分隔符，防止用户提供的脚本闭合标签提前结束数据元素。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [prepare.ts](prepare.ts.md) | src/review-workspace/prepare.ts | 评审工作区的准备层：把源文件冻结到 researchspec/ 之外的受控目录、比对源变化、准备内嵌图片资源，并组装通过 Schema 校验的 v2 工作区。 |
| [render.ts](render.ts.md) | src/review-workspace/render.ts | 把 Markdown 源与 Pandoc JSON AST 转换为统一的评审块序列，处理行内标记、行内公式、引用、脚注、表格与图片资源映射，并在解析失败时保留可见的原始回退。 |
| [revision-master.ts](revision-master.ts.md) | src/review-workspace/revision-master.ts | revision-master 评审工作区 v1 契约：显式业务表快照、阶段作用域与其基线、文档与定位、反馈结构，以及带严格确认规则的导出结果 Schema。 |
| [v2.ts](v2.ts.md) | src/review-workspace/v2.ts | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| prepareRevisionMasterReview | 函数 | 41–135 | 完整装配流程：校验工作目录在 researchspec/ 之外、比对投影上下文与图交接一致、冻结源与图片、把业务表与冻结文档投影成带定位的块、补充日志片段定位，发布前再次确认候选未变化。 |
| readRevisionMasterProjection | 函数 | 18–22 | 以只读方式运行包内 review_workbench.py 的 project 子命令并解析其 JSON 投影，禁用字节码写入，不执行 instructions 或任何 schema 修复。 |
| renderRevisionMasterHtml | 函数 | 24–30 | 把工作区 JSON 注入模板的唯一内嵌数据标记，并转义 < 与行分隔符，防止用户提供的脚本闭合标签提前结束数据元素。 |
