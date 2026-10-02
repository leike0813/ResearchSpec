
# src/arsu-converter/authoring/procedures/review-response/comment-atomization.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/review-response](../../../../../../modules/src/arsu-converter/authoring/procedures/review-response.md)
<!-- node: document:src/arsu-converter/authoring/procedures/review-response/comment-atomization.md -->

审稿意见原子化节点：先按审稿人/编辑的自然边界抽取原始线程，再拆成可独立回答、独立执行、独立核验的原子条目，仅在核心问题、期望动作、证据需求与修改方向全部一致时才跨审稿人合并，并要求每个线程至少有一条 primary 来源切片。
源码：[src/arsu-converter/authoring/procedures/review-response/comment-atomization.md](../../../../../../../../src/arsu-converter/authoring/procedures/review-response/comment-atomization.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [manuscript-analysis.md](manuscript-analysis.md.md) | src/arsu-converter/authoring/procedures/review-response/manuscript-analysis.md | 手稿结构分析节点：只做分析不改稿，产出完整章节层级（而非标题清单）、按问题定义/方法/实验/结果讨论/局限/结论标注的章节功能、可稳定陈述并各自挂接支撑证据的核心主张，以及摘要、结果讨论、关键方法定义、局限与结论等高风险修改区。 |
| [workboard-planning.md](workboard-planning.md.md) | src/arsu-converter/authoring/procedures/review-response/workboard-planning.md | 原子条目工作板规划节点：为每个 comment_id 写入状态、优先级、证据缺口、待用户确认项、下一步动作、目标位置与分析链接，并要求不留空壳规划行；工作板确认绑定整张候选板，页面筛选不构成范围收窄。 |
