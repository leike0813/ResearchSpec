
# src/arsu-converter/authoring/cli.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring](../../../../modules/src/arsu-converter/authoring.md)
<!-- node: file:src/arsu-converter/authoring/cli.ts -->

ARSU 能力编写的批处理入口，遍历 M1–M5 全部授权源生成能力包，并以 JSON 输出结果，支持 --dry-run 预检。
源码：[src/arsu-converter/authoring/cli.ts](../../../../../../src/arsu-converter/authoring/cli.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/authoring/cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 11–25 | 简单 | entry-point、cli、batch-authoring | 0 | 解析输出根目录与 --dry-run，顺序调用 authorCapabilityPackage 处理 M1–M5 授权源，并把每个能力的文件清单与注册表版本写入 stdout。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [m1-sources.ts](m1-sources.ts.md) | src/arsu-converter/authoring/m1-sources.ts | M1 里程碑六个能力的授权源声明，覆盖研究问题构建、方法设计、文献检索筛选、来源质量分级、证据综合与研究报告撰写，并绑定各自的抽取产物与知识文件。 |
| [m2-sources.ts](m2-sources.ts.md) | src/arsu-converter/authoring/m2-sources.ts | M2 写作里程碑六个能力的授权源声明，覆盖写作接入、稿件结构设计、论证蓝图、正文起草、摘要写作与引用格式合规检查。 |
| [m3-sources.ts](m3-sources.ts.md) | src/arsu-converter/authoring/m3-sources.ts | M3 评审里程碑七个能力的授权源声明，覆盖参考文献完整性核验、评审小组配置、编辑判断、专项评审、反方压力测试、评审综合与投稿前自检。 |
| [m4-sources.ts](m4-sources.ts.md) | src/arsu-converter/authoring/m4-sources.ts | M4 修订里程碑五个能力的授权源声明，包含修订路线图解析、fail-closed 修订打补丁、格式渲染、终稿政策 Gate 与时序完整性核验，并通过 checkerSource 绑定可执行 runner。 |
| [m5-sources.ts](m5-sources.ts.md) | src/arsu-converter/authoring/m5-sources.ts | M5 系统综述与投稿校验里程碑十四个能力的授权源声明，涵盖 meta 分析、偏倚风险评估、图表生成、文献监控、引用存在性核验、污染信号检测等多个 checker，并大量复用 checkerSource 生成的 runner。 |
