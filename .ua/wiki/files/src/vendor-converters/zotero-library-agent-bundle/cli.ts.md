
# src/vendor-converters/zotero-library-agent-bundle/cli.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/zotero-library-agent-bundle](../../../../modules/src/vendor-converters/zotero-library-agent-bundle.md)
<!-- node: file:src/vendor-converters/zotero-library-agent-bundle/cli.ts -->

Zotero Bundle 转换器的维护者 CLI 入口，向上查找仓库根并分派 generate、check 与 idempotence 三个维护命令。
源码：[src/vendor-converters/zotero-library-agent-bundle/cli.ts](../../../../../../src/vendor-converters/zotero-library-agent-bundle/cli.ts)

## 符号（1）
<!-- node: function:src/vendor-converters/zotero-library-agent-bundle/cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 11–44 | 中等 | cli、entry-point、converter、maintainer | 0 | 解析命令行参数、定位仓库根目录并执行对应的生成、检查或幂等性子命令，输出结果后返回退出码。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/zotero-library-agent-bundle/converter.ts | 把 vendor 的 Zotero Bundle 转换为 `literature-adapters/zotero` 下的发布包，产出转换清单、Skill 树与派生说明，并提供输出检查与幂等性检查。 |
| [zotero-library-agent-bundle.ts](../../vendor-audits/zotero-library-agent-bundle.ts.md) | src/vendor-audits/zotero-library-agent-bundle.ts | Zotero Library Agent Bundle 的不可变审计 SSOT：定义审计 JSON 契约、固定发布集 ID 与路径常量，并校验上游身份、文件哈希与排序一致性。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 11–44 | 解析命令行参数、定位仓库根目录并执行对应的生成、检查或幂等性子命令，输出结果后返回退出码。 |
