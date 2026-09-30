# FinRobot 候选 Agent 语义审阅

审阅日期：2026-09-30。对象：`snapshot-2717499` 的六份完整候选和六份隔离 extension。
本记录是维护 Agent 的内容审阅，不代表人类批准或生产准入。

完整候选树集合 SHA-256：
`1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6`。
来源 audit SHA-256：
`3a592982ff4bd9f53853ef56b958e330593d7b70594622580975bafa3727884b`。
逐文件和逐树身份见 [review.json](artifacts/candidate/review.json)。

## 证据与判定方法

以下表格中的旧文件位于 `skills/plugins/vendors/finrobot/<raw-id>/`，相对于仓库根；
候选文件位于本锚点 `artifacts/candidate/vendors/finrobot/<raw-id>/`；对应 extension
位于 `artifacts/candidate/extensions/capabilities/<extension-id>/`。
表内引号是旧文件的原文片段；候选承载栏记录实际章节或函数，而非上游自述。
`preserved` 指义务保留，`adapted` 指由完整 Agent 程序或自有确定性实现承接。
选中来源仅作证据，不复制 FinRobot runtime。七项新 surface 的来源和具体实现
逐一记录在各候选 `DERIVATION.json` 的 `capability_map`。

主 Agent 检查了完整树和投影；沿用当前模型的原生子 Agent 分别复核业务实现、
来源与许可闭包。审阅发现的跨币增长、混合频率、标签排序、报表同名字段、
金额/股数 scale 表述和敏感性范围问题已经修正并重新生成本 hash。

## company-fundamentals

raw：`financial-research-company-fundamentals`；extension：`plugin-financial-company-fundamentals`。

| 不可丢失义务与旧原文 | 候选承载 | 判定 |
| --- | --- | --- |
| `SKILL.md / Workflow`：“Describe the business model, segments, customers, geography, and revenue logic” | raw 与 extension 的 Workflow 3、Responsibilities 业务模型与驱动程序 | preserved |
| `SKILL.md / Workflow`：“Choose base, upside, and downside driver assumptions” | Workflow 5；`scripts/fundamentals.py` 与 extension `tools/fundamentals.py` 保持旧字节，假设仍由 Agent 提供 | preserved |
| `SKILL.md / Responsibilities`：“The script validates structured input, calculates ratios and scenario paths” | Formal entrypoint 的 metrics/forecast、自有 support、明确错误与覆盖约束 | preserved |
| `SKILL.md / Outputs`：“Link every material statement to evidence” | Responsibilities 增加数字种类与依赖程序，Hard constraints 和 Workflow 4 消费既有报表审计；extension brief 增加 `numeric_evidence` | adapted |
| `SKILL.md / Responsibilities`：“Record each conclusion with evidence, assumptions, counterevidence, and limitations.” | 数字失效后重新评价、撤回或修订评级/目标/论点；不照搬上游保留评级政策 | adapted |

新增 `financial-numeric-evidence` 来自 `engine/models/numeric_claim.py / NumericClaim`。
依赖无效数值的叙事由 Agent 重新判断，脚本不决定评级或投资结论。

## competitive-position

raw：`financial-research-competitive-position`；extension：`plugin-financial-competitive-position`。

| 不可丢失义务与旧原文 | 候选承载 | 判定 |
| --- | --- | --- |
| `SKILL.md / Workflow`：“Establish inclusion and exclusion criteria based on economic drivers” | Workflow 2 与 Responsibilities 的 peer 选择程序，仍由 Agent 决定 | preserved |
| `SKILL.md / Hard constraints`：“Do not compare unaligned periods, currencies, units” | Workflow 3 消费同一份期间/血缘/市值审计，要求报价币与报表币的有来源、有日期 FX | adapted |
| `SKILL.md / Workflow`：“Test claimed advantages against persistence, substitutability, customer behavior” | Workflow 5 的机制、可证伪指标和反证，未缩减为倍数排序 | preserved |
| `SKILL.md / Outputs`：“peer inclusion/exclusion ledger” | Outputs 保留 peer 台账、经营比较、估值解释和限制；仍为 llm 包，无脚本与新 hard dependency | preserved |

没有新增独立 surface。复用证据结果是程序义务，未建立运行时依赖或新的领域成员关系。

## corporate-risk

raw：`financial-research-corporate-risk`；extension：`plugin-financial-corporate-risk`。

| 不可丢失义务与旧原文 | 候选承载 | 判定 |
| --- | --- | --- |
| `SKILL.md / Workflow`：“identify source, exposure, trigger, transmission path” | Workflow 3、Responsibilities 的风险传导程序 | preserved |
| `SKILL.md / Hard constraints`：“Distinguish gross exposure, mitigants, and residual exposure.” | Workflow 5、Hard constraints、Outputs 风险台账 | preserved |
| `SKILL.md / Workflow`：“Rank risks for the stated decision and horizon.” | Workflow 6 及 likelihood/impact/confidence/反证程序 | preserved |
| `SKILL.md / Purpose`：“no script assigns semantic probability or severity” | llm execution、空知识工具集合、advisory 输出；不取得合规或投资授权 | preserved |

raw 业务正文仅更新 release 元数据；extension 正文保持原字节。无新增语义，不机械扩充步骤。

## event-evidence

raw：`financial-research-event-evidence`；extension：`plugin-financial-event-evidence`。

| 不可丢失义务与旧原文 | 候选承载 | 判定 |
| --- | --- | --- |
| `SKILL.md / Workflow`：“distinguish event date from publication date” | Workflow 2 与 timestamps/source 输入合同 | preserved |
| `SKILL.md / Workflow`：“remove exact or declared duplicates” | Formal entrypoint prepare；`scripts/event_evidence.py` 与 `tools/event_evidence.py` 保持旧字节 | preserved |
| `SKILL.md / Responsibilities`：“assess causal path, probability, sentiment, magnitude, timing, and counterevidence” | Agent 逐事件程序，脚本不从标题或关键词推断语义 | preserved |
| `SKILL.md / Workflow`：“The script applies only the supplied numeric scores” | rank 输入概率/影响/置信度及确定性 tie-breakers；语义评分仍明确由 Agent 提供 | preserved |

raw 业务正文仅更新 release 元数据；extension 正文保持原字节。无新增固定影响阈值。

## relative-valuation

raw：`financial-research-relative-valuation`；extension：`plugin-financial-relative-valuation`。

| 不可丢失义务与旧原文 | 候选承载 | 判定 |
| --- | --- | --- |
| `SKILL.md / Purpose`：“The Agent chooses methods, assumptions, peers, weights, and conclusions.” | Purpose、Workflow 3 与方法适用性程序；银行/保险不自动套 EV/FCF，亏损 P/E 为 NM | preserved |
| `SKILL.md / Workflow`：“Run `value` for DCF, peer-multiple, or weighted valuation.” | `valuation.py / dcf_result, multiples_result, value`；缺乏比较依据时保留个别结果并将综合值置 null | adapted |
| `SKILL.md / Inputs`：“State net debt, preferred stock, noncontrolling interest, diluted shares” | `equity_bridge` 逐项扣减，拒绝 net_debt 与 debt/cash 重复；未核实 claim 显式保留且阻止认证组合；非正终值现金流或普通股权益失败 | adapted |
| `SKILL.md / Workflow`：“Run `sensitivity` for explicit discount-rate” | `sensitivity` 共用 value 的计算和校验；正式支持 r/g 和 multiple 网格，revenue/margin 由 Agent 重算 base 后再执行 value | adapted |
| `SKILL.md / Workflow`：“Do not average incompatible methods merely to create precision.” | `comparability_reasons` 检查币种/期间/日期/每股基础、股数及桥、明确适用性与权重理由；分歧仅诊断，不按经验阈值挑方法 | adapted |

三个新增 surface 绑定 `valuation_synthesis.py / synthesize_valuations`、
`audit/ev_bridge.py / audit_ev_bridge`、`dcf.py / calculate_dcf`。
金额与股数使用同一个 scale，结果每股值不带金额 scale；每个方法单独显示结果币种。
DCF 固定年末折现，不宣称支持 midyear。敏感性不是新估值法。
extension 的 `comparability_checks`、`equity_bridge` 同时进入正文和 validator `--required`。

## statement-analysis

raw：`financial-research-statement-analysis`；extension：`plugin-financial-statement-analysis`。

| 不可丢失义务与旧原文 | 候选承载 | 判定 |
| --- | --- | --- |
| `SKILL.md / Purpose`：“the Agent or user-configured tools extract source values and provenance” | Workflow 2/3 与 Formal entrypoint；仍不让 normalize 充当 PDF/API 语义 extractor | preserved |
| `SKILL.md / Workflow`：“calculate growth, margins, returns, leverage, liquidity” | `statements.py / metrics` 复用 record 校验、实际报表类别和日期排序；跨币、混频或排序未知不报告增长，ratio 不兼容时带原因 | adapted |
| `SKILL.md / Inputs`：“Record fiscal calendar, period duration, restatement status” | `parse_record` 保存频率、起止、年度、修订、kind/lineage；`period_coverage` 检查有界 annual/quarter/ttm/ytd 链、窗口、缺口和重叠 | adapted |
| `SKILL.md / Hard constraints`：“Preserve source, period, currency, unit, sign, restatement, and reported label.” | normalize 保存原值/单位和新增 DTO，`cross_source` 对齐日期并比较 base units；`currency_caliber` 只用显式 FX，市值核对不对股数换汇 | adapted |
| `SKILL.md / Responsibilities`：“The Agent owns source verification” | provenance/derived_from 与 `market_cap_check` 区分 independent、not_independent、uncertified；未计算的 residual 为 null，不能视为核对通过 | adapted |

三个新增 surface 绑定 `audit/ttm_period.py / audit_ttm_period`、
`audit/currency_caliber.py / audit_currency_caliber`、`engine/data/validator.py / market_cap_consistency`。
窗口 covered 仅指日历区间覆盖，不等于金额 TTM 认证；instant 不是覆盖链。
脚本比较声明的 lineage，不验证声明真实性；Agent 必须核对来源、合并范围、修订和 FX 日期适用性。
forecast 算术保持旧实现。extension 的 `evidence_checks` 进入正文及 validator `--required`。

## 投影、验证与流程权威

- 六 raw → 六 extension，四 mixed、两 llm；八份 tools 与 raw scripts/support 逐字节一致，全部知识 hash 绑定真实字节。
- llm 包仅使用 output-role policy；四 mixed 沿用自有 brief validator。manifest 显式传入各包 `--required`，不依赖 validator 的通用默认列表。
- validators 只读取 submission/brief JSON 并检验非空字段；它们不验证业务结论真实性，也不执行金融工具、模型或网络请求。
- 六 profiles 与生产逐字节相同。金融域六 capability/profile，会计域两 capability/profile。无新增 Gate、Decision、入口或运行时授权。
- extension SKILL 的 next-node/next-phase/agent-team/proceed-to-next 检索无命中；`gate_policy: advisory`，研究语义输出不取得流程修改权。
- 来源政策覆盖 1,049 entries、129 surfaces；39 admitted surfaces 精确落在六份定义。旧 34 excluded 和新增 56 第三方 Skill 未升格。19 份来源只作审计证据，不出现在分发树。

## 结论

**declared-fit-with-notes**。六项原业务义务保留，七项新 surface 由完整自有程序承接，
没有本轮范围内未承接的 gap。选中的源代码依赖、阈值策略、Desktop 编排和第三方
转存内容未随之分发。独立估值法仍需独立审计。

验证证明合成输入上的确定性行为、完整树字节与投影合同；不证明真实市场输出正确性、
宿主工具取数质量或全部 893 个 Desktop 文件均已通过语义审查。实际来源独立性、
会计定义、方法适用性和外部数据日期仍由 Agent 结合任务证据确认。

敏感性网格遇到任一无效组合会整体失败，不输出逐格错误。FX 仅消费显式方向的
币对，不推导倒数。市值的 derived_from 文本标记只是辅助识别，不能代替来源核实。
普通 metrics 和 balance-sheet residual 是对调用者已选口径的算术，不认证会计
可比性；cross_source 的数值差异不采用默认 materiality 阈值。

本 hash 的人类批准仍待取得。正式 pin、生产政策与包、catalog、主规格和新
production manifest 尚未切换；生产 `snapshot-297a8d2` 继续保持独立可验证。
