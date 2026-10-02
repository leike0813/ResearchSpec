
# src/arsu-converter/authoring/checkers/pdf.py
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/checkers](../../../../../modules/src/arsu-converter/authoring/checkers.md)
<!-- node: file:src/arsu-converter/authoring/checkers/pdf.py -->

PDF 读取前检的纯离线计算模块：读取页数信号、遍历页树并给出 PASS/FAIL/UNAVAILABLE 判定，只产出报告数据，不写任何文件。
源码：[src/arsu-converter/authoring/checkers/pdf.py](../../../../../../../src/arsu-converter/authoring/checkers/pdf.py)

## 符号（4）
<!-- node: function:src/arsu-converter/authoring/checkers/pdf.py:_compute -->
<!-- node: function:src/arsu-converter/authoring/checkers/pdf.py:_walk_page_tree -->
<!-- node: class:src/arsu-converter/authoring/checkers/pdf.py:_WarningCollector -->
<!-- node: function:src/arsu-converter/authoring/checkers/pdf.py:compute -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| _compute | 函数 | 72–182 | 复杂 | pdf、preflight、verdict、结构校验、计算入口 | 0 | 前检主计算：解析 PDF 结构、统计三种页数信号、校验页树完整性、处理加密与尾部 EOF，产出整体 verdict 与各检查项结果。 |
| _walk_page_tree | 函数 | 50–69 | 简单 | pdf、traversal、page-tree、budget | 0 | 带已访问集合和节点预算地递归遍历 PDF 页树，用于页数统计与异常页树检测。 |
| _WarningCollector | 类 | 28–34 | 简单 | warning、logging、pdf、内部类 | 0 | 继承 logging.Handler 的告警收集器，把解析器产生的 WARNING 文本收进列表，作为报告里的解析器告警证据。 |
| compute | 函数 | 185–191 | 简单 | entrypoint、pdf、checker、report | 0 | 检查器公开入口，接收 role/path 形式的输入映射并返回 pdf_preflight_report 结构。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| compute | 函数 | 185–191 | 检查器公开入口，接收 role/path 形式的输入映射并返回 pdf_preflight_report 结构。 |
