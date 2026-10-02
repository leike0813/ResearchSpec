
# src/review-workspace/index.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/review-workspace](../../../modules/src/review-workspace.md)
<!-- node: file:src/review-workspace/index.ts -->

评审工作区模块的 barrel 出口，再导出 contracts、v2 契约、prepare/render 投影、host 适配、handoff 与 revision-master 相关实现。
源码：[src/review-workspace/index.ts](../../../../../src/review-workspace/index.ts)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.ts](adapters.ts.md) | src/review-workspace/adapters.ts | 把标注候选、论文人性化计划与审稿回复工作板投影成评审工作区描述与 v2 工作区，是业务语义与浏览器静态评审面之间的适配层。 |
| [contracts.ts](contracts.ts.md) | src/review-workspace/contracts.ts | review-workspace v1 契约的 Zod 定义：适配器枚举、稿件、目标锚点、条目、描述与导出结果，并要求结果覆盖每个条目且源哈希一致。 |
| [handoff.ts](handoff.ts.md) | src/review-workspace/handoff.ts | 校验浏览器导出的评审结果并把归属 Agent 必须澄清的问题分类为源已变更、需定位或可直接采纳三种状态。 |
| [host.ts](host.ts.md) | src/review-workspace/host.ts | 通过宿主机 Pandoc 解析已渲染 HTML 与 LaTeX 源码为评审块，不执行任何项目 hook；LaTeX 路径会把无法确定的命令与环境显式记为回退说明。 |
| [instructions.ts](instructions.ts.md) | src/review-workspace/instructions.ts | 按 profile 或 capability 决定是否提供本地静态评审面：返回描述符/结果契约名、包内页面与 workbench 路径、评审阶段映射和给 Agent 的操作指引。 |
| [prepare.ts](prepare.ts.md) | src/review-workspace/prepare.ts | 评审工作区的准备层：把源文件冻结到 researchspec/ 之外的受控目录、比对源变化、准备内嵌图片资源，并组装通过 Schema 校验的 v2 工作区。 |
| [render.ts](render.ts.md) | src/review-workspace/render.ts | 把 Markdown 源与 Pandoc JSON AST 转换为统一的评审块序列，处理行内标记、行内公式、引用、脚注、表格与图片资源映射，并在解析失败时保留可见的原始回退。 |
| [revision-master-prepare.ts](revision-master-prepare.ts.md) | src/review-workspace/revision-master-prepare.ts | 准备 revision-master 独立评审工作台：只读执行包内投影命令、冻结源与图片、装配业务快照与定位关系、复核期间无变更后写出 workspace.json 与内嵌数据的 review.html。 |
| [revision-master.ts](revision-master.ts.md) | src/review-workspace/revision-master.ts | revision-master 评审工作区 v1 契约：显式业务表快照、阶段作用域与其基线、文档与定位、反馈结构，以及带严格确认规则的导出结果 Schema。 |
| [v2.ts](v2.ts.md) | src/review-workspace/v2.ts | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |
