
# src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py
所属分层：[厂商 Skill 转换与审计层](../../../../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts](../../../../../../../modules/src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts.md)
<!-- node: file:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py -->

相对估值确定性入口：实现 DCF、可比倍数、加权复合估值与敏感性网格，字段白名单严格，未声明字段直接拒绝。
源码：[src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py](../../../../../../../../../src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py)

## 符号（11）
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:comparability_reasons -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:dcf_result -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:equity_bridge -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:metadata -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:multiples_result -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:reject_duplicate_bridge -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:reject_unknown -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:run_advisories -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:run_diagnostics -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:sensitivity -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-relative-valuation/scripts/valuation.py:value -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| comparability_reasons | 函数 | 93–112 | 简单 | comparability、valuation、validation | 0 | 判断各估值方法是否口径可比，记录不可比的具体原因并影响复合认证。 |
| dcf_result | 函数 | 136–167 | 中等 | dcf、valuation、计算 | 0 | 计算 DCF 结果：折现自由现金流、推导终值并给出企业价值、股权价值和每股价值。 |
| equity_bridge | 函数 | 71–90 | 简单 | equity-bridge、valuation、计算 | 0 | 从企业价值桥接到股权价值：处理净债务、优先股、少数股东权益与稀释股本。 |
| metadata | 函数 | 55–68 | 简单 | metadata、valuation、finance | 0 | 抽取货币、as-of、期间与股本口径等方法级元数据，供跨方法可比性检查使用。 |
| multiples_result | 函数 | 170–189 | 简单 | multiples、valuation、计算 | 0 | 按选定倍数计算可比公司估值结果，并给出对应的价值桥接与口径元数据。 |
| reject_duplicate_bridge | 函数 | 45–52 | 简单 | validation、equity-bridge、finance | 0 | 拒绝股权价值桥接中重复出现的同一桥接项，避免同一债务或现金被多次扣减。 |
| reject_unknown | 函数 | 38–42 | 简单 | validation、契约、安全 | 0 | 拒绝契约未定义的字段，把拼写或越权字段变成显式错误而不是被忽略。 |
| run_advisories | 函数 | 127–133 | 简单 | advisory、valuation、输出 | 0 | 把不构成阻断的问题转成建议性提示，与 diagnostics 分离。 |
| run_diagnostics | 函数 | 115–124 | 简单 | diagnostics、valuation、metrics | 0 | 汇总方法间绝对差、相对跨度和终值占比等诊断指标。 |
| sensitivity | 函数 | 239–263 | 中等 | sensitivity、valuation、计算 | 0 | 生成折现率与终值增长率的敏感性网格，并复用主入口的取值校验。 |
| value | 函数 | 192–236 | 中等 | valuation、composite、核心流程 | 0 | 加权复合估值主入口：计算各方法结果、诊断方法分歧，并在可比性与权重理由缺失时拒绝认证。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [financial_support.py](../../../lib/financial_support.py.md) | src/vendor-converters/finrobot/lib/financial_support.py | FinRobot 派生金融 Skill 共用的便携确定性支撑库：输入校验、日期与单位归一、原子 JSON 写入和子命令解析分发。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| comparability_reasons | 函数 | 93–112 | 判断各估值方法是否口径可比，记录不可比的具体原因并影响复合认证。 |
| dcf_result | 函数 | 136–167 | 计算 DCF 结果：折现自由现金流、推导终值并给出企业价值、股权价值和每股价值。 |
| equity_bridge | 函数 | 71–90 | 从企业价值桥接到股权价值：处理净债务、优先股、少数股东权益与稀释股本。 |
| metadata | 函数 | 55–68 | 抽取货币、as-of、期间与股本口径等方法级元数据，供跨方法可比性检查使用。 |
| multiples_result | 函数 | 170–189 | 按选定倍数计算可比公司估值结果，并给出对应的价值桥接与口径元数据。 |
| reject_duplicate_bridge | 函数 | 45–52 | 拒绝股权价值桥接中重复出现的同一桥接项，避免同一债务或现金被多次扣减。 |
| reject_unknown | 函数 | 38–42 | 拒绝契约未定义的字段，把拼写或越权字段变成显式错误而不是被忽略。 |
| run_advisories | 函数 | 127–133 | 把不构成阻断的问题转成建议性提示，与 diagnostics 分离。 |
| run_diagnostics | 函数 | 115–124 | 汇总方法间绝对差、相对跨度和终值占比等诊断指标。 |
| sensitivity | 函数 | 239–263 | 生成折现率与终值增长率的敏感性网格，并复用主入口的取值校验。 |
| value | 函数 | 192–236 | 加权复合估值主入口：计算各方法结果、诊断方法分歧，并在可比性与权重理由缺失时拒绝认证。 |
