
# src/arsu-converter/authoring/checker-source.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring](../../../../modules/src/arsu-converter/authoring.md)
<!-- node: file:src/arsu-converter/authoring/checker-source.ts -->

为可执行 checker 能力生成统一的 script_validator 与 validators 资源声明，使报告生成与校验共用同一份 Python 代码。
源码：[src/arsu-converter/authoring/checker-source.ts](../../../../../../src/arsu-converter/authoring/checker-source.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/authoring/checker-source.ts:checkerSource -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [checkerSource](../../../../symbols/src/arsu-converter/authoring/checker-source.ts/checkerSource.md) | 函数 | 4–17 | 简单 | factory、validator、script-runner | 2 | 拼装 checker 能力的验证器描述：共享 runner 作为 script validator，专用检查模块作为随包资源复制到 validators/ 目录。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [m4-sources.ts](m4-sources.ts.md) | src/arsu-converter/authoring/m4-sources.ts | M4 修订里程碑五个能力的授权源声明，包含修订路线图解析、fail-closed 修订打补丁、格式渲染、终稿政策 Gate 与时序完整性核验，并通过 checkerSource 绑定可执行 runner。 |
| [m5-sources.ts](m5-sources.ts.md) | src/arsu-converter/authoring/m5-sources.ts | M5 系统综述与投稿校验里程碑十四个能力的授权源声明，涵盖 meta 分析、偏倚风险评估、图表生成、文献监控、引用存在性核验、污染信号检测等多个 checker，并大量复用 checkerSource 生成的 runner。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [checkerSource](../../../../symbols/src/arsu-converter/authoring/checker-source.ts/checkerSource.md) | 函数 | 4–17 | 拼装 checker 能力的验证器描述：共享 runner 作为 script validator，专用检查模块作为随包资源复制到 validators/ 目录。 |
