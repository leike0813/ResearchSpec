
# generateZoteroTree
<!-- node: function:src/vendor-converters/zotero-library-agent-bundle/converter.ts:generateZoteroTree -->

构建 `literature-adapters/zotero` 完整输出树，包含七个 Skill 包、profile 模板、AGPL 许可证与转换清单的写入计划。
类型：函数  
复杂度：复杂  
入边数：1  
标签：converter、generation、file-manifest、delivery  
所属文件：[src/vendor-converters/zotero-library-agent-bundle/converter.ts](../../../../../files/src/vendor-converters/zotero-library-agent-bundle/converter.ts.md)
源码：[src/vendor-converters/zotero-library-agent-bundle/converter.ts:103](../../../../../../../src/vendor-converters/zotero-library-agent-bundle/converter.ts#L103)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [convertZoteroBundle](../../../../../files/src/vendor-converters/zotero-library-agent-bundle/converter.ts.md) | src/vendor-converters/zotero-library-agent-bundle/converter.ts:46–66 | 执行完整转换：先跑不可变审计作为前置门禁，再生成 Zotero 适配包并写出转换清单，支持 dry-run 与 force 覆盖。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [adaptIncludedFile](../../../../../files/src/vendor-converters/zotero-library-agent-bundle/converter.ts.md) | src/vendor-converters/zotero-library-agent-bundle/converter.ts:154–170 | 按审计准入决定把单个上游文件原样复制或按适配规则改写，并保留其可执行位与相对路径。 |
| [renderDerivation](../../../../../files/src/vendor-converters/zotero-library-agent-bundle/converter.ts.md) | src/vendor-converters/zotero-library-agent-bundle/converter.ts:182–203 | 渲染每个生成 Skill 的派生说明，记录上游来源、发布集、审计哈希与授权边界等不可变溯源元数据。 |
