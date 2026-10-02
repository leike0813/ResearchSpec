
# src/core/runtime/annotation-provenance.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/runtime](../../../../modules/src/core/runtime.md)
<!-- node: file:src/core/runtime/annotation-provenance.ts -->

校验候选批注集的原始来源真实有效：限制在私有工作根内、拒绝符号链接、比对字节哈希与来源片段，并返回读前置条件。
源码：[src/core/runtime/annotation-provenance.ts](../../../../../../src/core/runtime/annotation-provenance.ts)

## 符号（2）
<!-- node: class:src/core/runtime/annotation-provenance.ts:AnnotationProvenanceError -->
<!-- node: function:src/core/runtime/annotation-provenance.ts:validateAnnotationRawProvenance -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| AnnotationProvenanceError | 类 | 8–13 | 简单 | error-type、provenance、diagnostics | 0 | 原始来源校验失败时抛出的错误，携带错误码、是否属于冲突以及附加详情。 |
| validateAnnotationRawProvenance | 函数 | 15–60 | 复杂 | validation、security、provenance、path-boundary | 0 | 逐个原始来源做路径边界、符号链接与字节哈希校验，再核对每条批注的来源片段或 Review Delta 条目，最后返回读前置条件。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [annotation.ts](../contracts/annotation.ts.md) | src/core/contracts/annotation.ts | 核心层批注契约：语义影响级别、批注目标、原始来源、来源引用、完整批注与 AnnotationSetCandidate 的 zod 定义。 |
| [boundary-path.ts](boundary-path.ts.md) | src/core/runtime/boundary-path.ts | 边界交付物路径解析：拒绝绝对路径、越界、符号链接分量与 researchspec/ 内部路径，并在消费输入时校验存在性与可读性。 |
| [write-plan.ts](../workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [manuscript-annotation.test.ts](../../../tests/manuscript-annotation.test.ts.md) | tests/manuscript-annotation.test.ts | 修订补丁与批注来源的端到端测试：补丁应用、过期哈希与不完整映射的失败路径、QMD 围栏保持、独立 helper 的原子输出与来源边界校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| AnnotationProvenanceError | 类 | 8–13 | 原始来源校验失败时抛出的错误，携带错误码、是否属于冲突以及附加详情。 |
| validateAnnotationRawProvenance | 函数 | 15–60 | 逐个原始来源做路径边界、符号链接与字节哈希校验，再核对每条批注的来源片段或 Review Delta 条目，最后返回读前置条件。 |
