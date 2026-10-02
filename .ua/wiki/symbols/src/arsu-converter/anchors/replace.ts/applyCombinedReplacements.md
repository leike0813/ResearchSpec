
# applyCombinedReplacements
<!-- node: function:src/arsu-converter/anchors/replace.ts:applyCombinedReplacements -->

把锚点替换与运行时策略改写合并为单一有序重写流，适配被替换文本的行尾风格，为锚点块补上开闭标记，并在替换完成后同步更新两套计划的状态。
类型：函数  
复杂度：复杂  
入边数：1  
标签：replacement、rewriting、orchestration、runtime-policy  
所属文件：[src/arsu-converter/anchors/replace.ts](../../../../../files/src/arsu-converter/anchors/replace.ts.md)
源码：[src/arsu-converter/anchors/replace.ts:15](../../../../../../../src/arsu-converter/anchors/replace.ts#L15)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [copyTransformedFile](../../emit.ts/copyTransformedFile.md) | src/arsu-converter/emit.ts:251–319 | 复制单个文件并按类型选择处理路径：schema 源直接投影，文本资源依次执行联合替换、锚点块保护、Markdown 链接重写与文本改写后还原并注入契约前言，SKILL.md 额外投影 frontmatter 描述，二进制资源则原样复制。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [markRuntimePolicyAdapted](../../../../../files/src/arsu-converter/runtime-policy/planner.ts.md) | src/arsu-converter/runtime-policy/planner.ts:134–146 | 在改写实际落地后回填对应适配记录：标记 adapted、登记输出路径并写入 after_text 与其 SHA-256。 |
