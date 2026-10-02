
# src/vendor-converters/finrobot/admission-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: config:src/vendor-converters/finrobot/admission-decisions.json -->

FinRobot 能力准入 SSOT：在 snapshot-2717499 审计基线上批准 6 个 capability 映射为中立的 financial-research-* Skill，规定各自的来源 surface、领域归属、Apache-2.0 许可表达、空硬依赖与统一 5 条安全约束。
源码：[src/vendor-converters/finrobot/admission-decisions.json](../../../../../../src/vendor-converters/finrobot/admission-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/admission-decisions.json:financial-research-company-fundamentals -->

准入决策 company-fundamentals-analysis：由 8 个来源 surface（analyzer 业务亮点/公司描述/关键数据、enhanced 预测方法、equity 公司概览与主要结论、processor 增长预测、数值证据）生成 company-fundamentals Skill，归属会计审计与银行金融投资两个领域。
源码：[src/vendor-converters/finrobot/admission-decisions.json](../../../../../../src/vendor-converters/finrobot/admission-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/admission-decisions.json:financial-research-competitive-position -->

准入决策 competitive-position-analysis：由 analyzer 竞争者分析与 equity 竞争者分析两个 surface 生成 competitive-position Skill，仅归属银行金融投资领域，发布形态只有 SKILL.md。
源码：[src/vendor-converters/finrobot/admission-decisions.json](../../../../../../src/vendor-converters/finrobot/admission-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/admission-decisions.json:financial-research-corporate-risk -->

准入决策 corporate-risk-analysis：由风险评估、增强风险因子与 equity risks 三个 surface 生成 corporate-risk Skill，发布形态为纯指令式 Agent procedure。
源码：[src/vendor-converters/finrobot/admission-decisions.json](../../../../../../src/vendor-converters/finrobot/admission-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/admission-decisions.json:financial-research-event-evidence -->

准入决策 financial-news-impact-analysis：由催化事件识别、分类、概率估计与影响评估及新闻摘要共 6 个 surface 生成 event-evidence Skill，产出 SKILL.md 与 event_evidence.py 两个资产。
源码：[src/vendor-converters/finrobot/admission-decisions.json](../../../../../../src/vendor-converters/finrobot/admission-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/admission-decisions.json:financial-research-relative-valuation -->

准入决策 relative-valuation-analysis：由增强估值分析、估值概览、三类敏感性分析、EV/EBITDA、同业比较、可比性、EV 桥接与 DCF 有效性共 10 个 surface 生成 relative-valuation Skill。
源码：[src/vendor-converters/finrobot/admission-decisions.json](../../../../../../src/vendor-converters/finrobot/admission-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/admission-decisions.json:financial-research-statement-analysis -->

准入决策 financial-statement-analysis：由资产负债表、现金流量表、利润表、分部表、收入汇总、API/PDF 提取及 TTM 覆盖、币种口径、来源血缘共 10 个 surface 生成 statement-analysis Skill，同时归属会计审计与银行金融投资两个领域。
源码：[src/vendor-converters/finrobot/admission-decisions.json](../../../../../../src/vendor-converters/finrobot/admission-decisions.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [license-decisions.json](license-decisions.json.md) | src/vendor-converters/finrobot/license-decisions.json | FinRobot 许可声明处置目录：7 条上游许可声明中仅 root-apache 与 trademark-attribution 被 preserve 为 Apache-2.0 义务，其余五条（借用内容、FinNLP 外部、历史导入树、Anthropic 技能声明、第三方数据集与 fixture）因缺少可核实的生产内容许可而全部 excluded。 |
| [origin-decisions.json](origin-decisions.json.md) | src/vendor-converters/finrobot/origin-decisions.json | FinRobot 内容来源处置目录：8 个来源中 root-apache 与 native-desktop 被判为 production-source，可在保留来源哈希、派生说明、LICENSE/NOTICE 与不背书边界的前提下复制或改写；AutoGen 归属内容、外部 FinNLP、外部数据集、filings 与 marker 树以及 Anthropic 派生内容全部 excluded。 |
| [relationship-decisions.json](relationship-decisions.json.md) | src/vendor-converters/finrobot/relationship-decisions.json | FinRobot Skill 关系目录：6 条 Skill 之间的关系一律标为 advisory `related`，仅说明在双方都进入范围时可互相参照，不构成硬依赖，也不自动产生依赖关系。 |
| [resource-decisions.json](resource-decisions.json.md) | src/vendor-converters/finrobot/resource-decisions.json | FinRobot 外部资源处置目录：8 类资源被分为 reference-only（公开披露、已发布报告）、user-configured（用户自备数据、目标 Agent 的浏览器/申报/行情工具）、bundled（4 个 Python 3.11 标准库确定性计算入口）与 excluded（FinRobot 上游运行时）四档。 |
