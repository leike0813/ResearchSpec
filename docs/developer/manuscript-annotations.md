# 稿件批注 Intake Adapter

## 1. 定位

Annotation intake 是 `researchspec/` 外的普通工作材料。建议保存在明确的项目路径：

```text
work/annotation-intake/<session-id>/
```

它把原稿、自由格式反馈、机械 block delta、Agent interpretation 和 revision patch mapping 分开保存，
但不拥有 Gate、Decision、node lifecycle 或稿件版本。

## 2. 数据分层

- Raw source 保存用户实际提供的反馈或审阅文件，不补写缺失内容。
- Review copy 可加入便于人类批注的提示，但提示不是解析语法。
- Mechanical delta 只记录可确定的 block change。
- Normalized interpretation 保存 stable annotation ID、解释、歧义和所需澄清。
- Patch mapping 将 annotation IDs 映射到 ARSU revision patch operations。

Raw observation、normalized interpretation 和最终学术判断必须明确分开。模糊或高影响批注在用户
确认前保持 pending。

## 3. 跨边界使用

另一个 run 需要消费 annotation set 时，Agent 在 producing run handoff 中记录 role、type、path、
purpose 和 consumer。Working directory 本身不会自动成为接口。

## 4. Headless API

公开 `researchspec/annotation-intake` export 接受显式 source/destination paths，生成 review copy、
机械 delta 或 normalized candidate，并返回结构化 diagnostics。API 不加载 workspace runtime state，
也不推进 graph。输入无效、source drift、path escape 或 mapping 缺失时不写 completed output。

## 5. Revision helper

ARSU revision patch 是唯一稿件 patch contract。Stateless helper 在写 destination 前校验全部 block、
old hash 和 annotation mapping。Mechanical application 成功不等于 revision completeness；formal
verdict 仍由 Verify、用户和 owning node 完成。

## 6. 交互式审阅投影

`researchspec/review-workspace` 提供两套独立契约，不互相转换：

- 通用 `review-workspace.v2` / `review-workspace-result.v2`，含 annotation-intake、paper-humanizer
  和 review-response workboard 薄适配器。适配器保留各自证据：annotation candidate 保留 raw
  evidence、typed target、interpretation、expected action 和 semantic impact；paper-humanizer
  plan 保留 finding IDs、locators、operation、preservation constraints、risk、recommendation 和
  disposition；workboard 保留 comment ID、source pointer、target locations、priority、evidence gap、
  confirmation need 和 next action。
- review-response 的独立业务契约 `revision-master-review-workspace.v1` /
  `revision-master-review-result.v1`，承载覆盖、整板、当前策略和轮次改稿/回复四个交接点，以及范围内
  显式内部确认、round seen、处理记录和完整交回闭环。

`researchspec/review-workspace` 导出业务准备与校验 API：`prepareRevisionMasterReview` 组装并冻结
快照、写出工作区与嵌入式 HTML；`validateRevisionMasterResult` 按独立留存件校验结果；
`RevisionMasterWorkspaceSchema` 与 `RevisionMasterResultSchema` 定义两套严格 schema。包内
`workbench/review_workbench.py` 提供 `project`、`check`、`accept` 三个标准库子命令（用法见包内
`workbench/README.md`）：`project` 做任务边界的只读投影，`check` 重算各 scope 基线差异，
`accept` 只在显式语义写入路径内把已核对反馈与最小处理记录放进同一事务。

两套投影都包含精确手稿内容、路径、格式和 SHA-256，以便一个通过 `file://` 打开的静态页面完成本地
审阅。页面只产生普通外部结果文件。它不读取或写入 `researchspec/`，不访问 `revision-master.db`，
不修改手稿，也不调用 CLI。

## 7. 显示坐标与源码坐标

显示位置与原始证据目标是两个身份。显示区块 ID 来自本次冻结显示文档；选区锚点只指向这些显示区块，
不声称是源码 offset。原始审阅文档的 source span 单独保存文档身份、offset 和原文引文，稿件位置则
保存其冻结显示身份与内容哈希。一个业务对象可以有多个显示位置，关系边显式保存，页面据此显示全部
相关位置而不把单一定位当作唯一事实。无法可靠定位的条目保留为未定位且可审阅，不编造位置，也不把
显示高亮反推成业务真相。

Agent 接收结果后必须重新校验 source hash 与独立留存件，映射回原生事实源，再从当前 `instructions`
完成合法的 Gate、Decision 或 node 动作。Markdown/QMD 只通过 DOM text nodes 做有限安全渲染；原始
HTML 不执行。plain 和 LaTeX 可以源文本展示；业务工作台的目录同时提供已捕获的相关项目源文件。
浏览器不编译项目。
`review-workspace.v1` 及其结果仍按其原路径与身份规则处理，不与 v2 或 revision-master 契约混用。
