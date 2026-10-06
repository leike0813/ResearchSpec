# Own Vendor Anchor Semantic Review — revision-master @ snapshot-13e69610

## 审阅范围

- `vendor/revision-master` 上游 48 tracked blobs（SKILL、6 stage references、4 workflow references、8 scripts、schema/localization/templates）。
- 45 个 extraction artifacts。
- 5 个 capability packages 与 `review-response` graph profile。

## 逐项语义判定

| 上游语义 | 转换后承载 | 判定 | 证据 |
|---|---|---|---|
| Stage 1 入口解析 / 语言确认 / workspace 初始化 | `design-review-response-intake` | preserved | RM-CAP-01 -> intake procedure |
| Stage 2 原稿结构、claims、高风险修改区 | `analysis-review-response-manuscript-analysis` | preserved | RM-CAP-02 -> analysis procedure |
| Stage 3 raw threads / atomic comments / coverage 阈值 | `transform-review-response-comment-atomization` + comment-coverage Gate | adapted | RM-CAP-03 -> atomization procedure；graph Gate 承接用户确认 |
| Stage 4 workboard planning / confirmation | `design-review-response-workboard-planning` + strategy Gate | adapted | RM-CAP-04 -> workboard procedure；graph Gate 承接用户确认 |
| Stage 5 逐条策略与执行 + Stage 6 终审导出 | `generation-review-response-round` | adapted | 两个阶段合并为一个 repeatable round capability，由 graph revision template 配对 |
| `gate_and_render_workspace.py` 状态机 | package-local SQLite 校验/渲染工具 | adapted | RM-SCRIPT-03/04/05 与模板资产打包进 capability；不再选择下一 stage |
| continue/complete 循环 | `review-response-outcome` Decision | preserved | graph revision_round_template 用 `round`/`outcome` 配对 |

## 流程权威检查

- [x] capability SKILL 无 next-node / next-phase / agent-team orchestration。
- [x] stage 顺序、五个 Gate、revision Decision 全部由 `review-response` graph profile 承接。
- [x] 打包 `.py` 资产已剥离提取头，可作为普通 Python 工具执行。

## 风险与遗留

- Stage 5 与 Stage 6 合并进一个 round capability；节点 procedure 较长，但流程权威不泄漏到 SKILL。若未来需要更细粒度节点，应先扩展 graph template 能力。

## 按需激活复核（2026-09-14）

- 范围：5 个 review-response capability。逐包程序正文、输入输出、knowledge、validator、安全边界和 profile 保持原审阅结论；本轮语义变化只把固定 graph 完成动作改为服从 activation packet。
- Standalone packet 只允许返回 researchspec/ 外的普通输出路径，禁止 run、node、handoff、Gate、Decision、override 和 transition 写入；graph packet 才提供 owning handoff 与精确 advance selector。
- 生成路径与静态受审树均已核对；全库 47/47 core 与 332/332 extension 包含 mode-neutral Completion，旧 advance node:<run>/<node> Completion 为 0。该适配保留既有领域步骤和证据义务，未引入新的流程权威。

## 交互审阅工作区复核（2026-09-23）

- `design-review-response-workboard-planning` 与 `generation-review-response-round` 各自携带同一份 `review-workspace/index.html`；intake、manuscript-analysis 与 comment-atomization 包不携带该资产。
- workboard/round procedure 把既有 atomic comment、target、priority 与 evidence 投影成 `review-workspace.v1`，只消费用户显式导出的 `review-workspace-result.v1`；共享契约校验稿件 SHA-256、item 唯一性与 disposition 完整覆盖。
- 静态页面只在浏览器本地保存草稿并导出 JSON，不写 SQLite 或 `researchspec/`，不执行 revision，不确认五个 Gate 或 continue/complete Decision，也不改变 graph profile 的 stage 与 round 权威。

## 冻结文档审阅工作区复核（2026-09-29）

- 范围：`frozen-document-review-workspace` change 落地后，本锚点只有 `design-review-response-workboard-planning`（RM-CAP-04）与 `generation-review-response-round`（RM-CAP-05/06）受影响；`design-review-response-intake`、`analysis-review-response-manuscript-analysis`、`transform-review-response-comment-atomization` 三包无工作区改动（`git status` 干净）。

### 受影响能力判定

| 上游语义 | 转换后承载 | 判定 | 证据 |
|---|---|---|---|
| Stage 4 browser review：project atomic comments/workboard -> open page -> validate hash -> SQLite write | `design-review-response-workboard-planning` procedure 段 | adapted | `src/arsu-converter/authoring/procedures/review-response/workboard-planning.md` 段落改为保留冻结源集、经 `review-response` `review-workspace.v2` adapter 投影、渲染前单独批准并在临时副本渲染、无法可靠转换保留原文、结果对保留工作区校验并比对当前源；`revision-master.db` 写入仍走既有 SQLite write recipes，页面不写 db、不确认 graph Gate |
| Stage 5/6 final interactive pass：revision intent file -> verify hash -> apply -> commit semantic log | `generation-review-response-round` procedure 段 | adapted | `src/arsu-converter/authoring/procedures/review-response/round.md` 段落改为冻结源集 + `review-workspace.v2`；源已变则展示差异与受影响反馈并先询问，源未变则歧义定位询问，处理后准备不含已处理批注的新工作区 |
| 可选静态审阅面 `review-workspace/index.html` | 两包 `review-workspace/v1.html` | preserved | v1.html 与改动前页面逐字节一致（sha256 `5626313e33ccf67479c704d703e638f409367a6173ef1c639866b76f91a7dd09`），两包相同 |
| knowledge 声明 | 两包 manifest 新增 `review-workspace-v1.html` 引用 | adapted | `manifest.yaml` knowledge_refs 新增条目，`content_hash` 与文件实测一致（`5626313e...`）；`registry.json` manifest hash 同步刷新 |

### 审阅工作区 v2/v1 资产判定

| 资产 | 承载 | 判定 | 证据 |
|---|---|---|---|
| `review-workspace/index.html`（v2 页面） | 两包共享同一静态资产 | adapted | sha256 `505b1e769c5dab8528e668f20734c458da7a02d23af1196c428abed8b7ae1796` 在两个 review-response 包一致（`check-paper-humanization-review`、`transform-paper-humanization-revision` 两包亦为同值）；页面接受 `review-workspace.v2`、导出 `review-workspace-result.v2`，导入 v1 时拒绝并指向 `v1.html`；CSP `connect-src 'none'`、`img-src data:`，不执行文档内容、不加载远程资源 |
| 零 Agent 项 | 页面 `items` 仅要求数组、`document.blocks` 至少一块 | preserved | 支持纯用户批注；`src/review-workspace/v2.ts` 的 `items` 无最小长度约束 |
| v2 结果契约 | 页面内建校验 vs `src/review-workspace/v2.ts` | preserved | 两侧独立校验 anchor 引文/上下文与 block 文本一致、快照标识、决策覆盖 Agent 项、图片资产引用、冻结源清单排序与入口存在性；`export_revision` 递增支持多次导出 |

### 流程权威检查

- [x] 两包 SKILL 正文无 next-node / next-phase / agent-team orchestration；段落只描述浏览器审阅与写库义务。
- [x] Stage 顺序、五个 Gate、revision Decision 仍由 `review-response` graph profile 承接，段落未新增流程动作。
- [x] 页面 `workflow.mutation_authority` 固定 `researchspec-cli-only`；页面不写 `revision-master.db`、不写 `researchspec/`、不确认 Gate/Decision。
- [x] `knowledge/` 中 Stage 5/6 术语来自上游 verbatim 知识包，未进入 SKILL 流程权威。

### 风险与遗留

- 两包 procedure 段落现在引用共享 `review-workspace.v2` 契约与主机 Quarto/LaTeX 渲染边界；共享页面或契约变化会同时影响四个 capability 包，需在后续增量锚点一并复核（本锚点内两个 review-response 包页面 hash 一致）。
- 该 change 同时改动两个 paper-humanizer 包副本，属跨 vendor 耦合；本文档只对本 vendor 负责，paper-humanizer 侧由其自身语义审阅覆盖。

## 新审阅入口与既有资产复核（2026-09-29）

- RM-CAP-04 workboard 的 priority、evidence gap、target location、next action 以及 Gate 确认仍在 `design-review-response-workboard-planning` 的对话与 SQLite recipe 中；RM-CAP-05/06 的逐条策略、工作稿和 semantic revision log 仍在 `generation-review-response-round`。本轮仅撤回新工作区的浏览器入口，判定 `adapted`，无语义删除或 graph 权威转移。
- 两包原有 `review-workspace/index.html` 与 `v1.html` 仍在 manifest 中，并在生成 SKILL 的 Knowledge 段限定为现有审阅件恢复时读取；Tools 与 Procedure 不再引导新 review-response 审阅打开浏览器。根页面与四份包内 v2 页面 SHA-256 均为 `9f52387ccb0fc0ebe3fc6cdd778f16d5c878f4ea500859e115e516d02ae0bffc`，v1 恢复页不变。判定 `preserved`（既有资产）。
- 对照 RM-CAP-04/05/06 提取正文与两份生成 SKILL：数据库只由既有脚本写入，每条评论确认、revision log 和 response coverage 均未减少；三个其他 revision-master 包未变化。全局 parity 47/47 operational，未出现知识引用、输出或流程门禁缺口。

## 独立业务工作台复核（2026-09-30）

逐包对照 `authoring/revision-master/capabilities/` 六份阶段提取件、生成的五份 SKILL、`knowledge/sql-write-recipes.md` 与实际运行资源。上游提取件及其索引没有修改。

| 能力 | 判定 | 原文要求与本次承载 |
| --- | --- | --- |
| `design-review-response-intake` | preserved / adapted | RM-CAP-01 的“初始化运行时数据库与首批只读视图”及语言确认仍由 intake 实现。生成 schema、YAML 和 Jinja 模板剥离提取说明头，保留上游正文；加入 pinned 上游 `messages/en.json`、`zh-CN.json`，让实际初始化/渲染可执行。 |
| `analysis-review-response-manuscript-analysis` | preserved / adapted | RM-CAP-02 的“建立足以支撑后续映射和策略制定的全文结构理解”仍包含章节、论点、证据、风格和 resume。只同步同一套可执行 runtime 资源，无新浏览器交接。 |
| `transform-review-response-comment-atomization` | adapted | RM-CAP-03 的“明确原始意见块到 atomic item 的拆分、合并与去重关系”及 30%/50% 覆盖阈值保留。新增 coverage 冻结交接，全部原文 span、thread/atomic 多对多关系来自 task-bounded SQL 投影；确认仍绑定整体映射。 |
| `design-review-response-workboard-planning` | adapted | RM-CAP-04 的“优先级、依赖、证据缺口、原文位置与下一步动作”保留。board 内部确认覆盖完整候选；筛选不缩小范围，材料文件仍由 Agent 接收。 |
| `generation-review-response-round` | adapted | RM-CAP-05 的“把局部 blocker 留在 comment 作用域”与显式 active comment、RM-CAP-06 的“Agent-owned revision log 与 response 覆盖闭环”保留。新增 current-strategy 和 round 交接；seen 不构成确认，文件编辑与 semantic log 仍由 Agent 执行。 |

新增 `workbench/{review_workbench.py,receipts.sql,README.md}` 与 `review-workspace/revision-master.html` 从项目自有 `source_path` 发布到三个 handoff 包，不声明为原上游提取正文。页面使用独立业务协议，并直接复用公共捕获、区块与锚点规则。两个旧页面继续作为原协议的恢复资源。

实际验证包括只读 SQLite 投影/检查、缺字段与捕获期间变化、独立范围与依赖闭包、可信留存件、UTF-16 锚点、重复与分歧接收、失败回滚、修改日志和 gate-and-render。生产页在真实浏览器直接打开；实际导出的策略确认通过参数化 `recipe_stage5_confirm_strategy` 与 receipt 共同提交，再导入同件返回 `already_applied`，随后生成 19 份派生视图。预览夹具的缺材继续返回 `issues_found`，未冒充形式完成。

流程权威复核：五份 SKILL 无 next-node/next-phase/agent-team 模式；五个能力包和既有图谱不增删。页面只保存本地草稿/导出结果，准备与检查不调用初始化或渲染；接收事务只写 task SQLite。正式 Gate/Decision 仍需要对话中的独立人类确认与 CLI 操作。验收证据见 `openspec/changes/add-revision-master-interactive-workbench/verification.md`。

### 已批准原型的生产落实复核

用户拒绝首版通用表格布局后，生产 HTML 恢复 #14 的 B 台账、编号阶段、分组整卡、阶段阅读引导，以及右侧来源/反馈分区。coverage 原文片段可点选到具体 atomic item；工作板、策略与 round 分别以工作卡、行动/证据卡、回复/前后对照为主。预览恢复原型的六条意见、五项修订与完整稿件/日志/回复案例，仍通过实际 SQLite 投影和生产准备 API 生成。此为交互承载的 adapted 修正；快照、范围确认、正式关口与 Agent 写入权威未改变。修正后的导出对照独立留存件校验通过；用户生产页复核尚未完成。

新增文件/日志已落盘而 receipt 缺失的中断用例：范围漂移导致 pending，无回调重放，实际效果保留；新快照保留待处理反馈，拒绝旧结果转挂。没有引入按文字相似度推断已处理的机制。

## 共享维护身份复核（2026-10-06）

paper-humanizer 增量锚点更新了共用维护 catalog 和 Skill，因此刷新本锚点维护记录。revision-master 的上游、extraction index、registry subset、capability package tree 和 parity slice 与本轮开始前的 manifest 逐项一致；未再生或改写 revision-master 生产包。本节只解释共享维护身份变化，既有语义审阅结论继续成立。

## 项目钩子维护身份复核（2026-10-06）

paper-humanizer 声明独立 delivery assets 后，共用 catalog / own-vendor Skill 的维护身份更新。revision-master 未声明 delivery assets，其上游、extraction、五个 capability 包、registry subset 和 parity slice 保持原字节；不承接 writing-hook runtime。只刷新共享维护记录，原生产语义判定保持。

## 结论

declared-fit-with-notes。新增独立工作台保留五个能力的业务义务与流程权威；未发现阻塞性语义 gap。生产页的人工操作验收仍按本 change 的任务 7.3 等待用户复核，自动检查不替代该项。SQLite 事务仅覆盖数据库语义和 receipt，物理稿件编辑的中断恢复仍需要核对实际文件与日志。
