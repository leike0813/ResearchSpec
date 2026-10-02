
# src/arsu-converter/authoring/m5-sources.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring](../../../../modules/src/arsu-converter/authoring.md)
<!-- node: file:src/arsu-converter/authoring/m5-sources.ts -->

M5 系统综述与投稿校验里程碑十四个能力的授权源声明，涵盖 meta 分析、偏倚风险评估、图表生成、文献监控、引用存在性核验、污染信号检测等多个 checker，并大量复用 checkerSource 生成的 runner。
源码：[src/arsu-converter/authoring/m5-sources.ts](../../../../../../src/arsu-converter/authoring/m5-sources.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [checker-source.ts](checker-source.ts.md) | src/arsu-converter/authoring/checker-source.ts | 为可执行 checker 能力生成统一的 script_validator 与 validators 资源声明，使报告生成与校验共用同一份 Python 代码。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/arsu-converter/authoring/cli.ts | ARSU 能力编写的批处理入口，遍历 M1–M5 全部授权源生成能力包，并以 JSON 输出结果，支持 --dry-run 预检。 |
