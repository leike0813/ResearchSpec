
# 评审批注与静态工作台层

可选的交互式稿件评审工作台：冻结文档准备、静态 HTML/工作台投影、revision-master 工作台与批注导入的来源解释、差异与会话管理，全程只读。
> 本页由知识图谱分层 `layer:review-workspace` 生成，共 27 个文件级节点。

## 目录分布

| 目录 | 文件数 |
| --- | --- |
| [src/review-workspace](../modules/src/review-workspace.md) | 11 |
| [review-workspace](../modules/review-workspace.md) | 8 |
| [src/annotation-intake](../modules/src/annotation-intake.md) | 8 |

## 文件清单

| 文件 | 类型 | 语言 | 摘要 |
| --- | --- | --- | --- |
| [review-workspace/index.check.mjs](../files/review-workspace/index.check.mjs.md) | 文件 | — | v2 审阅工作台的契约自检脚本，抽取内联脚本纯函数校验 workspace/result schema、锚点挂载与拒绝路径，并在可用时用无头 Chrome 验证导入回放。 |
| [review-workspace/index.html](../files/review-workspace/index.html.md) | 文件 | — | review-workspace.v2 冻结文档批注工作台的完整单文件实现：在严格 CSP 下手写 schema 校验，把 Markdown/QMD/LaTeX 稿件渲染成可批注块，支持划选与整段/整图/公式/单元格批注、Agent 审阅项处置、localStorage 草稿，并导出 review-workspace-result.v2。检测到 v1 输入时拒绝导入并引导回 v1.html，两代契约不混用。 |
| [review-workspace/prototype-annotation-interaction.html](../files/review-workspace/prototype-annotation-interaction.html.md) | 文件 | — | 批注交互的三变体讨论原型：页边对齐、文档与批注清单、逐段聚焦三种布局通过 ?variant=A\|B\|C 或方向键切换，演示划选批注、整段批注、重叠批注选择菜单和 Agent 审阅项处置。 |
| [review-workspace/prototype-review-workbench.check.mjs](../files/review-workspace/prototype-review-workbench.check.mjs.md) | 文件 | — | 原型工作台的检查脚本，验证内联脚本语法可编译，并逐一断言 markdown/quarto/latex 三种格式的冻结锚点能正确挂载到文档块。 |
| [review-workspace/prototype-review-workbench.html](../files/review-workspace/prototype-review-workbench.html.md) | 文件 | — | 文档批注工作台的完整交互原型：内置 markdown、quarto、latex、empty 四种样稿，模拟段落/引述/公式/代码/脚注/表格单元格/图片等块类型，支持重叠高亮选择、脚注跳转、Agent 审阅项与用户批注混合筛选，并导出 prototype-review-workspace-result.v2 结果。 |
| [review-workspace/prototype-revision-master.html](../files/review-workspace/prototype-revision-master.html.md) | 文件 | — | 论文修订工作台的早期原型：用阶段导航呈现意见覆盖核对、五项工作板安排、当前策略与本轮改稿回复四个视图，内置虚构审稿案例与处置指标，最后以对话框收集试用反馈摘要。 |
| [review-workspace/revision-master.html](../files/review-workspace/revision-master.html.md) | 文件 | — | revision-master-review-workspace.v1 业务工作台模板：从内嵌的 __REVISION_MASTER_DATA__ 冻结快照读取数据，覆盖意见覆盖、整体工作板、当前策略、本轮改稿与回复四个阶段，收集处置、独立批注、内部确认、本轮已看、焦点请求与整体说明六类反馈，导出 revision-master-review-result.v1。 |
| [review-workspace/v1.html](../files/review-workspace/v1.html.md) | 文件 | — | 保留的 review-workspace.v1 论文审阅工作台：导入 v1 JSON 后按队列逐项处置审阅意见，可切换查看手稿原文或渲染视图，草稿存入 localStorage，导出 review-workspace-result.v1。它与 v2 页面并行保留，不做迁移或隐式转换。 |
| [src/annotation-intake/contracts.ts](../files/src/annotation-intake/contracts.ts.md) | 文件 | — | 批注接收链路的全部 zod 契约：会话、生成审阅副本、Review Delta、解释草稿、诊断与计划写入，同时导出对应 TS 类型。 |
| [src/annotation-intake/index.ts](../files/src/annotation-intake/index.ts.md) | 文件 | — | annotation-intake 模块的 barrel 文件，重新导出 contracts、interpretation、paths、review-copy、review-delta、session 与 sources 七个契约模块。 |
| [src/annotation-intake/interpretation.ts](../files/src/annotation-intake/interpretation.ts.md) | 文件 | — | 校验 Agent 提交的批注解释草稿：比对稿件、审阅副本与 Review Delta 的哈希、原始来源字节和批注目标，任何阻塞诊断都会让候选集物化失败。 |
| [src/annotation-intake/paths.ts](../files/src/annotation-intake/paths.ts.md) | 文件 | — | 为一次批注接收会话推导全部私有工作文件路径，并在注解集 ID 不安全时直接拒绝。 |
| [src/annotation-intake/review-copy.ts](../files/src/annotation-intake/review-copy.ts.md) | 文件 | — | 按 section/block/none 密度在原稿上生成带批注槽位的审阅副本，并可反向移除所有未被改动的槽位，使副本无损还原原文。 |
| [src/annotation-intake/review-delta.ts](../files/src/annotation-intake/review-delta.ts.md) | 文件 | — | 在原稿、槽位模板与用户改后的审阅副本之间推导块级 Review Delta，标出新增、修改、缺失与无法定位的整段差异。 |
| [src/annotation-intake/session.ts](../files/src/annotation-intake/session.ts.md) | 文件 | — | 批注接收会话的状态机：创建会话、附加 Review Delta 与外部来源、登记解释草稿，并把每一步整理成待写入私有工作目录的计划写入。 |
| [src/annotation-intake/sources.ts](../files/src/annotation-intake/sources.ts.md) | 文件 | — | 把审阅副本、反馈文件和对话消息捕获为内容寻址的原始来源记录，并给出 create_only 形式的写入计划。 |
| [src/review-workspace/adapters.ts](../files/src/review-workspace/adapters.ts.md) | 文件 | — | 把标注候选、论文人性化计划与审稿回复工作板投影成评审工作区描述与 v2 工作区，是业务语义与浏览器静态评审面之间的适配层。 |
| [src/review-workspace/contracts.ts](../files/src/review-workspace/contracts.ts.md) | 文件 | — | review-workspace v1 契约的 Zod 定义：适配器枚举、稿件、目标锚点、条目、描述与导出结果，并要求结果覆盖每个条目且源哈希一致。 |
| [src/review-workspace/handoff.ts](../files/src/review-workspace/handoff.ts.md) | 文件 | — | 校验浏览器导出的评审结果并把归属 Agent 必须澄清的问题分类为源已变更、需定位或可直接采纳三种状态。 |
| [src/review-workspace/host.ts](../files/src/review-workspace/host.ts.md) | 文件 | — | 通过宿主机 Pandoc 解析已渲染 HTML 与 LaTeX 源码为评审块，不执行任何项目 hook；LaTeX 路径会把无法确定的命令与环境显式记为回退说明。 |
| [src/review-workspace/index.ts](../files/src/review-workspace/index.ts.md) | 文件 | — | 评审工作区模块的 barrel 出口，再导出 contracts、v2 契约、prepare/render 投影、host 适配、handoff 与 revision-master 相关实现。 |
| [src/review-workspace/instructions.ts](../files/src/review-workspace/instructions.ts.md) | 文件 | — | 按 profile 或 capability 决定是否提供本地静态评审面：返回描述符/结果契约名、包内页面与 workbench 路径、评审阶段映射和给 Agent 的操作指引。 |
| [src/review-workspace/prepare.ts](../files/src/review-workspace/prepare.ts.md) | 文件 | — | 评审工作区的准备层：把源文件冻结到 researchspec/ 之外的受控目录、比对源变化、准备内嵌图片资源，并组装通过 Schema 校验的 v2 工作区。 |
| [src/review-workspace/render.ts](../files/src/review-workspace/render.ts.md) | 文件 | — | 把 Markdown 源与 Pandoc JSON AST 转换为统一的评审块序列，处理行内标记、行内公式、引用、脚注、表格与图片资源映射，并在解析失败时保留可见的原始回退。 |
| [src/review-workspace/revision-master-prepare.ts](../files/src/review-workspace/revision-master-prepare.ts.md) | 文件 | — | 准备 revision-master 独立评审工作台：只读执行包内投影命令、冻结源与图片、装配业务快照与定位关系、复核期间无变更后写出 workspace.json 与内嵌数据的 review.html。 |
| [src/review-workspace/revision-master.ts](../files/src/review-workspace/revision-master.ts.md) | 文件 | — | revision-master 评审工作区 v1 契约：显式业务表快照、阶段作用域与其基线、文档与定位、反馈结构，以及带严格确认规则的导出结果 Schema。 |
| [src/review-workspace/v2.ts](../files/src/review-workspace/v2.ts.md) | 文件 | — | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |

## 对其它分层的依赖

| 目标分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [核心契约与工作流运行时](core.md) | 6 | imports×6 |
| [ARSU 转换与 Skill 生成层](arsu-converter.md) | 2 | imports×2 |

## 被其它分层依赖

| 来源分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [测试与验收夹具层](tests.md) | 3 | imports×3 |
| [能力与插件目录层](capability-registry.md) | 1 | imports×1 |
| [CLI 命令入口层](cli.md) | 1 | imports×1 |
