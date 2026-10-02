
# src/vendor-converters/finrobot/lib/financial_support.py
所属分层：[厂商 Skill 转换与审计层](../../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot/lib](../../../../../modules/src/vendor-converters/finrobot/lib.md)
<!-- node: file:src/vendor-converters/finrobot/lib/financial_support.py -->

FinRobot 派生金融 Skill 共用的便携确定性支撑库：输入校验、日期与单位归一、原子 JSON 写入和子命令解析分发。
源码：[src/vendor-converters/finrobot/lib/financial_support.py](../../../../../../../src/vendor-converters/finrobot/lib/financial_support.py)

## 符号（10）
<!-- node: function:src/vendor-converters/finrobot/lib/financial_support.py:command_parser -->
<!-- node: function:src/vendor-converters/finrobot/lib/financial_support.py:load_json -->
<!-- node: function:src/vendor-converters/finrobot/lib/financial_support.py:normalize_date -->
<!-- node: function:src/vendor-converters/finrobot/lib/financial_support.py:normalize_datetime -->
<!-- node: function:src/vendor-converters/finrobot/lib/financial_support.py:normalize_unit -->
<!-- node: function:src/vendor-converters/finrobot/lib/financial_support.py:require_integer -->
<!-- node: function:src/vendor-converters/finrobot/lib/financial_support.py:require_list -->
<!-- node: function:src/vendor-converters/finrobot/lib/financial_support.py:require_number -->
<!-- node: function:src/vendor-converters/finrobot/lib/financial_support.py:run_command -->
<!-- node: function:src/vendor-converters/finrobot/lib/financial_support.py:write_json_atomic -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| command_parser | 函数 | 153–159 | 简单 | cli、argument-parsing、工具 | 0 | 构造带子命令的 argparse 解析器，失败信息保持机器可读。 |
| load_json | 函数 | 20–30 | 简单 | json、io、validation、输入 | 0 | 读取并解析一个 JSON 对象文件，缺文件或非对象根节点时抛出可纠正的 InputError。 |
| normalize_date | 函数 | 84–89 | 简单 | date、normalize、validation | 0 | 把日期字段归一为 ISO 日期字符串并校验格式。 |
| normalize_datetime | 函数 | 92–102 | 简单 | datetime、normalize、validation | 0 | 把时间戳字段归一为带时区的 ISO 8601 字符串。 |
| normalize_unit | 函数 | 108–113 | 简单 | unit、normalize、finance | 0 | 把 units/millions/billions 等单位写法归一为倍率。 |
| require_integer | 函数 | 77–81 | 简单 | validation、integer、输入 | 0 | 要求字段为整数并按需校验上下界。 |
| require_list | 函数 | 39–43 | 简单 | validation、list、输入 | 0 | 要求字段为数组，可选要求非空，否则抛出 InputError。 |
| require_number | 函数 | 58–68 | 简单 | validation、number、输入 | 0 | 要求字段为数值并按需校验上下界，拒绝布尔与非有限值。 |
| run_command | 函数 | 162–175 | 简单 | cli、dispatch、工具 | 0 | 按子命令分发到对应处理函数，把 InputError 转成稳定的退出码与结构化错误。 |
| write_json_atomic | 函数 | 130–150 | 简单 | atomic-write、json、io、安全 | 0 | 以临时文件加原子替换的方式写出 JSON，并按需拒绝覆盖已存在目标。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| command_parser | 函数 | 153–159 | 构造带子命令的 argparse 解析器，失败信息保持机器可读。 |
| load_json | 函数 | 20–30 | 读取并解析一个 JSON 对象文件，缺文件或非对象根节点时抛出可纠正的 InputError。 |
| normalize_date | 函数 | 84–89 | 把日期字段归一为 ISO 日期字符串并校验格式。 |
| normalize_datetime | 函数 | 92–102 | 把时间戳字段归一为带时区的 ISO 8601 字符串。 |
| normalize_unit | 函数 | 108–113 | 把 units/millions/billions 等单位写法归一为倍率。 |
| require_integer | 函数 | 77–81 | 要求字段为整数并按需校验上下界。 |
| require_list | 函数 | 39–43 | 要求字段为数组，可选要求非空，否则抛出 InputError。 |
| require_number | 函数 | 58–68 | 要求字段为数值并按需校验上下界，拒绝布尔与非有限值。 |
| run_command | 函数 | 162–175 | 按子命令分发到对应处理函数，把 InputError 转成稳定的退出码与结构化错误。 |
| write_json_atomic | 函数 | 130–150 | 以临时文件加原子替换的方式写出 JSON，并按需拒绝覆盖已存在目标。 |
