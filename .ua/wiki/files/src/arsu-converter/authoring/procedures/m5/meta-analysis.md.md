
# src/arsu-converter/authoring/procedures/m5/meta-analysis.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/m5](../../../../../../modules/src/arsu-converter/authoring/procedures/m5.md)
<!-- node: document:src/arsu-converter/authoring/procedures/m5/meta-analysis.md -->

m5 元分析 Procedure，从 systematic_review_corpus 产出 meta_analysis_report。含可行性评估（何时合并、何时改用叙事综合）、连续/二分/生存结局的效应量计算与提取层级、异质性检验与 I² 解读、森林图数据生成、亚组与敏感性分析、发表偏倚评估及 GRADE 证据确定性分级。
源码：[src/arsu-converter/authoring/procedures/m5/meta-analysis.md](../../../../../../../../src/arsu-converter/authoring/procedures/m5/meta-analysis.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [figure-generation.md](figure-generation.md.md) | src/arsu-converter/authoring/procedures/m5/figure-generation.md | m5 图表生成 Procedure，从 manuscript_draft、统计结果与提供的数据集产出 figure_code。含图表类型决策逻辑、尺寸与分辨率、字体排印、无障碍配色、APA 7.0 图号与图题规范、LaTeX 集成，以及 Python（matplotlib + seaborn）与 R（ggplot2）代码生成标准。 |
