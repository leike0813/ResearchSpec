
# src/vendor-converters/finrobot/surface-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: config:src/vendor-converters/finrobot/surface-decisions.json -->

FinRobot 能力面决策目录：129 条记录把上游 surface_id（源文件 + 符号）映射为 admitted-capability 或 excluded，并标明实现形式（bundled-script 22 条 / agent-procedure 17 条）与产出的 10 个发布资产。
源码：[src/vendor-converters/finrobot/surface-decisions.json](../../../../../../src/vendor-converters/finrobot/surface-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/surface-decisions.json:excluded-surface-bulk -->

排除面集合：129 条 surface 中 90 条被排除，其中 56 条因第三方来源未验证（全部归属 anthropic-derived），34 条因落在六个准入能力之外。
源码：[src/vendor-converters/finrobot/surface-decisions.json](../../../../../../src/vendor-converters/finrobot/surface-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/surface-decisions.json:financial-research-company-fundamentals -->

surface 映射：8 个 admitted-capability 汇入 company-fundamentals，产出 SKILL.md 与 scripts/fundamentals.py。
源码：[src/vendor-converters/finrobot/surface-decisions.json](../../../../../../src/vendor-converters/finrobot/surface-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/surface-decisions.json:financial-research-competitive-position -->

surface 映射：2 个 admitted-capability 汇入 competitive-position，仅产出 SKILL.md，实现形式为 agent-procedure。
源码：[src/vendor-converters/finrobot/surface-decisions.json](../../../../../../src/vendor-converters/finrobot/surface-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/surface-decisions.json:financial-research-corporate-risk -->

surface 映射：3 个 admitted-capability 汇入 corporate-risk，仅产出 SKILL.md，实现形式为 agent-procedure。
源码：[src/vendor-converters/finrobot/surface-decisions.json](../../../../../../src/vendor-converters/finrobot/surface-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/surface-decisions.json:financial-research-event-evidence -->

surface 映射：6 个 admitted-capability 汇入 event-evidence，产出 SKILL.md 与 scripts/event_evidence.py。
源码：[src/vendor-converters/finrobot/surface-decisions.json](../../../../../../src/vendor-converters/finrobot/surface-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/surface-decisions.json:financial-research-relative-valuation -->

surface 映射：10 个 admitted-capability 汇入 relative-valuation，产出 SKILL.md 与 scripts/valuation.py。
源码：[src/vendor-converters/finrobot/surface-decisions.json](../../../../../../src/vendor-converters/finrobot/surface-decisions.json)
<!-- node: resource:src/vendor-converters/finrobot/surface-decisions.json:financial-research-statement-analysis -->

surface 映射：10 个 admitted-capability 汇入 statement-analysis，产出 SKILL.md 与 scripts/statements.py，是准入 surface 数量最多的一组。
源码：[src/vendor-converters/finrobot/surface-decisions.json](../../../../../../src/vendor-converters/finrobot/surface-decisions.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [admission-decisions.json](admission-decisions.json.md) | src/vendor-converters/finrobot/admission-decisions.json | FinRobot 能力准入 SSOT：在 snapshot-2717499 审计基线上批准 6 个 capability 映射为中立的 financial-research-* Skill，规定各自的来源 surface、领域归属、Apache-2.0 许可表达、空硬依赖与统一 5 条安全约束。 |
