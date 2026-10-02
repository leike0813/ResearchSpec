
# isPathWithin
<!-- node: function:src/core/runtime/boundary-path.ts:isPathWithin -->

纯词法判断目标是否位于根目录之内。
类型：函数  
复杂度：简单  
入边数：2  
标签：path-safety、utility、read-only、security  
所属文件：[src/core/runtime/boundary-path.ts](../../../../../files/src/core/runtime/boundary-path.ts.md)
源码：[src/core/runtime/boundary-path.ts:88](../../../../../../../src/core/runtime/boundary-path.ts#L88)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validateAnnotationRawProvenance](../../../../../files/src/core/runtime/annotation-provenance.ts.md) | src/core/runtime/annotation-provenance.ts:15–60 | 逐个原始来源做路径边界、符号链接与字节哈希校验，再核对每条批注的来源片段或 Review Delta 条目，最后返回读前置条件。 |
| [resolveBoundaryPath](../../../../../files/src/core/runtime/boundary-path.ts.md) | src/core/runtime/boundary-path.ts:21–70 | 解析边界交付物路径，按 use 区分仅校验与实际消费，逐类拒绝分隔符、越界、绝对路径与 researchspec 内部路径。 |

## 调用

该符号没有记录对外调用。
