# Own Vendor Anchor Semantic Review — paper-humanizer @ snapshot-84eb2ed

## 审阅范围

来源为干净本地上游 `84eb2edf9570aea85a799e4c4db559882c19928c`，前锚点为 `v2.9.1-1a31f2d`。远端 HEAD 核对时仍是前锚点提交，本轮吸纳的是已提交、尚未推送的本地版本。完整 Git 文件清单及原文差异归档为 `artifacts/source-inventory.json`，其中 `upstream_diff` 保存原始 Git diff 文本。

本轮修改 PH-CAP-03，新增 PH-KP-03，其余八个 extraction 文件保持原字节。审阅覆盖四个 capability 的 SKILL、knowledge、manifest、工具和 `paper-humanizer` graph profile；确定性 Python 工具、图与既有交互审阅页面没有语义变更。SOURCE.json 记录发布子树和根目录诊断参考的实际映射；MIT 通知与上游根新增 LICENSE 一致。

PH-CAP-04/05 延续既有切片提取格式：正文保留指定行范围的直接连接结果，索引 SHA 则对该结果追加一个换行计算。核对实际正文与索引分别使用对应规则，其余八份提取文件保持原字节。

## 上游增量准入

原文差异文本 SHA-256：`0f1407a8c536ef949b26af8fb5ff4a7684acc75b12b9fbc5613ae946bae386a2`。上游 Markdown 行尾空白在 snapshot、extraction 和生成 knowledge 中逐字节保留，由 `authoring/paper-humanizer/whitespace-exemptions.json` 通过现有白名单机制绑定实际文件和已核验提取来源。

`artifacts/source-inventory.json` SHA-256：`d01553a9a4af24888fa03ab21834a22d0e7d65a25ad95afe235069e075befb36`；whitespace 豁免清单 SHA-256：`8116fe4ff8740cf3ee47f628218872106eb2d9a101e4ce7b06b497ba8402a7cc`。

| 上游变更 | 本轮承载或范围决定 | 判定 |
|---|---|---|
| `paper-humanizer/SKILL.md` | vendor 原文快照、PH-CAP-03、四包 taxonomy；Reference 主程序及 Review 学术扫描 | preserved / adapted |
| 根 `references/diagnostic-guidance.md` | vendor `references/academic-diagnostic-guidance.md`、PH-KP-03；Review / Verification 条件读取的完整知识资源 | preserved / adapted |
| `paper-humanizer/assets/hook-inject-guard.md` | vendor 原文快照；其语义、文体、作者性保护和输出前检查并入既有 Reference 程序 | adapted |
| `README.md` | Git 差异审计证据；其“44 项”计数不作为规则来源 | removed from delivery |
| 根 `LICENSE` | 核对与现有 vendor/上游 Skill MIT 通知一致，现有通知继续保留 | preserved |
| 根 `AGENTS.md` | 审计证据；开发约束、完成历史和私有项目路径不进入能力指令 | removed from delivery |
| `references/humanizer/AGENTS.md` | baseline 仓库开发指引，归档差异，不属于 paper-humanizer 执行输入 | removed from delivery |
| `.mcp.json` | 开发研究 MCP 配置，归档差异，不进入宿主安装或运行配置 | removed from delivery |
| `references/harness-hooks-survey.md` | 宿主 Hooks 情报研究，固定到本次源清单，不构成产品部署规则 | removed from delivery |
| `references/ponytail-hook-injection.md` | 第 10.2 节原文区分“常驻型”与“显式调用型”；研究、示例与本机路径仅作审计证据 | removed from delivery |

## 逐包语义判定

| capability | 来源语义及原文片段 | 转换后证据 | 判定 |
|---|---|---|---|
| `generation-humanization-reference` | PH-CAP-03：`Keep negations that correct a real confusion`；#40 `flag it when it replaces concrete findings or limitations`；#41 `Keep fact-lists when the genre requires them`；#42 `Use pronouns or short references`；#43 `Do not remove legitimately required sections` | `src/arsu-converter/authoring/procedures/paper-humanizer/reference.md` 的 #9、#40–43、False positives 和 Before returning prose；生成包 `SKILL.md` 对应完整内联程序，`knowledge/paper-humanizer-taxonomy.md` 保留原文 | preserved / adapted |
| `check-paper-humanization-review` | PH-CAP-01：`Never leave an entry pending`；PH-KP-03：`What specific question does this paragraph answer?`、`Does the text explain what this proves, solves, or clarifies`、`Always prefer leaving ambiguous spans unchanged` | `procedures/paper-humanizer/review.md` 的 Pass C 学术扫描和 False-positive challenge；生成包 `SKILL.md` 及条件读取的 `knowledge/academic-diagnostic-guidance.md`；既有 review report / plan 输出契约 | preserved / adapted |
| `transform-paper-humanization-revision` | PH-CAP-04：`Edit only the text fields of approved prose segments`、`Do not touch excluded, pending, or protected content`；PH-CAP-03 新增学术语域保护 | `procedures/paper-humanizer/revision.md` 保持原字节；生成包 `knowledge/paper-humanizer-taxonomy.md` 更新原文，`scripts/document_pipeline.py` 和 document YAML contract 不变；批准计划和双向信息单元对照控制编辑 | preserved |
| `check-paper-humanization-verification` | PH-CAP-05：`Search for newly introduced instances of all numbered patterns`；PH-KP-03：`False positives scanned`、`Section context checked`、`Scope maintained` | `procedures/paper-humanizer/verification.md` 的 Style and finding check 学术核验；生成包 `SKILL.md`、taxonomy 和条件读取的 academic diagnostics；将补造论证、未测试场景、结果或限制视为失败 | preserved / adapted |

### 原文漂移与示例解释

- 上游 SKILL 的 Reference 步骤仍说 39 patterns，README 说 44，但编号标题实际为 1–43。提取和 knowledge 保留原文，Reference 执行程序按全部 43 个编号模式提供规则。扩展 #9 是既有模式细化，不计为新编号。
- PH-KP-03 的 cluster 示例把 pattern #2 称作 paragraph templates；taxonomy #2 实为 Notability claims。执行程序要求按 taxonomy 名称解释模式，并通过可见机制与上下文组合判定，避免复制错误编号和“3+”硬阈值。
- PH-KP-03 的 5–10 段、20+ 页以及 Hook 守则的 5–10 / 30+ 词均为例示性启发。本轮执行程序采用附近引用语境和自然节奏，不引入距离或句长配额。
- #41 的雷达示例和 register-drift 示例可能读成“补上缺失解释”或“增加未测试场景”。Reference、Review、Verification 都以来源支持和信息单元双向保留为准；缺失论证、研究身份或证据限制保持未决，不能从示例搬入事实。
- 缩短同一研究的重复介绍时保留不同结果和必要引用；远距引用、摘要到正文的正常重现、方法被动、统计性 hedging、专门 Future Work / Recommendations 以及 ethics/funding 等结构保留。

### Hook 守则映射

原文“保护语义 / 保护体裁 / 保护作者性”对应 Reference 的 Non-negotiable invariants；八条防线对应 #7、#34–39 和 Before returning prose；次高频陷阱对应 #8、#10、#24、#28、#38；学术专项对应 #9、#40–43；引文、代码、公式、标识符和 required template 对应 Protected content / False positives。检查只在当前 prose 任务内执行。资产本身不进入能力包，宿主全局每轮注入、开关、模型、MCP 配置与平台协议不获执行权。

## 流程权威检查

四包保持各自输入输出与 mode-neutral Completion。Standalone 仅产生普通工作输出；graph 模式由当前 activation packet 指定 CLI mutation。Review 只报告和提出计划，Revision 执行批准范围，Verification 报告核验；plan Gate、plan Decision、acceptance Decision 和 revision template 仍由 `src/arsu-converter/workflow/graph-profiles/paper-humanizer.ts` 承接。`full_workflow.py` 仍是未执行的 extraction provenance。能力入口没有 next-node / next-phase / agent-team 编排指令。

## 风险与遗留

学术诊断仍需 Agent 语义判断，机器 parity 只提供词汇/结构覆盖证据。固定根诊断参考的计数、编号、阈值与示例问题保留为来源事实，并由上述主程序约束解释；不能据其推断作者身份、补做事实核查或修复未授权的论文论证。没有新增运行依赖或宿主注入实现。

## 共享锚点刷新

revision-master 当前锚点仅刷新共用维护 catalog / Skill 的身份及记录，其 upstream、extraction、conversion 和 parity slice 与本轮开始前逐项一致。ARSU 当前 `v3.22.2-7de1c9d` 聚合锚点包含四个 paper-humanizer 包，因此同步其聚合 hashes、parity 和审阅 HTML；ARS 上游、extraction、38 包和 graph profiles 未变。首轮全量测试发现旧聚合身份漂移，刷新后复核对应维护检查。

## 验证结果

- `pnpm build`、`pnpm check`、`pnpm lint` 通过。
- `UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test` 最终全量 546/546 通过，零失败、跳过或取消；日志为 `/tmp/researchspec-paper-humanizer-tests-final.log`。首轮唯一失败是 ARSU 聚合锚点身份漂移，刷新后相关 18 项复测通过，再执行上述全量验证。
- 四包与 registry 的 27 个文件连续生成两次后逐字节一致；10 份 extraction 正文核对通过，其余八份既有提取文件和条目保持原字节；所有 vendor snapshot 文件匹配固定提交中的实际来源。
- parity 的 65 个包全部 operational，输出、knowledge、flow 及低覆盖告警为空；本轮四包 section coverage 为 0.94537037，rule coverage 为 1。
- paper-humanizer、revision-master 与 ARSU 当前维护锚点检查通过。ARSU 原有人工增量说明保留，记录摘要同步实际内容。
- `pnpm whitespace:check` 通过；原文硬换行空格由现有逐字节来源豁免检查验证。OpenSpec change 严格验证通过，主规格 62/62 通过。

## 项目常驻守则交付复核（2026-10-06）

新增 PH-KP-04 `authoring/paper-humanizer/knowledge/04_hook_inject_guard.md`，正文逐字节对应 `vendor/paper-humanizer/upstream/assets/hook-inject-guard.md`，SHA-256 为 `6aa145b9d300baa77cf07d57552dfdc753f64ed9b667ed0a71481ffd1b7c0f6a`。此前十件 extraction 正文、四个 capability 包、registry 与 graph profiles 均未改写。常驻交付独立于 Procedure parity，由 catalog 的 `delivery_assets` 冻结字节身份。

| 来源语义 | 交付承载与判定 |
|---|---|
| “保护语义 / 保护体裁 / 保护作者性” | `hooks/paper-humanizer/guard.md` 保留约束，并明确用户体裁/输出格式优先，独立信息不得丢失；adapted |
| 八条防线、次高频陷阱、学术专项、执行检查 | 全部主题进入同一 guard；所有宿主读取它，不维护另一份规则正文；preserved / adapted |
| “句长集中15-25词”“5-10词…30+词” | 以内容决定的自然节奏替换固定词数配额；adapted |
| “恢复判断、立场”“补上 which explains why” | 只还原材料或用户已给出的判断及论证联系；不能补造作者性、因果、证据、引用或未测试结果；adapted |
| “引文、代码、公式、标识符、required模板不动” | 守则明确保留，并纳入用户提供的受保护模板；preserved |
| 上游原始 MIT 通知 | `hooks/paper-humanizer/LICENSE` 保留 Copyright (c) 2025 Siqi Chen 与完整许可；NOTICE 标明衍生范围；preserved |

`inject.cjs` 为 ResearchSpec 编写的 Node 标准库发布器。进程协议只读守则；Copilot 变换另读取有界输入，保留完整 transformedPrompt 并追加守则。其他进程事件不读 prompt；原生插件直接相对自身读取相同守则。失败返回宿主空成功响应，不写状态、不记录提示、不调用模型或网络。

`src/adapters/tools.ts` 声明 18 个经审阅的目标及原生事件、协议、证据 URL、复核日期和加载限制。Claude/Codex/Qwen/Qoder/Copilot 的已声明 subagent 事件使用同一发布器；Codex 5000-token context 额度在 handler 显式设置。Cursor additional_context 属于 Ponytail 的指定版本私有接口证据；Junie TUI/EAP、Cline POSIX、Kiro CLI 3、宿主信任与启用条件由静态状态报告披露，不视为活宿主验收。

所有 hook 都是建议性写作上下文。init/update 在同一现有事务内安装配置与资源，只合并原生配置中的拥有条目；整文件快照保护其他设置与并发变化。off/deselection 保留已改 hook 及依赖并报告未完成移除。无新增 Procedure、模型服务、授权、Gate、Decision 或 workflow-state 写入。

独立验证覆盖每个原生投影的连续两轮注入、原提示/既有 system 保留、无守则/异常/超限/超时输入、用户设置、漂移、安全路径、子集更新、事务并发和三种 delivery 模式。具体最终命令与结果在本 change 的 `verification.md` 留存；上述静态验收不证明 Agent 完全遵守守则或全部宿主实际加载。

## 结论

declared-fit-with-notes。新增学术写作语义与 Hook 守则的可移植检查均有明确承载；原始来源逐字保留，矛盾和不安全的例示操作由主程序的来源支持、体裁保护和未决报告约束处理。工作流与宿主边界维持既有权威划分。
