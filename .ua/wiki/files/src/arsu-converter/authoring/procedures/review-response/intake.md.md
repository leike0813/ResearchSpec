
# src/arsu-converter/authoring/procedures/review-response/intake.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/review-response](../../../../../../modules/src/arsu-converter/authoring/procedures/review-response.md)
<!-- node: document:src/arsu-converter/authoring/procedures/review-response/intake.md -->

审稿回复工作流的入口节点：校验 Python/PyYAML/Jinja2 运行时依赖、确认文本语言与工作语言、定位 LaTeX 主入口，并初始化包含 revision-master.db、只读视图 01–17 与 source_snapshot 的任务级工件工作区。
源码：[src/arsu-converter/authoring/procedures/review-response/intake.md](../../../../../../../../src/arsu-converter/authoring/procedures/review-response/intake.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [manuscript-analysis.md](manuscript-analysis.md.md) | src/arsu-converter/authoring/procedures/review-response/manuscript-analysis.md | 手稿结构分析节点：只做分析不改稿，产出完整章节层级（而非标题清单）、按问题定义/方法/实验/结果讨论/局限/结论标注的章节功能、可稳定陈述并各自挂接支撑证据的核心主张，以及摘要、结果讨论、关键方法定义、局限与结论等高风险修改区。 |
