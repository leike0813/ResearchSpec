# Education Agent Skills v3.1.0 语义审查

审查以固定版本的 `skills/<上游域>/<名称>/SKILL.md` 为来源。下表名称对应
原始投影 `education-agent-skills-<名称>` 与扩展 `plugin-education-agent-skills-<名称>`。
正文保真检查按 Skill 对比去除 ResearchSpec 边界和证据标记后的正文，另检查声明输入输出。

| 名称 | 本轮核对的语义点 | 判定 |
| --- | --- | --- |
| kud-chart-author | 七类输入和路由说明，发现形成性证据与目标类型不匹配时保留复核 | preserved |
| curriculum-knowledge-architecture-designer | 区分层级、横向和倾向性知识，保留先修图、评估与辅导示例 | adapted |
| differentiation-adapter | 保留核心学习目标与适配方案，基于实际需求和访问条件 | preserved |
| kud-knowledge-type-mapper | 区分 Know、Understand、Do，保留评估路由和差距示例 | adapted |
| scope-and-sequence-designer | 先修约束、顺序解释与教师酌情判断完整，完整示例按条件读取 | adapted |
| retrieval-practice-generator | 低风险回忆、按答题表现反馈，重复间隔和形式按实际情况调整 | preserved |
| spaced-practice-scheduler | 保留按主题和时间规划的检索表，区分间隔证据和示例时表 | preserved |
| panel-review | 七角色顺序评阅、异议记录、最低分判定，配套模拟例明示用途 | adapted |
| pedagogical-content-knowledge-developer | 诊断学科教学知识差距，保留误解、表征及发展计划参考 | adapted |
| technological-pedagogical-content-knowledge-developer | 保留内容与技术匹配、AI 核验、教师示范与数据边界 | adapted |
| ai-claim-checker | 指认具体可核声明，给出独立核验计划和结果记录 | preserved |
| confidence-calibration-check | 任务前后自愿报告信心，依据任务表现讨论，不补造分数 | preserved |
| explain-first-interrogator | 学习者先完成解释，按需提示，区分即期解释质量和持久迁移证据 | preserved |
| fading-manager | 核对可比历史、保留无障碍支持、逐级调整及恢复提示 | preserved |
| productive-failure-protocol | 保留探索和巩固，允许缩短、暂停或换用前置教学 | preserved |
| progressive-hint-ladder | 最少足够的提示、检查先备知识、按工作表现选择下一教育提示 | preserved |
| retrieve-first-gate | 先回忆再教学，保留可访问暖启动和实际证据记录 | preserved |
| srl-session-wrapper | 计划、监测、反思可独立运行，缺失会话信息按实际可得材料处理 | preserved |
| stuck-and-error-diagnosis-coach | 区分观察与学习困难假设，按需暂停或调整支持 | preserved |
| teach-back-evaluator | 以稳定的任务口径评估复述，允许多种作答方式和停止 | preserved |
| transfer-bridge | 先验证目标机制，再给近远迁移题并拆分各自表现 | preserved |
| unassisted-evidence-checkpoint | 先确定可用的辅助措施，记录退出选择、实际提示和证据限制 | preserved |
| weekly-agency-review | 仅用可核的会话数据，保留趋势和学习者选择，缺失时说明 | preserved |
| ladder-of-inference-reflection | 区分事实、解释及替代假设，保留人工处理伤害问题的边界 | preserved |
| agency-scaffold-generator | 保留自主度分级与可协商选择，保护目标、安全和可达性 | preserved |
| awe-wonder-experience-designer | 保留体验设计与调整，容纳不同反应和访问需求 | preserved |
| belonging-classroom-culture-designer | 设计日常参与活动，关注实际安全和私下意见，禁止以单一行为推断 | preserved |
| flow-state-condition-designer | 保留目标、反馈和难度设计，使用实际观察和学习者反馈调整 | preserved |
| implementation-intention-designer | 保留情境线索与行动匹配，纳入外部障碍和学习者同意 | preserved |
| motivation-diagnostic-task-redesign | 以任务设计分析动机条件，保留学习目标和人工监督 | preserved |
| perma-based-lesson-designer | 在课程内嵌入活动，采用低披露选项并尊重不同情绪反应 | preserved |
| restorative-practice-protocol-designer | 保留修复性方案选择和问题序列，会议须自愿并处理安全风险 | preserved |
| ruler-emotional-literacy-sequence | 保留识别、理解和表达的教学顺序，采用低披露且可访问选项 | preserved |
| self-efficacy-builder-sequence | 从实际能力安排渐进任务，依据表现调整并保留支持 | preserved |
| trauma-informed-practice-designer | 关心当前支持需要，保留安全计划，行为不推断为创伤诊断 | preserved |
| wellbeing-learning-connection-mapper | 区分机制假设与效果证据，保留可测结果与条件说明 | preserved |

## 结论

`declared-fit-with-notes`。六项示例迁移保留原相对路径和按需阅读条件。迁移后的示例继续
标注未决依据，投影保持其余内容。课堂课程架构示例涉及教师看板和反思记录，保留隐私及
学习分析边界。其他改动保留教育任务和输入输出。引用核查限于书目身份。
逐份示例说明见[上游增量审查](upstream-review.md)。

本轮对比两个生产基线的逐包摘要。36 个原始 Skill 和对应扩展与预览变更清单一致，
其余 100 个原始 Skill 和扩展沿用上一版审查，136 个图工作流配置的摘要一致。
流程扫描仅在 `checking-for-understanding-protocol-designer` 找到 `Proceed to next phase`，
指的是根据课堂答题正确率进入下一教学阶段。教学中的门槛和角色评阅由 Skill 描述，
正式 ResearchSpec 流程由 CLI 和图工作流配置管理。
