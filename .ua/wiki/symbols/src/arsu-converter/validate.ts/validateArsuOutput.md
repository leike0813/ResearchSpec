
# validateArsuOutput
<!-- node: function:src/arsu-converter/validate.ts:validateArsuOutput -->

转换产物的总验收入口：确认输出根存在，聚合清单结构、契约集成、路由目录落盘、anchor 标记、运行时策略报告、链接可解析性与风险覆盖等子检查，返回 errors/warnings 汇总。
类型：函数  
复杂度：复杂  
入边数：1  
标签：校验、验收、编排、离线检查  
所属文件：[src/arsu-converter/validate.ts](../../../../files/src/arsu-converter/validate.ts.md)
源码：[src/arsu-converter/validate.ts:22](../../../../../../src/arsu-converter/validate.ts#L22)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [checkIdempotence](../../../../files/src/arsu-converter/idempotence.ts.md) | src/arsu-converter/idempotence.ts:40–65 | 先校验现有产物，再在系统临时目录以同一 regenerate 回调重新生成一次，比较两侧归一化 manifest 的 JSON 字符串，失败时给出具体漂移文件列表。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderArsuSkillDescription](../../../../files/src/arsu-converter/routing/projection.ts.md) | src/arsu-converter/routing/projection.ts:11–16 | 把单个 Skill 拼成 frontmatter description 文本，包含摘要、路由列表、适用意图、near-miss 引导与逐次启动前需确认的前置与 Gate 清单。 |
| [scanFindings](../../../../files/src/arsu-converter/transform.ts.md) | src/arsu-converter/transform.ts:19–47 | 逐行扫描源文件，登记平台术语、历史术语、schema 版本标记、version 标记与 issue/PR 引用五类风险发现。 |
