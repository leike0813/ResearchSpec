
# src/vendor-converters/finrobot/skills/financial-research-event-evidence/scripts/event_evidence.py
所属分层：[厂商 Skill 转换与审计层](../../../../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot/skills/financial-research-event-evidence/scripts](../../../../../../../modules/src/vendor-converters/finrobot/skills/financial-research-event-evidence/scripts.md)
<!-- node: file:src/vendor-converters/finrobot/skills/financial-research-event-evidence/scripts/event_evidence.py -->

事件证据确定性入口：校验并去重事件记录、绑定来源与时区，再按影响与置信度排序输出。
源码：[src/vendor-converters/finrobot/skills/financial-research-event-evidence/scripts/event_evidence.py](../../../../../../../../../src/vendor-converters/finrobot/skills/financial-research-event-evidence/scripts/event_evidence.py)

## 符号（2）
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-event-evidence/scripts/event_evidence.py:prepare -->
<!-- node: function:src/vendor-converters/finrobot/skills/financial-research-event-evidence/scripts/event_evidence.py:rank -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| prepare | 函数 | 29–63 | 中等 | events、normalize、provenance、准备 | 0 | 归一化 as_of 与事件列表，去除重复事件并为每条记录补齐溯源、时间与情绪字段。 |
| rank | 函数 | 66–91 | 中等 | events、ranking、finance、计算 | 0 | 按声明的权重对事件打分排序，输出影响、时域、概率和置信度，并标注未验证的结论。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [financial_support.py](../../../lib/financial_support.py.md) | src/vendor-converters/finrobot/lib/financial_support.py | FinRobot 派生金融 Skill 共用的便携确定性支撑库：输入校验、日期与单位归一、原子 JSON 写入和子命令解析分发。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| prepare | 函数 | 29–63 | 归一化 as_of 与事件列表，去除重复事件并为每条记录补齐溯源、时间与情绪字段。 |
| rank | 函数 | 66–91 | 按声明的权重对事件打分排序，输出影响、时域、概率和置信度，并标注未验证的结论。 |
