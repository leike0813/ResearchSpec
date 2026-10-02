
# checkerSource
<!-- node: function:src/arsu-converter/authoring/checker-source.ts:checkerSource -->

拼装 checker 能力的验证器描述：共享 runner 作为 script validator，专用检查模块作为随包资源复制到 validators/ 目录。
类型：函数  
复杂度：简单  
入边数：2  
标签：factory、validator、script-runner  
所属文件：[src/arsu-converter/authoring/checker-source.ts](../../../../../files/src/arsu-converter/authoring/checker-source.ts.md)
源码：[src/arsu-converter/authoring/checker-source.ts:4](../../../../../../../src/arsu-converter/authoring/checker-source.ts#L4)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [m4-sources.ts](../../../../../files/src/arsu-converter/authoring/m4-sources.ts.md) | src/arsu-converter/authoring/m4-sources.ts:— | M4 修订里程碑五个能力的授权源声明，包含修订路线图解析、fail-closed 修订打补丁、格式渲染、终稿政策 Gate 与时序完整性核验，并通过 checkerSource 绑定可执行 runner。 |
| [m5-sources.ts](../../../../../files/src/arsu-converter/authoring/m5-sources.ts.md) | src/arsu-converter/authoring/m5-sources.ts:— | M5 系统综述与投稿校验里程碑十四个能力的授权源声明，涵盖 meta 分析、偏倚风险评估、图表生成、文献监控、引用存在性核验、污染信号检测等多个 checker，并大量复用 checkerSource 生成的 runner。 |

## 调用

该符号没有记录对外调用。
