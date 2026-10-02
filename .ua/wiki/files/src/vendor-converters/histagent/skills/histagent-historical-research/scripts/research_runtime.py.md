
# src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py
所属分层：[厂商 Skill 转换与审计层](../../../../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent/skills/histagent-historical-research/scripts](../../../../../../../modules/src/vendor-converters/histagent/skills/histagent-historical-research/scripts.md)
<!-- node: file:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py -->

Gate 驱动的历史研究运行时：以 Skill 本地 state.json 为唯一事实源，实现 init、submit-source/layer/evidence、status、report 与 render 的确定性状态机。
源码：[src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py](../../../../../../../../../src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py)

## 符号（12）
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_example -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_handle -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_init -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_load -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_render -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_report -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_status -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_submit_evidence -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_submit_layer -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_submit_source -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:_validate_layer_plan -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-research/scripts/research_runtime.py:parser -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| _example | 函数 | 112–129 | 简单 | state、example、工具 | 0 | 为状态中的每个记录生成可直接复制的示例载荷，降低 Agent 填错字段的概率。 |
| _handle | 函数 | 298–316 | 简单 | cli、dispatch、state | 0 | 子命令分发：解析动作、读取状态、调用对应处理函数并写回状态。 |
| _init | 函数 | 156–166 | 简单 | state、init、entrypoint | 0 | 用范围文件初始化运行目录并写入初始 state.json。 |
| _load | 函数 | 34–44 | 简单 | state、io、validation | 0 | 读取并校验 state.json，区分运行不存在、不可读和结构不支持三种失败。 |
| _render | 函数 | 284–295 | 简单 | render、artifact、state | 0 | 把状态渲染为只读 Markdown 与 JSON 产物，并标记这些产物不是权威状态。 |
| _report | 函数 | 270–281 | 简单 | report、render、state | 0 | 生成可读报告，把状态、缺失项与下一步动作汇总为一份确定性文本。 |
| _status | 函数 | 72–109 | 中等 | state、gate、status | 0 | 根据当前状态给出下一步可用动作与缺失项，是 Gate 的主要只读视图。 |
| _submit_evidence | 函数 | 207–267 | 复杂 | evidence、conflict、state、validation | 0 | 登记证据、冲突、局限、审阅与综合记录，校验引用完整性并阻止未解决冲突被静默跳过。 |
| _submit_layer | 函数 | 189–204 | 简单 | layer、state、validation | 0 | 登记层记录并强制顺序约束：父层必须先存在，层类型必须在允许集合内。 |
| _submit_source | 函数 | 169–186 | 简单 | source、state、validation | 0 | 登记来源记录：校验身份、定位、SHA-256 溯源与完整层计划后写入状态。 |
| _validate_layer_plan | 函数 | 140–149 | 简单 | layer、validation、provenance | 0 | 校验来源的五层适用性计划完整且每层都带理由。 |
| parser | 函数 | 319–339 | 中等 | cli、argument-parsing、工具 | 0 | 构造全部子命令与选项的 argparse 解析器，错误输出保持机器可读。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [historical_support.py](../../../lib/historical_support.py.md) | src/vendor-converters/histagent/lib/historical_support.py | HistAgent 派生 Skill 共用的便携支撑库：五层来源记录校验、SHA-256 溯源、原子写入、环境变量凭据读取和 HTTP JSON 请求。 |
