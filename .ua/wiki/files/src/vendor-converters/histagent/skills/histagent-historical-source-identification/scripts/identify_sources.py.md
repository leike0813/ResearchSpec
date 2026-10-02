
# src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts/identify_sources.py
所属分层：[厂商 Skill 转换与审计层](../../../../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts](../../../../../../../modules/src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts.md)
<!-- node: file:src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts/identify_sources.py -->

来源识别确定性入口：本地索引检索与外部适配器调用共用同一候选结构，统一校验状态、来源溯源和哈希后写出结果。
源码：[src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts/identify_sources.py](../../../../../../../../../src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts/identify_sources.py)

## 符号（5）
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts/identify_sources.py:_candidate -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts/identify_sources.py:_handle -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts/identify_sources.py:_local_index -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts/identify_sources.py:_validate_candidate -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-source-identification/scripts/identify_sources.py:parser -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| _candidate | 函数 | 33–56 | 简单 | candidate、schema、工具 | 0 | 构造候选记录：候选 ID、标题、定位、规范化 URL、来源查询、提供方、状态与证据全部按契约填充。 |
| _handle | 函数 | 124–187 | 复杂 | cli、dispatch、adapters、核心流程 | 0 | 子命令主处理：按检索、精确文本、抓取、上传核验分派，处理凭据、上传同意与结果持久化。 |
| _local_index | 函数 | 70–93 | 简单 | search、offline、index | 0 | 离线本地索引检索：词项要求全部命中，精确文本检索校验字面串，并记录索引路径与哈希而非复制索引。 |
| _validate_candidate | 函数 | 59–67 | 简单 | validation、candidate、工具 | 0 | 校验候选记录字段与状态合法性，拒绝越界状态或缺失证据。 |
| parser | 函数 | 195–236 | 中等 | cli、argument-parsing、工具 | 0 | 构造检索、抓取与上传命令的 argparse 解析器，含凭据变量名与同意参数。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [historical_support.py](../../../lib/historical_support.py.md) | src/vendor-converters/histagent/lib/historical_support.py | HistAgent 派生 Skill 共用的便携支撑库：五层来源记录校验、SHA-256 溯源、原子写入、环境变量凭据读取和 HTTP JSON 请求。 |
