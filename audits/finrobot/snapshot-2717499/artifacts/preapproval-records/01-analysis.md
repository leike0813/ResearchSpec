# FinRobot 增量审计与吸纳方案：297a8d2 → 2717499

审计日期：2026-09-30。状态：增量分析完成，生产准入尚未实施。

建议以 `snapshot-2717499` 作为下一次吸纳的候选快照，保留六个现有金融能力 ID，
先完成来源身份更新，再增强现有能力的估值与证据检查。新增的 56 个 Skill 全部有
第三方来源；本轮没有任何一个获得生产准入。源代码中的新估值方法另行评估。

本目录目前是分析记录，不是可验证的生产锚点。没有生成 `manifest.json` 或吸纳、
转换、生产语义审阅完成记录。当前生产仍为 `snapshot-297a8d2`。
机器证据见 [upstream-delta.json](artifacts/upstream-delta.json)：完整 987 项 Git diff、
旧知识来源对应关系、56 个真实 Skill 的路径、Git blob、字节 SHA-256 和初步结构分类。

## 1. 上游身份与版本选择

| 项目 | 身份 |
| --- | --- |
| 官方仓库 | `https://github.com/AI4Finance-Foundation/FinRobot.git` |
| 当前生产快照 | `297a8d28d099be328c8a8eb658b4f782b93f3651` |
| 最新默认分支 | `master` |
| 本次候选提交 | `2717499b8e30f242640af08c4ad9afd1113c2d45` |
| 候选提交时间 | 2026-09-28 19:24:51 +08:00 |
| 候选 Git tree | `eee135451d83398acd925f061483f0c864331749` |
| 最新正式 release | `desktop-v0.1.0`，2026-07-07 07:49:05 UTC 发布 |
| release tag 指向 | `6a8161ff5cfa66ec3df9c11a0bf7a84a1ac11f01`，提交日期为 2026-05-11 |

特别注意：`desktop-v0.1.0` 的 Git tree 没有 `finrobot_desktop/`，且该提交早于当前
生产快照。release 页面描述的 Desktop 二进制功能不能证明 tag 源码含有相同实现。
要吸纳此次新增源码，必须绑定最新默认分支的完整提交，标为 snapshot；不能把它
标为正式发布的 `v2.0.0`。Desktop `pyproject.toml` 内的 `2.0.0` 是组件版本。

来源：[官方 releases](https://github.com/AI4Finance-Foundation/FinRobot/releases)、
[候选提交](https://github.com/AI4Finance-Foundation/FinRobot/commit/2717499b8e30f242640af08c4ad9afd1113c2d45)。
release 发布时间另由 GitHub releases API 核对；tag 源码与祖先关系由 Git 对象核对。

## 2. 增量范围与旧能力影响

旧快照到候选提交共 25 个提交，987 项路径变化：905 新增、6 原路径修改、
2 删除、74 重命名，其中 69 个重命名逐字节相同。文本 diff 为新增 258,687 行、
删除 457 行；大量锁文件、测试和前端资源也在此统计中，不能把行数当成能力数量。

| 候选源码区域 | tracked entries | 吸纳处理 |
| --- | ---: | --- |
| 根目录 | 9 | 版本、许可、部署、打包元数据审计 |
| `.github/` | 1 | Desktop CI，仅审计 |
| `figs/` | 11 | 产品截图与图示，仅审计 |
| `finrobot_autogen/` | 71 | V0 路径迁移；保留已有来源与排除决策 |
| `finrobot_equity/` | 64 | V1 核心金融来源未变化；部署/依赖整理仅审计 |
| `finrobot_desktop/` | 893 | V2 新增内容，按计算、证据、第三方 Skill、运行时分开审查 |
| 合计 | 1,049 | 包含 1 个外部 gitlink，不把它当成目录内文件 |

FinNLP gitlink 移到 `finrobot_autogen/FinNLP`，对象仍是
`587f04f473507ddea6453e43796797fce17155ce`。本轮未初始化它。

现有 66 个知识 surface 所在的 **18 个源文件全部保持相同 Git blob**；其中已准入
的 32 个 surface 来自 12 个源文件。这 12 个源文件中，只有
`finrobot/functional/analyzer.py` 改为
`finrobot_autogen/finrobot/functional/analyzer.py`，其他 11 个路径原样保留。
因此六个生产能力的原始业务依据没有发生语义修改。

| 现有 extension | 旧准入 surface 数 | 本轮判定 |
| --- | ---: | --- |
| `plugin-financial-company-fundamentals` | 7 | preserved；可增加证据与预测适用性检查 |
| `plugin-financial-competitive-position` | 2 | preserved；可增加比较口径说明 |
| `plugin-financial-corporate-risk` | 3 | preserved；风险程序无需因目录迁移重写 |
| `plugin-financial-event-evidence` | 6 | preserved；已有去重与 Agent 给分排序继续保留 |
| `plugin-financial-relative-valuation` | 7 | preserved；新版本提供值得吸纳的估值检查 |
| `plugin-financial-statement-analysis` | 7 | preserved；新版本提供期间、货币、血缘检查 |

根 `LICENSE`、`NOTICE`、`TRADEMARK_POLICY.md` 未变化。`setup.py` 的 MIT 元数据改为
Apache-2.0，旧的根许可与包元数据冲突在这个文件上已消除；此结论不能扩展到第三方内容。

## 3. 新增内容中最值得吸纳的部分

Desktop 中真实存在 DCF、WACC、DDM、LBO、Monte Carlo、SOTP、估值综合、数据审计和
React/Tauri 实现。旧审计中“若干实现缺失”的结论是旧快照事实，不能用于候选快照。
本轮按实际源码选取增量，没有把 README 的生产成熟度与测试宣称当成验证结果。

下表中的上游路径均相对于候选 `finrobot_desktop/finrobot/`；行号来自该固定快照。
“建议”是 ResearchSpec 的吸纳决策，尚未实现。

| 增量 | 上游证据 | 当前 ResearchSpec 能力与建议 |
| --- | --- | --- |
| 估值方法分歧与比较口径 | `engine/compute/operators/valuation_synthesis.py:94`、`engine/models/valuation_thresholds.py:57` | `valuation.py:67` 已能算 DCF、倍数及显式加权，但脚本只检查权重和。保留各方法结果；比较前明确期间、币种、每股基础、方法适用性和权重依据。缺乏可比性时不形成综合点值。分歧比例可作诊断，不能自动挑一个方法当真值。 |
| EV→普通股权益桥与无效 DCF | `engine/compute/operators/dcf.py:84`、`engine/compute/operators/audit/ev_bridge.py:23` | 现有桥只有 `EV - net_debt`。明确优先股、少数股东权益、现金、债务和稀释股数的口径，缺项不默认为已证实的零；若新增输入字段，在领域 DTO 中定义并防止重复扣减。非正终值现金流或权益不能直接发布为负的普通股公允价。 |
| 行业与经济意义 | `engine/primitives/industry.py:423`、`engine/compute/operators/audit/sector_sign.py:46` | 银行和资产负债表驱动保险的 EV/现金流法适用性，以及亏损 P/E 的 NM 表达值得纳入估值与比较程序。先由 Agent 确认经营模型；不让模糊行业子串直接决定估值结论。 |
| TTM 期间完整性 | `engine/compute/operators/audit/ttm_period.py:58` | `statements.py` 已有期间字符串、单位归一与同期间混币拒绝，但没有连续期间检查。新增检查需明确期间起止日、财年、频率和重述关系；检查覆盖、缺口及重复。仅有期末日期时可以提示，不能认证 TTM 完整。 |
| 报价币与报表币 | `engine/compute/operators/audit/currency_caliber.py:81`、`engine/data/normalize/currency.py:27` | 现有单个 currency 字段不足以证明跨口径比率有效。区分价格、报表及计算输出币种；用有日期和来源的汇率归一后再形成倍数。该流程由宿主配置的工具取数，包不引入 FX provider。 |
| 跨来源与数据血缘 | `engine/data/validator.py:255`、`engine/data/normalize/contracts.py:101` | 价×股数与市值的核对需要独立输入。若股数由同一市值/价格倒算，记录“不构成独立验证”。冲突保留双方出处、日期、口径和差异；不得用 provider 数量表决真实性。 |
| 数字与叙事对应 | `engine/models/numeric_claim.py:70`、`artifact/contract.py:474` | 复用研究 brief 的证据结构，标注实际数、计算数、假设数及出处。无效数字及其派生点值需在所有报告位置一致处理，相关语义结论由 Agent 重新评估。检查结果保持 advisory，不获得 Gate 或 Decision 权威。 |

前三项主要落在 relative-valuation 和 competitive-position，期间与币种落在
statement-analysis，血缘与叙事对应同时覆盖 fundamentals。corporate-risk 和
event-evidence 仅在确有新增语义时调整，不为更新版本而扩充步骤。

### 数学规则与上游策略要分开

可以保留有明确输入的数学检查，如折现率大于终值增长率、币种一致、桥中各项归属、
期间覆盖、有限数值和非零分母。下列是上游的产品或研究策略，不能未经审查变成硬门禁：

- 方法间 2 倍差异、单方法与市价 2 倍差异、多方法与市价 4 倍差异。
- Gordon 价差固定 1.5 个百分点、跨 provider 财务差异固定 15% 等阈值。
- 对 β>1 才做 Blume 收缩的非对称处理。
- 数字被撤回后，方向性评级必须继续发布的固定政策。

源码注释中的历史案例和“calibration”不等于 ResearchSpec 已经做过适用性实验。
本轮没有运行相关回放。可先把差异、价差、终值占比等作为可解释诊断输出；若业务确需
阈值，应由有证据的显式研究政策提供，不能新增默认阈值配置层。

CAPM/WACC 可作为后续 stdlib 算术扩展：参数由 Agent 明确提供，原始/调整 β 分开记录。
它不应阻塞第一批口径与证据改进，也不应带入行业中位数、默认 ERP、自动选取折现率。

## 4. 56 个新增 Skill 的来源与结构审计

候选快照共 60 个 `SKILL.md`：56 个位于 `finrobot_desktop/skills/`，另 4 个是测试
fixture。真实 Skill 全部是 Markdown；这只能证明当前快照没附带脚本，不能证明它们
不需要脚本、办公软件或远端服务。

| 上游 desk | 数量 | 内容方向 |
| --- | ---: | --- |
| equity-research | 9 | 财报、覆盖、催化剂、投资论点 |
| financial-analysis | 11 | 财务模型、Excel/演示材料及维护辅助 |
| investment-banking | 9 | 交易材料、买家筛选、并购模型 |
| private-equity | 10 | 尽调、IC、投后、收益与单位经济 |
| wealth-management | 6 | 客户报告、规划、组合与税损收割 |
| partner-lseg | 8 | LSEG 数据工具驱动分析 |
| partner-spglobal | 3 | S&P Global/Kensho 数据工具驱动分析 |

### 来源身份尚不完整

`skills/ATTRIBUTION.md:3` 声明这批内容来自 Anthropic 的
`financial-services-plugins`，2026-03-31 自动转换，正文未改变，许可声明为 MIT。
`UPSTREAM_VERSION.txt` 只有转换时间和作者本机源目录，没有原始提交号。

原仓库地址现重定向为 `anthropics/financial-services`。
我核对了转换日前的 LICENSE 历史提交
`b891783b23f4c46050bd4c7c34128d19351917cb`（2026-02-23），其正文已是 Apache-2.0；
当前 LICENSE 也为 Apache-2.0。因此 FinRobot 的 MIT 声明至少不能直接作为这些副本
的分发依据。该历史 LICENSE 仍不能证明 56 个副本的精确原始版本。

来源：[原仓库](https://github.com/anthropics/financial-services)、
[历史 LICENSE](https://github.com/anthropics/financial-services/blob/b891783b23f4c46050bd4c7c34128d19351917cb/LICENSE)、
[当前 LICENSE](https://github.com/anthropics/financial-services/blob/main/LICENSE)。
历史正文和提交日期另通过官方 GitHub API/raw 内容核对。

吸纳前需为选中的内容定位原始提交、正文和附属资源，核对逐文件许可及署名。
根 Apache-2.0 不覆盖来源不明的副本；也不能凭这次分析把整批内容标为不可再分发。
若后续要维护这批原生金融 Skill，建议直接建立原作者来源记录，避免把 FinRobot 转存
正文当成独立 authored 内容或制造第二个维护事实源。

### 资源闭包被转换器丢弃

`scripts/convert_skills.py:176` 只枚举 `**/SKILL.md`，输出单个正文；当前技能目录没有
其正文引用的附属资源。已确认 11 个 Skill 有本地资源悬空，其中两个也是维护/工具范围。

| Skill | 缺失资源示例 |
| --- | --- |
| `earnings-analysis` | `references/workflow.md`、报告结构与最佳实践（正文约 150 行起） |
| `3-statement-model` | `references/sec-filings.md`、`formulas.md`、`recalc.py` |
| `competitive-analysis` | `references/frameworks.md`、`schemas.md` |
| `comps-analysis` | `examples/comps_example.xlsx` |
| `dcf-model` | `TROUBLESHOOTING.md`、`recalc.py` |
| `ib-check-deck` | `references/ib-terminology.md`、`report-format.md` |
| `lbo-model` | `examples/LBO_Model.xlsx`、`recalc.py` |
| `pitch-deck` | `reference/` 下四份 XML、格式、模板、计算标准 |
| `strip-profile` | `examples/Nike_Strip_Profile_Example.pptx` |
| `ppt-template-creator` | `assets/template.pptx` |
| `skill-creator` | 多份 DOCX/PDF/OOXML 文档、references、scripts、assets |

这些包不能以“正文已完整复制”通过自包含性检查。直接从原作者取回受审资源或按
ResearchSpec 的完整程序标准重新表达，然后才决定脚本、knowledge refs 和执行类型。

### 结构初筛不是准入

机器工件给 56 个 Skill 做了互斥分类：32 个未发现本地资源缺口，11 个需要资源或
办公工具修复，13 个暂缓（11 个 partner + `skill-creator` + `ppt-template-creator`）。
**全部 56 个仍为 not-reviewed**；32 也不表示已确认版权、业务边界或可独立执行。

内容重叠应优先合并：`competitive-analysis` → competitive-position，
`comps-analysis`/`dcf-model` → relative-valuation，`3-statement-model` → statement-analysis，
earnings/coverage → fundamentals 或 event-evidence。不能仅因为上游有新 ID 就另发同义包。

在原始来源复核后，较值得另行评估的是尽调检查/尽调会议、IC memo、投资论点与催化剂
跟踪。先判断能否进入现有风险或事件能力；独立输出确实有价值时再添加 Procedure。
客户财务规划、税务、组合调整、交易流程材料扩大了领域边界，须独立审计，不在本轮
最小吸纳范围内。partner 的 MCP 依赖本轮暂缓，不能将其视为宿主已授权或可自动安装。

上游 desk 名称不直接成为 ResearchSpec domain。首批继续使用现有两个 ANZSRC Group
域；将来新增候选的分类也只作审计元数据，成员关系仍由 source-neutral catalog 决定。

## 5. 本轮建议保留在审计侧的内容

- Tauri/React、FastAPI、SQLite artifact/run/session store、认证、secret store、自动更新。
- provider adapters、远端摄取、凭证配置、MCP 安装、模型配置、PydanticAI/AutoGen 编排。
- 原生 pipeline runtime、重试、状态迁移、发布政策。其语义文件可审查，运行时不进入包。
- LBO、DDM、Residual Income、SOTP、反向 DCF、Monte Carlo、回测和交易策略：作为独立
  方法候选暂缓，不因现有六能力更新而一并引入。其中 Monte Carlo 现实现依赖 numpy；
  这不意味着该能力永远不能以其他受审实现吸纳。
- Damodaran 数据集与刷新脚本：数据来源、许可、适用日期需独立审查。
- screenshots、外部财报、测试 fixture、部署与发布脚本：不进入研究 capability。
- FinNLP、AutoGen 归属和旧 filings/marker 来源不明内容：既有排除理由继续有效。

ResearchSpec 维护、转换、安装、status/check 不运行上游代码。被用户明确调用的研究
Procedure 仍可在宿主政策下使用已授权外部工具；本轮建议不新增 provider 包装层。

## 6. 制定方案

无阻塞问题，基于以下假设制定方案：这次目标是维护已有六项金融研究能力、吸收实际
有价值的新证据与计算规则；全量新 Skill、桌面产品、财富管理和交易领域不属于首批。
这是可供下一阶段选择的实施范围，本轮只新增分析工件。

### 第一步：快照与审计身份更新

先建立候选完整审计，再更新生产 pin。旧 `snapshot-297a8d2` 的 immutable audit 和
记录原样保留。新增源码库存需要覆盖 1,049 entries、迁移后的 FinNLP、真实 Skill、
计算/数据 surface 与第三方归属；新增 source 不自动获得 admission。

| 文件或目录 | 预期变化 |
| --- | --- |
| `openspec/changes/update-finrobot-to-snapshot-2717499/` | 新建 proposal/design/specs/tasks，明确快照更新、六 ID 保留、第三方暂缓与检查范围 |
| `openspec/specs/finrobot-domain-skill-audit/spec.md`、`finrobot-vendor-conversion/spec.md` | 更新当前适用的审计规模、真实 Skill、来源准入和候选审阅要求；历史事实留在旧记录 |
| `audits/finrobot/snapshot-2717499/` | 新建完整 capability audit、report、01–05、审阅工件与最终 manifest；当前 01 分析内容需要保留 |
| `src/vendor-audits/finrobot.ts` | 消除仅能表示旧 146/66/无 Skill 的限制；通过当前审计身份与实际库存验证完整覆盖，继续严格检查引用和数量关系 |
| `src/vendor-converters/finrobot/policy.ts` 及 8 份 `*-decisions.json` | 绑定新审核事实、路径和 hash；完整分类新增来源，保留已排除内容；只为选中 surface 新增映射 |
| `src/vendor-converters/finrobot/converter.ts` | nested gitlink 检查改用新受审路径；保留 offline staging 与文件闭包检查 |
| `src/vendor-converters/finrobot/complete-tree.ts`、`cli.ts` | 支持维护者生成待审候选完整树，随后执行已批准树校验；不新增公共 ResearchSpec 命令 |
| `audits/finrobot/catalog.json`、`scripts/finrobot-maintenance.mjs` | 新身份与当前审核计数，真实创建日期；维护记录仍按 catalog 生成 |
| `.agents/skills/finrobot-maintenance/SKILL.md`、`AGENTS.md`、`docs/maintainer/vendors/finrobot.md`、`audits/finrobot/README.md` | 同步当前路径、真实 Skill、生产选择和维护方法 |
| `vendor/finrobot` | 完成候选审阅后才更新 gitlink；FinNLP 不初始化 |

当前实现的两个限制需要先处理：`FinRobotAuditSchema` 写死 146 entries、66 surfaces
和 `source_has_upstream_skills: false`；`renderFinRobotCompleteTrees` 在生成后立即要求
树 hash 等于旧 published hash，`convert --dry-run` 也先要求生产 approved。
因此仅填 candidate 或调用 dry-run 无法得到不同于当前已批准树的受审预览。
应将候选组装与已批准发布检查分别调用，复用现有 renderer、政策验证与 staging，
不通过提前改写批准 hash 来绕过审阅。旧生产文件需继续可以独立验证。

### 第二步：最小业务增量

先明确 DTO 中的币种、期间、EV 桥、每股基础和来源血缘。按第 3 节选中的义务更新：

- `skills/financial-research-relative-valuation/{SKILL.md,scripts/valuation.py}`：适用性、
  方法比较与桥；`value` 和 `sensitivity` 共用的计算函数一起修正。
- `skills/financial-research-statement-analysis/{SKILL.md,scripts/statements.py}`：期间覆盖、
  报价/报表口径、独立数据核对；复用已有 normalization 与 metrics。
- `skills/financial-research-company-fundamentals/SKILL.md` 和
  `skills/financial-research-competitive-position/SKILL.md`：消费同一组证据，不重复计算。
- `lib/financial_support.py` 仅承载真正共用的输入校验；领域估值公式和适用性不塞入
  通用库。不新增通用 runner、provider adapter 或独立配置框架。
- `skill-definitions.ts` 与 surface/resource/review 决策：绑定新证据、实现路径和候选树。

原始 authored 树位于 `src/vendor-converters/finrobot/skills/`，以上短路径均相对于该
converter。产物同步到 `skills/plugins/vendors/finrobot/` 与六个
`skills/plugins/extensions/capabilities/plugin-financial-*/`，并更新 manifest knowledge
hash、brief 证据字段、registry 和对应 profile。现有 `artifacts` 命令同步工具和审阅
工件，不负责重写 extension 的完整语义正文；受影响正文也必须逐包审阅。

未选中的业务正文和脚本应逐字节不变。新 provenance 的 revision、audit hash 和
`DERIVATION.json` 会使六个包的 metadata/tree hash 改变；即使业务不变，也不能声称
新版本全包字节与旧版相同或复用旧 tree approval。

### 验证与发布前审阅

复用 `finrobot-audit`、`finrobot-ingest-draft`、`finrobot-converter`、
`finrobot-maintenance` 和 plugin-extension 现有测试。只补可观察的关键边界：
不兼容方法不能形成无依据综合值、混币失败、桥重复扣减、期间重叠/缺口、输入不独立、
无效 DCF；不对大段 Skill 文案增加 snapshot 测试。

候选实施后运行 `pnpm check`、`pnpm lint`、FinRobot converter check/idempotence、
targeted tests、全量测试及 maintenance check/diff。生成工作与读取生产文件的测试
顺序执行。Agent 逐能力审查 preserved/adapted/removed/gap，四个工具投影 byte-identical，
两个领域成员关系不变，其他 vendor 产物不受影响。

完整树须按既有 OpenSpec 的 Complete Tree Approval 要求展示并审阅；当前分析报告
没有新候选树 hash，也不授予发布批准。没有新增 formal Gate、Decision、公共 CLI 命令。

## 7. 本轮实际验证与证据限度

已执行：官方远端 refs 与 releases 核对；临时仓库 fetch 和固定 Git tree 检查；
25 提交与完整 diff；18 份旧知识源/12 份准入源的 blob 比对；56+4 Skill 库存；
新增方法与审计实现的静态审查；第三方历史许可查询；
`node scripts/finrobot-maintenance.mjs check snapshot-297a8d2` 返回 **OK**。

落盘后重新逐项校验工件：987 项 diff 与 Git 输出一致，1,049 entries 数量一致，
18 个旧源 blob、12 个准入源字节 hash、56 个 Skill 字节 hash 与互斥分类均通过。
两份新增文件的 authored-whitespace 检查通过；生产路径 diff 为空。
收尾时再次查询远端 master，仍为本报告绑定的完整提交。

本轮不改 converter、生产 Skill、registry、catalog 或 vendor pin，不运行上游工具、
上游测试、模型或服务，不安装依赖，不提交代码。无需为仅新增分析工件重跑全量测试。
没有把所有 893 个 Desktop 文件称为已通过逐文件语义或来源审查，也没有宣称任何
金融阈值、算法性能、宿主行为或真实市场输出已获实验验证。

结论：**既有六项能力的来源语义 preserved；推荐有选择的增量吸纳；新 Skill 批次尚不
具备直接准入证据。** 第一批范围是快照身份更新和既有能力的口径、血缘、估值适用性
改进。56 个转存 Skill 与独立估值方法留待分别完成来源/资源/领域审查。

## 实施结果入口

本文件保留分析阶段的原始证据与方案。按该方案形成的六份完整候选、隔离 extension、
来源政策与验证记录见 [02-ingestion.md](02-ingestion.md)、
[03-conversion.md](03-conversion.md)、[04-review.md](04-review.md) 和
[05-semantic-review.md](05-semantic-review.md)。当前状态为 pending-human-review，
完整候选树集合 hash 为 `1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6`。
生产仍为 `snapshot-297a8d2`；新 production manifest/diff 在该精确树批准后固化。
