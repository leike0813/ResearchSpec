
# src/arsu-converter/authoring/procedures/review-response
> 目录聚合页：5 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/authoring/procedures/review-response/comment-atomization.md](../../../../../files/src/arsu-converter/authoring/procedures/review-response/comment-atomization.md.md) | 文档 | 0 | 审稿意见原子化节点：先按审稿人/编辑的自然边界抽取原始线程，再拆成可独立回答、独立执行、独立核验的原子条目，仅在核心问题、期望动作、证据需求与修改方向全部一致时才跨审稿人合并，并要求每个线程至少有一条 primary 来源切片。 |
| [src/arsu-converter/authoring/procedures/review-response/intake.md](../../../../../files/src/arsu-converter/authoring/procedures/review-response/intake.md.md) | 文档 | 0 | 审稿回复工作流的入口节点：校验 Python/PyYAML/Jinja2 运行时依赖、确认文本语言与工作语言、定位 LaTeX 主入口，并初始化包含 revision-master.db、只读视图 01–17 与 source_snapshot 的任务级工件工作区。 |
| [src/arsu-converter/authoring/procedures/review-response/manuscript-analysis.md](../../../../../files/src/arsu-converter/authoring/procedures/review-response/manuscript-analysis.md.md) | 文档 | 0 | 手稿结构分析节点：只做分析不改稿，产出完整章节层级（而非标题清单）、按问题定义/方法/实验/结果讨论/局限/结论标注的章节功能、可稳定陈述并各自挂接支撑证据的核心主张，以及摘要、结果讨论、关键方法定义、局限与结论等高风险修改区。 |
| [src/arsu-converter/authoring/procedures/review-response/round.md](../../../../../files/src/arsu-converter/authoring/procedures/review-response/round.md.md) | 文档 | 0 | 单个完整修订轮次节点：Stage 5 逐条原子意见撰写并确认策略卡、证据判断、手稿草稿与回复草稿，Stage 6 交互修订 working_manuscript、通过 capture_revision_action 与 commit_revision_round 提交语义修订日志、生成 13–17 号视图并导出终稿与回复信。 |
| [src/arsu-converter/authoring/procedures/review-response/workboard-planning.md](../../../../../files/src/arsu-converter/authoring/procedures/review-response/workboard-planning.md.md) | 文档 | 0 | 原子条目工作板规划节点：为每个 comment_id 写入状态、优先级、证据缺口、待用户确认项、下一步动作、目标位置与分析链接，并要求不留空壳规划行；工作板确认绑定整张候选板，页面筛选不构成范围收窄。 |
