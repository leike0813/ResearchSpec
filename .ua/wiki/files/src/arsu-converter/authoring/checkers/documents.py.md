
# src/arsu-converter/authoring/checkers/documents.py
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/checkers](../../../../../modules/src/arsu-converter/authoring/checkers.md)
<!-- node: file:src/arsu-converter/authoring/checkers/documents.py -->

有界文档检查器：读取 JSON/YAML 输入，计算 Material Passport 与投稿包的结构完整性，含哈希化的语料与手稿核对，不依赖任何上游运行时。
源码：[src/arsu-converter/authoring/checkers/documents.py](../../../../../../../src/arsu-converter/authoring/checkers/documents.py)

## 符号（2）
<!-- node: function:src/arsu-converter/authoring/checkers/documents.py:compute_passport -->
<!-- node: function:src/arsu-converter/authoring/checkers/documents.py:compute_submission -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| compute_passport | 函数 | 20–49 | 中等 | passport、文档校验、公开入口 | 0 | 读取 passport 输入并核对 literature_corpus 的结构、必填字段与哈希，产出可判定的校验结果。 |
| compute_submission | 函数 | 52–106 | 中等 | 投稿包、文档校验、公开入口 | 0 | 检查投稿包的手稿、图件与引用面是否齐备且与 passport 一致，输出逐项检查结论。 |
