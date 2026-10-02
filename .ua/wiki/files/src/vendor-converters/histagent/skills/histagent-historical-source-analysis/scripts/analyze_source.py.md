
# src/vendor-converters/histagent/skills/histagent-historical-source-analysis/scripts/analyze_source.py
所属分层：[厂商 Skill 转换与审计层](../../../../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent/skills/histagent-historical-source-analysis/scripts](../../../../../../../modules/src/vendor-converters/histagent/skills/histagent-historical-source-analysis/scripts.md)
<!-- node: file:src/vendor-converters/histagent/skills/histagent-historical-source-analysis/scripts/analyze_source.py -->

来源分析确定性入口：inspect/convert 使用标准库解析容器，OCR/转写/抽帧/视觉走用户配置的本地或 HTTP 适配器，全部输出都带层归属与哈希。
源码：[src/vendor-converters/histagent/skills/histagent-historical-source-analysis/scripts/analyze_source.py](../../../../../../../../../src/vendor-converters/histagent/skills/histagent-historical-source-analysis/scripts/analyze_source.py)

## 符号（4）
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-source-analysis/scripts/analyze_source.py:_extract -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-source-analysis/scripts/analyze_source.py:_handle -->
<!-- node: class:src/vendor-converters/histagent/skills/histagent-historical-source-analysis/scripts/analyze_source.py:_TextExtractor -->
<!-- node: function:src/vendor-converters/histagent/skills/histagent-historical-source-analysis/scripts/analyze_source.py:parser -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| _extract | 函数 | 53–81 | 中等 | extraction、format、dispatch | 0 | 按格式分派到 TXT/Markdown/CSV/JSON/XML/HTML/ZIP 家族提取器，PDF 仅在用户提供 pypdf 时启用。 |
| _handle | 函数 | 107–197 | 复杂 | cli、dispatch、adapters、核心流程 | 0 | 子命令主处理：按 inspect/convert/ocr/transcribe/frames/vision 分派，校验同意与凭据后产出层记录与产物。 |
| _TextExtractor | 类 | 36–43 | 简单 | html、parser、extraction、内部类 | 0 | 最小 HTMLParser 子类，只收集可见文本，不跟随链接或执行任何嵌入内容。 |
| parser | 函数 | 210–265 | 复杂 | cli、argument-parsing、工具 | 0 | 构造全部模式与适配器选项的 argparse 解析器，包含凭据变量名与端点参数。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [historical_support.py](../../../lib/historical_support.py.md) | src/vendor-converters/histagent/lib/historical_support.py | HistAgent 派生 Skill 共用的便携支撑库：五层来源记录校验、SHA-256 溯源、原子写入、环境变量凭据读取和 HTTP JSON 请求。 |
