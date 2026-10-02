
# captureAnnotationSource
<!-- node: function:src/annotation-intake/sources.ts:captureAnnotationSource -->

按内容哈希为原始来源生成 source_id 与内容寻址路径，并给出 create_only 写入计划与默认扩展名、媒体类型。
类型：函数  
复杂度：中等  
入边数：2  
标签：content-addressed、provenance、annotation-intake  
所属文件：[src/annotation-intake/sources.ts](../../../../files/src/annotation-intake/sources.ts.md)
源码：[src/annotation-intake/sources.ts:13](../../../../../../src/annotation-intake/sources.ts#L13)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [createAnnotationIntakeSession](../../../../files/src/annotation-intake/session.ts.md) | src/annotation-intake/session.ts:15–70 | 创建 collecting 状态的接收会话：生成审阅副本、把副本登记为首个原始来源，并返回会话、来源与三条待写入计划。 |
| [withDerivedReviewDelta](../../../../files/src/annotation-intake/session.ts.md) | src/annotation-intake/session.ts:72–116 | 把推导出的 Review Delta 登记进会话：校验基准哈希一致，新增原始来源、切换到 interpreting 状态并累积诊断。 |

## 调用

该符号没有记录对外调用。
