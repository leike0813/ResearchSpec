
# src/vendor-converters/histagent/lib/historical_support.py
所属分层：[厂商 Skill 转换与审计层](../../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent/lib](../../../../../modules/src/vendor-converters/histagent/lib.md)
<!-- node: file:src/vendor-converters/histagent/lib/historical_support.py -->

HistAgent 派生 Skill 共用的便携支撑库：五层来源记录校验、SHA-256 溯源、原子写入、环境变量凭据读取和 HTTP JSON 请求。
源码：[src/vendor-converters/histagent/lib/historical_support.py](../../../../../../../src/vendor-converters/histagent/lib/historical_support.py)

## 符号（9）
<!-- node: function:src/vendor-converters/histagent/lib/historical_support.py:_atomic_write -->
<!-- node: function:src/vendor-converters/histagent/lib/historical_support.py:credential_from_env -->
<!-- node: function:src/vendor-converters/histagent/lib/historical_support.py:layer_record -->
<!-- node: function:src/vendor-converters/histagent/lib/historical_support.py:read_json -->
<!-- node: function:src/vendor-converters/histagent/lib/historical_support.py:request_json -->
<!-- node: function:src/vendor-converters/histagent/lib/historical_support.py:require_string -->
<!-- node: function:src/vendor-converters/histagent/lib/historical_support.py:run_cli -->
<!-- node: function:src/vendor-converters/histagent/lib/historical_support.py:sha256_file -->
<!-- node: function:src/vendor-converters/histagent/lib/historical_support.py:validate_layer_records -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| _atomic_write | 函数 | 83–97 | 简单 | atomic-write、filesystem、安全 | 0 | 临时文件加原子替换的写入实现，overwrite=False 时拒绝已存在的目标。 |
| credential_from_env | 函数 | 116–124 | 简单 | credential、security、环境变量 | 0 | 从环境变量读取凭据，缺失时报错，回执与产物中不写入凭据值。 |
| layer_record | 函数 | 152–180 | 中等 | layer、provenance、histagent | 0 | 构造五层来源记录：层类型、来源、操作、工具或提供方、理由、不确定度与审阅状态缺一不可。 |
| read_json | 函数 | 43–53 | 简单 | json、io、validation | 0 | 读取带标签的 JSON 输入文件，区分不存在、不可读和格式错误三类失败。 |
| request_json | 函数 | 127–149 | 中等 | http、network、adapter | 0 | 发起受限的 HTTP JSON 请求，区分超时、HTTP 错误与非法响应并保留可诊断信息。 |
| require_string | 函数 | 56–60 | 简单 | validation、string、输入 | 0 | 要求字段为非空字符串，失败时抛出带机器可读 code 的 SkillError。 |
| run_cli | 函数 | 204–214 | 简单 | cli、entrypoint、工具 | 0 | Skill 命令行统一入口骨架：处理 SkillError 并输出机器可读结果后返回退出码。 |
| sha256_file | 函数 | 67–71 | 简单 | sha256、hash、provenance | 0 | 按原始字节计算文件 SHA-256，避免文本重新编码改变哈希结果。 |
| validate_layer_records | 函数 | 183–197 | 简单 | validation、layer、provenance | 0 | 校验层记录的父级关系、审阅状态与内容哈希，防止伪造或跨层跳跃。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| _atomic_write | 函数 | 83–97 | 临时文件加原子替换的写入实现，overwrite=False 时拒绝已存在的目标。 |
| credential_from_env | 函数 | 116–124 | 从环境变量读取凭据，缺失时报错，回执与产物中不写入凭据值。 |
| layer_record | 函数 | 152–180 | 构造五层来源记录：层类型、来源、操作、工具或提供方、理由、不确定度与审阅状态缺一不可。 |
| read_json | 函数 | 43–53 | 读取带标签的 JSON 输入文件，区分不存在、不可读和格式错误三类失败。 |
| request_json | 函数 | 127–149 | 发起受限的 HTTP JSON 请求，区分超时、HTTP 错误与非法响应并保留可诊断信息。 |
| require_string | 函数 | 56–60 | 要求字段为非空字符串，失败时抛出带机器可读 code 的 SkillError。 |
| run_cli | 函数 | 204–214 | Skill 命令行统一入口骨架：处理 SkillError 并输出机器可读结果后返回退出码。 |
| sha256_file | 函数 | 67–71 | 按原始字节计算文件 SHA-256，避免文本重新编码改变哈希结果。 |
| validate_layer_records | 函数 | 183–197 | 校验层记录的父级关系、审阅状态与内容哈希，防止伪造或跨层跳跃。 |
