
# src/arsu-converter/authoring/checkers/citations.py
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/checkers](../../../../../modules/src/arsu-converter/authoring/checkers.md)
<!-- node: file:src/arsu-converter/authoring/checkers/citations.py -->

离线引用检查器：按闭集 resolver 观察（crossref/openalex/semantic_scholar/arxiv）计算文献存在性、汇总状态与撤稿告警，并给出预印本/污染信号判定，不联网也不导入上游模块。
源码：[src/arsu-converter/authoring/checkers/citations.py](../../../../../../../src/arsu-converter/authoring/checkers/citations.py)

## 符号（3）
<!-- node: function:src/arsu-converter/authoring/checkers/citations.py:compute_contamination -->
<!-- node: function:src/arsu-converter/authoring/checkers/citations.py:compute_existence -->
<!-- node: function:src/arsu-converter/authoring/checkers/citations.py:compute_summary -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| compute_contamination | 函数 | 547–567 | 中等 | 污染信号、公开入口、预印本 | 0 | 按预印本与 resolver 信号对语料做污染风险判定，输出逐条风险行而不补齐缺失观察。 |
| compute_existence | 函数 | 366–382 | 中等 | 引用验证、公开入口、离线 | 0 | 读取语料文件中的文献条目，校验 resolver 观察并输出逐条存在性判定与状态计数。 |
| compute_summary | 函数 | 469–480 | 简单 | 汇总报告、公开入口、撤稿告警 | 0 | 读取本模块产出的存在性报告（接受 runner 信封或裸 payload），汇总 resolver 状态分布与撤稿告警。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [documents.py](documents.py.md) | src/arsu-converter/authoring/checkers/documents.py | 有界文档检查器：读取 JSON/YAML 输入，计算 Material Passport 与投稿包的结构完整性，含哈希化的语料与手稿核对，不依赖任何上游运行时。 |
