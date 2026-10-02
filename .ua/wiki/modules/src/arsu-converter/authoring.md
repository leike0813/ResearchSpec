
# src/arsu-converter/authoring
> 目录聚合页：12 个文件、7 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/authoring/author.ts](../../../files/src/arsu-converter/authoring/author.ts.md) | 文件 | 3 | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [src/arsu-converter/authoring/checker-source.ts](../../../files/src/arsu-converter/authoring/checker-source.ts.md) | 文件 | 1 | 为可执行 checker 能力生成统一的 script_validator 与 validators 资源声明，使报告生成与校验共用同一份 Python 代码。 |
| [src/arsu-converter/authoring/cli.ts](../../../files/src/arsu-converter/authoring/cli.ts.md) | 文件 | 1 | ARSU 能力编写的批处理入口，遍历 M1–M5 全部授权源生成能力包，并以 JSON 输出结果，支持 --dry-run 预检。 |
| [src/arsu-converter/authoring/m1-sources.ts](../../../files/src/arsu-converter/authoring/m1-sources.ts.md) | 文件 | 0 | M1 里程碑六个能力的授权源声明，覆盖研究问题构建、方法设计、文献检索筛选、来源质量分级、证据综合与研究报告撰写，并绑定各自的抽取产物与知识文件。 |
| [src/arsu-converter/authoring/m2-sources.ts](../../../files/src/arsu-converter/authoring/m2-sources.ts.md) | 文件 | 0 | M2 写作里程碑六个能力的授权源声明，覆盖写作接入、稿件结构设计、论证蓝图、正文起草、摘要写作与引用格式合规检查。 |
| [src/arsu-converter/authoring/m3-sources.ts](../../../files/src/arsu-converter/authoring/m3-sources.ts.md) | 文件 | 0 | M3 评审里程碑七个能力的授权源声明，覆盖参考文献完整性核验、评审小组配置、编辑判断、专项评审、反方压力测试、评审综合与投稿前自检。 |
| [src/arsu-converter/authoring/m4-sources.ts](../../../files/src/arsu-converter/authoring/m4-sources.ts.md) | 文件 | 0 | M4 修订里程碑五个能力的授权源声明，包含修订路线图解析、fail-closed 修订打补丁、格式渲染、终稿政策 Gate 与时序完整性核验，并通过 checkerSource 绑定可执行 runner。 |
| [src/arsu-converter/authoring/m5-sources.ts](../../../files/src/arsu-converter/authoring/m5-sources.ts.md) | 文件 | 0 | M5 系统综述与投稿校验里程碑十四个能力的授权源声明，涵盖 meta 分析、偏倚风险评估、图表生成、文献监控、引用存在性核验、污染信号检测等多个 checker，并大量复用 checkerSource 生成的 runner。 |
| [src/arsu-converter/authoring/paper-humanizer-cli.ts](../../../files/src/arsu-converter/authoring/paper-humanizer-cli.ts.md) | 文件 | 1 | paper-humanizer 能力族的独立编写入口，使用 vendor-derived 来源选项生成四个能力包。 |
| [src/arsu-converter/authoring/paper-humanizer-sources.ts](../../../files/src/arsu-converter/authoring/paper-humanizer-sources.ts.md) | 文件 | 0 | paper-humanizer 四个能力（参考模式、评审、修订、验证）的授权源声明，MIT 许可、vendor-derived 来源，并把文档流水线脚本与本地静态评审页面作为随包资源。 |
| [src/arsu-converter/authoring/revision-master-cli.ts](../../../files/src/arsu-converter/authoring/revision-master-cli.ts.md) | 文件 | 1 | revision-master 能力族的独立编写入口，使用专属 extraction index 与 vendor-derived 来源生成审稿回复能力包。 |
| [src/arsu-converter/authoring/revision-master-sources.ts](../../../files/src/arsu-converter/authoring/revision-master-sources.ts.md) | 文件 | 0 | revision-master 五个能力（接入、稿件分析、评语原子化、工作板规划、轮次执行）的授权源声明，以模板数组与共享 Gate 运行时资产组装大量 Jinja 模板、SQLite 脚本和 workbench 资源。 |

## 子目录
- [checkers](authoring/checkers.md)、[procedures/m1](authoring/procedures/m1.md)、[procedures/m2](authoring/procedures/m2.md)、[procedures/m3](authoring/procedures/m3.md)、[procedures/m4](authoring/procedures/m4.md)、[procedures/m5](authoring/procedures/m5.md)、[procedures/paper-humanizer](authoring/procedures/paper-humanizer.md)、[procedures/review-response](authoring/procedures/review-response.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/capabilities](../capabilities.md) | 1 |
| [src/core/contracts](../core/contracts.md) | 1 |
