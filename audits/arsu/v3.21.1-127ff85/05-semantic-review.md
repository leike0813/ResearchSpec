# ARSU Anchor Semantic Review — v3.21.1-127ff85

内容语义审阅及经用户授权的七个检查器执行修复已完成；以下保留初次发现及修复验收证据。该审计记录不等同于发布批准。

## 审阅范围

2026-09-06 对比 ARS v3.19.0 (`828ef3b`) 与 v3.21.1 (`127ff85e4bbfcdd10b95040537b6c6bd7ad17aeb`)。远端 annotated tag 的 peeled commit 与本地干净子模块一致。全上游差异为 1659 files、323146 insertions、5475 deletions，包含大量维护与评估材料，不代表全部进入产品。

119 个提取工件中 57 个更新、62 个与 Git HEAD 字节一致；extraction:index:check 为 119 pass。四个 ARSU 包通过独立转换器生成，38 个 ARS capability 通过 authoring 生成；全 capability registry 另含九个 own-vendor 节点，共 47。旧审计保持不变。当前 graph profile、capability ID 和工作流状态合同未变更。

阅读三份审阅 HTML 的源文本，复核全部 27 mode 的输入文档、节点与输出映射，并阅读变更 procedure、上游提取正文与生成 SKILL/knowledge。下表中的 capability 路径均以 `skills/capabilities/<id>/` 为根；对应源 procedure 为 `src/arsu-converter/authoring/procedures/m1..m5/`，上游精确源路径及切片由 `authoring/ars/extraction-index.json` 的 artifact sources 给出。

## 逐项语义判定

| 变更 capability | 上游证据与不可丢失义务 | 转换后承载与判定 |
|---|---|---|
| discovery-literature-search-screening | CAP-M1-01 bibliography/literature strategist：claim-specific coverage；`not_checked`；`source_acquisition_date`；API limits | adapted：Coverage Plan、Literature Fitness、Retraction/Provenance 段；真实检索覆盖、不可用状态、来源适配日期分开，禁止配额替代证据 |
| analysis-evidence-synthesis | KP-M1-04 corpus iron rules：可信字段按来源保留；不得自行升级证据 | preserved：knowledge corpus iron rules，既有 synthesis procedure；知识更新不引入工作流写入 |
| design-research-question-formulation | CAP-M1-04、KP-M1-02：FINER questioning；claim intent | adapted：研究问题及方法适切性建议保持作者选择，不把语言模板提示当创新性裁决 |
| design-methodology-design | CAP-M1-05、KP-M5-20/21/22/23：`institutional determination required`、`submission_readiness`、actor/scope | adapted：Human-Subjects Administrative Planning；无精确上下文与 replay 证据时 unresolved，不代机构选择豁免或审批级别 |
| design-writing-intake | CAP-M2-01：target criteria、evidence/claim boundaries | adapted：intake 记录作者确认的目标、实际材料及缺口，不推断目标或补造文献 |
| design-manuscript-structure-design | CAP-M2-02：章节与证据对应、discipline fit | preserved：结构设计和 evidence map；明确材料支持范围 |
| design-argument-blueprint | CAP-M2-03 与更新 claim-intent knowledge：claim/source alignment | adapted：蓝图保留主张强度与证据边界，未知保持显式 |
| generation-manuscript-drafting | CAP-M2-04：manuscript drafting、不可虚构来源与结果、作者意图 | adapted：drafting procedure；守住未支持主张、论证结构和引文来源约束 |
| check-reference-integrity-verification | CAP-M3-01、KP-M3-09：bibliographic integrity 与 retraction 信号 | adapted：reference-integrity procedure；区分存在性、撤稿状态、使用方式与最终人类判断 |
| design-review-panel-config | field_analyst_agent：`never emits a binding receipt`；tone never changes verdict | adapted：作者目标及 binding IDs/digest 原样传递；四张卡加固定 DA；发展性措辞不减轻结论 |
| judgment-editorial-judgment | eic_agent：`contract_role: eic`、`eligible_roles`、`NOT_CALIBRATED` | adapted：Journal-Fit Reviewer、blind/visible procedure 和 sprint-contract knowledge；不由单席计算全组决策 |
| judgment-specialist-review | methodology/domain/perspective agents：fatal/repairable、singleton Critical、`[UNVERIFIED]` | adapted：按配置选择 role；R3 限制只约束 perspective，逐项严重度及来源真实性规则保留 |
| judgment-devils-advocate-stress-test | DA agent：`contract_role: da`、eligible dimensions、CRITICAL stable IDs | adapted：只评 DA 适用维度，不给论文总分；交 synthesis 逐项裁定 |
| judgment-review-synthesis | editorial_synthesizer：role quantifiers、`DIMENSION-UNASSESSED`、`DA-CRITICAL-VS-ACCEPT` | adapted：v2 matrix、failure precedence、每条 DA 判定；advisory 决策不能替代正式 Gate |
| check-pre-submission-self-check | peer_reviewer 与 re_review protocol：criterion-local judgments、`CANNOT_VERIFY`、`user_review_required` | adapted：删除数值总分规则；先冻结准则再读答复；仅修订引入问题可恶化判定；缺少 replay 证据不得宣称通过 |
| transform-revision-roadmap-parsing | revision_coach、KP-M4-01：source order、author dispositions、rebuttal audit | adapted：保留原始意见和作者采纳/反驳/延期；QA 分支不生成回复内容；独立记录真实委员会语境 |
| transform-revision-patching | CAP-M4-02、revision_patch protocol：author decision、claim strength、no collateral edits | adapted：ResearchSpec patch schema/helper 为唯一合同；claim_strength_changes 与 integrity_correction 检查，既有标注映射承载 disposition |
| generation-format-rendering | formatter、disclosure/policy anchor protocols：applicability/status bundle、source anchors | adapted：格式与 disclosure 分支保留；事实声明不能由默认模板冒充；terminal gate 仍由本地规则承接 |
| check-terminal-policy-gate | CAP-M4-04、KP-M4-02/03：terminal policies 与 degradation | adapted：更新知识原文；生产终端裁决只用 ResearchSpec 已接受合同，不执行上游状态写入 |
| check-temporal-integrity-verification | CAP-M4-05 temporal_lint.py | adapted：五 pass 派生计算与当前输入重算验证；缺元数据明确 NOT_CHECKED |
| transform-socratic-mentoring | CAP-M5-03、KP-M5-03：wording advisory、author-led inquiry | preserved：socratic knowledge 更新，现有 questioning procedure；不把措辞问题升级为研究质量判决 |
| check-compliance-check | KP-M5-10、20、23：actor-bound authority、authorization 与 readiness 分开 | adapted：输出 unresolved/documented/cannot_verify；伦理完整性结论不授权人体研究 |
| check-submission-package-verifier | CAP-M5-09：package findings、NOT-CHECKED | adapted：显式清单与文本 profile 检查；未支持的检查保持 not_checked |
| check-passport-verifier | CAP-M5-10：read-only evidence、reset ledger | adapted：本地 corpus 一致性；CLI 负责 resume，不承诺完整上游护照校验 |
| check-citation-existence-verification | CAP-M5-11：`true / false / unresolvable`、resolver coverage | adapted：离线归约真实提供的 resolver 观察；ID-backed false、title-only unresolvable |
| check-pdf-read-preflight | CAP-M5-12：`PASS / FAIL / UNAVAILABLE`；separate content advisory | adapted：三路页数与结构检查可执行；内容分类及文本层未检查 |
| check-citation-verification-summary | CAP-M5-13：resolver outcomes、policy-independent summary | adapted：消费 existence 报告，保留逐项状态、计数、撤稿提示与降级 |
| check-contamination-signals | CAP-M5-14：advisory-only contamination | adapted：预印本及 resolver 信号计算；不得由风格或不可用结果推断污染 |

## 27 mode 审阅

deep-research 的 full/quick/lit-review/systematic-review 共用更新后的检索、研究问题、方法与证据节点；review/fact-check 保留来源与主张边界；three-way-scan 的 WHY/HOW/WHAT 边界保持；socratic 维持作者引导。academic-paper 的 full/plan/outline-only/lit-review/abstract-only 保留结构、论证与写作输出，revision/revision-coach/rebuttal-audit 分开补丁实施、意见整理和纯 QA，format-convert/disclosure/citation-check 分开格式、披露事实和引用核查。reviewer full/quick/methodology-focus 保留角色范围，guided 保持渐进讨论，re-review 保留逐条核验与未解决义务。calibration 和两个 pipeline mode 的特殊差异如下。

## 非 preserved 锚点逐项判定

- reviewer full/quick 的 `converted_only:EIC Review Report`：adapted。上游显示名称变为 Journal-Fit Reviewer，内部角色仍为 eic；生成输出角色 editorial_decision 不增加权限。此项是显示名称匹配差异。
- calibration 的 `FNR`、`FPR`、`gold set`：gap。原有 graph 没有专用 calibration capability，最近似 reviewer/checker 不能等同于完整实验。上游 full tier 要求冻结条件、隔离 gold、重复 panel 和误差区间；directional tier 必须 NOT_CALIBRATED。不能将原有 claim-faithfulness gold checks 当 reviewer calibration。
- calibration 的 `AUC`：removed。上游明确 `Do not report AUC: there is no continuous rubric score`；字符串存在不代表要求生成 AUC。机器 preserved 不能作为语义结论。
- pipeline `Stage 1 RESEARCH`、`FINAL INTEGRITY`、`Process Summary`：adapted / flow。研究、完整性审查与摘要由 frozen graph 及对应节点/Gate 承载；后两项即使字面命中也不授予节点编排权。
- resume 的 `reset boundary`、`awaiting_resume`、`consumes_hash`：removed / adapted。按已确认设计不引入上游 opt-in ledger；`status -> instructions` 和既有 run/node 状态承担恢复。不能声称实现了 ARS 护照 hash 重放。

## 流程权威检查

- `rg 'next phase|proceed to|agent.team' skills/capabilities --glob SKILL.md` 无命中。统一 Completion 只提交当前节点并读取 status，不选择后续节点。
- 四个 ARSU 根 Skill 的 unavailable-runtime boundary 约束整个包，包括嵌套 references。嵌套保留的上游脚本/传输名称是来源语境，不是可执行权限；缺失运行时须 unresolved/not_checked。
- runtime-policy 41 entries（18 adapt、23 retain），reviewer checker closure 5；契约 anchors 56、source inventory 322。未执行上游 Python、模型服务或安装依赖。

## 风险与遗留

初次审阅发现七个旧 validator 直接复制提取工件，`<!--` 导致 SyntaxError，模块依赖和 CLI 参数也未适配。此缺陷已存在于 HEAD。用户授权后一并修复，执行证据见下文；静态 registry 的 operational 标签及 parity 本身仍不能证明执行有效。

reviewer calibration 的专用图能力缺口单独保留；当前四个 ARSU 包含完整来源协议，但不承诺 graph 的近似节点提供校准执行。没有执行模型实验，不能宣称 empirical calibration。

## 验证结果

- `pnpm extraction:index:check`：119 pass；57 个更新提取工件，62 个未变化。
- `pnpm check`、`pnpm lint`、`openspec validate update-ars-to-v3-21-1 --strict`：通过。
- `arsu:anchors:check`：56 anchors / 322 files，无 errors/warnings；runtime-policy check：41 entries、5-file checker closure。
- authoring 连续两次生成：`skills/capabilities` 355 个文件的路径与 SHA-256 完全一致。
- ARSU `convert --force`、`check`、`idempotence`：通过。四个包由转换器输出，未手工修改。
- 首轮全量测试 345 pass、4 fail：审计 manifest 尚未建立和 parity 尚未补齐导致两项失败，另两项插件测试与生成重叠，稳定后单独重跑 2/2 pass。
- 最终 `UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test`：349 tests / 349 pass / 0 fail，耗时约 249 秒。随后修正新 claim/change 组合标识中冒号可能造成的串联碰撞；重新 typecheck/lint、生成/check/idempotence 后，manuscript-annotation、arsu-converter、runtime-policy、anchors 聚焦测试 28/28 pass。首次新增测试的联合类型访问报错已用显式字段收窄修复，最终编译通过。
- 修复后全量测试：351 tests / 351 pass / 0 fail / 0 skipped，耗时约 251 秒（`/tmp/ars-repair-full-tests.log`）。类型检查、lint、OpenSpec strict validation、extraction check、ARSU check/anchors/runtime-policy/idempotence 全部通过。
- 修复后独立生成两次共 156 个文件（含临时 registry）完全一致，其中 155 个 ARS package 文件与生产目录字节一致；生产目录另含 own-vendor 文件。
- maintenance `check` 的 OK 证明审计 hash 与当前工件一致；真实执行可用性由 checker 和打包 CLI 验收支持。

## 增量锚点差异

`arsu-maintenance.mjs diff v3.19.0-828ef3b v3.21.1-127ff85`：版本 v3.19.0 → v3.21.1，commit 828ef3b → 127ff85；extraction 119 → 119，registry 47 → 47；章节覆盖 0.9503128956509691 → 0.9453378676060703，规则覆盖 0.9654416505480335 → 0.9463518494045783。所有 below-threshold、output-missing、knowledge-below、flow-retained 列表为空。覆盖率下降来自新增上游语义，不能据此抹去已列明的执行缺口。

## 执行缺口修复复核

用户随后明确授权“一并修复，修复后本项目要达到可用状态”。七个 checker 的初始 gap 按以下证据更新为 adapted：

- `src/arsu-converter/authoring/checker-source.ts` 与 `checkers/runner.py` 统一生成/验证入口；不再把提取注释头作为 Python 执行。计算模块由 authoring 声明并随包生成，`advance` 使用同一实现对当前输入重算，比较完整报告且不改写材料。
- temporal：`checkers/temporal.py` 对照 `vendor/ars/scripts/temporal_lint.py` 的五 pass，保留 finding_kind、bound_refs、bound_dates 和 matched_span；缺少 timeline/provenance 明确 NOT_CHECKED，不把未运行 pass 算成成功。
- PDF：`checkers/pdf.py` 对照 `vendor/ars/scripts/pdf_read_preflight.py`，保留三路页数、循环/节点预算、解析警告、尾部 EOF、加密及 xref 覆盖检查。内容分类保留 NOT_CHECKED；缺少 pypdf 返回 UNAVAILABLE。
- passport/submission：`checkers/documents.py` 实现本地 corpus 字段一致性及显式文件清单、校验和、披露文件、文本 profile 检查；未覆盖完整上游 passport schema、恢复状态和 PDF/DOCX 匿名性检测，报告逐项列明 not_checked。此处是已声明的有限检查，不宣称完成全部上游审计。
- existence/summary/contamination：`checkers/citations.py` 对照 citation_verification_summary.py 的 C-V6(a) 和 contamination_signals.py。matched 优先，只有 ID 查询 unmatched 可为 false；title-only、缺失观察保持 unresolvable；保留 resolver 明细、撤稿提示和污染遗漏。消费用户授权检索所得观察，不执行网络检索或把提示作为污染判决。
- 生成 SKILL 的 Executable report contract 与 `docs/user/deterministic-checkers.md` 声明实际输入格式、生成方式、依赖和边界。`graph-run.ts` 复用既有输入解析与路径验证，将绝对材料路径/typed parameter 交给 validator；可选输出遵循 manifest required 标记。

执行证据：checker/validator 定向测试 7/7 通过；七种真实报告生成并通过重算，篡改结果和输入变化后的旧报告被拒绝。`node scripts/verify-arsu-checkers.mjs` 使用打包 CLI 完成 init、start、instructions、七次 advance、结束状态及 check all --strict，并验证篡改 PDF 报告无法推进。缺失 PDF parser 的单独验证返回 UNAVAILABLE。未安装依赖、未调用模型或上游运行时。

收尾远端复查发现 v3.21.2（`8fa3d651ad45da9e02762a6ba1fa3d1f231f91b6`，另有 51 文件变化）。本次遵循已确认设计中的 v3.21.1 发布边界；v3.21.2 尚未吸纳，不将本次版本称为最新发布版。

## 按需激活复核（2026-09-14）

- 范围：38 个 ARSU-derived capability 与四个 ARSU 入口 preflight。逐包程序正文、输入输出、knowledge、validator、安全边界和 profile 保持原审阅结论；本轮语义变化只把固定 graph 完成动作改为服从 activation packet。
- Standalone packet 只允许返回 researchspec/ 外的普通输出路径，禁止 run、node、handoff、Gate、Decision、override 和 transition 写入；graph packet 才提供 owning handoff 与精确 advance selector。
- 生成路径与静态受审树均已核对；全库 47/47 core 与 332/332 extension 包含 mode-neutral Completion，旧 advance node:<run>/<node> Completion 为 0。该适配保留既有领域步骤和证据义务，未引入新的流程权威。

## 共享 capability 树复核（2026-09-23）

- 本轮变化来自 paper-humanizer 与 revision-master 四个 package 新增静态 `review-workspace/index.html` 及对应 procedure/manifest；38 个 ARSU-derived package、ARS extraction 与 graph profile 均未修改。
- 中央 `skills/capabilities/registry.json` 与整树 SHA-256 因上述受审资产变化而更新。重新生成的 ARSU capability review、graph assessment 与 gap review 保持原有 ARSU 语义结论；parity 仍为 47/47 operational，所有 below-threshold、output-missing、knowledge-below 与 flow-retained 列表为空。
- 交互工作区不进入 ARSU procedure，不获得 graph、Gate、Decision 或 workflow-state 权限，因此不改变本锚点已审阅的 27 mode 映射与运行边界。

## 冻结审阅件共享资产复核（2026-09-29）

- 本次变更仅影响四个 own-vendor package：`check-paper-humanization-review`、`transform-paper-humanization-revision`、`design-review-response-workboard-planning`、`generation-review-response-round` 的审阅页面、v1 恢复页、procedure 与 manifest。`git diff --name-only -- skills/capabilities` 未显示任何 38 个 ARSU-derived package；`authoring/ars` 提取正文、ARSU procedure 和 graph profile 也未改动。本节复核共享 registry 和审阅工件的牵连，不重新宣称审阅上游 27 mode 的新语义。
- 逐项读取四个变更 package 的生成 SKILL 与 `review-workspace/index.html`、`review-workspace/v1.html`：四者都把新浏览器结果限定为 advisory working material；paper-humanizer 仍回到当前 Gate/Decision 指令，review-response 仍通过现有 SQLite/semantic log 写入。v2 页面无 ResearchSpec 工作流写入口，v1 页面与原生产页 SHA-256 相同。判定为 `adapted`：新增冻结审阅件交接，但未转移流程权威。
- `pnpm own-vendor-maintenance:artifacts` 重生成两组 owner-vendor 包及 parity；47/47 operational，`below_section_threshold`、`below_rule_threshold`、`output_missing`、`knowledge_below_threshold`、`flow_retained` 均为空。`pnpm arsu-maintenance:artifacts` 更新三份 HTML 复核工件；本轮无新增 ARSU-derived capability 或 mode gap。HTML 大幅变化来自嵌入四份新的静态页面及其 v1 恢复页，不是 ARSU 上游协议变化。
- 风险边界：v2 导出前 Agent 必须对照保留的冻结原稿核对当前源码；Quarto 项目脚本、过滤器和计算每次单独获批并在临时副本渲染。临时副本不限制主机权限。上述义务位于 owner-vendor procedure 和 Navigate，不得被解释为 ARSU graph 的自动状态推进。

## 结论

declared-fit-with-notes：七个脚本能力的实际执行缺口已修复并通过真实报告与打包 CLI 验证，支持声明范围内的使用。冻结审阅件只改变共享 own-vendor 资产和 registry，不改变 ARSU-derived procedure 的流程边界。完整上游护照/投稿检查和 reviewer empirical calibration 不在当前确定性实现的承诺内；报告及指令明确保留未检查状态，不能以运行完成代替科学通过或人类 Gate。
