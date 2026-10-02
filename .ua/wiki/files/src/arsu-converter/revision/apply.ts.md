
# src/arsu-converter/revision/apply.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/revision](../../../../modules/src/arsu-converter/revision.md)
<!-- node: file:src/arsu-converter/revision/apply.ts -->

在全部前置校验通过后，把 ARSU 修订补丁应用到带块标记的手稿，并汇总改动块、插入块与批注处置计数。
源码：[src/arsu-converter/revision/apply.ts](../../../../../../src/arsu-converter/revision/apply.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/revision/apply.ts:applyRevisionPatch -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| applyRevisionPatch | 函数 | 30–61 | 复杂 | patch-apply、validation、fail-closed | 0 | 先验证补丁契约、基准草稿哈希、目标块存在性与旧块哈希，再拒绝注入块标记或含混块结构的替换文本，全部通过才交给 applyValidated 落盘。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract.ts](contract.ts.md) | src/arsu-converter/revision/contract.ts | ARSU 修订补丁 v2.0 的唯一契约：操作、授权上下文、claim strength 变更与批注映射的 zod 定义、校验和 JSON Schema 导出。 |
| [markdown-blocks.ts](markdown-blocks.ts.md) | src/arsu-converter/revision/markdown-blocks.ts | 带 ResearchSpec 块标记的 Markdown 解析底座：切分与定位锚定块、计算块哈希、判定正文起点、提取章节标题，并提供共享 sha256。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [manuscript-annotation.test.ts](../../../tests/manuscript-annotation.test.ts.md) | tests/manuscript-annotation.test.ts | 修订补丁与批注来源的端到端测试：补丁应用、过期哈希与不完整映射的失败路径、QMD 围栏保持、独立 helper 的原子输出与来源边界校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| applyRevisionPatch | 函数 | 30–61 | 先验证补丁契约、基准草稿哈希、目标块存在性与旧块哈希，再拒绝注入块标记或含混块结构的替换文本，全部通过才交给 applyValidated 落盘。 |
