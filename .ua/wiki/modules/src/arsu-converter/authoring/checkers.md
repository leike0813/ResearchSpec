
# src/arsu-converter/authoring/checkers
> 目录聚合页：5 个文件、23 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/authoring/checkers/citations.py](../../../../files/src/arsu-converter/authoring/checkers/citations.py.md) | 文件 | 3 | 离线引用检查器：按闭集 resolver 观察（crossref/openalex/semantic_scholar/arxiv）计算文献存在性、汇总状态与撤稿告警，并给出预印本/污染信号判定，不联网也不导入上游模块。 |
| [src/arsu-converter/authoring/checkers/documents.py](../../../../files/src/arsu-converter/authoring/checkers/documents.py.md) | 文件 | 2 | 有界文档检查器：读取 JSON/YAML 输入，计算 Material Passport 与投稿包的结构完整性，含哈希化的语料与手稿核对，不依赖任何上游运行时。 |
| [src/arsu-converter/authoring/checkers/pdf.py](../../../../files/src/arsu-converter/authoring/checkers/pdf.py.md) | 文件 | 4 | PDF 读取前检的纯离线计算模块：读取页数信号、遍历页树并给出 PASS/FAIL/UNAVAILABLE 判定，只产出报告数据，不写任何文件。 |
| [src/arsu-converter/authoring/checkers/runner.py](../../../../files/src/arsu-converter/authoring/checkers/runner.py.md) | 文件 | 3 | 七个内建检查器的统一命令行入口：既可按 --generate 打印计算报告，也可只读比对已提交报告是否与当前输入一致。 |
| [src/arsu-converter/authoring/checkers/temporal.py](../../../../files/src/arsu-converter/authoring/checkers/temporal.py.md) | 文件 | 11 | 离线时间完整性审计：五遍确定性扫描草稿与时间线，产出时间算术不可能、时代错置引用、比较级未落实、因果倒置、指示词和元数据缺失六类 finding。 |
