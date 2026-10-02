
# src/vendor-converters/finrobot/skills/financial-research-company-fundamentals/scripts/fundamentals.py
所属分层：[厂商 Skill 转换与审计层](../../../../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot/skills/financial-research-company-fundamentals/scripts](../../../../../../../modules/src/vendor-converters/finrobot/skills/financial-research-company-fundamentals/scripts.md)
<!-- node: file:src/vendor-converters/finrobot/skills/financial-research-company-fundamentals/scripts/fundamentals.py -->

公司基本面确定性入口：按 revenue/profit 等口径计算基础指标与情景预测，并把支撑库注入到 Skill 本地 lib 路径后复用。
源码：[src/vendor-converters/finrobot/skills/financial-research-company-fundamentals/scripts/fundamentals.py](../../../../../../../../../src/vendor-converters/finrobot/skills/financial-research-company-fundamentals/scripts/fundamentals.py)

## 符号（2）
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-company-fundamentals/scripts/fundamentals.py:forecast -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-company-fundamentals/scripts/fundamentals.py:metrics -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| forecast | 函数 | 67–102 | 中等 | forecast、finance、scenario、计算 | 0 | 在显式假设下计算情景预测：区分 actual、assumed 与 forecast，输出营收、利润与每股收益路径。 |
| metrics | 函数 | 33–64 | 中等 | metrics、finance、normalize、计算 | 0 | 按货币与单位倍率归一化收入、利润、资产等基础科目，计算利润率、杠杆和回报类指标。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [financial_support.py](../../../lib/financial_support.py.md) | src/vendor-converters/finrobot/lib/financial_support.py | FinRobot 派生金融 Skill 共用的便携确定性支撑库：输入校验、日期与单位归一、原子 JSON 写入和子命令解析分发。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| forecast | 函数 | 67–102 | 在显式假设下计算情景预测：区分 actual、assumed 与 forecast，输出营收、利润与每股收益路径。 |
| metrics | 函数 | 33–64 | 按货币与单位倍率归一化收入、利润、资产等基础科目，计算利润率、杠杆和回报类指标。 |
