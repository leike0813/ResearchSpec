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

## 结论

declared-fit-with-notes。本轮两个受影响能力的浏览器审阅语义按 v2 冻结源模型适配，v1 页面与结果按原契约逐字节保留（`5626313e...`），三个未受影响能力无漂移；无阻塞性 gap。note 是共享 v2 静态资产与主机渲染边界带来的跨包耦合，属后续增量维护的观察项。
