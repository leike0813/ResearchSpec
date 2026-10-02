
# src/review-workspace
> 目录聚合页：11 个文件、34 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/review-workspace/adapters.ts](../../files/src/review-workspace/adapters.ts.md) | 文件 | 10 | 把标注候选、论文人性化计划与审稿回复工作板投影成评审工作区描述与 v2 工作区，是业务语义与浏览器静态评审面之间的适配层。 |
| [src/review-workspace/contracts.ts](../../files/src/review-workspace/contracts.ts.md) | 文件 | 0 | review-workspace v1 契约的 Zod 定义：适配器枚举、稿件、目标锚点、条目、描述与导出结果，并要求结果覆盖每个条目且源哈希一致。 |
| [src/review-workspace/handoff.ts](../../files/src/review-workspace/handoff.ts.md) | 文件 | 1 | 校验浏览器导出的评审结果并把归属 Agent 必须澄清的问题分类为源已变更、需定位或可直接采纳三种状态。 |
| [src/review-workspace/host.ts](../../files/src/review-workspace/host.ts.md) | 文件 | 2 | 通过宿主机 Pandoc 解析已渲染 HTML 与 LaTeX 源码为评审块，不执行任何项目 hook；LaTeX 路径会把无法确定的命令与环境显式记为回退说明。 |
| [src/review-workspace/index.ts](../../files/src/review-workspace/index.ts.md) | 文件 | 0 | 评审工作区模块的 barrel 出口，再导出 contracts、v2 契约、prepare/render 投影、host 适配、handoff 与 revision-master 相关实现。 |
| [src/review-workspace/instructions.ts](../../files/src/review-workspace/instructions.ts.md) | 文件 | 1 | 按 profile 或 capability 决定是否提供本地静态评审面：返回描述符/结果契约名、包内页面与 workbench 路径、评审阶段映射和给 Agent 的操作指引。 |
| [src/review-workspace/prepare.ts](../../files/src/review-workspace/prepare.ts.md) | 文件 | 6 | 评审工作区的准备层：把源文件冻结到 researchspec/ 之外的受控目录、比对源变化、准备内嵌图片资源，并组装通过 Schema 校验的 v2 工作区。 |
| [src/review-workspace/render.ts](../../files/src/review-workspace/render.ts.md) | 文件 | 6 | 把 Markdown 源与 Pandoc JSON AST 转换为统一的评审块序列，处理行内标记、行内公式、引用、脚注、表格与图片资源映射，并在解析失败时保留可见的原始回退。 |
| [src/review-workspace/revision-master-prepare.ts](../../files/src/review-workspace/revision-master-prepare.ts.md) | 文件 | 3 | 准备 revision-master 独立评审工作台：只读执行包内投影命令、冻结源与图片、装配业务快照与定位关系、复核期间无变更后写出 workspace.json 与内嵌数据的 review.html。 |
| [src/review-workspace/revision-master.ts](../../files/src/review-workspace/revision-master.ts.md) | 文件 | 3 | revision-master 评审工作区 v1 契约：显式业务表快照、阶段作用域与其基线、文档与定位、反馈结构，以及带严格确认规则的导出结果 Schema。 |
| [src/review-workspace/v2.ts](../../files/src/review-workspace/v2.ts.md) | 文件 | 2 | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/contracts](core/contracts.md) | 1 |
| [src/core/workspace](core/workspace.md) | 1 |
