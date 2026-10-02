
# tests/manuscript-annotation.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/manuscript-annotation.test.ts -->

修订补丁与批注来源的端到端测试：补丁应用、过期哈希与不完整映射的失败路径、QMD 围栏保持、独立 helper 的原子输出与来源边界校验。
源码：[tests/manuscript-annotation.test.ts](../../../../tests/manuscript-annotation.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [annotation-intake.ts](../src/annotation-intake.ts.md) | src/annotation-intake.ts | 批注接收（annotation intake）子系统的 barrel 入口，向上重导出 contracts、session、sources、review-copy、review-delta 与 interpretation 全部公开接口。 |
| [annotation-provenance.ts](../src/core/runtime/annotation-provenance.ts.md) | src/core/runtime/annotation-provenance.ts | 校验候选批注集的原始来源真实有效：限制在私有工作根内、拒绝符号链接、比对字节哈希与来源片段，并返回读前置条件。 |
| [annotation.ts](../src/core/contracts/annotation.ts.md) | src/core/contracts/annotation.ts | 核心层批注契约：语义影响级别、批注目标、原始来源、来源引用、完整批注与 AnnotationSetCandidate 的 zod 定义。 |
| [apply.ts](../src/arsu-converter/revision/apply.ts.md) | src/arsu-converter/revision/apply.ts | 在全部前置校验通过后，把 ARSU 修订补丁应用到带块标记的手稿，并汇总改动块、插入块与批注处置计数。 |
| [cli.ts](helpers/cli.ts.md) | tests/helpers/cli.ts | CLI 测试夹具：用 spawnSync 运行编译产物、解析 envelope 响应，并创建与清理临时项目目录。 |
| [contract.ts](../src/arsu-converter/revision/contract.ts.md) | src/arsu-converter/revision/contract.ts | ARSU 修订补丁 v2.0 的唯一契约：操作、授权上下文、claim strength 变更与批注映射的 zod 定义、校验和 JSON Schema 导出。 |
| [markdown-blocks.ts](../src/arsu-converter/revision/markdown-blocks.ts.md) | src/arsu-converter/revision/markdown-blocks.ts | 带 ResearchSpec 块标记的 Markdown 解析底座：切分与定位锚定块、计算块哈希、判定正文起点、提取章节标题，并提供共享 sha256。 |
