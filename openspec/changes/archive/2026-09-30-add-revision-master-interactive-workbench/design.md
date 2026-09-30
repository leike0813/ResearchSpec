# Design

## Context

动机与产品范围见 [proposal.md](proposal.md)，行为边界见四份 delta specs。

现有通用 v2 已提供区块、选区锚点、源文件捕获、安全静态渲染和结果检查，但只承载通用 item/decision；一个 item 的定位不能表达本工作台的全部多对多关联。现有快照摘要也未覆盖 revision-master 的领域字段，不能作为业务候选身份。

revision-master 数据以任务 SQLite 为真源，Markdown 为派生视图。多数表没有更新时间，策略和回复分别按 comment_id/thread_id 保存，没有按图谱轮次隔离的历史表。`gate-and-render` 会调用 schema 补齐及写入路径，不能直接用于只读冻结。正式轮次来自图谱的 exact selector。

五个能力包从作者源生成；原子化、工作板和 round 分别承载四个交接点。当前共享页面仅在后两包作为 recovery 资源出现，CLI/Navigate 仍排除新 review-response 入口。作者资产声明已经支持项目自有 `source_path`，可用于新增资源；原有提取文件带不可变来源索引和校验，不能将自行改写的内容继续声明为上游原文。

已批准原型用于交互参考。预览 harness 的导入注入是开发设施。两者都不承担生产数据准备或正式验收。

## Goals / Non-Goals

**Goals:**

- 用一套明确业务 DTO 贯通只读投影、冻结文档、页面结果、范围检查与现有语义写入。
- 公共文档/锚点/捕获规则继续由现有模块维护；SQL 依赖范围集中在包内读取模块，页面不重建业务依赖。
- 接收流程能解释每个反馈的已处理、待处理或冲突状态，处理记录与实际语义效果一致。
- 页面以当前对象或章节为渲染边界，完整材料仍可达。

**Non-Goals:**

- 不在 CLI core 引入 SQLite 运行时、通用 SQL 补丁引擎或结果事件系统。
- 不修改图谱节点、覆盖门槛、revision 模板或正式确认规则。
- 不扩展通用 v2 的领域语义，也不把已有审阅件转换为新契约。
- 其他首版排除项按 proposal 和范围决议执行。

## Decisions

### 1. 独立领域模型，直接复用文档原语

在 `src/review-workspace/revision-master.ts` 集中定义快照/结果 schema、组装及可信留存件校验；由既有导出入口暴露必要 API。复用 `ReviewBlock`、`ReviewAnchor`、安全渲染和源文件捕获，不将业务字段塞进通用 metadata，不改变 v2 adapter 枚举来伪装协议。

快照采用新分配的身份，包含如下显式分区：

| 分区 | 内容与身份 |
| --- | --- |
| context | task_id、snapshot_id、workspace_id、handoff stage、exact workflow selector、run/node 与适用 round、冻结正式状态 |
| sources/documents | 捕获清单、完整原文/稿件、可选安全渲染区块、捕获和定位限制 |
| business | 原始文档、thread、atomic item、全部关系和源 span、工作板、策略、材料状态、修改 log、thread 回复、当前执行焦点 |
| scopes | 覆盖整体、工作板整体、单卡等候选范围；明确对象集合与语义/材料依赖基线 |
| review state | Agent 候选与已有有效内部确认、未解决问题、下一步，不混入用户草稿 |

源 span 保存原始文档身份、offset 和原文引文；稿件显示选区只指向冻结显示区块，不声称是源码 offset。未知定位保留为未知并可审阅。显示区块 ID 与业务目标 ID 分开，关系边显式保存，支持一个业务对象的多个位置。

结果嵌入原快照，另有 result_id、draft 身份、export_revision、exported_at；反馈使用稳定 feedback_id，并分开保存 disposition/request、annotation、confirmation、seen、focus_request、overall_note。schema 校验唯一性、引用、锚点和精确范围，原候选与独立留存件结构比对。新快照不复制未核验确认或旧页面草稿。

备选：扩展通用 v2。它会混淆通用建议和阶段业务确认，并迫使多位置关系适配单 item 定位，故采用用户确认的独立协议。

### 2. 包内只读读取与一次冻结

新增项目自有资源 `authoring/revision-master/workbench/`，集中放置标准库 Python 读取/范围检查/处理记录工具、最小记录 DDL 和写入指导。使用现有 `source_path` 声明交付，保留原有提取资产及 provenance。复用可接受只读连接的现有 SQL 读取能力；没有安全复用点时，把实际字段投影集中在这个模块，不复制到页面或 CLI。

准备顺序为：读取确切图谱上下文 → 只读 SQLite 事务读取本任务相关记录和依赖 → 捕获实际源文件 → 从同一基线构造显示文档 → 核对捕获与语义数据未在准备期间变化 → 留存独立快照并生成 HTML。准备失败不发布可确认的半成品。SQLite 使用只读连接，不调用 connect/ensure/gate-and-render 的写入路径；缺字段报告前置条件。

SQL 模块是业务字段与依赖关系选择的唯一来源，输出明确的领域投影和 scope baselines。TypeScript 负责该 DTO 的契约检查、公共文档组装和结果可信校验；浏览器只使用已声明的 scopes，不推断范围。读取仅限当前任务、相关轮次和材料，不输出全库。

快照包含整份本次可见材料，旧轮次内容仅来自明确留存件；当前库不被当成旧轮次历史库。文件捕获复用现有清单和内容检查，不新增全库哈希、mtime 门禁或从 Markdown 反推业务状态。

备选：先 gate-and-render 再读取派生 Markdown。它会触发隐式写入，且无法可靠恢复关系和一致基线，故只在接受语义写入后使用现有 gate-and-render。

### 3. 生产准备路径生成嵌入式 HTML

维护 `review-workspace/revision-master.html` 及其必要静态资源。准备 API 将经过校验的冻结数据安全嵌入模板，生成一份可直接用 file URL 打开的 HTML；所有运行所需资源随件提供，不加载远程资源或执行文稿 markup。对嵌入内容采用不可执行数据编码和现有安全文档模型，测试 script 结束标记、用户 HTML、恶意链接等输入。

沿用现有静态页面与构建工具。只按实际调用需要提取公共文档、批注和草稿能力，不复制整份 v2 页面，也不建立通用前端框架层。原型和 preview bootstrap 不进入生产生成路径。页面的生成/校验能力是内部工具与包资源，CLI `instructions` 只提供调用指引，不执行它们。

备选：页面加 JSON 导入。用户已选择直接打开成品，生产路径不要求导入操作；预览也通过相同准备路径得到成品。

### 4. 四阶段用同一台账与有限文档投影

采用一个业务页面，用 stage 和选中对象呈现四个视图；阶段浏览不改变执行焦点。顶部说明本次核对对象、确认范围、未解决问题和下一步。原始资料与工件列表、当前核对内容和反馈区域沿用已批准布局。Agent 语义状态、用户草稿、正式图谱状态分别显示，所有数值来自快照。

每个对象显式索引全部来源、关联对象和稿件位置。筛选只改变列表显示，确认仍指向原候选范围。默认加载相关片段；完整原始文档与稿件按目录切换文档/章节。输入、选区和高亮更新仅处理当前投影，保持长稿的 DOM 范围。无可靠配对的修改显示完整前后原文；可靠配对复用词句变化能力。

覆盖/工作板为整体显式确认，当前 active comment 为单卡确认，round 只有 seen 与反馈。内部待确认问题或实质调整阻止相应 scope 被认作确认。补材、拆合、依赖及策略修改采用对象绑定请求；页面不编辑业务表。键盘、焦点顺序和窄屏可完成同样动作。

备选：默认铺开全部材料或可编辑关系图。前者放大阅读和更新成本，后者超出首版请求语义；本版用目录、列表和双向跳转覆盖真实关系。

### 5. 先检查可信结果，再按范围接收

结果接收分为三个步骤，不将检查与写入混用：

1. 校验结果 schema、身份、context、引用与锚点，并和 Agent 独立留存快照比较。缺留存件、改写候选或错轮次均不进入写入。
2. 包内工具以只读方式重取各 scope 当前依赖，输出可解释的字段/成员/关系/材料差异。整体 scope 比较完整集合，包括新增和删除；单卡包含其来源、证据及稿件。无足够证据按待核对处理，不自动重挂批注。
3. Agent 解释 advisory 请求并采用现有参数化语义写入。受影响范围展示差异后重新审阅；独立未变范围可接收。每步写入后重新检查可能受影响的剩余范围，并生成新候选快照。

同一反馈必须绑定原 snapshot/context。当前候选与旧快照不同不会取消已经有效落库且依赖未变的独立确认；尚未处理的页面确认也不会凭业务 ID 转移到新轮次。上游调整影响下游确认时，在语义操作中显式标明并取得受影响范围的新确认。

备选：任意改动阻断整个结果。用户已选择依赖范围接收；无法证明独立时暂停相关范围，保持保守且有解释的边界。

### 6. 最小 SQLite 处理记录与事务

新增结果与反馈范围记录，保存 result/draft/snapshot/context 身份、稳定 feedback_id、已处理 payload 或等价比较依据、处理状态及关联语义记录。完整 HTML/快照/结果只保存在任务目录，数据库不复制它们。DDL 由项目自有写入资源维护，仅在明确的语义初始化或接收写入路径创建，准备/检查不创建表。

成功状态与对应语义数据库写入共享连接和事务；事务内在写入前再次核对相应数据库依赖和已处理记录，差异不沿用先前检查结论。不另建 JSON 处理日志或通用补丁执行器。用户结果中的内容不成为任意 SQL。处理记录只描述实际效果，不授予正式 workflow 权限。

相同 feedback_id 和已应用 payload 不重复写入；新/改反馈再次核对。删除旧批注不构成撤销。跨浏览器分歧无全局先后，Agent 请求用户选择。pending/conflict 记录在新交付中保持可追踪，已处理批注不自动复制为新草稿。写入完成不明时先核对数据库、文件与修改日志，禁止盲目重放。

实际稿件编辑继续通过现有修订/记录流程；先检查实际文件及 log，才认定相关处理完成。SQLite 事务不覆盖文件系统，不引入跨介质事务或自动回滚稿件。

备选：独立 JSON 账本。它在数据库已提交、文件尚未保存之间产生额外恢复问题；用户选择复用任务 SQLite。

### 7. 静态入口与作者生成链

修改 `src/review-workspace/instructions.ts`，为三类 handoff 节点给出独立协议和实际资源路径。profile/run/Gate/Decision 仅说明适用边界并指向所属节点；没有 package root 时不伪造可执行路径。直接 Procedure packet 使用其真实 package root。instructions 路径不读取 SQLite、源稿或生成 HTML。

更新 `src/arsu-converter/authoring/procedures/review-response/` 的 atomization、workboard、round 及 `revision-master-sources.ts`，通过现有作者链交付新资源。现有五个包/图谱不增删。Navigate 的 canonical renderer 更新后再生成派生入口文档，不手改生成 Skill。维护按 `own-vendor-maintenance` 的语义审阅和锚点检查执行，不为资产哈希变化增加新维护规则。

备选：新增公开 CLI 或修改所有交付器。已有包资源和静态指引可覆盖交付，不扩大核心命令/宿主入口。

## File Plan

| 文件/目录 | 计划变化 |
| --- | --- |
| `src/review-workspace/revision-master.ts`、`index.ts` 与公共入口 | 新业务 DTO、组装、可信结果校验；按需复用公共文档原语 |
| `review-workspace/revision-master.html` 及必要静态资源 | 维护独立生产页面和安全嵌入式准备路径 |
| `authoring/revision-master/workbench/` | 新增项目自有只读领域读取、scope 检查、最小 receipt DDL/事务支持与写入指导 |
| `src/arsu-converter/authoring/revision-master-sources.ts`、相关 Procedures | 三类节点资产和四次交接、接收与回退说明；只按现有资产声明需要调整生成入口 |
| `src/review-workspace/instructions.ts`、相关 graph/Procedure instruction 调用处 | 静态适用指引和有真实 package root 时的路径 |
| `src/adapters/companion/workflows/navigate.ts` | canonical 可选工作台路径与单独正式确认说明 |
| `harness/review-workspace-preview.ts`、既有预览入口 | 用正式生成路径准备四阶段样例，继续隔离开发控件 |
| `tests/review-workspace*.test.ts`、`tests/review-response.test.ts`、`tests/graph-context-cli.test.ts` 及必要包内脚本检查 | 调整既有行为测试，补齐 DB/范围/重复接收与真实浏览器验收 |
| `docs/user/usage-model.md`、`docs/user/review-workspace.md`、`docs/developer/manuscript-annotations.md`、`AGENTS.md` | 更新入口、交接、源稿/显示坐标和权威边界，消除旧 v1 文档漂移 |
| capability 包、registry、manifest、维护锚点及必要派生文档、`package.json` 发布资产列表 | 从 canonical 源再生成并校验；发布新生产资产，排除原型/样例 |

不存在需要预先删除的生产文件；实施时仅合并真实重复的公共逻辑。保留用户已有未提交修改。

## Risks / Trade-offs

- 完整冻结内容增大 HTML → 保留数据完整性，以当前章节/对象限制 DOM；记录长稿样例规模与实际浏览器表现，不设任意毫秒门槛。
- 文件和 SQLite 无共同事务 → 发布前核对候选一致性，接收后以实际文件/log/receipt 核对效果；不声称一次 DB commit 覆盖文件写入。
- 上游提取文件误改导致 provenance 失真 → 项目自有新资源通过 source_path 交付，原提取索引继续校验。
- 多浏览器完整结果可能分歧 → 比对稳定反馈身份和 payload，冲突请用户选择，不用本地 revision/time 排序。
- 只测 DTO 会漏真实交付问题 → SQLite/source → 生产 HTML → 浏览器 → 完整结果 → Agent 检查 → 语义写入/receipt/gate-and-render 形成验收闭环。

## Delivery and Validation

先更新 usage-model 的显式产品边界与契约，再实施包内读取/检查、生产页面和接收。完成静态入口与作者投影后生成四阶段真实数据预览。复用已有测试，新增仅覆盖关系、范围、身份隔离、只读、幂等和事务风险的稳定行为测试。验证旧通用 v2 与旧审阅件路径保持各自协议。

正式验收包含实际浏览器的直接打开、草稿恢复、多次导出、四阶段、复杂关系、文本/对象批注、搜索过滤、键盘、窄屏和长稿；记录浏览器环境和案例规模。通过用户操作复核确认生产体验，原型认可不替代该项。

最后运行包投影、相关 CLI、构建/发布内容及现有维护语义审阅/锚点检查。新资源随正常发布分发，已有冻结件保持原路径。不存在核心 workspace migration 或自动语义修复步骤。
