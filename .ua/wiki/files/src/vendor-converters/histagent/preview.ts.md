
# src/vendor-converters/histagent/preview.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent](../../../../modules/src/vendor-converters/histagent.md)
<!-- node: file:src/vendor-converters/histagent/preview.ts -->

HistAgent 策展预览：把渲染出的完整树写入临时预览目录，并生成含审核状态与逐文件哈希的 preview-manifest.json。
源码：[src/vendor-converters/histagent/preview.ts](../../../../../../src/vendor-converters/histagent/preview.ts)

## 符号（1）
<!-- node: function:src/vendor-converters/histagent/preview.ts:writeHistAgentPreview -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| writeHistAgentPreview | 函数 | 9–22 | 简单 | 预览、文件写入、vendor-converter | 0 | 清空并重建预览目录，逐文件写出渲染结果，最后写入包含树集合哈希与逐文件哈希的预览清单。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/histagent/complete-tree.ts | 把三个 histagent-* Skill 的已编写树与上游 LICENSE、historical_support.py 支持库渲染为完整树，并按能力映射注入派生源信息。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| writeHistAgentPreview | 函数 | 9–22 | 清空并重建预览目录，逐文件写出渲染结果，最后写入包含树集合哈希与逐文件哈希的预览清单。 |
