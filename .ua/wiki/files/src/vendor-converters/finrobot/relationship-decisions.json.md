
# src/vendor-converters/finrobot/relationship-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: config:src/vendor-converters/finrobot/relationship-decisions.json -->

FinRobot Skill 关系目录：6 条 Skill 之间的关系一律标为 advisory `related`，仅说明在双方都进入范围时可互相参照，不构成硬依赖，也不自动产生依赖关系。
源码：[src/vendor-converters/finrobot/relationship-decisions.json](../../../../../../src/vendor-converters/finrobot/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/relationship-decisions.json:financial-research-company-fundamentals--financial-research-statement-analysis -->

咨询关系：基本面结论可用独立准备的报表分析进行核对。
源码：[src/vendor-converters/finrobot/relationship-decisions.json](../../../../../../src/vendor-converters/finrobot/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/relationship-decisions.json:financial-research-competitive-position--financial-research-company-fundamentals -->

咨询关系：同业比较可使用独立的基本面记录来界定可比的经营驱动因素。
源码：[src/vendor-converters/finrobot/relationship-decisions.json](../../../../../../src/vendor-converters/finrobot/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/relationship-decisions.json:financial-research-corporate-risk--financial-research-company-fundamentals -->

咨询关系：风险传导分析可引用一份独立的业务与经营驱动因素图谱。
源码：[src/vendor-converters/finrobot/relationship-decisions.json](../../../../../../src/vendor-converters/finrobot/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/relationship-decisions.json:financial-research-event-evidence--financial-research-corporate-risk -->

咨询关系：带来源日期的事件可为独立的风险评估提供信息，但不会自动形成依赖。
源码：[src/vendor-converters/finrobot/relationship-decisions.json](../../../../../../src/vendor-converters/finrobot/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/relationship-decisions.json:financial-research-relative-valuation--financial-research-company-fundamentals -->

咨询关系：估值解读可引用经单独审阅的基本面与假设。
源码：[src/vendor-converters/finrobot/relationship-decisions.json](../../../../../../src/vendor-converters/finrobot/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/relationship-decisions.json:financial-research-statement-analysis--financial-research-company-fundamentals -->

咨询关系：已审阅的报表结论可在双方都在范围内时为独立的公司基本面分析提供参考。
源码：[src/vendor-converters/finrobot/relationship-decisions.json](../../../../../../src/vendor-converters/finrobot/relationship-decisions.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |
