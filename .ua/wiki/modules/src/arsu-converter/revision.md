
# src/arsu-converter/revision
> 目录聚合页：4 个文件、16 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/revision/apply-revision-patch.mjs](../../../files/src/arsu-converter/revision/apply-revision-patch.mjs.md) | 文件 | 9 | 独立修订补丁应用器：校验补丁与授权上下文、检查标注块锚点与映射，在全部前置条件通过后原子生成修订稿与处理报告。 |
| [src/arsu-converter/revision/apply.ts](../../../files/src/arsu-converter/revision/apply.ts.md) | 文件 | 1 | 在全部前置校验通过后，把 ARSU 修订补丁应用到带块标记的手稿，并汇总改动块、插入块与批注处置计数。 |
| [src/arsu-converter/revision/contract.ts](../../../files/src/arsu-converter/revision/contract.ts.md) | 文件 | 2 | ARSU 修订补丁 v2.0 的唯一契约：操作、授权上下文、claim strength 变更与批注映射的 zod 定义、校验和 JSON Schema 导出。 |
| [src/arsu-converter/revision/markdown-blocks.ts](../../../files/src/arsu-converter/revision/markdown-blocks.ts.md) | 文件 | 4 | 带 ResearchSpec 块标记的 Markdown 解析底座：切分与定位锚定块、计算块哈希、判定正文起点、提取章节标题，并提供共享 sha256。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/contracts](../core/contracts.md) | 1 |
