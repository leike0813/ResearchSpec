
# src/vendor-converters/zotero-library-agent-bundle
> 目录聚合页：2 个文件、8 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/vendor-converters/zotero-library-agent-bundle/cli.ts](../../../files/src/vendor-converters/zotero-library-agent-bundle/cli.ts.md) | 文件 | 1 | Zotero Bundle 转换器的维护者 CLI 入口，向上查找仓库根并分派 generate、check 与 idempotence 三个维护命令。 |
| [src/vendor-converters/zotero-library-agent-bundle/converter.ts](../../../files/src/vendor-converters/zotero-library-agent-bundle/converter.ts.md) | 文件 | 7 | 把 vendor 的 Zotero Bundle 转换为 `literature-adapters/zotero` 下的发布包，产出转换清单、Skill 树与派生说明，并提供输出检查与幂等性检查。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/vendor-audits](../vendor-audits.md) | 2 |
| [src/core/workspace](../core/workspace.md) | 1 |
