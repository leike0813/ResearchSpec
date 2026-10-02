
# src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py
所属分层：[厂商 Skill 转换与审计层](../../../../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts](../../../../../../../modules/src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts.md)
<!-- node: file:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py -->

财务报表确定性入口：归一化多来源报表记录，计算比率与增长，判定期间覆盖、跨源一致性、市值勾稽与币种口径，并输出证据审计。
源码：[src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py](../../../../../../../../../src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py)

## 符号（14）
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:audit -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:caliber_conflict -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:cross_source -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:currency_caliber -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:forecast -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:market_cap_check -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:metrics -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:normalize -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:parse_fx -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:parse_inputs -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:parse_record -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:parse_windows -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:period_coverage -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-statement-analysis/scripts/statements.py:provenance_verdict -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| audit | 函数 | 635–656 | 简单 | audit、entrypoint、orchestration | 0 | 证据审计入口：编排期间覆盖、跨源比对、市值勾稽和币种口径检查，汇总为可签署的审计结果。 |
| caliber_conflict | 函数 | 363–373 | 简单 | caliber、validation、finance | 0 | 判定两条记录的口径是否冲突，冲突时给出可比较的换算说明。 |
| cross_source | 函数 | 496–540 | 中等 | cross-source、audit、reconciliation | 0 | 对齐多来源的同期间记录，判定口径一致、差异大小与无法对齐的边界。 |
| currency_caliber | 函数 | 604–632 | 中等 | currency、audit、fx | 0 | 检查币种口径是否统一，只使用已提供的汇率证据换算并记录未解决项。 |
| forecast | 函数 | 247–288 | 中等 | forecast、finance、计算 | 0 | 基于历史期间与显式假设生成预测序列，并标注每个预测值的依据与不确定性。 |
| market_cap_check | 函数 | 543–601 | 复杂 | market-cap、audit、provenance | 0 | 用价格与股本的独立溯源勾稽市值，明确拒绝在没有价格或股本证据时换算股数。 |
| metrics | 函数 | 187–244 | 复杂 | metrics、ratios、finance、计算 | 0 | 按期间计算利润率、回报率、杠杆和现金转换等比率，仅在同一时间序列基础上计算增长。 |
| normalize | 函数 | 172–184 | 简单 | normalize、statements、validation | 0 | 归一化整份报表载荷，拒绝混合币种并保留期间与数值类型字段。 |
| parse_fx | 函数 | 291–312 | 简单 | fx、parse、provenance | 0 | 解析汇率证据条目，记录来源、日期与目标币种，作为唯一的换算依据。 |
| parse_inputs | 函数 | 70–89 | 简单 | validation、input、statements | 0 | 校验输入根结构、报表类型与记录集合，给出可用的归一化载荷。 |
| parse_record | 函数 | 129–169 | 中等 | parse、records、validation | 0 | 解析单条报表记录：科目、期间、数值、币种、单位、频率、区间与 kind 全部逐项校验。 |
| parse_windows | 函数 | 109–126 | 简单 | period、parse、validation | 0 | 解析期间覆盖窗口定义，校验报表、行项目与起止日期。 |
| period_coverage | 函数 | 416–493 | 复杂 | period-coverage、audit、计算 | 0 | 判定每个期间窗口是否被有界的实际期间完整覆盖，区分 interval-only、covered、incomplete 与 overlap。 |
| provenance_verdict | 函数 | 100–106 | 简单 | provenance、validation、statements | 0 | 根据溯源条目数量判定来源可信度，来源不足时降级而非默认可信。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [financial_support.py](../../../lib/financial_support.py.md) | src/vendor-converters/finrobot/lib/financial_support.py | FinRobot 派生金融 Skill 共用的便携确定性支撑库：输入校验、日期与单位归一、原子 JSON 写入和子命令解析分发。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| audit | 函数 | 635–656 | 证据审计入口：编排期间覆盖、跨源比对、市值勾稽和币种口径检查，汇总为可签署的审计结果。 |
| caliber_conflict | 函数 | 363–373 | 判定两条记录的口径是否冲突，冲突时给出可比较的换算说明。 |
| cross_source | 函数 | 496–540 | 对齐多来源的同期间记录，判定口径一致、差异大小与无法对齐的边界。 |
| currency_caliber | 函数 | 604–632 | 检查币种口径是否统一，只使用已提供的汇率证据换算并记录未解决项。 |
| forecast | 函数 | 247–288 | 基于历史期间与显式假设生成预测序列，并标注每个预测值的依据与不确定性。 |
| market_cap_check | 函数 | 543–601 | 用价格与股本的独立溯源勾稽市值，明确拒绝在没有价格或股本证据时换算股数。 |
| metrics | 函数 | 187–244 | 按期间计算利润率、回报率、杠杆和现金转换等比率，仅在同一时间序列基础上计算增长。 |
| normalize | 函数 | 172–184 | 归一化整份报表载荷，拒绝混合币种并保留期间与数值类型字段。 |
| parse_fx | 函数 | 291–312 | 解析汇率证据条目，记录来源、日期与目标币种，作为唯一的换算依据。 |
| parse_inputs | 函数 | 70–89 | 校验输入根结构、报表类型与记录集合，给出可用的归一化载荷。 |
| parse_record | 函数 | 129–169 | 解析单条报表记录：科目、期间、数值、币种、单位、频率、区间与 kind 全部逐项校验。 |
| parse_windows | 函数 | 109–126 | 解析期间覆盖窗口定义，校验报表、行项目与起止日期。 |
| period_coverage | 函数 | 416–493 | 判定每个期间窗口是否被有界的实际期间完整覆盖，区分 interval-only、covered、incomplete 与 overlap。 |
| provenance_verdict | 函数 | 100–106 | 根据溯源条目数量判定来源可信度，来源不足时降级而非默认可信。 |
