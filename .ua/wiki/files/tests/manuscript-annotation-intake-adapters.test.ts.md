
# tests/manuscript-annotation-intake-adapters.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/manuscript-annotation-intake-adapters.test.ts -->

批注接收主链路的测试：槽位可逆性、从自由文本到候选批注集的完整物化、未决解释必须失败，以及对话捕获的确定性。
源码：[tests/manuscript-annotation-intake-adapters.test.ts](../../../../tests/manuscript-annotation-intake-adapters.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [annotation-intake.ts](../src/annotation-intake.ts.md) | src/annotation-intake.ts | 批注接收（annotation intake）子系统的 barrel 入口，向上重导出 contracts、session、sources、review-copy、review-delta 与 interpretation 全部公开接口。 |
| [markdown-blocks.ts](../src/arsu-converter/revision/markdown-blocks.ts.md) | src/arsu-converter/revision/markdown-blocks.ts | 带 ResearchSpec 块标记的 Markdown 解析底座：切分与定位锚定块、计算块哈希、判定正文起点、提取章节标题，并提供共享 sha256。 |
